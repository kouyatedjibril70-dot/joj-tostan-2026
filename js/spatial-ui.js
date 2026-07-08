/* ============================================================
   spatial-ui.js — Interface Analyse Spatiale JOJ × Tostan 2026
   Dépendances : spatial.js, data.js, Leaflet
   ============================================================ */

let spatialMap = null;
let spatialLayer = null;
let spatialBuilt = false;

function initSpatial() {
  if (spatialBuilt) {
    if (spatialMap) setTimeout(() => spatialMap.invalidateSize(), 100);
    return;
  }
  spatialBuilt = true;

  const sel = document.getElementById('spatialCommuneSelect');
  if (sel) {
    JOJ_DATA.slice().sort((a, b) => a.nom.localeCompare(b.nom)).forEach(d => {
      const o = document.createElement('option');
      o.value = d.nom + '|' + d.lat;
      o.textContent = `${d.nom} (${d.commune || d.dept})`;
      sel.appendChild(o);
    });
  }

  ['compareA', 'compareB'].forEach(id => {
    const s = document.getElementById(id);
    if (!s) return;
    JOJ_DATA.slice().sort((a, b) => a.nom.localeCompare(b.nom)).forEach(d => {
      const o = document.createElement('option');
      o.value = d.nom;
      o.textContent = d.nom;
      s.appendChild(o);
    });
  });

  spatialMap = L.map('spatialMap', { zoomControl: true }).setView([13.8, -14.2], 7);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap', maxZoom: 18
  }).addTo(spatialMap);
  spatialLayer = L.layerGroup().addTo(spatialMap);

  renderStatsGlobales();
}

function setRayonChip(btn, value, inputId) {
  btn.parentElement.querySelectorAll('.sp-chip').forEach(c => c.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById(inputId).value = value;
  console.log('[setRayonChip]', inputId, '=', value);
}

function switchSpatialMode(mode, btn) {
  document.querySelectorAll('.spatial-mode-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  document.querySelectorAll('.spatial-panel').forEach(p => p.style.display = 'none');
  const panel = document.getElementById('panel-' + mode);
  if (panel) panel.style.display = 'block';
  spatialLayer.clearLayers();
  const results = document.getElementById('spatialResults');
  if (mode === 'global') {
    results.innerHTML = '';
    renderStatsGlobales();
  } else {
    results.innerHTML = '';
  }
}

const SPATIAL_ZONE_COLORS = { 1: '#27AE60', 2: '#E74C3C', 3: '#2980B9' };

/* MODE 1 : RECHERCHE PAR RAYON */
function genererAnalyseRayon(ref, voisines, rayon) {
  const nb = voisines.length;
  const voisinesReelles = voisines.filter(v => v.distance > 0);
  const distMoy = voisinesReelles.length > 0
    ? voisinesReelles.reduce((s, v) => s + v.distance, 0) / voisinesReelles.length
    : 0;
  const tpsMoy = Math.round((distMoy / 35) * 60);

  // Niveau qualitatif
  let niveau, badge, verdict;
  if (nb === 0) {
    niveau = 'isole'; badge = '🔴';
    verdict = `Aucune autre communauté n'est accessible dans un rayon de ${rayon} km. ${ref.nom} est isolée à cette distance — augmentez le rayon ou choisissez une communauté mieux centrée.`;
  } else if (nb >= 20) {
    niveau = 'excellent'; badge = '🟢';
    verdict = `Excellent point de regroupement.`;
  } else if (nb >= 12) {
    niveau = 'bon'; badge = '🟢';
    verdict = `Bon point de regroupement.`;
  } else if (nb >= 5) {
    niveau = 'moyen'; badge = '🟡';
    verdict = `Point de regroupement convenable.`;
  } else {
    niveau = 'faible'; badge = '🟠';
    verdict = `Point de regroupement limité.`;
  }

  let txt = '';
  if (nb > 0) {
    txt += `${ref.nom} peut rassembler <strong>${nb} communauté${nb > 1 ? 's' : ''}</strong> dans un rayon de ${rayon} km, soit <strong>${(voisines.reduce((s,v)=>s+v.jeunes,0)+ref.jeunes).toLocaleString('fr-FR')} jeunes</strong> 15-35 ans. `;

    if (distMoy > 0) {
      txt += `La distance moyenne de <strong>${distMoy.toFixed(1)} km</strong> (≈ ${tpsMoy} min de trajet) est `;
      txt += distMoy < 10 ? 'très favorable pour la mobilisation. '
           : distMoy < 20 ? 'compatible avec une mobilisation en journée. '
           : 'élevée et peut représenter une contrainte logistique. ';
    }

    const atouts = [];
    if (ref.statut === 'EN COURS') atouts.push('un programme PRCC actif');
    if (ref.rpp === 'Oui') atouts.push('un programme RPP');
    if (ref.ps === 'Oui') atouts.push('le programme P&S');
    if (atouts.length > 0)
      txt += `La communauté dispose de ${atouts.join(', ')}, ce qui facilite l'organisation des activités. `;

    if (niveau === 'excellent' || niveau === 'bon')
      txt += '✅ Ce site est recommandé comme point de rassemblement prioritaire.';
    else if (niveau === 'moyen')
      txt += '⚠️ Ce site est acceptable — augmenter le rayon améliorerait la couverture.';
    else
      txt += '❌ Couverture faible pour ce rayon. Envisagez un rayon plus large ou une autre communauté.';
  } else {
    txt = verdict;
  }

  return { niveau, badge, txt };
}

function lancerRechercheRayon() {
  const sel = document.getElementById('spatialCommuneSelect');
  const rayon = parseInt(document.getElementById('spatialRayon').value);
  if (!sel.value) {
    document.getElementById('spatialResults').innerHTML =
      '<div class="spatial-empty">Sélectionnez une communauté de référence.</div>';
    return;
  }
  const [nom, lat] = sel.value.split('|');
  const ref = JOJ_DATA.find(d => d.nom === nom && String(d.lat) === lat);
  if (!ref) return;

  const voisines = communautesDansRayon(ref, rayon);
  const jeunesTotal = voisines.reduce((s, v) => s + v.jeunes, 0) + ref.jeunes;
  const analyseRayon = genererAnalyseRayon(ref, voisines, rayon);

  spatialLayer.clearLayers();
  spatialMap.setView([ref.lat, ref.lng], rayon > 30 ? 8 : rayon > 15 ? 9 : 10);

  L.circle([ref.lat, ref.lng], {
    radius: rayon * 1000,
    color: '#F39C12', weight: 1.5, fillColor: '#F39C12', fillOpacity: 0.06, dashArray: '6 4'
  }).addTo(spatialLayer);

  L.marker([ref.lat, ref.lng], {
    icon: L.divIcon({
      html: `<div style="width:18px;height:18px;border-radius:50%;background:#F39C12;border:3px solid #fff;box-shadow:0 0 10px #F39C12"></div>`,
      iconSize: [18, 18], iconAnchor: [9, 9], className: ''
    })
  }).bindPopup(`<b>${ref.nom}</b><br>Communauté de référence`).addTo(spatialLayer);

  voisines.forEach(v => {
    L.marker([v.lat, v.lng], {
      icon: L.divIcon({
      html: `<div style="width:13px;height:13px;border-radius:50%;background:${SPATIAL_ZONE_COLORS[v.zone_id]};border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,.3)"></div>`,
      iconSize: [13, 13], iconAnchor: [6, 6], className: ''
      })
    }).bindPopup(`<b>${v.nom}</b><br>${v.distance} km · ${v.temps_trajet} min`).addTo(spatialLayer);
  });

  document.getElementById('spatialResults').innerHTML = `
    <div class="spatial-summary">
      <div class="ss-item"><div class="ss-val">${voisines.length}</div><div class="ss-lbl">Communautés dans ${rayon} km</div></div>
      <div class="ss-item"><div class="ss-val">${jeunesTotal.toLocaleString('fr-FR')}</div><div class="ss-lbl">Jeunes 15-35 couverts</div></div>
      <div class="ss-item"><div class="ss-val">${voisines.length > 0 ? (voisines.reduce((s,v)=>s+v.distance,0)/voisines.length).toFixed(1) : 0} km</div><div class="ss-lbl">Distance moyenne</div></div>
      <div class="ss-item"><div class="ss-val">${voisines.length > 0 ? estimerTempsTrajet(voisines.reduce((s,v)=>s+v.distance,0)/voisines.length) : 0} min</div><div class="ss-lbl">Trajet moyen estimé</div></div>
    </div>
    <div class="rayon-analyse rayon-analyse--${analyseRayon.niveau}">
      <div class="rayon-analyse-badge">${analyseRayon.badge}</div>
      <div class="rayon-analyse-body">
        <div class="rayon-analyse-titre">Analyse du point de regroupement</div>
        <p class="rayon-analyse-txt">${analyseRayon.txt}</p>
      </div>
    </div>
    <table class="spatial-table">
      <thead><tr><th>Communauté</th><th>Zone</th><th>Distance</th><th>Trajet</th><th>Jeunes</th><th>PRCC</th></tr></thead>
      <tbody>
        ${voisines.map(v => `
          <tr>
            <td><b>${v.nom}</b></td>
            <td><span class="zone-tag zt${v.zone_id}">Z${v.zone_id}</span></td>
            <td>${v.distance} km</td>
            <td>${v.temps_trajet} min</td>
            <td>${v.jeunes.toLocaleString('fr-FR')}</td>
            <td>${v.statut === 'EN COURS' ? '🟣' : '—'}</td>
          </tr>`).join('')}
      </tbody>
    </table>`;
}


/* MODE 3 : COMPARATEUR */
function genererAnalyseComparaison(a, b, rayon, winner) {
  const W = winner === 'a' ? a : winner === 'b' ? b : null;
  const L = winner === 'a' ? b : winner === 'b' ? a : null;

  let txt = '';

  if (!winner) {
    txt += `<strong>${a.communaute.nom}</strong> et <strong>${b.communaute.nom}</strong> sont équivalentes sur l'ensemble des critères pour un rayon de ${rayon} km. `;
    txt += `Elles couvrent respectivement ${a.nbCouvertes} et ${b.nbCouvertes} communautés. `;
    txt += `Dans ce cas, privilégiez la communauté disposant du meilleur statut PRCC ou du plus grand nombre de jeunes sur place.`;
    return txt;
  }

  // Gagnante
  const diffIndice = Math.abs(a.indice - b.indice);
  const ecart = diffIndice >= 20 ? 'nettement supérieure' : diffIndice >= 10 ? 'supérieure' : 'légèrement supérieure';
  txt += `<strong>${W.communaute.nom}</strong> est ${ecart} à <strong>${L.communaute.nom}</strong> avec un indice de ${W.indice}/100 contre ${L.indice}/100. `;

  // Couverture
  if (W.nbCouvertes !== L.nbCouvertes) {
    const diffComm = W.nbCouvertes - L.nbCouvertes;
    txt += `Elle couvre ${diffComm > 0 ? diffComm + ' communauté' + (diffComm > 1 ? 's' : '') + ' de plus' : 'autant de communautés'} (${W.nbCouvertes} vs ${L.nbCouvertes}), `;
    txt += `soit ${(W.jeunesCouverts - L.jeunesCouverts) > 0 ? (W.jeunesCouverts - L.jeunesCouverts).toLocaleString('fr-FR') + ' jeunes supplémentaires' : 'un nombre comparable de jeunes'}. `;
  } else {
    txt += `Elles couvrent le même nombre de communautés (${W.nbCouvertes}), mais ${W.communaute.nom} l'emporte sur d'autres critères. `;
  }

  // Distance
  if (W.distMoyenne !== L.distMoyenne && W.distMoyenne > 0 && L.distMoyenne > 0) {
    if (W.distMoyenne < L.distMoyenne) {
      txt += `Sa distance moyenne plus faible (${W.distMoyenne} km vs ${L.distMoyenne} km) réduit les coûts et le temps de déplacement. `;
    } else {
      txt += `Bien que sa distance moyenne soit plus élevée (${W.distMoyenne} km vs ${L.distMoyenne} km), ses autres avantages compensent. `;
    }
  }

  // Atouts PRCC
  const atotsW = [], atotsL = [];
  if (W.communaute.statut === 'EN COURS') atotsW.push('PRCC en cours');
  if (W.communaute.rpp === 'Oui') atotsW.push('RPP');
  if (W.communaute.ps === 'Oui') atotsW.push('P&S');
  if (L.communaute.statut === 'EN COURS') atotsL.push('PRCC en cours');
  if (L.communaute.rpp === 'Oui') atotsL.push('RPP');
  if (L.communaute.ps === 'Oui') atotsL.push('P&S');

  if (atotsW.length > atotsL.length) {
    txt += `${W.communaute.nom} dispose également de plus de programmes actifs (${atotsW.join(', ')}), un atout pour la mobilisation. `;
  } else if (atotsW.length > 0) {
    txt += `La présence de ${atotsW.join(', ')} est un atout pour l'organisation des activités. `;
  }

  txt += `✅ <strong>${W.communaute.nom}</strong> est la communauté recommandée pour organiser un événement JO'TALI dans cette zone.`;
  return txt;
}

function lancerComparaison() {
  const nomA = document.getElementById('compareA').value;
  const nomB = document.getElementById('compareB').value;
  const rayon = parseInt(document.getElementById('compareRayon').value);

  if (!nomA || !nomB) {
    document.getElementById('spatialResults').innerHTML =
      '<div class="spatial-empty">Sélectionnez deux communautés à comparer.</div>';
    return;
  }
  if (nomA === nomB) {
    document.getElementById('spatialResults').innerHTML =
      '<div class="spatial-empty">Choisissez deux communautés différentes.</div>';
    return;
  }

  const comp = comparerCommunautesHotes(nomA, nomB, rayon);
  if (!comp) return;
  const { a, b } = comp;
  const winner = a.indice > b.indice ? 'a' : b.indice > a.indice ? 'b' : null;
  const analyseCompare = genererAnalyseComparaison(a, b, rayon, winner);

  spatialLayer.clearLayers();
  const bounds = [[a.communaute.lat, a.communaute.lng], [b.communaute.lat, b.communaute.lng]];
  spatialMap.fitBounds(bounds, { padding: [80, 80] });

  [{ d: a, color: '#F39C12' }, { d: b, color: '#2980B9' }].forEach(({ d, color }) => {
    L.circle([d.communaute.lat, d.communaute.lng], {
      radius: rayon * 1000, color, weight: 1.5, fillColor: color, fillOpacity: 0.06, dashArray: '6 4'
    }).addTo(spatialLayer);
    L.marker([d.communaute.lat, d.communaute.lng], {
      icon: L.divIcon({
        html: `<div style="width:16px;height:16px;border-radius:50%;background:${color};border:3px solid #fff;box-shadow:0 0 8px ${color}"></div>`,
        iconSize: [16, 16], iconAnchor: [8, 8], className: ''
      })
    }).bindPopup(`<b>${d.communaute.nom}</b>`).addTo(spatialLayer);
  });

  const rows = [
    ['Communautés couvertes', a.nbCouvertes, b.nbCouvertes, a.nbCouvertes, b.nbCouvertes, 'higher'],
    ['Jeunes 15-35 couverts', a.jeunesCouverts.toLocaleString('fr-FR'), b.jeunesCouverts.toLocaleString('fr-FR'), a.jeunesCouverts, b.jeunesCouverts, 'higher'],
    ['Distance moyenne', a.distMoyenne + ' km', b.distMoyenne + ' km', a.distMoyenne, b.distMoyenne, 'lower'],
    ['Trajet moyen estimé', a.tempsTrajetMoyen + ' min', b.tempsTrajetMoyen + ' min', a.tempsTrajetMoyen, b.tempsTrajetMoyen, 'lower'],
    ['Statut PRCC', a.communaute.statut, b.communaute.statut, 0, 0, 'none'],
    ['Indice de centralité', a.indice + '/100', b.indice + '/100', a.indice, b.indice, 'higher']
  ];

  document.getElementById('spatialResults').innerHTML = `
    <div class="compare-header">
      <div class="compare-col" style="color:#F39C12">${a.communaute.nom}</div>
      <div class="compare-col-mid">VS</div>
      <div class="compare-col" style="color:#2980B9">${b.communaute.nom}</div>
    </div>
    <table class="compare-table">
      ${rows.map(([label, valA, valB, rawA, rawB, rule]) => {
        let winA = false, winB = false;
        if (rule === 'higher') { winA = rawA > rawB; winB = rawB > rawA; }
        if (rule === 'lower')  { winA = rawA < rawB; winB = rawB < rawA; }
        return `<tr>
          <td class="compare-val ${winA?'compare-win':''}" style="color:#F39C12">${valA}</td>
          <td class="compare-label">${label}</td>
          <td class="compare-val ${winB?'compare-win':''}" style="color:#2980B9">${valB}</td>
        </tr>`;
      }).join('')}
    </table>
    <div class="compare-verdict">
      ${winner ? `<b>${(winner==='a'?a:b).communaute.nom}</b> a l'indice de centralité le plus élevé pour ce rayon.` : 'Les deux communautés sont équivalentes.'}
    </div>
    <div class="compare-analyse">
      <div class="compare-analyse-titre">💡 Analyse comparative</div>
      <p class="compare-analyse-txt">${analyseCompare}</p>
    </div>`;
}

/* MODE 4 : COMMUNAUTÉS ISOLÉES */
function lancerAnalyseIsolees() {
  const seuil = parseInt(document.getElementById('isoleesSeuil').value);
  const isolees = trouverCommunautesIsolees(seuil);

  spatialLayer.clearLayers();
  if (isolees.length === 0) {
    document.getElementById('spatialResults').innerHTML =
      `<div class="spatial-empty">Aucune communauté isolée au-delà de ${seuil} km. Le réseau est bien couvert.</div>`;
    return;
  }

  spatialMap.setView([13.8, -14.2], 7);
  isolees.forEach(r => {
    L.marker([r.communaute.lat, r.communaute.lng], {
      icon: L.divIcon({
        html: `<div style="width:14px;height:14px;border-radius:50%;background:#E74C3C;border:2px solid #fff;box-shadow:0 0 8px #E74C3C"></div>`,
        iconSize: [14, 14], iconAnchor: [7, 7], className: ''
      })
    }).bindPopup(`<b>${r.communaute.nom}</b><br>Voisine la plus proche : ${r.distancePlusProcheVoisine} km`).addTo(spatialLayer);
  });

  document.getElementById('spatialResults').innerHTML = `
    <div class="spatial-summary">
      <div class="ss-item"><div class="ss-val" style="color:#E74C3C">${isolees.length}</div><div class="ss-lbl">Communautés isolées (> ${seuil} km)</div></div>
      <div class="ss-item"><div class="ss-val">${isolees[0].distancePlusProcheVoisine} km</div><div class="ss-lbl">Isolement maximum</div></div>
    </div>
    <table class="spatial-table">
      <thead><tr><th>Communauté</th><th>Zone</th><th>Région</th><th>Voisine la + proche</th><th>Jeunes</th></tr></thead>
      <tbody>
        ${isolees.map(r => `
          <tr>
            <td><b>${r.communaute.nom}</b></td>
            <td><span class="zone-tag zt${r.communaute.zone_id}">Z${r.communaute.zone_id}</span></td>
            <td>${r.communaute.region}</td>
            <td style="color:#E74C3C;font-weight:700">${r.distancePlusProcheVoisine} km</td>
            <td>${r.communaute.jeunes.toLocaleString('fr-FR')}</td>
          </tr>`).join('')}
      </tbody>
    </table>`;
}

/* VUE GLOBALE PAR DÉFAUT */
function renderStatsGlobales() {
  spatialLayer.clearLayers();
  spatialMap.setView([13.8, -14.2], 7);

  JOJ_DATA.forEach(d => {
    L.circleMarker([d.lat, d.lng], {
      radius: 6, color: '#fff', weight: 1.5,
      fillColor: SPATIAL_ZONE_COLORS[d.zone_id], fillOpacity: .85
    })
    .bindPopup(`<b>${d.nom}</b><br>${d.region} · Zone ${d.zone_id}<br>${d.jeunes.toLocaleString('fr-FR')} jeunes · Score ${d.score_total}/100`)
    .addTo(spatialLayer);
  });

  // ── Calculs d'ensemble pour l'analyse automatique ─────────
  const TOTAL_COMM   = JOJ_DATA.length;
  const TOTAL_JEUNES = JOJ_DATA.reduce((s, d) => s + d.jeunes, 0);

  const TRANCHES = [
    { val: '0-200',      label: 'moins de 200 jeunes',    min: 0,    max: 199 },
    { val: '200-500',    label: 'entre 200 et 499 jeunes', min: 200,  max: 499 },
    { val: '500-1000',   label: 'entre 500 et 999 jeunes', min: 500,  max: 999 },
    { val: '1000-99999', label: '1 000 jeunes ou plus',    min: 1000, max: 99999 }
  ].map(t => {
    const comm = JOJ_DATA.filter(d => d.jeunes >= t.min && d.jeunes <= t.max);
    const jeunes = comm.reduce((s, d) => s + d.jeunes, 0);
    return { ...t, comm: comm.length, jeunes, pctComm: ((comm.length / TOTAL_COMM) * 100).toFixed(1), pctJeunes: ((jeunes / TOTAL_JEUNES) * 100).toFixed(1) };
  });

  const ZONES = [
    { id: 1, label: 'Zone 1 — Kolda & Sédhiou',   shortLabel: 'Zone 1', color: SPATIAL_ZONE_COLORS[1] },
    { id: 2, label: 'Zone 2 — Tamba & Kédougou',  shortLabel: 'Zone 2', color: SPATIAL_ZONE_COLORS[2] },
    { id: 3, label: 'Zone 3 — Matam',              shortLabel: 'Zone 3', color: SPATIAL_ZONE_COLORS[3] }
  ].map(z => {
    const comm   = JOJ_DATA.filter(d => d.zone_id === z.id);
    const jeunes = comm.reduce((s, d) => s + d.jeunes, 0);
    const moy    = Math.round(jeunes / comm.length);
    return { ...z, total: comm.length, jeunes, moy };
  });

  const zoneMaxJeunes = ZONES.reduce((a, b) => b.moy > a.moy ? b : a);
  const trancheMaj    = TRANCHES.reduce((a, b) => b.comm > a.comm ? b : a);
  const trancheMin    = TRANCHES[0]; // moins de 200
  const trancheForte  = TRANCHES[3]; // 1000+

  const moyGlobale = Math.round(TOTAL_JEUNES / TOTAL_COMM);

  // ── Analyse narrative ─────────────────────────────────────
  const narratif = `
Sur les <strong>${TOTAL_COMM} communautés pilotes</strong> JO'TALI × Tostan 2026, le programme touche un total de <strong>${TOTAL_JEUNES.toLocaleString('fr-FR')} jeunes 15-35 ans</strong>, soit une moyenne de <strong>${moyGlobale} jeunes par communauté</strong>.

La répartition par tranche révèle une concentration importante dans les catégories moyennes :
<ul style="margin:8px 0 8px 18px;line-height:2">
  <li><strong>${TRANCHES[0].comm} communautés (${TRANCHES[0].pctComm} %)</strong> comptent <em>moins de 200 jeunes</em> — ce sont souvent des villages périphériques ou isolés, avec un potentiel de mobilisation limité mais une importance symbolique réelle pour l'inclusion territoriale.</li>
  <li><strong>${TRANCHES[1].comm} communautés (${TRANCHES[1].pctComm} %)</strong> se situent <em>entre 200 et 499 jeunes</em> — elles forment le socle intermédiaire du programme, idéales pour des événements locaux à taille humaine.</li>
  <li><strong>${TRANCHES[2].comm} communautés (${TRANCHES[2].pctComm} %)</strong> réunissent <em>entre 500 et 999 jeunes</em> — leur capacité de mobilisation en fait des sites prioritaires pour les activités de zone.</li>
  <li><strong>${TRANCHES[3].comm} communautés (${TRANCHES[3].pctComm} %)</strong> dépassent <em>1 000 jeunes</em> — concentrant à elles seules <strong>${TRANCHES[3].pctJeunes} % des jeunes</strong> du programme, elles représentent les leviers de mobilisation les plus puissants.</li>
</ul>

La tranche dominante est celle des <strong>${trancheMaj.label}</strong> avec <strong>${trancheMaj.comm} communautés</strong>, ce qui traduit une structure démographique typique des zones rurales sahéliennes où les villages de taille intermédiaire sont les plus nombreux.

Du point de vue territorial, <strong>${zoneMaxJeunes.label}</strong> présente la moyenne la plus élevée avec <strong>${zoneMaxJeunes.moy} jeunes par communauté</strong> en moyenne, contre ${ZONES.filter(z => z.id !== zoneMaxJeunes.id).map(z => `${z.moy} en ${z.shortLabel}`).join(' et ')}. Cette disparité reflète des différences de densité de peuplement entre les régions couvertes.

Sélectionnez une tranche ci-dessus pour explorer en détail la répartition géographique et identifier les communautés concernées.`;

  document.getElementById('spatialResults').innerHTML = `
    <div class="spatial-section-title">🧭 Analyse de la répartition des jeunes 15-35 ans</div>
    <div class="global-narratif">${narratif}</div>
    <div class="tranche-overview">
      ${TRANCHES.map(t => `
        <div class="tranche-ov-item" onclick="document.getElementById('globalJeunesFilter').value='${t.val}';lancerAnalyseGlobale()">
          <div class="tranche-ov-val">${t.comm}</div>
          <div class="tranche-ov-lbl">${t.label}</div>
          <div class="tranche-ov-pct">${t.pctComm} % des comm.</div>
        </div>`).join('')}
    </div>`;
}

/* VUE GLOBALE — DISPATCHER (zone + tranche) */
function lancerAnalyseGlobale() {
  const zoneVal   = document.getElementById('globalZoneFilter').value;
  const trancheVal = document.getElementById('globalJeunesFilter').value;
  if (!zoneVal && !trancheVal) { renderStatsGlobales(); return; }
  _afficherAnalyse(zoneVal ? parseInt(zoneVal) : null, trancheVal || null);
}

/* Alias conservé pour les cartes cliquables de renderStatsGlobales */
function analyserParTrancheJeunes() { lancerAnalyseGlobale(); }

/* ── Constantes partagées ── */
const ZONES_META = [
  { id: 1, label: 'Zone 1 — Kolda & Sédhiou',  shortLabel: 'Zone 1', color: null },
  { id: 2, label: 'Zone 2 — Tamba & Kédougou', shortLabel: 'Zone 2', color: null },
  { id: 3, label: 'Zone 3 — Matam',             shortLabel: 'Zone 3', color: null }
];
const TRANCHES_META = [
  { val: '0-200',      min: 0,    max: 199,   label: 'moins de 200 jeunes',     badge: '🔵', titre: 'Petite taille' },
  { val: '200-500',    min: 200,  max: 499,   label: '200 à 499 jeunes',        badge: '🟦', titre: 'Taille intermédiaire' },
  { val: '500-1000',   min: 500,  max: 999,   label: '500 à 999 jeunes',        badge: '🟡', titre: 'Fort potentiel' },
  { val: '1000-99999', min: 1000, max: 99999, label: '1 000 jeunes ou plus',    badge: '🔴', titre: 'Très fort potentiel' }
];

function _trancheMeta(val) { return TRANCHES_META.find(t => t.val === val) || TRANCHES_META[1]; }

/* ── Fonction principale d'analyse ─────────────────────────
   zoneId    : 1|2|3|null  (null = toutes les zones)
   trancheVal: '0-200'|...  (null = toutes les tranches)
────────────────────────────────────────────────────────── */
function _afficherAnalyse(zoneId, trancheVal) {
  const TOTAL_COMM   = JOJ_DATA.length;
  const TOTAL_JEUNES = JOJ_DATA.reduce((s, d) => s + d.jeunes, 0);

  // Pool de base selon la zone sélectionnée
  const basePool = zoneId ? JOJ_DATA.filter(d => d.zone_id === zoneId) : JOJ_DATA;
  const baseJeunes = basePool.reduce((s, d) => s + d.jeunes, 0);

  // Pool final selon la tranche
  let pool;
  if (trancheVal) {
    const tm = _trancheMeta(trancheVal);
    pool = basePool.filter(d => d.jeunes >= tm.min && d.jeunes <= tm.max);
  } else {
    pool = basePool;
  }

  // ── Carte ─────────────────────────────────────────────────
  spatialLayer.clearLayers();
  if (pool.length === 0) {
    spatialMap.setView([13.8, -14.2], 7);
    document.getElementById('spatialResults').innerHTML =
      `<div class="spatial-empty">Aucune communauté ne correspond à cette sélection.</div>`;
    return;
  }

  // Points grisés = contexte de base, points colorés = sélection active
  if (zoneId || trancheVal) {
    JOJ_DATA.forEach(d => {
      const inPool = pool.includes(d);
      L.circleMarker([d.lat, d.lng], {
        radius: inPool ? 7 : 5,
        color: '#fff', weight: inPool ? 2 : 1,
        fillColor: inPool ? SPATIAL_ZONE_COLORS[d.zone_id] : '#ccc',
        fillOpacity: inPool ? .92 : .3
      })
      .bindPopup(`<b>${d.nom}</b><br>${d.region} · Zone ${d.zone_id}<br><b>${d.jeunes.toLocaleString('fr-FR')} jeunes</b> · Score ${d.score_total}/100`)
      .addTo(spatialLayer);
    });
    spatialMap.fitBounds(pool.map(d => [d.lat, d.lng]), { padding: [50, 50] });
  }

  // ── Stats du pool ──────────────────────────────────────────
  const poolJeunes = pool.reduce((s, d) => s + d.jeunes, 0);
  const pctCommSurTotal  = ((pool.length / TOTAL_COMM) * 100).toFixed(1);
  const pctJeunesSurTotal = ((poolJeunes / TOTAL_JEUNES) * 100).toFixed(1);
  const pctCommSurBase   = basePool.length > 0 ? ((pool.length / basePool.length) * 100).toFixed(1) : '0';
  const moyPool = Math.round(poolJeunes / pool.length);

  // ── Titre et contexte ─────────────────────────────────────
  const zoneMeta = zoneId ? ZONES_META.find(z => z.id === zoneId) : null;
  const trMeta   = trancheVal ? _trancheMeta(trancheVal) : null;

  let titreSection = '';
  if (zoneMeta && trMeta)  titreSection = `${trMeta.badge} ${zoneMeta.shortLabel} · ${trMeta.label}`;
  else if (zoneMeta)       titreSection = `🗺️ ${zoneMeta.label}`;
  else if (trMeta)         titreSection = `${trMeta.badge} ${trMeta.titre} — ${trMeta.label}`;

  // ── Analyse narrative ─────────────────────────────────────
  let narratif = '';

  if (zoneMeta && !trMeta) {
    // MODE : zone seule → vue d'ensemble de la zone par tranche
    const tranchesZone = TRANCHES_META.map(t => {
      const comm = basePool.filter(d => d.jeunes >= t.min && d.jeunes <= t.max);
      const jeunes = comm.reduce((s, d) => s + d.jeunes, 0);
      return { ...t, comm: comm.length, jeunes,
               pct: ((comm.length / basePool.length) * 100).toFixed(1) };
    });
    const trancheDom = tranchesZone.reduce((a, b) => b.comm > a.comm ? b : a);
    const moyZone = Math.round(baseJeunes / basePool.length);

    narratif = `La <strong>${zoneMeta.label}</strong> regroupe <strong>${basePool.length} communautés</strong> sur les 300 du programme (${((basePool.length / TOTAL_COMM) * 100).toFixed(1)} %), représentant <strong>${baseJeunes.toLocaleString('fr-FR')} jeunes 15-35 ans</strong> avec une moyenne de <strong>${moyZone} jeunes par communauté</strong>.

La répartition par tranche de jeunes dans cette zone est la suivante :
<ul style="margin:8px 0 8px 18px;line-height:2">
  ${tranchesZone.map(t => `<li><strong>${t.comm} communautés (${t.pct} %)</strong> comptent <em>${t.label}</em>${t.comm > 0 ? ` — soit ${t.jeunes.toLocaleString('fr-FR')} jeunes` : ''}</li>`).join('')}
</ul>
La tranche dominante est celle des <strong>${trancheDom.label}</strong> avec <strong>${trancheDom.comm} communautés (${trancheDom.pct} % de la zone)</strong>. Pour approfondir l'analyse, sélectionnez une tranche dans le filtre ci-dessus.`;

  } else if (!zoneMeta && trMeta) {
    // MODE : tranche seule → analyse globale de la tranche par zone
    const zonesData = ZONES_META.map(z => {
      const totalZone = JOJ_DATA.filter(d => d.zone_id === z.id).length;
      const comm   = pool.filter(d => d.zone_id === z.id);
      const jeunes = comm.reduce((s, d) => s + d.jeunes, 0);
      return { ...z, color: SPATIAL_ZONE_COLORS[z.id], totalZone,
               comm: comm.length, jeunes,
               pctZone:    ((comm.length / totalZone) * 100).toFixed(1),
               pctTranche: pool.length > 0 ? ((comm.length / pool.length) * 100).toFixed(1) : '0' };
    });
    const zoneMax = zonesData.reduce((a, b) => b.comm > a.comm ? b : a);
    const zoneMin = zonesData.reduce((a, b) => b.comm < a.comm ? b : a);

    narratif = `Sur les <strong>${TOTAL_COMM} communautés</strong> du programme, <strong>${pool.length} (${pctCommSurTotal} %)</strong> comptent <strong>${trMeta.label}</strong>. Elles représentent <strong>${poolJeunes.toLocaleString('fr-FR')} jeunes</strong> (${pctJeunesSurTotal} % du total), avec une moyenne de <strong>${moyPool} jeunes par communauté</strong> dans cette tranche.

Sur le plan territorial, <strong>${zoneMax.label}</strong> concentre le plus grand nombre de ces communautés avec <strong>${zoneMax.comm} communautés</strong> (${zoneMax.pctTranche} % de la tranche, ${zoneMax.pctZone} % de sa zone). ${zoneMin.comm === 0 ? `<strong>${zoneMin.label}</strong> n'en compte aucune dans cette tranche.` : `<strong>${zoneMin.label}</strong> en compte ${zoneMin.comm} (${zoneMin.pctZone} % de sa zone).`}

${_interpretationTranche(trMeta.val, pool.length, pctJeunesSurTotal)}`;

    // Ajouter les cartes de zone au lieu du tableau zone (done below)
    narratif += `\n\nSélectionnez une zone dans le filtre pour croiser cette tranche avec une zone spécifique.`;

  } else if (zoneMeta && trMeta) {
    // MODE : zone + tranche → analyse croisée
    const totalZone = JOJ_DATA.filter(d => d.zone_id === zoneId).length;
    const trancheGlobale = JOJ_DATA.filter(d => { const t = _trancheMeta(trancheVal); return d.jeunes >= t.min && d.jeunes <= t.max; });

    narratif = `Dans la <strong>${zoneMeta.label}</strong>, <strong>${pool.length} communauté${pool.length > 1 ? 's' : ''} (${pctCommSurBase} % de la zone)</strong> comptent <strong>${trMeta.label}</strong>, représentant <strong>${poolJeunes.toLocaleString('fr-FR')} jeunes</strong> et une moyenne de <strong>${moyPool} jeunes par communauté</strong>.

À l'échelle nationale, ces ${pool.length} communautés représentent <strong>${pctCommSurTotal} % des 300 communautés</strong> du programme et <strong>${((pool.length / trancheGlobale.length) * 100).toFixed(1)} % de toutes les communautés dans cette tranche</strong> (${trancheGlobale.length} au total national).

${_interpretationCroisee(zoneMeta, trMeta, pool.length, totalZone)}`;
  }

  // ── Construction du HTML ──────────────────────────────────
  const zonesDetailData = ZONES_META.map(z => {
    const totalZone = JOJ_DATA.filter(d => d.zone_id === z.id).length;
    const comm   = pool.filter(d => d.zone_id === z.id);
    const jeunes = comm.reduce((s, d) => s + d.jeunes, 0);
    return { ...z, color: SPATIAL_ZONE_COLORS[z.id], totalZone,
             comm: comm.length, jeunes,
             pctZone: ((comm.length / totalZone) * 100).toFixed(1),
             pctPool: pool.length > 0 ? ((comm.length / pool.length) * 100).toFixed(1) : '0' };
  });

  const triees = [...pool].sort((a, b) => b.jeunes - a.jeunes);

  // Cartes tranche cliquables uniquement en mode zone-seule
  const trancheCardsHTML = (!trancheVal && zoneId) ? `
    <div class="spatial-section-title" style="margin-top:18px">Explorer par tranche dans cette zone</div>
    <div class="tranche-overview">
      ${TRANCHES_META.map(t => {
        const nb = basePool.filter(d => d.jeunes >= t.min && d.jeunes <= t.max).length;
        return `<div class="tranche-ov-item" onclick="
          document.getElementById('globalJeunesFilter').value='${t.val}';
          lancerAnalyseGlobale()">
          <div class="tranche-ov-val">${nb}</div>
          <div class="tranche-ov-lbl">${t.label}</div>
          <div class="tranche-ov-pct">${((nb/basePool.length)*100).toFixed(1)} % de la zone</div>
        </div>`;
      }).join('')}
    </div>` : '';

  document.getElementById('spatialResults').innerHTML = `
    <div class="spatial-section-title">${titreSection}</div>
    <div class="global-narratif">${narratif}</div>
    <div class="spatial-summary">
      <div class="ss-item"><div class="ss-val">${pool.length}</div><div class="ss-lbl">Communautés</div></div>
      <div class="ss-item"><div class="ss-val">${poolJeunes.toLocaleString('fr-FR')}</div><div class="ss-lbl">Jeunes 15-35</div></div>
      <div class="ss-item"><div class="ss-val">${pctCommSurTotal} %</div><div class="ss-lbl">des 300 comm.</div></div>
      <div class="ss-item"><div class="ss-val">${pctJeunesSurTotal} %</div><div class="ss-lbl">du total jeunes</div></div>
    </div>
    <div class="spatial-section-title" style="margin-top:18px">Répartition par zone</div>
    <div class="tranche-zones">
      ${zonesDetailData.map(z => `
        <div class="tranche-zone-card" style="cursor:pointer" onclick="
          document.getElementById('globalZoneFilter').value='${z.id}';
          lancerAnalyseGlobale()">
          <div class="tranche-zone-bar" style="background:${z.color};width:${z.pctPool}%;min-width:4px"></div>
          <div class="tranche-zone-label" style="color:${z.color}">${z.label}</div>
          <div class="tranche-zone-stats">
            <span class="tranche-zone-val">${z.comm} comm.</span>
            <span class="tranche-zone-sep">·</span>
            <span>${z.jeunes.toLocaleString('fr-FR')} jeunes</span>
            <span class="tranche-zone-pct">${z.pctZone} % de la zone · ${z.pctPool} % ici</span>
          </div>
        </div>`).join('')}
    </div>
    ${trancheCardsHTML}
    <div class="spatial-section-title" style="margin-top:18px">Détail des ${pool.length} communautés (triées par jeunes ↓)</div>
    <table class="spatial-table">
      <thead><tr><th>Communauté</th><th>Région</th><th>Zone</th><th>Jeunes</th><th>Score</th><th>PRCC</th></tr></thead>
      <tbody>
        ${triees.map(d => `
          <tr>
            <td><b>${d.nom}</b></td>
            <td>${d.region}</td>
            <td><span class="zone-tag zt${d.zone_id}">Z${d.zone_id}</span></td>
            <td><b>${d.jeunes.toLocaleString('fr-FR')}</b></td>
            <td>${d.score_total}/100</td>
            <td>${d.statut === 'EN COURS' ? '🟣 EN COURS' : '—'}</td>
          </tr>`).join('')}
      </tbody>
    </table>`;
}

function _interpretationTranche(val, nb, pctJeunes) {
  if (val === '0-200')      return `Ces ${nb} communautés, bien que modestes en effectif, sont essentielles à la couverture territoriale du programme. Elles représentent souvent des villages périphériques pour lesquels JO'TALI est une opportunité rare d'inclusion.`;
  if (val === '200-500')    return `Ces ${nb} communautés forment le socle du programme. Avec une taille suffisante pour organiser des activités locales, elles constituent le principal levier de déploiement opérationnel de JO'TALI.`;
  if (val === '500-1000')   return `Ces ${nb} communautés disposent d'une masse critique de jeunes propice à des événements d'envergure. Elles sont idéales comme points de rassemblement pour les communes voisines plus petites.`;
  if (val === '1000-99999') return `Ces ${nb} communautés concentrent à elles seules ${pctJeunes} % du vivier total de jeunes. Chacune d'elles devrait être prioritairement retenue comme site d'accueil d'événements régionaux ou de zone.`;
  return '';
}

function _interpretationCroisee(zoneMeta, trMeta, nb, totalZone) {
  const pct = ((nb / totalZone) * 100).toFixed(1);
  if (nb === 0) return `Aucune communauté de ${zoneMeta.shortLabel} ne correspond à cette tranche. Cela peut refléter une structure démographique particulière de cette zone.`;
  if (trMeta.val === '1000-99999') return `Ces ${nb} communautés (${pct} % de ${zoneMeta.shortLabel}) constituent les leviers de mobilisation les plus puissants de la zone. Elles sont les candidates naturelles pour accueillir les grandes manifestations JO'TALI de ce territoire.`;
  if (trMeta.val === '500-1000')  return `Avec ${nb} communautés représentant ${pct} % de ${zoneMeta.shortLabel}, cette tranche offre un potentiel significatif pour des événements de zone. Leur accessibilité et leur capacité logistique en font des sites d'accueil prioritaires.`;
  if (trMeta.val === '200-500')   return `Ces ${nb} communautés (${pct} % de ${zoneMeta.shortLabel}) constituent le tissu intermédiaire du programme dans cette zone. Elles sont adaptées à des événements de proximité et peuvent contribuer à la mobilisation vers les sites plus importants.`;
  return `Ces ${nb} petites communautés (${pct} % de ${zoneMeta.shortLabel}) jouent un rôle inclusif dans le programme, garantissant que les villages les moins peuplés bénéficient aussi des activités JO'TALI.`;
}

/* Ancien nom conservé pour compatibilité avec les cartes overview */
function _afficherAnalyseTranche(val) {
  document.getElementById('globalJeunesFilter').value = val;
  lancerAnalyseGlobale();
}


