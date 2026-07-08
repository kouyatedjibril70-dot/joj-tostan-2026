/* ============================================================
   charts.js — Graphiques JOJ × Tostan 2026
   Dépendance : Chart.js, data.js
   ============================================================ */

let chartsBuilt = false;

function buildCharts() {
  if (chartsBuilt) return;
  chartsBuilt = true;

  const Z_COLORS = ['#27AE60', '#E74C3C', '#2980B9'];
  const GRID_COLOR = '#f0f4f8';

  // ── 1. Répartition par région (barres horizontales) ──────
  const regionCounts = {};
  JOJ_DATA.forEach(d => { if (d.region) regionCounts[d.region] = (regionCounts[d.region] || 0) + 1; });
  const regEntries = Object.entries(regionCounts).sort((a, b) => b[1] - a[1]);

  new Chart(document.getElementById('chartRegions'), {
    type: 'bar',
    data: {
      labels: regEntries.map(e => e[0]),
      datasets: [{
        data: regEntries.map(e => e[1]),
        backgroundColor: ['#27AE60','#2ECC71','#E74C3C','#C0392B','#2980B9'],
        borderRadius: 6,
        borderSkipped: false
      }]
    },
    options: {
      indexAxis: 'y',
      plugins: { legend: { display: false } },
      scales: {
        x: { beginAtZero: true, grid: { color: GRID_COLOR } },
        y: { grid: { display: false } }
      }
    }
  });

  // ── 2. Donut zones ───────────────────────────────────────
  new Chart(document.getElementById('chartZones'), {
    type: 'doughnut',
    data: {
      labels: ['Zone 1 — Kolda & Sédhiou', 'Zone 2 — Tamba & Kédougou', 'Zone 3 — Matam'],
      datasets: [{
        data: [141, 59, 100],
        backgroundColor: Z_COLORS,
        borderWidth: 3,
        borderColor: '#fff',
        hoverOffset: 6
      }]
    },
    options: {
      cutout: '68%',
      plugins: {
        legend: { position: 'bottom', labels: { font: { size: 11 }, padding: 10 } }
      }
    }
  });

  // ── 3. Statuts PRCC ──────────────────────────────────────
  const prccCounts = {};
  JOJ_DATA.forEach(d => { const k = d.statut || 'Inconnu'; prccCounts[k] = (prccCounts[k] || 0) + 1; });
  const prccEntries = Object.entries(prccCounts).sort((a, b) => b[1] - a[1]).slice(0, 10);

  new Chart(document.getElementById('chartPRCC'), {
    type: 'bar',
    data: {
      labels: prccEntries.map(e => e[0]),
      datasets: [{
        data: prccEntries.map(e => e[1]),
        backgroundColor: prccEntries.map(e => e[0] === 'EN COURS' ? '#8E44AD' : '#95a5a6'),
        borderRadius: 5
      }]
    },
    options: {
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, grid: { color: GRID_COLOR } },
        x: { ticks: { maxRotation: 35, font: { size: 10 } }, grid: { display: false } }
      }
    }
  });

  // ── 4. Distribution des scores ───────────────────────────
  const bins = { '35–45': 0, '46–55': 0, '56–70': 0, '71–80': 0 };
  JOJ_DATA.forEach(d => {
    if (d.score_total <= 45)      bins['35–45']++;
    else if (d.score_total <= 55) bins['46–55']++;
    else if (d.score_total <= 70) bins['56–70']++;
    else                          bins['71–80']++;
  });

  new Chart(document.getElementById('chartScores'), {
    type: 'bar',
    data: {
      labels: Object.keys(bins),
      datasets: [{
        data: Object.values(bins),
        backgroundColor: ['#E74C3C', '#E67E22', '#F39C12', '#27AE60'],
        borderRadius: 6
      }]
    },
    options: {
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, grid: { color: GRID_COLOR } },
        x: { grid: { display: false } }
      }
    }
  });

  // ── 5. Jeunes par zone (barres verticales) ───────────────
  const jeunesZone = { 1: 0, 2: 0, 3: 0 };
  JOJ_DATA.forEach(d => { jeunesZone[d.zone_id] += d.jeunes; });

  new Chart(document.getElementById('chartJeunes'), {
    type: 'bar',
    data: {
      labels: ['Zone 1\nKolda & Sédhiou', 'Zone 2\nTamba & Kédougou', 'Zone 3\nMatam'],
      datasets: [{
        data: Object.values(jeunesZone).map(v => +(v / 1000).toFixed(1)),
        backgroundColor: Z_COLORS,
        borderRadius: 8
      }]
    },
    options: {
      plugins: { legend: { display: false } },
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: 'Milliers de jeunes' },
          grid: { color: GRID_COLOR }
        },
        x: { grid: { display: false } }
      }
    }
  });

  // ── 6. Couverture RPP & P&S ──────────────────────────────
  const rppOnly  = JOJ_DATA.filter(d => d.rpp === 'Oui' && d.ps !== 'Oui').length;
  const psOnly   = JOJ_DATA.filter(d => d.ps  === 'Oui' && d.rpp !== 'Oui').length;
  const both     = JOJ_DATA.filter(d => d.rpp === 'Oui' && d.ps  === 'Oui').length;
  const none     = JOJ_DATA.filter(d => d.rpp !== 'Oui' && d.ps  !== 'Oui').length;

  new Chart(document.getElementById('chartProgrammes'), {
    type: 'doughnut',
    data: {
      labels: ['RPP seul', 'P&S seul', 'RPP + P&S', 'PRCC uniquement'],
      datasets: [{
        data: [rppOnly, psOnly, both, none],
        backgroundColor: ['#27AE60', '#2980B9', '#F39C12', '#95a5a6'],
        borderWidth: 3,
        borderColor: '#fff'
      }]
    },
    options: {
      cutout: '60%',
      plugins: { legend: { position: 'bottom', labels: { font: { size: 11 } } } }
    }
  });

}
