# 🏅 JOJ × Tostan 2026 — Plateforme Géospatiale

Tableau de bord interactif de sélection des 300 communautés pilotes pour les Jeux Olympiques Communautaires JOJ × Tostan 2026 au Sénégal.

---

## 📁 Structure du projet

```
joj-tostan-2026/
├── index.html              ← Dashboard principal (ouvrir dans navigateur)
├── rapport/
│   └── rapport_carto.html  ← Rapport PDF (Ctrl+P pour exporter)
├── css/
│   └── style.css           ← Styles globaux
├── js/
│   ├── data.js             ← Données des 300 communautés (JS)
│   ├── map.js              ← Carte Leaflet interactive
│   ├── charts.js           ← Graphiques Chart.js
│   └── table.js            ← Tableau filtrable & triable
├── data/
│   ├── communities.geojson ← Pour QGIS / SIG
│   ├── zones.geojson       ← Polygones des 3 zones
│   └── communities.csv     ← Export tableur propre
└── assets/
    └── (logos, images)
```

---

## 🚀 Démarrage rapide

### Option 1 — Ouvrir dans le navigateur
Double-cliquer sur `index.html` → s'ouvre directement dans Chrome/Firefox.

### Option 2 — Serveur local (recommandé pour le dev)
```bash
# Dans VS Code, ouvrir un terminal et taper :
npx live-server
# ou si Python installé :
python -m http.server 8080
```
Puis ouvrir `http://localhost:8080`

---

## 🗺️ Utilisation dans QGIS

1. Ouvrir QGIS
2. **Glisser-déposer** `data/communities.geojson` dans la fenêtre QGIS
3. **Glisser-déposer** `data/zones.geojson` pour les contours de zones
4. Faire un clic droit sur la couche → **Propriétés** → **Symbologie**
5. Choisir **Catégorisé** sur le champ `zone_id` pour les couleurs par zone
6. Ou **Gradué** sur `score_total` pour une heatmap de scores

---

## 📊 Données

| Fichier | Contenu | Usage |
|---------|---------|-------|
| `communities.geojson` | 300 points géolocalisés | QGIS, Leaflet |
| `zones.geojson` | 3 polygones de zones | QGIS, superposition |
| `communities.csv` | 300 lignes, 17 colonnes | Excel, Tableau |
| `js/data.js` | Même data en JS | Dashboard web |

### Colonnes disponibles
- `Communauté` — Nom
- `Région`, `Département`, `Commune`
- `Zone`, `Zone_ID` (1, 2 ou 3)
- `Statut_PRCC` — EN COURS / Terminé XXXX / Inconnu
- `Jeunes_15_35` — Estimation population cible
- `RPP`, `PS` — Oui / Non
- `Score_PRCC` (max 35), `Score_Jeunesse` (max 30)
- `Score_Proximite` (max 20), `Score_Densite` (max 15)
- `Score_Total` (max 100)
- `Latitude`, `Longitude`

---

## 🛠️ Sprints de développement

- [x] **Sprint 1** — Structure projet + données GeoJSON/CSV/JS
- [ ] **Sprint 2** — Dashboard avancé (clustering, panneau latéral)
- [ ] **Sprint 3** — Couches QGIS + cartes thématiques
- [ ] **Sprint 4** — Rapport PDF cartographique

---

## 👤 Auteur
Djibril · Géomaticien / Data Analyst · Dakar, Sénégal
