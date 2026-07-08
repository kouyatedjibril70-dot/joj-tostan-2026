# ============================================================
# JOJ_Export_Cartes.py
# Script Python QGIS — Export automatique des cartes en PNG
#
# ⚠️ À exécuter APRÈS JOJ_Tostan_2026_QGIS.py
#
# UTILISATION :
#   Console Python QGIS → Ouvrir ce fichier → Exécuter
#
# RÉSULTAT :
#   → 3 cartes PNG dans le dossier /data/cartes/
#     • carte_zones.png          (vue d'ensemble 3 zones)
#     • carte_scores.png         (scores de sélection)
#     • carte_prcc_en_cours.png  (priorités absolues)
# ============================================================

import os
from qgis.core import (
    QgsProject, QgsPrintLayout, QgsLayoutItemMap,
    QgsLayoutItemLabel, QgsLayoutItemLegend,
    QgsLayoutSize, QgsLayoutPoint, QgsUnitTypes,
    QgsLayoutExporter, QgsRectangle
)
from PyQt5.QtCore import QRectF
from PyQt5.QtGui import QColor, QFont

# ── Chemin de sortie ─────────────────────────────────────────
PROJECT_DIR  = os.path.dirname(__file__)
OUTPUT_DIR   = os.path.join(PROJECT_DIR, 'data', 'cartes')
os.makedirs(OUTPUT_DIR, exist_ok=True)

print(f"📁 Dossier de sortie : {OUTPUT_DIR}")

def export_carte(nom_fichier, titre, layer_names_visible, extent_rect=None, dpi=200):
    """
    Crée une mise en page simple et exporte en PNG.
    
    nom_fichier     : nom du fichier PNG (sans extension)
    titre           : titre affiché sur la carte
    layer_names_visible : liste des noms de couches à afficher
    extent_rect     : QgsRectangle (None = Sénégal complet)
    dpi             : résolution en DPI
    """
    project  = QgsProject.instance()
    manager  = project.layoutManager()

    # Supprimer la mise en page si elle existe déjà
    existing = manager.layoutByName(nom_fichier)
    if existing:
        manager.removeLayout(existing)

    # Créer une nouvelle mise en page A4 paysage
    layout = QgsPrintLayout(project)
    layout.initializeDefaults()
    layout.setName(nom_fichier)
    layout.pageCollection().pages()[0].setPageSize('A4', QgsLayoutItemPage.Landscape)

    # ── Item carte ───────────────────────────────────────────
    map_item = QgsLayoutItemMap(layout)
    map_item.setRect(QRectF(0, 0, 270, 170))
    map_item.attemptMove(QgsLayoutPoint(10, 20, QgsUnitTypes.LayoutMillimeters))
    map_item.attemptResize(QgsLayoutSize(270, 170, QgsUnitTypes.LayoutMillimeters))

    # Emprise géographique
    if extent_rect:
        map_item.setExtent(extent_rect)
    else:
        map_item.setExtent(QgsRectangle(-17.5, 11.5, -11.5, 16.7))

    # Filtrer les couches visibles
    all_layers = project.mapLayers().values()
    visible    = [l for l in all_layers if any(n in l.name() for n in layer_names_visible)]
    if visible:
        map_item.setLayers(visible)

    layout.addLayoutItem(map_item)

    # ── Titre ────────────────────────────────────────────────
    title_item = QgsLayoutItemLabel(layout)
    title_item.setText(titre)
    title_item.setFont(QFont('Segoe UI', 14, QFont.Bold))
    title_item.setFontColor(QColor('#1a1a2e'))
    title_item.attemptMove(QgsLayoutPoint(10, 5, QgsUnitTypes.LayoutMillimeters))
    title_item.attemptResize(QgsLayoutSize(200, 12, QgsUnitTypes.LayoutMillimeters))
    layout.addLayoutItem(title_item)

    # ── Sous-titre / Source ───────────────────────────────────
    sub_item = QgsLayoutItemLabel(layout)
    sub_item.setText(f"Source : Tostan / PRCC · JOJ × Tostan 2026 · 300 communautés")
    sub_item.setFont(QFont('Segoe UI', 7))
    sub_item.setFontColor(QColor('#7f8c8d'))
    sub_item.attemptMove(QgsLayoutPoint(10, 193, QgsUnitTypes.LayoutMillimeters))
    sub_item.attemptResize(QgsLayoutSize(200, 7, QgsUnitTypes.LayoutMillimeters))
    layout.addLayoutItem(sub_item)

    # ── Légende ───────────────────────────────────────────────
    legend = QgsLayoutItemLegend(layout)
    legend.setLinkedMap(map_item)
    legend.setTitle('Légende')
    legend.setStyleFont(QgsLegendStyle.Title,   QFont('Segoe UI', 8, QFont.Bold))
    legend.setStyleFont(QgsLegendStyle.SymbolLabel, QFont('Segoe UI', 7))
    legend.attemptMove(QgsLayoutPoint(285, 20, QgsUnitTypes.LayoutMillimeters))
    legend.attemptResize(QgsLayoutSize(55, 120, QgsUnitTypes.LayoutMillimeters))
    layout.addLayoutItem(legend)

    # ── Exporter en PNG ───────────────────────────────────────
    manager.addLayout(layout)
    exporter = QgsLayoutExporter(layout)
    settings  = QgsLayoutExporter.ImageExportSettings()
    settings.dpi = dpi

    out_path = os.path.join(OUTPUT_DIR, f"{nom_fichier}.png")
    result   = exporter.exportToImage(out_path, settings)

    if result == QgsLayoutExporter.Success:
        print(f"✅ Exporté : {out_path}")
    else:
        print(f"❌ Échec export : {out_path} (code {result})")

    return out_path


# ════════════════════════════════════════════════════════════
# EXPORTS DES 3 CARTES THÉMATIQUES
# ════════════════════════════════════════════════════════════

print("\n" + "="*55)
print("  Export des cartes thématiques JOJ × Tostan 2026")
print("="*55 + "\n")

# ── Carte 1 : Vue d'ensemble — 3 zones ───────────────────────
export_carte(
    nom_fichier     = 'carte_zones',
    titre           = "Carte 1 — Vue d'ensemble des 3 zones d'intervention",
    layer_names_visible = ['OpenStreetMap', "Zones d'intervention", 'Communautés — par zone'],
    extent_rect     = QgsRectangle(-17.5, 11.5, -11.5, 16.7),
    dpi             = 200
)

# ── Carte 2 : Scores de sélection ────────────────────────────
export_carte(
    nom_fichier     = 'carte_scores',
    titre           = 'Carte 2 — Scores de sélection des communautés (/100 points)',
    layer_names_visible = ['OpenStreetMap', "Zones d'intervention", 'Communautés — Score'],
    extent_rect     = QgsRectangle(-17.0, 11.8, -11.8, 16.5),
    dpi             = 200
)

# ── Carte 3 : Priorités PRCC EN COURS ────────────────────────
export_carte(
    nom_fichier     = 'carte_prcc_en_cours',
    titre           = 'Carte 3 — Communautés PRCC EN COURS (20 priorités absolues)',
    layer_names_visible = ['OpenStreetMap', 'PRCC EN COURS', 'Communautés — par zone'],
    extent_rect     = QgsRectangle(-15.5, 12.3, -13.8, 13.5),  # Zoom sur Kolda
    dpi             = 250
)

print("\n" + "="*55)
print("  ✅ 3 cartes exportées avec succès !")
print(f"  📁 Dossier : {OUTPUT_DIR}")
print("="*55)
print("""
FICHIERS CRÉÉS :
  • carte_zones.png          → Vue d'ensemble 3 zones
  • carte_scores.png         → Scores de sélection
  • carte_prcc_en_cours.png  → 20 priorités absolues

PROCHAINE ÉTAPE :
  → Ces 3 images peuvent être intégrées dans le rapport PDF
  → Glissez-les dans le fichier rapport/rapport_carto.html
  → Ou ouvrez-les dans Word / PowerPoint pour le rapport final
""")
