/* ============================================================
   table.js — Tableau interactif JOJ × Tostan 2026
   Dépendance : data.js
   ============================================================ */

let filteredRows = [...JOJ_DATA];
let sortKey      = 'score_total';
let sortAsc      = false;
let currentPage  = 1;
const PER_PAGE   = 25;
let tableReady   = false;

/* ── Initialiser les filtres ─────────────────────────────── */
function initTable() {
  if (tableReady) { renderTable(); return; }
  tableReady = true;

  // Peupler le select régions
  const regions = [...new Set(JOJ_DATA.map(d => d.region).filter(Boolean))].sort();
  const selRegion = document.getElementById('filterRegion');
  regions.forEach(r => {
    const o = document.createElement('option');
    o.value = r; o.textContent = r;
    selRegion.appendChild(o);
  });

  filterTable();
}

/* ── Appliquer tous les filtres ──────────────────────────── */
function filterTable() {
  const q      = (document.getElementById('tableSearch')?.value || '').toLowerCase();
  const zoneF  = document.getElementById('filterZoneT')?.value  || '';
  const regionF= document.getElementById('filterRegion')?.value || '';
  const prccF  = document.getElementById('filterPRCCT')?.value  || '';
  const rppF   = document.getElementById('filterRPP')?.value    || '';

  filteredRows = JOJ_DATA.filter(d => {
    if (q && !d.nom.toLowerCase().includes(q) &&
             !d.commune.toLowerCase().includes(q) &&
             !d.dept.toLowerCase().includes(q)) return false;
    if (zoneF   && String(d.zone_id) !== zoneF)    return false;
    if (regionF && d.region !== regionF)            return false;
    if (prccF   && !d.statut.includes(prccF))       return false;
    if (rppF    && d.rpp !== rppF)                  return false;
    return true;
  });

  applySort();
  currentPage = 1;
  renderTable();
}

/* ── Trier ───────────────────────────────────────────────── */
function sortTable(key) {
  if (sortKey === key) { sortAsc = !sortAsc; }
  else { sortKey = key; sortAsc = false; }
  applySort();
  renderTable();
}

function applySort() {
  filteredRows.sort((a, b) => {
    const av = a[sortKey], bv = b[sortKey];
    if (typeof av === 'string') return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
    return sortAsc ? av - bv : bv - av;
  });
}

/* ── Rendre le tableau ───────────────────────────────────── */
function renderTable() {
  const total = filteredRows.length;
  const start = (currentPage - 1) * PER_PAGE;
  const end   = Math.min(start + PER_PAGE, total);
  const slice = filteredRows.slice(start, end);

  // Compteur
  const counter = document.getElementById('tableCount');
  if (counter) counter.textContent = `${total} communauté${total > 1 ? 's' : ''}`;

  // Corps du tableau
  const tbody  = document.getElementById('tableBody');
  if (!tbody) return;

  const zTag  = { 1:'zt1', 2:'zt2', 3:'zt3' };
  const scoreColor = s => s >= 60 ? '#27AE60' : s >= 50 ? '#F39C12' : s >= 40 ? '#E67E22' : '#E74C3C';
  const prccClass  = s => s === 'EN COURS' ? 'prcc-en-cours' : s.match(/202[2-9]|2026/) ? 'prcc-recent' : 'prcc-old';

  tbody.innerHTML = slice.map(d => `
    <tr onclick="highlightOnMap(${JOJ_DATA.indexOf(d)})" style="cursor:pointer">
      <td><strong>${d.nom}</strong></td>
      <td>${d.region}</td>
      <td>${d.dept}</td>
      <td>${d.commune || '—'}</td>
      <td><span class="zone-tag ${zTag[d.zone_id]}">Z${d.zone_id}</span></td>
      <td><span class="prcc-tag ${prccClass(d.statut)}">${d.statut}</span></td>
      <td>${d.jeunes.toLocaleString('fr-FR')}</td>
      <td class="${d.rpp === 'Oui' ? 'oui-val' : 'non-val'}">${d.rpp}</td>
      <td class="${d.ps  === 'Oui' ? 'oui-val' : 'non-val'}">${d.ps}</td>
      <td>
        <div class="score-bar-cell">
          <div class="mini-bar">
            <div class="mini-fill" style="width:${Math.round(d.score_total/100*100)}%;background:${scoreColor(d.score_total)}"></div>
          </div>
          <strong style="color:${scoreColor(d.score_total)}">${d.score_total}</strong>
        </div>
      </td>
    </tr>`).join('');

  // Pagination
  renderPagination(total);
}

/* ── Pagination ──────────────────────────────────────────── */
function renderPagination(total) {
  const totalPages = Math.ceil(total / PER_PAGE);
  const footer     = document.getElementById('tablePagination');
  if (!footer) return;

  const start = (currentPage - 1) * PER_PAGE + 1;
  const end   = Math.min(currentPage * PER_PAGE, total);

  let html = `<span class="page-info">${start}–${end} sur ${total}</span>`;
  if (currentPage > 1)         html = `<button class="page-btn" onclick="goPage(${currentPage - 1})">◀ Préc.</button>` + html;
  if (currentPage < totalPages) html += `<button class="page-btn" onclick="goPage(${currentPage + 1})">Suiv. ▶</button>`;

  footer.innerHTML = html;
}

function goPage(p) { currentPage = p; renderTable(); }

/* ── Cliquer sur une ligne → zoomer sur la carte ────────── */
function highlightOnMap(idx) {
  const d = JOJ_DATA[idx];
  if (!d) return;
  showTab('map');
  setTimeout(() => {
    if (typeof map === 'undefined') return;
    map.setView([d.lat, d.lng], 14);
    // allMarkers est construit dans le même ordre que JOJ_DATA
    const marker = allMarkers[idx];
    if (marker) {
      marker.openPopup();
      updateSidePanel(d);
    }
  }, 150);
}

/* ── Export CSV ──────────────────────────────────────────── */
function exportCSV() {
  const headers = ['Communauté','Région','Département','Commune','Zone','Zone_ID',
                   'Statut_PRCC','Jeunes_15_35','RPP','PS',
                   'Score_PRCC','Score_Jeunesse','Score_Proximite','Score_Densite','Score_Total',
                   'Latitude','Longitude'];
  const rows = filteredRows.map(d =>
    [d.nom, d.region, d.dept, d.commune, d.zone, d.zone_id,
     d.statut, d.jeunes, d.rpp, d.ps,
     d.score_prcc, d.score_jeunesse, d.score_proximite, d.score_densite, d.score_total,
     d.lat, d.lng].join(';')
  );
  const csv   = [headers.join(';'), ...rows].join('\n');
  const blob  = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url   = URL.createObjectURL(blob);
  const a     = document.createElement('a');
  a.href      = url;
  a.download  = `JOJ_Tostan_2026_selection_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
