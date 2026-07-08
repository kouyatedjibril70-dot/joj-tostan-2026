/* ============================================================
   map.js — Carte Leaflet interactive JOJ × Tostan 2026
   Dépendances : Leaflet, Leaflet.markercluster, data.js
   ============================================================ */

let map, markerLayer, allMarkers = [];
let activeZone = 0, prccOnly = false, activeJeunes = 0;

/* ── Couleur d'un marqueur selon la zone ─────────────────── */
function markerColor(d) {
  if (d.zone_id === 1) return '#27AE60';
  if (d.zone_id === 2) return '#E74C3C';
  if (d.zone_id === 3) return '#2980B9';
  return '#95a5a6';
}

/* ── Créer l'icône HTML d'un marqueur ───────────────────── */
function makeIcon(d) {
  const color = markerColor(d);
  const size = 14;
  return L.divIcon({
    html: `<div style="
      width:${size}px;
      height:${size}px;
      border-radius:50%;
      background:${color};
      border:2.5px solid #fff;
      box-shadow: 0 1px 5px rgba(0,0,0,.5);
    "></div>`,
    iconSize: [size, size],
    iconAnchor: [size/2, size/2],
    className: ''
  });
}

/* ── Contenu du popup Leaflet ────────────────────────────── */
function popupHTML(d) {
  const color = markerColor(d);
  const pct   = Math.round(d.score_total / 100 * 100);
  const zc    = { 1:'#27AE60', 2:'#E74C3C', 3:'#2980B9' }[d.zone_id];
  return `
    <div class="popup-nom">🏘️ ${d.nom}</div>
    <div class="popup-grid">
      <span class="popup-lbl">Région</span>       <span class="popup-val">${d.region}</span>
      <span class="popup-lbl">Département</span>  <span class="popup-val">${d.dept}</span>
      <span class="popup-lbl">Commune</span>       <span class="popup-val">${d.commune || '—'}</span>
      <span class="popup-lbl">Zone</span>          <span class="popup-val" style="color:${zc}">${d.zone}</span>
      <span class="popup-lbl">PRCC</span>          <span class="popup-val" style="color:${d.statut==='EN COURS'?'#8E44AD':'#27AE60'}">${d.statut}</span>
      <span class="popup-lbl">Jeunes 15-35</span> <span class="popup-val">${d.jeunes.toLocaleString('fr-FR')}</span>
      <span class="popup-lbl">RPP</span>           <span class="popup-val">${d.rpp}</span>
      <span class="popup-lbl">P&S</span>           <span class="popup-val">${d.ps}</span>
    </div>
    <div class="popup-score-label">Score de sélection</div>
    <div class="popup-bar"><div class="popup-fill" style="width:${pct}%;background:${color}"></div></div>
    <div class="popup-sub">
      <span>PRCC ${d.score_prcc}/35</span>
      <span>Jeunes ${d.score_jeunesse}/30</span>
      <span>Prox ${d.score_proximite}/20</span>
      <span>P&S ${d.score_densite}/15</span>
    </div>
    <div class="popup-total">
      <span>Score total</span>
      <span>${d.score_total} / 100</span>
    </div>`;
}

/* ── Mettre à jour le panneau latéral ───────────────────── */
function updateSidePanel(d) {
  const panel = document.getElementById('sidePanel');
  if (!panel) return;
  const zc    = { 1:'#27AE60', 2:'#E74C3C', 3:'#2980B9' }[d.zone_id];
  const color = markerColor(d);

  const scoreRows = [
    { label:'PRCC',     val: d.score_prcc,       max: 35, color:'#8E44AD' },
    { label:'Jeunes',   val: d.score_jeunesse,   max: 30, color:'#F39C12' },
    { label:'Proximité',val: d.score_proximite,  max: 20, color:'#2980B9' },
    { label:'P&S/RPP',  val: d.score_densite,    max: 15, color:'#27AE60' }
  ].map(r => `
    <div class="score-row">
      <span class="s-label">${r.label}</span>
      <div class="s-bar"><div class="s-fill" style="width:${Math.round(r.val/r.max*100)}%;background:${r.color}"></div></div>
      <span class="s-val">${r.val}/${r.max}</span>
    </div>`).join('');

  panel.innerHTML = `
    <div class="side-header">
      <h3>🏘️ ${d.nom}</h3>
      <span class="zone-chip" style="background:${zc}20;color:${zc}">Zone ${d.zone_id}</span>
    </div>
    <div class="side-body">
      <div class="side-stat-grid">
        <div class="side-stat">
          <div class="val">${d.jeunes.toLocaleString('fr-FR')}</div>
          <div class="lbl">Jeunes 15-35</div>
        </div>
        <div class="side-stat">
          <div class="val" style="color:${color}">${d.score_total}</div>
          <div class="lbl">Score /100</div>
        </div>
        <div class="side-stat">
          <div class="val">${d.region}</div>
          <div class="lbl">Région</div>
        </div>
        <div class="side-stat">
          <div class="val">${d.dept}</div>
          <div class="lbl">Département</div>
        </div>
      </div>
      <div style="font-size:.75rem;color:var(--muted);margin-bottom:12px">
        <strong>Commune :</strong> ${d.commune || '—'}
      </div>
      <div class="score-section">
        <h4>Détail des scores</h4>
        ${scoreRows}
        <div class="score-total-row">
          <span class="label">Score total</span>
          <span class="value">${d.score_total} / 100</span>
        </div>
      </div>
      <div class="score-section">
        <h4>Statut PRCC</h4>
        <span class="badge prcc">${d.statut}</span>
      </div>
      <div class="score-section">
        <h4>Programmes</h4>
        <div class="badge-row">
          <span class="badge ${d.rpp==='Oui'?'oui':'non'}">RPP : ${d.rpp}</span>
          <span class="badge ${d.ps==='Oui'?'oui':'non'}">P&S : ${d.ps}</span>
        </div>
      </div>
      <div style="font-size:.7rem;color:var(--muted);margin-top:12px">
        📍 ${d.lat.toFixed(4)}, ${d.lng.toFixed(4)}
      </div>
    </div>`;
}

/* ── Réinitialiser le panneau latéral ───────────────────── */
function resetSidePanel() {
  const panel = document.getElementById('sidePanel');
  if (!panel) return;
  panel.innerHTML = `
    <div class="side-panel-empty">
      <div class="icon">🗺️</div>
      <div>Cliquez sur une communauté<br>pour voir sa fiche détaillée</div>
    </div>`;
}

/* ── Initialiser la carte ────────────────────────────────── */
function initMap() {
  map = L.map('map', { zoomControl: true }).setView([13.8, -14.2], 7);

  // Fond de carte OpenStreetMap
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>',
    maxZoom: 18
  }).addTo(map);

  // Initialiser le cluster
  markerLayer = L.layerGroup().addTo(map);

  // Créer tous les marqueurs
  JOJ_DATA.forEach(d => {
    const marker = L.marker([d.lat, d.lng], { icon: makeIcon(d) });
    marker.bindPopup(popupHTML(d), { maxWidth: 280, className: 'joj-popup' });
    marker.on('click', () => updateSidePanel(d));
    marker._data = d;
    allMarkers.push(marker);
    markerLayer.addLayer(marker);
  });
  resetSidePanel();

  // Charger les polygones de zones
  loadZonePolygons();
}

/* ── Charger les polygones de zones ─────────────────────── */
let zoneLayer = null;

function loadZonePolygons() {
  fetch('data/zones.geojson')
    .then(r => r.json())
    .then(data => {
      const zoneColors = { 1:'#27AE60', 2:'#E74C3C', 3:'#2980B9' };
      zoneLayer = L.geoJSON(data, {
        style(feature) {
          const c = zoneColors[feature.properties.zone_id];
          return {
            color: c,
            weight: 2,
            opacity: 0.6,
            fillColor: c,
            fillOpacity: 0.04,
            dashArray: '6 4'
          };
        },
        onEachFeature(feature, layer) {
          const p = feature.properties;
          layer.bindTooltip(`<b>${p.nom}</b><br>${p.nb_communautes} communautés`, {
            sticky: true, className: 'zone-tooltip'
          });
        }
      }).addTo(map);
    })
    .catch(() => console.log('zones.geojson non chargé (normal en file://)'));
}

/* ── Filtrer par zone ────────────────────────────────────── */
function filterZone(zoneId, btn) {
  activeZone = zoneId;

  // Mettre à jour les boutons
  document.querySelectorAll('.zone-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  applyFilters();

  // Recentrer la carte
  if (zoneId === 0) {
    map.setView([13.8, -14.2], 7);
  } else {
    const pts = JOJ_DATA.filter(d => d.zone_id === zoneId).map(d => [d.lat, d.lng]);
    if (pts.length) map.fitBounds(L.latLngBounds(pts), { padding: [40, 40] });
  }

  resetSidePanel();
}

/* ── Filtrer PRCC EN COURS ───────────────────────────────── */
function togglePRCC() {
  prccOnly = !prccOnly;
  const btn = document.getElementById('btnPRCC');
  if (btn) btn.classList.toggle('active', prccOnly);
  applyFilters();
  resetSidePanel();
}

/* ── Filtrer par tranche de jeunes 15-35 ────────────────── */
function filterJeunes(range) {
  activeJeunes = parseInt(range);
  applyFilters();
  resetSidePanel();
}

/* ── Appliquer les filtres actifs ────────────────────────── */
function applyFilters() {
  markerLayer.clearLayers();
  const filtered = allMarkers.filter(m => {
    const d = m._data;
    if (activeZone !== 0 && d.zone_id !== activeZone) return false;
    if (prccOnly && d.statut !== 'EN COURS') return false;
    if (activeJeunes !== 0) {
      const j = m._data.jeunes;
      if (activeJeunes === 1 && j >= 200)             return false;
      if (activeJeunes === 2 && (j < 200 || j >= 500))  return false;
      if (activeJeunes === 3 && (j < 500 || j >= 1000)) return false;
      if (activeJeunes === 4 && j < 1000)             return false;
    }
    return true;
  });
  filtered.forEach(m => markerLayer.addLayer(m));
}

/* ── Init au chargement ──────────────────────────────────── */
document.addEventListener('DOMContentLoaded', initMap);
