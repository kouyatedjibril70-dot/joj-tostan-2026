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

let currentSpatialMode = 'global';

function switchSpatialMode(mode, btn) {
  currentSpatialMode = mode;
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

/* ── Rafraîchir les textes traduits (changement de langue) ──── */
function refreshSpatialI18n() {
  if (!spatialBuilt) return;
  switch (currentSpatialMode) {
    case 'rayon':
      if (document.getElementById('spatialCommuneSelect').value) lancerRechercheRayon();
      break;
    case 'comparer':
      if (document.getElementById('compareA').value && document.getElementById('compareB').value) lancerComparaison();
      break;
    case 'isolees':
      lancerAnalyseIsolees();
      break;
    default:
      lancerAnalyseGlobale();
  }
}

const SPATIAL_ZONE_COLORS = { 1: '#27AE60', 2: '#E74C3C', 3: '#2980B9' };

/* MODE 1 : RECHERCHE PAR RAYON */
function genererAnalyseRayon(ref, voisines, rayon) {
  const isEn = getLang() === 'en';
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
    verdict = isEn
      ? `No other community is reachable within a ${rayon} km radius. ${ref.nom} is isolated at this distance — increase the radius or choose a more central community.`
      : `Aucune autre communauté n'est accessible dans un rayon de ${rayon} km. ${ref.nom} est isolée à cette distance — augmentez le rayon ou choisissez une communauté mieux centrée.`;
  } else if (nb >= 20) {
    niveau = 'excellent'; badge = '🟢';
    verdict = isEn ? `Excellent gathering point.` : `Excellent point de regroupement.`;
  } else if (nb >= 12) {
    niveau = 'bon'; badge = '🟢';
    verdict = isEn ? `Good gathering point.` : `Bon point de regroupement.`;
  } else if (nb >= 5) {
    niveau = 'moyen'; badge = '🟡';
    verdict = isEn ? `Decent gathering point.` : `Point de regroupement convenable.`;
  } else {
    niveau = 'faible'; badge = '🟠';
    verdict = isEn ? `Limited gathering point.` : `Point de regroupement limité.`;
  }

  let txt = '';
  if (nb > 0) {
    const jeunesTotal = fmtNum(voisines.reduce((s,v)=>s+v.jeunes,0)+ref.jeunes);
    txt += isEn
      ? `${ref.nom} can bring together <strong>${nb} ${nb > 1 ? 'communities' : 'community'}</strong> within a ${rayon} km radius, i.e. <strong>${jeunesTotal} youth</strong> aged 15-35. `
      : `${ref.nom} peut rassembler <strong>${nb} communauté${nb > 1 ? 's' : ''}</strong> dans un rayon de ${rayon} km, soit <strong>${jeunesTotal} jeunes</strong> 15-35 ans. `;

    if (distMoy > 0) {
      txt += isEn
        ? `The average distance of <strong>${distMoy.toFixed(1)} km</strong> (≈ ${tpsMoy} min travel) is `
        : `La distance moyenne de <strong>${distMoy.toFixed(1)} km</strong> (≈ ${tpsMoy} min de trajet) est `;
      if (isEn) {
        txt += distMoy < 10 ? 'very favorable for mobilization. '
             : distMoy < 20 ? 'compatible with a single-day mobilization. '
             : 'high and may represent a logistical constraint. ';
      } else {
        txt += distMoy < 10 ? 'très favorable pour la mobilisation. '
             : distMoy < 20 ? 'compatible avec une mobilisation en journée. '
             : 'élevée et peut représenter une contrainte logistique. ';
      }
    }

    const atouts = [];
    if (isEn) {
      if (ref.statut === 'EN COURS') atouts.push('an active PRCC program');
      if (ref.rpp === 'Oui') atouts.push('an RPP program');
      if (ref.ps === 'Oui') atouts.push('the P&S program');
      if (atouts.length > 0)
        txt += `The community has ${atouts.join(', ')}, which facilitates organizing activities. `;
    } else {
      if (ref.statut === 'EN COURS') atouts.push('un programme PRCC actif');
      if (ref.rpp === 'Oui') atouts.push('un programme RPP');
      if (ref.ps === 'Oui') atouts.push('le programme P&S');
      if (atouts.length > 0)
        txt += `La communauté dispose de ${atouts.join(', ')}, ce qui facilite l'organisation des activités. `;
    }

    if (niveau === 'excellent' || niveau === 'bon')
      txt += isEn ? '✅ This site is recommended as a priority gathering point.' : '✅ Ce site est recommandé comme point de rassemblement prioritaire.';
    else if (niveau === 'moyen')
      txt += isEn ? '⚠️ This site is acceptable — increasing the radius would improve coverage.' : '⚠️ Ce site est acceptable — augmenter le rayon améliorerait la couverture.';
    else
      txt += isEn ? '❌ Low coverage for this radius. Consider a wider radius or another community.' : '❌ Couverture faible pour ce rayon. Envisagez un rayon plus large ou une autre communauté.';
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
      `<div class="spatial-empty">${t('spatial.select_ref')}</div>`;
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
  }).bindPopup(`<b>${ref.nom}</b><br>${t('spatial.ref_tag')}`).addTo(spatialLayer);

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
      <div class="ss-item"><div class="ss-val">${voisines.length}</div><div class="ss-lbl">${t('spatial.ss_comm_dans', { r: rayon })}</div></div>
      <div class="ss-item"><div class="ss-val">${fmtNum(jeunesTotal)}</div><div class="ss-lbl">${t('spatial.ss_jeunes_couverts')}</div></div>
      <div class="ss-item"><div class="ss-val">${voisines.length > 0 ? (voisines.reduce((s,v)=>s+v.distance,0)/voisines.length).toFixed(1) : 0} km</div><div class="ss-lbl">${t('spatial.ss_dist_moy')}</div></div>
      <div class="ss-item"><div class="ss-val">${voisines.length > 0 ? estimerTempsTrajet(voisines.reduce((s,v)=>s+v.distance,0)/voisines.length) : 0} min</div><div class="ss-lbl">${t('spatial.ss_trajet_moy')}</div></div>
    </div>
    <div class="rayon-analyse rayon-analyse--${analyseRayon.niveau}">
      <div class="rayon-analyse-badge">${analyseRayon.badge}</div>
      <div class="rayon-analyse-body">
        <div class="rayon-analyse-titre">${t('spatial.title_analysis')}</div>
        <p class="rayon-analyse-txt">${analyseRayon.txt}</p>
      </div>
    </div>
    <table class="spatial-table">
      <thead><tr><th>${t('spatial.th_communaute')}</th><th>${t('spatial.th_zone')}</th><th>${t('spatial.th_distance')}</th><th>${t('spatial.th_trajet')}</th><th>${t('spatial.th_jeunes')}</th><th>${t('spatial.th_prcc')}</th></tr></thead>
      <tbody>
        ${voisines.map(v => `
          <tr>
            <td><b>${v.nom}</b></td>
            <td><span class="zone-tag zt${v.zone_id}">Z${v.zone_id}</span></td>
            <td>${v.distance} km</td>
            <td>${v.temps_trajet} min</td>
            <td>${fmtNum(v.jeunes)}</td>
            <td>${v.statut === 'EN COURS' ? '🟣' : '—'}</td>
          </tr>`).join('')}
      </tbody>
    </table>`;
}


/* MODE 3 : COMPARATEUR */
function genererAnalyseComparaison(a, b, rayon, winner) {
  const isEn = getLang() === 'en';
  const W = winner === 'a' ? a : winner === 'b' ? b : null;
  const L = winner === 'a' ? b : winner === 'b' ? a : null;

  let txt = '';

  if (!winner) {
    if (isEn) {
      txt += `<strong>${a.communaute.nom}</strong> and <strong>${b.communaute.nom}</strong> are equivalent on all criteria for a ${rayon} km radius. `;
      txt += `They respectively cover ${a.nbCouvertes} and ${b.nbCouvertes} communities. `;
      txt += `In this case, favor the community with the better PRCC status or the larger number of youth on site.`;
    } else {
      txt += `<strong>${a.communaute.nom}</strong> et <strong>${b.communaute.nom}</strong> sont équivalentes sur l'ensemble des critères pour un rayon de ${rayon} km. `;
      txt += `Elles couvrent respectivement ${a.nbCouvertes} et ${b.nbCouvertes} communautés. `;
      txt += `Dans ce cas, privilégiez la communauté disposant du meilleur statut PRCC ou du plus grand nombre de jeunes sur place.`;
    }
    return txt;
  }

  // Gagnante
  const diffIndice = Math.abs(a.indice - b.indice);
  if (isEn) {
    const ecart = diffIndice >= 20 ? 'clearly higher' : diffIndice >= 10 ? 'higher' : 'slightly higher';
    txt += `<strong>${W.communaute.nom}</strong> is ${ecart} than <strong>${L.communaute.nom}</strong> with a centrality index of ${W.indice}/100 versus ${L.indice}/100. `;
  } else {
    const ecart = diffIndice >= 20 ? 'nettement supérieure' : diffIndice >= 10 ? 'supérieure' : 'légèrement supérieure';
    txt += `<strong>${W.communaute.nom}</strong> est ${ecart} à <strong>${L.communaute.nom}</strong> avec un indice de ${W.indice}/100 contre ${L.indice}/100. `;
  }

  // Couverture
  if (W.nbCouvertes !== L.nbCouvertes) {
    const diffComm = W.nbCouvertes - L.nbCouvertes;
    const diffJeunes = W.jeunesCouverts - L.jeunesCouverts;
    if (isEn) {
      txt += `It covers ${diffComm > 0 ? diffComm + ' more ' + (diffComm > 1 ? 'communities' : 'community') : 'as many communities'} (${W.nbCouvertes} vs ${L.nbCouvertes}), `;
      txt += `i.e. ${diffJeunes > 0 ? fmtNum(diffJeunes) + ' additional youth' : 'a comparable number of youth'}. `;
    } else {
      txt += `Elle couvre ${diffComm > 0 ? diffComm + ' communauté' + (diffComm > 1 ? 's' : '') + ' de plus' : 'autant de communautés'} (${W.nbCouvertes} vs ${L.nbCouvertes}), `;
      txt += `soit ${diffJeunes > 0 ? fmtNum(diffJeunes) + ' jeunes supplémentaires' : 'un nombre comparable de jeunes'}. `;
    }
  } else {
    txt += isEn
      ? `They cover the same number of communities (${W.nbCouvertes}), but ${W.communaute.nom} wins on other criteria. `
      : `Elles couvrent le même nombre de communautés (${W.nbCouvertes}), mais ${W.communaute.nom} l'emporte sur d'autres critères. `;
  }

  // Distance
  if (W.distMoyenne !== L.distMoyenne && W.distMoyenne > 0 && L.distMoyenne > 0) {
    if (W.distMoyenne < L.distMoyenne) {
      txt += isEn
        ? `Its lower average distance (${W.distMoyenne} km vs ${L.distMoyenne} km) reduces travel cost and time. `
        : `Sa distance moyenne plus faible (${W.distMoyenne} km vs ${L.distMoyenne} km) réduit les coûts et le temps de déplacement. `;
    } else {
      txt += isEn
        ? `Although its average distance is higher (${W.distMoyenne} km vs ${L.distMoyenne} km), its other advantages compensate. `
        : `Bien que sa distance moyenne soit plus élevée (${W.distMoyenne} km vs ${L.distMoyenne} km), ses autres avantages compensent. `;
    }
  }

  // Atouts PRCC
  const atotsW = [], atotsL = [];
  if (isEn) {
    if (W.communaute.statut === 'EN COURS') atotsW.push('ongoing PRCC');
    if (W.communaute.rpp === 'Oui') atotsW.push('RPP');
    if (W.communaute.ps === 'Oui') atotsW.push('P&S');
    if (L.communaute.statut === 'EN COURS') atotsL.push('ongoing PRCC');
    if (L.communaute.rpp === 'Oui') atotsL.push('RPP');
    if (L.communaute.ps === 'Oui') atotsL.push('P&S');
  } else {
    if (W.communaute.statut === 'EN COURS') atotsW.push('PRCC en cours');
    if (W.communaute.rpp === 'Oui') atotsW.push('RPP');
    if (W.communaute.ps === 'Oui') atotsW.push('P&S');
    if (L.communaute.statut === 'EN COURS') atotsL.push('PRCC en cours');
    if (L.communaute.rpp === 'Oui') atotsL.push('RPP');
    if (L.communaute.ps === 'Oui') atotsL.push('P&S');
  }

  if (atotsW.length > atotsL.length) {
    txt += isEn
      ? `${W.communaute.nom} also has more active programs (${atotsW.join(', ')}), an asset for mobilization. `
      : `${W.communaute.nom} dispose également de plus de programmes actifs (${atotsW.join(', ')}), un atout pour la mobilisation. `;
  } else if (atotsW.length > 0) {
    txt += isEn
      ? `The presence of ${atotsW.join(', ')} is an asset for organizing activities. `
      : `La présence de ${atotsW.join(', ')} est un atout pour l'organisation des activités. `;
  }

  txt += isEn
    ? `✅ <strong>${W.communaute.nom}</strong> is the recommended community for hosting a JO'TALI event in this area.`
    : `✅ <strong>${W.communaute.nom}</strong> est la communauté recommandée pour organiser un événement JO'TALI dans cette zone.`;
  return txt;
}

function lancerComparaison() {
  const nomA = document.getElementById('compareA').value;
  const nomB = document.getElementById('compareB').value;
  const rayon = parseInt(document.getElementById('compareRayon').value);

  if (!nomA || !nomB) {
    document.getElementById('spatialResults').innerHTML =
      `<div class="spatial-empty">${t('spatial.select_two')}</div>`;
    return;
  }
  if (nomA === nomB) {
    document.getElementById('spatialResults').innerHTML =
      `<div class="spatial-empty">${t('spatial.select_different')}</div>`;
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

  const isEn = getLang() === 'en';
  const rows = [
    [isEn ? 'Communities covered' : 'Communautés couvertes', a.nbCouvertes, b.nbCouvertes, a.nbCouvertes, b.nbCouvertes, 'higher'],
    [isEn ? 'Youth 15-35 covered' : 'Jeunes 15-35 couverts', fmtNum(a.jeunesCouverts), fmtNum(b.jeunesCouverts), a.jeunesCouverts, b.jeunesCouverts, 'higher'],
    [isEn ? 'Average distance' : 'Distance moyenne', a.distMoyenne + ' km', b.distMoyenne + ' km', a.distMoyenne, b.distMoyenne, 'lower'],
    [isEn ? 'Estimated average travel time' : 'Trajet moyen estimé', a.tempsTrajetMoyen + ' min', b.tempsTrajetMoyen + ' min', a.tempsTrajetMoyen, b.tempsTrajetMoyen, 'lower'],
    [isEn ? 'PRCC status' : 'Statut PRCC', trStatut(a.communaute.statut), trStatut(b.communaute.statut), 0, 0, 'none'],
    [isEn ? 'Centrality index' : 'Indice de centralité', a.indice + '/100', b.indice + '/100', a.indice, b.indice, 'higher']
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
      ${winner ? `<b>${(winner==='a'?a:b).communaute.nom}</b> ${isEn ? 'has the highest centrality index for this radius.' : "a l'indice de centralité le plus élevé pour ce rayon."}` : t('spatial.equivalentes')}
    </div>
    <div class="compare-analyse">
      <div class="compare-analyse-titre">${t('spatial.title_compare_analysis')}</div>
      <p class="compare-analyse-txt">${analyseCompare}</p>
    </div>`;
}

/* MODE 4 : COMMUNAUTÉS ISOLÉES */
function lancerAnalyseIsolees() {
  const isEn = getLang() === 'en';
  const seuil = parseInt(document.getElementById('isoleesSeuil').value);
  const isolees = trouverCommunautesIsolees(seuil);

  spatialLayer.clearLayers();
  if (isolees.length === 0) {
    document.getElementById('spatialResults').innerHTML = isEn
      ? `<div class="spatial-empty">No community is isolated beyond ${seuil} km. The network is well covered.</div>`
      : `<div class="spatial-empty">Aucune communauté isolée au-delà de ${seuil} km. Le réseau est bien couvert.</div>`;
    return;
  }

  spatialMap.setView([13.8, -14.2], 7);
  isolees.forEach(r => {
    L.marker([r.communaute.lat, r.communaute.lng], {
      icon: L.divIcon({
        html: `<div style="width:14px;height:14px;border-radius:50%;background:#E74C3C;border:2px solid #fff;box-shadow:0 0 8px #E74C3C"></div>`,
        iconSize: [14, 14], iconAnchor: [7, 7], className: ''
      })
    }).bindPopup(`<b>${r.communaute.nom}</b><br>${isEn ? 'Nearest neighbor' : 'Voisine la plus proche'} : ${r.distancePlusProcheVoisine} km`).addTo(spatialLayer);
  });

  document.getElementById('spatialResults').innerHTML = `
    <div class="spatial-summary">
      <div class="ss-item"><div class="ss-val" style="color:#E74C3C">${isolees.length}</div><div class="ss-lbl">${t('spatial.ss_comm_isolees', { s: seuil })}</div></div>
      <div class="ss-item"><div class="ss-val">${isolees[0].distancePlusProcheVoisine} km</div><div class="ss-lbl">${t('spatial.ss_isolement_max')}</div></div>
    </div>
    <table class="spatial-table">
      <thead><tr><th>${t('spatial.th_communaute')}</th><th>${t('spatial.th_zone')}</th><th>${t('spatial.th_region')}</th><th>${t('spatial.th_voisine')}</th><th>${t('spatial.th_jeunes')}</th></tr></thead>
      <tbody>
        ${isolees.map(r => `
          <tr>
            <td><b>${r.communaute.nom}</b></td>
            <td><span class="zone-tag zt${r.communaute.zone_id}">Z${r.communaute.zone_id}</span></td>
            <td>${r.communaute.region}</td>
            <td style="color:#E74C3C;font-weight:700">${r.distancePlusProcheVoisine} km</td>
            <td>${fmtNum(r.communaute.jeunes)}</td>
          </tr>`).join('')}
      </tbody>
    </table>`;
}

/* VUE GLOBALE PAR DÉFAUT */
function renderStatsGlobales() {
  const isEn = getLang() === 'en';
  spatialLayer.clearLayers();
  spatialMap.setView([13.8, -14.2], 7);

  JOJ_DATA.forEach(d => {
    L.circleMarker([d.lat, d.lng], {
      radius: 6, color: '#fff', weight: 1.5,
      fillColor: SPATIAL_ZONE_COLORS[d.zone_id], fillOpacity: .85
    })
    .bindPopup(`<b>${d.nom}</b><br>${d.region} · Zone ${d.zone_id}<br>${fmtNum(d.jeunes)} ${t('common.jeunes_word')} · Score ${d.score_total}/100`)
    .addTo(spatialLayer);
  });

  // ── Calculs d'ensemble pour l'analyse automatique ─────────
  const TOTAL_COMM   = JOJ_DATA.length;
  const TOTAL_JEUNES = JOJ_DATA.reduce((s, d) => s + d.jeunes, 0);

  const TRANCHES = [
    { val: '0-200',      label: t('spatial.tranche_0_200'),    min: 0,    max: 199 },
    { val: '200-500',    label: t('spatial.tranche_200_500'),  min: 200,  max: 499 },
    { val: '500-1000',   label: t('spatial.tranche_500_1000'), min: 500,  max: 999 },
    { val: '1000-99999', label: t('spatial.tranche_1000_plus'),min: 1000, max: 99999 }
  ].map(tr => {
    const comm = JOJ_DATA.filter(d => d.jeunes >= tr.min && d.jeunes <= tr.max);
    const jeunes = comm.reduce((s, d) => s + d.jeunes, 0);
    return { ...tr, comm: comm.length, jeunes, pctComm: ((comm.length / TOTAL_COMM) * 100).toFixed(1), pctJeunes: ((jeunes / TOTAL_JEUNES) * 100).toFixed(1) };
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

  const moyGlobale = Math.round(TOTAL_JEUNES / TOTAL_COMM);

  // ── Analyse narrative ─────────────────────────────────────
  const narratif = isEn ? `
Across the <strong>${TOTAL_COMM} pilot communities</strong> of JO'TALI × Tostan 2026, the program reaches a total of <strong>${fmtNum(TOTAL_JEUNES)} youth aged 15-35</strong>, i.e. an average of <strong>${moyGlobale} youth per community</strong>.

The breakdown by bracket reveals a significant concentration in the middle categories:
<ul style="margin:8px 0 8px 18px;line-height:2">
  <li><strong>${TRANCHES[0].comm} communities (${TRANCHES[0].pctComm} %)</strong> have <em>fewer than 200 youth</em> — these are often peripheral or isolated villages, with limited mobilization potential but real symbolic importance for territorial inclusion.</li>
  <li><strong>${TRANCHES[1].comm} communities (${TRANCHES[1].pctComm} %)</strong> fall <em>between 200 and 499 youth</em> — they form the program's intermediate backbone, ideal for human-scale local events.</li>
  <li><strong>${TRANCHES[2].comm} communities (${TRANCHES[2].pctComm} %)</strong> gather <em>between 500 and 999 youth</em> — their mobilization capacity makes them priority sites for zone-wide activities.</li>
  <li><strong>${TRANCHES[3].comm} communities (${TRANCHES[3].pctComm} %)</strong> exceed <em>1,000 youth</em> — concentrating alone <strong>${TRANCHES[3].pctJeunes} % of youth</strong> in the program, they represent the most powerful mobilization levers.</li>
</ul>

The dominant bracket is <strong>${trancheMaj.label}</strong> with <strong>${trancheMaj.comm} communities</strong>, reflecting a demographic structure typical of Sahelian rural areas where mid-sized villages are the most numerous.

Territorially, <strong>${zoneMaxJeunes.label}</strong> has the highest average with <strong>${zoneMaxJeunes.moy} youth per community</strong> on average, versus ${ZONES.filter(z => z.id !== zoneMaxJeunes.id).map(z => `${z.moy} in ${z.shortLabel}`).join(' and ')}. This disparity reflects differences in population density between the covered regions.

Select a bracket above to explore the geographic breakdown in detail and identify the communities concerned.` : `
Sur les <strong>${TOTAL_COMM} communautés pilotes</strong> JO'TALI × Tostan 2026, le programme touche un total de <strong>${fmtNum(TOTAL_JEUNES)} jeunes 15-35 ans</strong>, soit une moyenne de <strong>${moyGlobale} jeunes par communauté</strong>.

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
    <div class="spatial-section-title">${t('spatial.section_title_global')}</div>
    <div class="global-narratif">${narratif}</div>
    <div class="tranche-overview">
      ${TRANCHES.map(tr => `
        <div class="tranche-ov-item" onclick="document.getElementById('globalJeunesFilter').value='${tr.val}';lancerAnalyseGlobale()">
          <div class="tranche-ov-val">${tr.comm}</div>
          <div class="tranche-ov-lbl">${tr.label}</div>
          <div class="tranche-ov-pct">${tr.pctComm} ${t('spatial.pct_des_comm')}</div>
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

function getTranchesMeta() {
  return [
    { val: '0-200',      min: 0,    max: 199,   label: t('spatial.tranche_0_200'),     badge: '🔵', titre: t('spatial.titre_petite') },
    { val: '200-500',    min: 200,  max: 499,   label: t('spatial.tranche_200_500'),   badge: '🟦', titre: t('spatial.titre_intermediaire') },
    { val: '500-1000',   min: 500,  max: 999,   label: t('spatial.tranche_500_1000'),  badge: '🟡', titre: t('spatial.titre_fort') },
    { val: '1000-99999', min: 1000, max: 99999, label: t('spatial.tranche_1000_plus'), badge: '🔴', titre: t('spatial.titre_tresfort') }
  ];
}

function _trancheMeta(val) {
  const metas = getTranchesMeta();
  return metas.find(tr => tr.val === val) || metas[1];
}

/* ── Fonction principale d'analyse ─────────────────────────
   zoneId    : 1|2|3|null  (null = toutes les zones)
   trancheVal: '0-200'|...  (null = toutes les tranches)
────────────────────────────────────────────────────────── */
function _afficherAnalyse(zoneId, trancheVal) {
  const isEn = getLang() === 'en';
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
      `<div class="spatial-empty">${t('spatial.no_match')}</div>`;
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
      .bindPopup(`<b>${d.nom}</b><br>${d.region} · Zone ${d.zone_id}<br><b>${fmtNum(d.jeunes)} ${t('common.jeunes_word')}</b> · Score ${d.score_total}/100`)
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
    const tranchesZone = getTranchesMeta().map(tr => {
      const comm = basePool.filter(d => d.jeunes >= tr.min && d.jeunes <= tr.max);
      const jeunes = comm.reduce((s, d) => s + d.jeunes, 0);
      return { ...tr, comm: comm.length, jeunes,
               pct: ((comm.length / basePool.length) * 100).toFixed(1) };
    });
    const trancheDom = tranchesZone.reduce((a, b) => b.comm > a.comm ? b : a);
    const moyZone = Math.round(baseJeunes / basePool.length);

    narratif = isEn ? `The <strong>${zoneMeta.label}</strong> groups <strong>${basePool.length} communities</strong> out of the program's 300 (${((basePool.length / TOTAL_COMM) * 100).toFixed(1)} %), representing <strong>${fmtNum(baseJeunes)} youth aged 15-35</strong> with an average of <strong>${moyZone} youth per community</strong>.

The breakdown by youth bracket in this zone is as follows:
<ul style="margin:8px 0 8px 18px;line-height:2">
  ${tranchesZone.map(tr => `<li><strong>${tr.comm} communities (${tr.pct} %)</strong> have <em>${tr.label}</em>${tr.comm > 0 ? ` — i.e. ${fmtNum(tr.jeunes)} youth` : ''}</li>`).join('')}
</ul>
The dominant bracket is <strong>${trancheDom.label}</strong> with <strong>${trancheDom.comm} communities (${trancheDom.pct} % of the zone)</strong>. To dig deeper, select a bracket in the filter above.` : `La <strong>${zoneMeta.label}</strong> regroupe <strong>${basePool.length} communautés</strong> sur les 300 du programme (${((basePool.length / TOTAL_COMM) * 100).toFixed(1)} %), représentant <strong>${fmtNum(baseJeunes)} jeunes 15-35 ans</strong> avec une moyenne de <strong>${moyZone} jeunes par communauté</strong>.

La répartition par tranche de jeunes dans cette zone est la suivante :
<ul style="margin:8px 0 8px 18px;line-height:2">
  ${tranchesZone.map(tr => `<li><strong>${tr.comm} communautés (${tr.pct} %)</strong> comptent <em>${tr.label}</em>${tr.comm > 0 ? ` — soit ${fmtNum(tr.jeunes)} jeunes` : ''}</li>`).join('')}
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

    narratif = isEn ? `Across the program's <strong>${TOTAL_COMM} communities</strong>, <strong>${pool.length} (${pctCommSurTotal} %)</strong> have <strong>${trMeta.label}</strong>. They represent <strong>${fmtNum(poolJeunes)} youth</strong> (${pctJeunesSurTotal} % of the total), with an average of <strong>${moyPool} youth per community</strong> in this bracket.

Territorially, <strong>${zoneMax.label}</strong> concentrates the largest number of these communities with <strong>${zoneMax.comm} communities</strong> (${zoneMax.pctTranche} % of the bracket, ${zoneMax.pctZone} % of its zone). ${zoneMin.comm === 0 ? `<strong>${zoneMin.label}</strong> has none in this bracket.` : `<strong>${zoneMin.label}</strong> has ${zoneMin.comm} (${zoneMin.pctZone} % of its zone).`}

${_interpretationTranche(trMeta.val, pool.length, pctJeunesSurTotal)}` : `Sur les <strong>${TOTAL_COMM} communautés</strong> du programme, <strong>${pool.length} (${pctCommSurTotal} %)</strong> comptent <strong>${trMeta.label}</strong>. Elles représentent <strong>${fmtNum(poolJeunes)} jeunes</strong> (${pctJeunesSurTotal} % du total), avec une moyenne de <strong>${moyPool} jeunes par communauté</strong> dans cette tranche.

Sur le plan territorial, <strong>${zoneMax.label}</strong> concentre le plus grand nombre de ces communautés avec <strong>${zoneMax.comm} communautés</strong> (${zoneMax.pctTranche} % de la tranche, ${zoneMax.pctZone} % de sa zone). ${zoneMin.comm === 0 ? `<strong>${zoneMin.label}</strong> n'en compte aucune dans cette tranche.` : `<strong>${zoneMin.label}</strong> en compte ${zoneMin.comm} (${zoneMin.pctZone} % de sa zone).`}

${_interpretationTranche(trMeta.val, pool.length, pctJeunesSurTotal)}`;

    // Ajouter les cartes de zone au lieu du tableau zone (done below)
    narratif += isEn
      ? `\n\nSelect a zone in the filter to cross this bracket with a specific zone.`
      : `\n\nSélectionnez une zone dans le filtre pour croiser cette tranche avec une zone spécifique.`;

  } else if (zoneMeta && trMeta) {
    // MODE : zone + tranche → analyse croisée
    const totalZone = JOJ_DATA.filter(d => d.zone_id === zoneId).length;
    const trancheGlobale = JOJ_DATA.filter(d => { const tm = _trancheMeta(trancheVal); return d.jeunes >= tm.min && d.jeunes <= tm.max; });

    narratif = isEn ? `In <strong>${zoneMeta.label}</strong>, <strong>${pool.length} ${pool.length > 1 ? 'communities' : 'community'} (${pctCommSurBase} % of the zone)</strong> have <strong>${trMeta.label}</strong>, representing <strong>${fmtNum(poolJeunes)} youth</strong> and an average of <strong>${moyPool} youth per community</strong>.

Nationally, these ${pool.length} communities represent <strong>${pctCommSurTotal} % of the program's 300 communities</strong> and <strong>${((pool.length / trancheGlobale.length) * 100).toFixed(1)} % of all communities in this bracket</strong> (${trancheGlobale.length} nationwide).

${_interpretationCroisee(zoneMeta, trMeta, pool.length, totalZone)}` : `Dans la <strong>${zoneMeta.label}</strong>, <strong>${pool.length} communauté${pool.length > 1 ? 's' : ''} (${pctCommSurBase} % de la zone)</strong> comptent <strong>${trMeta.label}</strong>, représentant <strong>${fmtNum(poolJeunes)} jeunes</strong> et une moyenne de <strong>${moyPool} jeunes par communauté</strong>.

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
    <div class="spatial-section-title" style="margin-top:18px">${t('spatial.section_explore_tranche')}</div>
    <div class="tranche-overview">
      ${getTranchesMeta().map(tr => {
        const nb = basePool.filter(d => d.jeunes >= tr.min && d.jeunes <= tr.max).length;
        return `<div class="tranche-ov-item" onclick="
          document.getElementById('globalJeunesFilter').value='${tr.val}';
          lancerAnalyseGlobale()">
          <div class="tranche-ov-val">${nb}</div>
          <div class="tranche-ov-lbl">${tr.label}</div>
          <div class="tranche-ov-pct">${((nb/basePool.length)*100).toFixed(1)} ${t('spatial.pct_de_la_zone')}</div>
        </div>`;
      }).join('')}
    </div>` : '';

  document.getElementById('spatialResults').innerHTML = `
    <div class="spatial-section-title">${titreSection}</div>
    <div class="global-narratif">${narratif}</div>
    <div class="spatial-summary">
      <div class="ss-item"><div class="ss-val">${pool.length}</div><div class="ss-lbl">${t('spatial.ss_comm')}</div></div>
      <div class="ss-item"><div class="ss-val">${fmtNum(poolJeunes)}</div><div class="ss-lbl">${t('spatial.ss_jeunes')}</div></div>
      <div class="ss-item"><div class="ss-val">${pctCommSurTotal} %</div><div class="ss-lbl">${t('spatial.ss_pct_300')}</div></div>
      <div class="ss-item"><div class="ss-val">${pctJeunesSurTotal} %</div><div class="ss-lbl">${t('spatial.ss_pct_jeunes')}</div></div>
    </div>
    <div class="spatial-section-title" style="margin-top:18px">${t('spatial.section_repartition_zone')}</div>
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
            <span>${fmtNum(z.jeunes)} ${t('common.jeunes_word')}</span>
            <span class="tranche-zone-pct">${z.pctZone} ${t('spatial.pct_de_la_zone')} · ${z.pctPool} ${t('spatial.pct_ici')}</span>
          </div>
        </div>`).join('')}
    </div>
    ${trancheCardsHTML}
    <div class="spatial-section-title" style="margin-top:18px">${t('spatial.section_detail', { n: pool.length })}</div>
    <table class="spatial-table">
      <thead><tr><th>${t('spatial.th_communaute')}</th><th>${t('spatial.th_region')}</th><th>${t('spatial.th_zone')}</th><th>${t('spatial.th_jeunes')}</th><th>${t('spatial.th_score')}</th><th>${t('spatial.th_prcc')}</th></tr></thead>
      <tbody>
        ${triees.map(d => `
          <tr>
            <td><b>${d.nom}</b></td>
            <td>${d.region}</td>
            <td><span class="zone-tag zt${d.zone_id}">Z${d.zone_id}</span></td>
            <td><b>${fmtNum(d.jeunes)}</b></td>
            <td>${d.score_total}/100</td>
            <td>${d.statut === 'EN COURS' ? '🟣 ' + trStatut('EN COURS') : '—'}</td>
          </tr>`).join('')}
      </tbody>
    </table>`;
}

function _interpretationTranche(val, nb, pctJeunes) {
  const isEn = getLang() === 'en';
  if (isEn) {
    if (val === '0-200')      return `These ${nb} communities, although modest in size, are essential to the program's territorial coverage. They are often peripheral villages for which JO'TALI is a rare opportunity for inclusion.`;
    if (val === '200-500')    return `These ${nb} communities form the program's backbone. With enough size to organize local activities, they are the main operational deployment lever for JO'TALI.`;
    if (val === '500-1000')   return `These ${nb} communities have a critical mass of youth suited to large-scale events. They are ideal gathering points for smaller neighboring communes.`;
    if (val === '1000-99999') return `These ${nb} communities alone concentrate ${pctJeunes} % of the total youth pool. Each should be prioritized as a host site for regional or zone events.`;
    return '';
  }
  if (val === '0-200')      return `Ces ${nb} communautés, bien que modestes en effectif, sont essentielles à la couverture territoriale du programme. Elles représentent souvent des villages périphériques pour lesquels JO'TALI est une opportunité rare d'inclusion.`;
  if (val === '200-500')    return `Ces ${nb} communautés forment le socle du programme. Avec une taille suffisante pour organiser des activités locales, elles constituent le principal levier de déploiement opérationnel de JO'TALI.`;
  if (val === '500-1000')   return `Ces ${nb} communautés disposent d'une masse critique de jeunes propice à des événements d'envergure. Elles sont idéales comme points de rassemblement pour les communes voisines plus petites.`;
  if (val === '1000-99999') return `Ces ${nb} communautés concentrent à elles seules ${pctJeunes} % du vivier total de jeunes. Chacune d'elles devrait être prioritairement retenue comme site d'accueil d'événements régionaux ou de zone.`;
  return '';
}

function _interpretationCroisee(zoneMeta, trMeta, nb, totalZone) {
  const isEn = getLang() === 'en';
  const pct = ((nb / totalZone) * 100).toFixed(1);
  if (isEn) {
    if (nb === 0) return `No community in ${zoneMeta.shortLabel} matches this bracket. This may reflect a particular demographic structure in this zone.`;
    if (trMeta.val === '1000-99999') return `These ${nb} communities (${pct} % of ${zoneMeta.shortLabel}) are the zone's most powerful mobilization levers. They are the natural candidates to host this territory's major JO'TALI events.`;
    if (trMeta.val === '500-1000')  return `With ${nb} communities representing ${pct} % of ${zoneMeta.shortLabel}, this bracket offers significant potential for zone events. Their accessibility and logistical capacity make them priority host sites.`;
    if (trMeta.val === '200-500')   return `These ${nb} communities (${pct} % of ${zoneMeta.shortLabel}) form the intermediate fabric of the program in this zone. They are suited to local events and can help mobilize toward larger sites.`;
    return `These ${nb} small communities (${pct} % of ${zoneMeta.shortLabel}) play an inclusive role in the program, ensuring that the least populated villages also benefit from JO'TALI activities.`;
  }
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
