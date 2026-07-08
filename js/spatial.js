/* ============================================================
   spatial.js — Module Analyse Spatiale JOJ × Tostan 2026
   Calculs 100% côté client, aucune API externe nécessaire.
   Dépendance : data.js (JOJ_DATA)
   ============================================================ */

/* ── Distance Haversine en km entre 2 points GPS ──────────── */
function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371; // rayon terrestre en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 +
            Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) *
            Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

/* ── Temps de trajet estimé (vitesse moyenne piste/route rurale) ── */
function estimerTempsTrajet(km) {
  const VITESSE_MOYENNE = 35; // km/h — routes rurales sénégalaises
  const minutes = (km / VITESSE_MOYENNE) * 60;
  return Math.round(minutes);
}

/* ── Trouver toutes les communautés dans un rayon donné ────── */
function communautesDansRayon(communauteRef, rayonKm, excludeSelf = true) {
  return JOJ_DATA
    .filter(d => {
      if (excludeSelf && d.nom === communauteRef.nom && d.lat === communauteRef.lat) return false;
      const dist = haversine(communauteRef.lat, communauteRef.lng, d.lat, d.lng);
      return dist <= rayonKm;
    })
    .map(d => ({
      ...d,
      distance: +haversine(communauteRef.lat, communauteRef.lng, d.lat, d.lng).toFixed(1),
      temps_trajet: estimerTempsTrajet(haversine(communauteRef.lat, communauteRef.lng, d.lat, d.lng))
    }))
    .sort((a, b) => a.distance - b.distance);
}

/* ── Calculer l'indice de centralité pour UNE communauté ─────
   Score sur 100 basé sur :
   - Nombre de communautés couvertes dans le rayon (40%)
   - Population jeune couverte (30%)
   - Distance moyenne inversée (20%)
   - Présence PRCC/RPP/PS de l'hôte (10%)
─────────────────────────────────────────────────────────── */
function calculerIndiceCentralite(communaute, rayonKm, maxCouverte, maxJeunes) {
  const voisines = communautesDansRayon(communaute, rayonKm);
  const nbCouvertes = voisines.length;
  const jeunesCouverts = voisines.reduce((s, v) => s + v.jeunes, 0) + communaute.jeunes;

  // Exclure les voisines à distance 0 (coordonnées GPS identiques = doublons de données)
  // pour ne pas biaiser la moyenne vers 0
  const voisinesDistinctes = voisines.filter(v => v.distance > 0);
  const distMoyenne = voisinesDistinctes.length > 0
    ? voisinesDistinctes.reduce((s, v) => s + v.distance, 0) / voisinesDistinctes.length
    : 0;

  // Normalisation 0-1
  const scoreCouverture = maxCouverte > 0 ? Math.min(nbCouvertes / maxCouverte, 1) : 0;
  const scoreJeunes     = maxJeunes   > 0 ? Math.min(jeunesCouverts / maxJeunes, 1) : 0;
  // scoreDistance = 0 si toutes les voisines sont empilées au même point
  const scoreDistance   = voisinesDistinctes.length > 0
    ? Math.max(0, 1 - (distMoyenne / rayonKm))
    : 0;
  const scorePRCC = (communaute.statut === 'EN COURS' || communaute.statut.includes('202')) ? 1 :
                    (communaute.rpp === 'Oui' || communaute.ps === 'Oui') ? 0.5 : 0;

  const indice = Math.round(
    scoreCouverture * 40 +
    scoreJeunes     * 30 +
    scoreDistance   * 20 +
    scorePRCC       * 10
  );

  return {
    communaute,
    nbCouvertes,
    jeunesCouverts,
    distMoyenne: +distMoyenne.toFixed(1),
    tempsTrajetMoyen: estimerTempsTrajet(distMoyenne),
    indice: Math.min(indice, 100),
    voisines
  };
}

/* ── Classement des meilleures communautés hôtes ──────────── */
function classerCommunautesHotes(rayonKm, options = {}) {
  const {
    prccObligatoire = false,
    jeunesMin = 0,
    zoneId = null,
    limite = 10
  } = options;

  // Filtrer le pool de candidats selon les options
  let candidats = JOJ_DATA;
  if (zoneId) candidats = candidats.filter(d => d.zone_id === zoneId);
  if (prccObligatoire) {
    candidats = candidats.filter(d => d.statut === 'EN COURS' || d.statut.includes('202'));
  }

  // Calculer d'abord les valeurs max pour la normalisation
  const tousResultats = candidats.map(c => {
    const voisines = communautesDansRayon(c, rayonKm);
    const jeunesCouverts = voisines.reduce((s, v) => s + v.jeunes, 0) + c.jeunes;
    return { communaute: c, nbCouvertes: voisines.length, jeunesCouverts };
  });

  const maxCouverte = Math.max(...tousResultats.map(r => r.nbCouvertes), 1);
  const maxJeunes    = Math.max(...tousResultats.map(r => r.jeunesCouverts), 1);

  // Calculer l'indice complet pour chaque candidat
  let resultats = candidats.map(c =>
    calculerIndiceCentralite(c, rayonKm, maxCouverte, maxJeunes)
  );

  // Filtrer par jeunes minimum couverts
  if (jeunesMin > 0) {
    resultats = resultats.filter(r => r.jeunesCouverts >= jeunesMin);
  }

  // Trier par indice décroissant ; départage : score_total individuel puis jeunes
  resultats.sort((a, b) => {
    if (b.indice !== a.indice) return b.indice - a.indice;
    if (b.communaute.score_total !== a.communaute.score_total)
      return b.communaute.score_total - a.communaute.score_total;
    return b.communaute.jeunes - a.communaute.jeunes;
  });

  // Dédupliquer par position GPS : ne garder qu'une communauté par lieu unique
  // (évite d'afficher 10 entrées identiques partageant les mêmes coordonnées)
  const seenPos = {};
  const dedupl = [];
  for (const r of resultats) {
    const k = r.communaute.lat.toFixed(4) + ',' + r.communaute.lng.toFixed(4);
    if (!seenPos[k]) {
      seenPos[k] = true;
      dedupl.push(r);
      if (dedupl.length >= limite) break;
    }
  }
  return dedupl;
}

/* ── Planification automatique des événements ─────────────────
   Algorithme glouton : à chaque étape on choisit la communauté
   du pool restant qui couvre le plus de voisines, on lui affecte
   ces voisines (en respectant maxParEvenement), puis on retire
   tous les membres du pool. On répète jusqu'à épuisement du pool.
───────────────────────────────────────────────────────────────── */
function planifierEvenements(rayonKm, maxParEvenement = 25) {
  let pool = [...JOJ_DATA];
  const evenements = [];

  while (pool.length > 0) {
    let meilleureHote = null;
    let meilleuresVoisines = [];

    for (const c of pool) {
      const voisines = pool
        .filter(d => !(d.nom === c.nom && d.lat === c.lat))
        .map(d => ({ ...d, _dist: haversine(c.lat, c.lng, d.lat, d.lng) }))
        .filter(d => d._dist <= rayonKm)
        .sort((a, b) => a._dist - b._dist)
        .slice(0, maxParEvenement - 1);

      if (!meilleureHote || voisines.length > meilleuresVoisines.length) {
        meilleureHote = c;
        meilleuresVoisines = voisines;
      }
    }

    if (!meilleureHote) break;

    const membres = [meilleureHote, ...meilleuresVoisines];
    const jeunesTotal = membres.reduce((s, d) => s + d.jeunes, 0);
    const voisinesAvecDist = meilleuresVoisines.filter(v => v._dist > 0);
    const distMoyenne = voisinesAvecDist.length > 0
      ? +(voisinesAvecDist.reduce((s, v) => s + v._dist, 0) / voisinesAvecDist.length).toFixed(1)
      : 0;

    evenements.push({
      hote: meilleureHote,
      membres,
      nbMembres: membres.length,
      jeunesTotal,
      distMoyenne,
      tempsTrajetMoyen: estimerTempsTrajet(distMoyenne)
    });

    const assignes = new Set(membres.map(d => d.nom + '|' + d.lat));
    pool = pool.filter(d => !assignes.has(d.nom + '|' + d.lat));
  }

  return evenements;
}

/* ── Centre géographique (centre de gravité) ──────────────── */
function calculerCentreGeographique(liste = JOJ_DATA) {
  const lat = liste.reduce((s, d) => s + d.lat, 0) / liste.length;
  const lng = liste.reduce((s, d) => s + d.lng, 0) / liste.length;
  return { lat, lng };
}

/* ── Indice de dispersion (distance moyenne au centre) ────── */
function calculerDispersion(liste = JOJ_DATA) {
  const centre = calculerCentreGeographique(liste);
  const distances = liste.map(d => haversine(centre.lat, centre.lng, d.lat, d.lng));
  const moyenne = distances.reduce((s, d) => s + d, 0) / distances.length;
  const max = Math.max(...distances);
  const min = Math.min(...distances);
  return {
    centre,
    distanceMoyenne: +moyenne.toFixed(1),
    distanceMax: +max.toFixed(1),
    distanceMin: +min.toFixed(1)
  };
}

/* ── Communautés isolées (voisine la plus proche > seuil) ─── */
function trouverCommunautesIsolees(seuilKm = 15) {
  return JOJ_DATA.map(c => {
    const autres = JOJ_DATA.filter(d => !(d.nom === c.nom && d.lat === c.lat));
    const distances = autres.map(d => haversine(c.lat, c.lng, d.lat, d.lng));
    const distMin = Math.min(...distances);
    return { communaute: c, distancePlusProcheVoisine: +distMin.toFixed(1) };
  })
  .filter(r => r.distancePlusProcheVoisine > seuilKm)
  .sort((a, b) => b.distancePlusProcheVoisine - a.distancePlusProcheVoisine);
}

/* ── Comparer 2 communautés hôtes ─────────────────────────── */
function comparerCommunautesHotes(nomA, nomB, rayonKm) {
  const cA = JOJ_DATA.find(d => d.nom === nomA);
  const cB = JOJ_DATA.find(d => d.nom === nomB);
  if (!cA || !cB) return null;

  const tousResultats = JOJ_DATA.map(c => {
    const voisines = communautesDansRayon(c, rayonKm);
    const jeunesCouverts = voisines.reduce((s, v) => s + v.jeunes, 0) + c.jeunes;
    return { nbCouvertes: voisines.length, jeunesCouverts };
  });
  const maxCouverte = Math.max(...tousResultats.map(r => r.nbCouvertes), 1);
  const maxJeunes    = Math.max(...tousResultats.map(r => r.jeunesCouverts), 1);

  return {
    a: calculerIndiceCentralite(cA, rayonKm, maxCouverte, maxJeunes),
    b: calculerIndiceCentralite(cB, rayonKm, maxCouverte, maxJeunes)
  };
}

/* ── Clustering simple par proximité (algorithme glouton) ───
   Regroupe les communautés en clusters où chaque membre est
   à moins de rayonKm d'au moins un autre membre du cluster.
─────────────────────────────────────────────────────────── */
function clusteriserCommunautes(rayonKm, zoneId = null) {
  let pool = zoneId ? JOJ_DATA.filter(d => d.zone_id === zoneId) : [...JOJ_DATA];
  const visites = new Set();
  const clusters = [];

  pool.forEach(depart => {
    const key = depart.nom + depart.lat;
    if (visites.has(key)) return;

    // BFS pour trouver tous les points connectés
    const cluster = [depart];
    visites.add(key);
    const file = [depart];

    while (file.length > 0) {
      const courant = file.shift();
      pool.forEach(autre => {
        const akey = autre.nom + autre.lat;
        if (visites.has(akey)) return;
        const dist = haversine(courant.lat, courant.lng, autre.lat, autre.lng);
        if (dist <= rayonKm) {
          cluster.push(autre);
          visites.add(akey);
          file.push(autre);
        }
      });
    }

    if (cluster.length > 0) clusters.push(cluster);
  });

  // Trier par taille décroissante et enrichir
  return clusters
    .map(c => ({
      membres: c,
      taille: c.length,
      jeunesTotal: c.reduce((s, d) => s + d.jeunes, 0),
      centre: calculerCentreGeographique(c)
    }))
    .sort((a, b) => b.taille - a.taille);
}