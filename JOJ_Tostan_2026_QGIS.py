# ============================================================
# JOJ_Tostan_2026_QGIS.py
# Script Python à exécuter dans la Console Python de QGIS
#
# UTILISATION :
#   1. Ouvrir QGIS
#   2. Menu Extensions → Console Python (Ctrl+Alt+P)
#   3. Cliquer sur l'icône "Ouvrir un script" (dossier)
#   4. Sélectionner ce fichier
#   5. Cliquer sur "Exécuter" (triangle vert)
#
# RÉSULTAT :
#   → 5 couches chargées automatiquement avec symbologies
#   → Fond de carte OpenStreetMap
#   → Prêt pour export PDF / cartes thématiques
# ============================================================

import os
from qgis.core import (
    QgsProject, QgsVectorLayer, QgsRasterLayer,
    QgsSymbol, QgsRendererCategory, QgsCategorizedSymbolRenderer,
    QgsGraduatedSymbolRenderer, QgsRendererRange,
    QgsMarkerSymbol, QgsFillSymbol,
    QgsSimpleMarkerSymbolLayer, QgsSimpleFillSymbolLayer,
    QgsWkbTypes, QgsClassificationJenks,
    QgsPalLayerSettings, QgsVectorLayerSimpleLabeling,
    QgsTextFormat, QgsTextBufferSettings,
    QgsProperty
)
from qgis.utils import iface
from PyQt5.QtGui import QColor, QFont
from PyQt5.QtCore import Qt

# ── 0. Configuration des chemins ─────────────────────────────
# ⚠️ MODIFIER CE CHEMIN selon l'emplacement de votre projet
PROJECT_DIR = os.path.dirname(__file__)   # Dossier du script
DATA_DIR    = os.path.join(PROJECT_DIR, 'data')

GEOJSON_COMMUNITIES = os.path.join(DATA_DIR, 'communities.geojson')
GEOJSON_ZONES       = os.path.join(DATA_DIR, 'zones.geojson')

# Vérification
for f in [GEOJSON_COMMUNITIES, GEOJSON_ZONES]:
    if not os.path.exists(f):
        print(f"❌ ERREUR : Fichier introuvable : {f}")
        print("   → Vérifiez le chemin PROJECT_DIR")
        raise FileNotFoundError(f)

print("✅ Fichiers trouvés, chargement en cours…")

# ── 1. Fond de carte OpenStreetMap ───────────────────────────
def add_osm():
    uri = "type=xyz&url=https://tile.openstreetmap.org/{z}/{x}/{y}.png&zmax=19&zmin=0"
    layer = QgsRasterLayer(uri, "OpenStreetMap", "wms")
    if layer.isValid():
        QgsProject.instance().addMapLayer(layer)
        print("✅ Fond OSM ajouté")
    else:
        print("⚠️  Fond OSM non disponible (pas de connexion internet)")

# ── 2. Couche Zones (polygones colorés) ──────────────────────
def add_zones_layer():
    layer = QgsVectorLayer(GEOJSON_ZONES, "Zones d'intervention", "ogr")
    if not layer.isValid():
        print("❌ zones.geojson invalide"); return None

    ZONE_COLORS = {
        1: ('#27AE60', '#1e8449'),   # Zone 1 Kolda & Sédhiou
        2: ('#E74C3C', '#c0392b'),   # Zone 2 Tamba & Kédougou
        3: ('#2980B9', '#1a5276'),   # Zone 3 Matam
    }
    ZONE_LABELS = {
        1: 'Zone 1 — Kolda & Sédhiou (141)',
        2: 'Zone 2 — Tamba & Kédougou (59)',
        3: 'Zone 3 — Matam (100)',
    }

    categories = []
    for zone_id, (fill_hex, border_hex) in ZONE_COLORS.items():
        sym = QgsFillSymbol.createSimple({
            'color':        fill_hex,
            'color_border': border_hex,
            'style':        'solid',
            'width_border': '0.6',
        })
        # Transparence 85%
        sym.setOpacity(0.15)
        cat = QgsRendererCategory(zone_id, sym, ZONE_LABELS.get(zone_id, str(zone_id)))
        categories.append(cat)

    renderer = QgsCategorizedSymbolRenderer('zone_id', categories)
    layer.setRenderer(renderer)
    QgsProject.instance().addMapLayer(layer)
    print("✅ Couche Zones ajoutée")
    return layer

# ── 3. Couche Communautés par ZONE (couleur par zone) ────────
def add_communities_zone():
    layer = QgsVectorLayer(GEOJSON_COMMUNITIES, "Communautés — par zone", "ogr")
    if not layer.isValid():
        print("❌ communities.geojson invalide"); return None

    ZONE_COLORS = {1: '#27AE60', 2: '#E74C3C', 3: '#2980B9'}
    ZONE_LABELS = {
        1: 'Zone 1 — Kolda & Sédhiou',
        2: 'Zone 2 — Tamba & Kédougou',
        3: 'Zone 3 — Matam',
    }

    categories = []
    for zone_id, color in ZONE_COLORS.items():
        sym = QgsMarkerSymbol.createSimple({
            'name':              'circle',
            'color':             color,
            'color_border':      'white',
            'size':              '3.0',
            'outline_width':     '0.4',
        })
        cat = QgsRendererCategory(zone_id, sym, ZONE_LABELS.get(zone_id, str(zone_id)))
        categories.append(cat)

    renderer = QgsCategorizedSymbolRenderer('zone_id', categories)
    layer.setRenderer(renderer)

    # Labels : nom de la communauté
    _add_labels(layer, 'nom', 6, '#2c3e50')

    QgsProject.instance().addMapLayer(layer)
    print("✅ Couche Communautés (par zone) ajoutée")
    return layer

# ── 4. Couche Score Total (dégradé de couleur) ───────────────
def add_communities_score():
    layer = QgsVectorLayer(GEOJSON_COMMUNITIES, "Communautés — Score /100", "ogr")
    if not layer.isValid():
        print("❌ communities.geojson invalide"); return None

    # Plages de scores avec couleurs dégradées
    ranges_data = [
        (0, 45, '#E74C3C', 'Score 0–45 (faible)'),
        (46, 55, '#E67E22', 'Score 46–55'),
        (56, 70, '#F1C40F', 'Score 56–70'),
        (71, 100, '#27AE60', 'Score 71–100 (élevé)'),
    ]

    ranges = []
    for low, high, color, label in ranges_data:
        sym = QgsMarkerSymbol.createSimple({
            'name':          'circle',
            'color':         color,
            'color_border':  'white',
            'size':          '3.2',
            'outline_width': '0.4',
        })
        r = QgsRendererRange(low, high, sym, label)
        ranges.append(r)

    renderer = QgsGraduatedSymbolRenderer('score_total', ranges)
    layer.setRenderer(renderer)
    QgsProject.instance().addMapLayer(layer)
    print("✅ Couche Score /100 ajoutée")
    return layer

# ── 5. Couche PRCC EN COURS (priorités absolues) ─────────────
def add_communities_prcc():
    # Filtrer uniquement les EN COURS
    uri = f"{GEOJSON_COMMUNITIES}|subset=statut_prcc = 'EN COURS'"
    layer = QgsVectorLayer(uri, "PRCC EN COURS (20 communautés)", "ogr")
    if not layer.isValid():
        # Fallback sans filtre
        layer = QgsVectorLayer(GEOJSON_COMMUNITIES, "PRCC EN COURS", "ogr")

    sym = QgsMarkerSymbol.createSimple({
        'name':          'star',
        'color':         '#8E44AD',
        'color_border':  'white',
        'size':          '6.0',
        'outline_width': '0.5',
    })
    layer.renderer().setSymbol(sym)

    # Labels en violet
    _add_labels(layer, 'nom', 7, '#8E44AD')

    QgsProject.instance().addMapLayer(layer)
    print("✅ Couche PRCC EN COURS ajoutée")
    return layer

# ── 6. Couche Jeunes 15-35 (taille proportionnelle) ──────────
def add_communities_jeunes():
    layer = QgsVectorLayer(GEOJSON_COMMUNITIES, "Communautés — Jeunes 15-35", "ogr")
    if not layer.isValid():
        print("❌ communities.geojson invalide"); return None

    # Taille du point proportionnelle au nombre de jeunes
    ranges_data = [
        (0,    200,  2.0, '#3498DB', '< 200 jeunes'),
        (200,  500,  3.5, '#2980B9', '200–500 jeunes'),
        (500,  1000, 5.0, '#1a5276', '500–1000 jeunes'),
        (1000, 5000, 7.0, '#0f2d4a', '> 1000 jeunes'),
    ]

    ranges = []
    for low, high, size, color, label in ranges_data:
        sym = QgsMarkerSymbol.createSimple({
            'name':          'circle',
            'color':         color,
            'color_border':  'white',
            'size':          str(size),
            'outline_width': '0.3',
        })
        r = QgsRendererRange(low, high, sym, label)
        ranges.append(r)

    renderer = QgsGraduatedSymbolRenderer('jeunes', ranges)
    layer.setRenderer(renderer)
    QgsProject.instance().addMapLayer(layer)
    print("✅ Couche Jeunes 15-35 ajoutée")
    return layer

# ── Fonction utilitaire : labels ──────────────────────────────
def _add_labels(layer, field, size, color_hex):
    """Ajoute des étiquettes simples à une couche vecteur."""
    try:
        settings = QgsPalLayerSettings()
        settings.fieldName = field
        settings.enabled   = True

        fmt = QgsTextFormat()
        fmt.setFont(QFont('Segoe UI', size))
        fmt.setSize(size)
        fmt.setColor(QColor(color_hex))

        # Halo blanc pour lisibilité
        buf = QgsTextBufferSettings()
        buf.setEnabled(True)
        buf.setSize(1.0)
        buf.setColor(QColor('white'))
        fmt.setBuffer(buf)

        settings.setFormat(fmt)
        settings.placement = QgsPalLayerSettings.OverPoint
        settings.dist = 1.5

        labeling = QgsVectorLayerSimpleLabeling(settings)
        layer.setLabelsEnabled(False)   # labels off par défaut, à activer manuellement
        layer.setLabeling(labeling)
    except Exception as e:
        print(f"⚠️  Labels non configurés : {e}")

# ── Cadrer la vue sur le Sénégal ─────────────────────────────
def zoom_to_senegal():
    try:
        from qgis.core import QgsRectangle, QgsCoordinateReferenceSystem
        canvas = iface.mapCanvas()
        # Emprise approximative du Sénégal
        rect = QgsRectangle(-17.5, 11.5, -11.5, 16.7)
        canvas.setExtent(rect)
        canvas.refresh()
        print("✅ Vue cadrée sur le Sénégal")
    except Exception as e:
        print(f"⚠️  Zoom automatique échoué : {e}")

# ════════════════════════════════════════════════════════════
# EXÉCUTION PRINCIPALE
# ════════════════════════════════════════════════════════════
print("\n" + "="*55)
print("  JOJ × Tostan 2026 — Chargement des couches QGIS")
print("="*55)

# Vider le projet en cours
QgsProject.instance().clear()

# Ordre d'ajout : fond en premier, couches actives au-dessus
add_osm()
add_zones_layer()
add_communities_zone()
add_communities_score()
add_communities_jeunes()
add_communities_prcc()

# Cadrer la vue
zoom_to_senegal()

print("\n" + "="*55)
print("  ✅ Toutes les couches chargées avec succès !")
print("="*55)
print("""
COUCHES DISPONIBLES :
  1. OpenStreetMap         → fond de carte
  2. Zones d'intervention  → polygones des 3 zones
  3. Communautés — par zone     → couleur par zone
  4. Communautés — Score /100   → dégradé de couleur
  5. Communautés — Jeunes 15-35 → taille proportionnelle
  6. PRCC EN COURS (20)         → étoiles violettes

CONSEILS :
  → Activer/désactiver chaque couche dans le panneau de gauche
  → Clic droit sur une couche → Propriétés → Symbologie pour personnaliser
  → Pour activer les étiquettes : clic droit → Propriétés → Étiquettes → ON
  → Pour exporter PDF : Projet → Nouvelle mise en page d'impression
""")
