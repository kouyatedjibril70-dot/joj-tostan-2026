# 🗺️ Guide QGIS — JOJ × Tostan 2026

Tout ce qu'il faut faire dans QGIS, étape par étape.

---

## Étape 1 — Ouvrir la Console Python

1. Lancer **QGIS** (version 3.x recommandée)
2. Menu **Extensions** → **Console Python** (ou `Ctrl+Alt+P`)
3. La console s'ouvre en bas de l'écran

---

## Étape 2 — Charger toutes les couches automatiquement

1. Dans la console, cliquer sur l'icône **"Ouvrir un éditeur"** (les deux flèches)
2. Puis **"Ouvrir un script"** → naviguer vers ce dossier
3. Sélectionner **`JOJ_Tostan_2026_QGIS.py`**
4. Cliquer sur **▶ Exécuter**

**Résultat :** 6 couches apparaissent automatiquement dans le panneau :

| # | Couche | Description |
|---|--------|-------------|
| 1 | OpenStreetMap | Fond de carte |
| 2 | Zones d'intervention | Polygones des 3 zones colorés |
| 3 | Communautés — par zone | Points colorés par zone |
| 4 | Communautés — Score /100 | Dégradé rouge → vert selon le score |
| 5 | Communautés — Jeunes 15-35 | Taille proportionnelle au nb de jeunes |
| 6 | PRCC EN COURS (20) | Étoiles violettes — priorités absolues |

---

## Étape 3 — Naviguer et explorer

- **Activer / désactiver** une couche : coche à gauche du nom
- **Zoomer** sur une zone : clic droit sur la couche → **Zoomer sur la couche**
- **Inspecter** une communauté : outil **Identifier les entités** (icône "i") → clic sur un point
- **Activer les étiquettes** : clic droit → Propriétés → Étiquettes → cocher "Étiquettes simples"

---

## Étape 4 — Créer une carte thématique pour le rapport

### Option A — Export rapide (recommandé)
1. Dans la console Python, ouvrir **`JOJ_Export_Cartes.py`**
2. Cliquer **▶ Exécuter**
3. 3 fichiers PNG sont créés dans `data/cartes/`

### Option B — Mise en page manuelle
1. Menu **Projet** → **Nouvelle mise en page d'impression**
2. Donner un nom → OK
3. Dans la mise en page :
   - Ajouter une carte : **Ajouter élément → Ajouter carte**
   - Ajouter un titre : **Ajouter élément → Ajouter étiquette**
   - Ajouter une légende : **Ajouter élément → Ajouter légende**
   - Ajouter une échelle : **Ajouter élément → Ajouter barre d'échelle**
4. Exporter : **Mise en page → Exporter en image** (PNG/JPEG)
   ou **Exporter en PDF**

---

## Étape 5 — Personnaliser la symbologie

### Changer les couleurs d'une couche
1. Double-clic sur la couche dans le panneau
2. Onglet **Symbologie**
3. Modifier les couleurs → **OK**

### Créer une carte de chaleur (heatmap)
1. Clic droit sur la couche communautés → **Propriétés**
2. Onglet **Symbologie** → Type de rendu : **Carte de chaleur**
3. Rayon : `20` · Poids : `score_total`
4. Palette : **RdYlGn** (rouge-jaune-vert)

---

## Couches recommandées par carte thématique

| Carte | Couches à activer |
|-------|-------------------|
| Vue d'ensemble | OSM + Zones + Communautés par zone |
| Scores | OSM + Zones + Score /100 |
| Jeunes | OSM + Zones + Jeunes 15-35 |
| Priorités | OSM + PRCC EN COURS |
| Densité | OSM + Communautés par zone (heatmap) |

---

## Problèmes fréquents

**"Couche invalide"** → Vérifier que les fichiers `.geojson` sont bien dans `data/`

**"Module introuvable"** → Utiliser QGIS 3.16+ et la console Python intégrée

**Fond OSM ne charge pas** → Vérifier la connexion internet, ou utiliser un fond hors-ligne

**Points mal placés** → Vérifier le SCR : doit être **EPSG:4326** (WGS 84)
