/* ============================================================
   i18n.js — Traduction FR / EN — JO'TALI × Tostan 2026
   Dictionnaire statique + moteur d'application + helpers
   de formatage (nombres, statuts, oui/non) sensibles à la langue.
   ============================================================ */

const I18N_LANG_KEY = 'jojtostan_lang';

const I18N = {
  fr: {
    /* Splash */
    'splash.skip': 'Passer ›',
    'splash.quote': "Le sport a le pouvoir de changer le monde.<br>Il a le pouvoir d'inspirer.<br>Il a le pouvoir d'unir les peuples.",
    'splash.constat1': "Les Jeux Olympiques de la Jeunesse arrivent à <strong>Dakar en 2026</strong>.",
    'splash.constat2': "Mais beaucoup de jeunes risquent de les regarder de loin —<br>depuis leur village, loin des projecteurs.",
    'splash.mission_title': "Et si l'esprit des Jeux<br>voyageait jusqu'à <span class=\"gold\">eux</span> ?",
    'splash.mission_sub': "JO'TALI porte le sport, le dialogue et le leadership<br>directement dans les communautés du Sénégal.",
    'splash.pillar1': 'Sport & jeu',
    'splash.pillar4': 'Héritage',
    'splash.final_title': 'Ramener les Jeux<br>dans les <span class="gold">communautés</span>',
    'splash.final_sub': "JO'TALI × Tostan · Plateforme 2026",

    /* Hub */
    'hub.subtitle': 'Choisissez votre espace',
    'hub.door_selection_title': 'Sélection',
    'hub.door_selection_desc': 'Carte interactive, statistiques, analyse spatiale et liste des 300 communautés pilotes',
    'hub.door_cta': 'Explorer →',

    /* Header / nav */
    'app.title': "🏅 JO'TALI × Tostan 2026 — Sélection des Communautés Pilotes",
    'app.subtitle': "Tableau de bord géospatial · Sénégal · 300 communautés · 3 zones d'intervention",
    'nav.hub': '🏠 Hub',
    'nav.selection': '🗺️ Sélection',
    'tab.map': '🗺️ Carte interactive',
    'tab.charts': '📊 Statistiques',
    'tab.table': '📋 Liste des communautés',
    'tab.spatial': '🧭 Analyse spatiale',
    'tab.rapport': '📄 Rapport',

    /* KPI */
    'kpi.total': 'Communautés sélectionnées',
    'kpi.jeunes': 'Jeunes 15-35 estimés',

    /* Carte */
    'map.zone_label': 'Zone :',
    'map.zone_all': 'Toutes (300)',
    'map.prcc_toggle': '🟣 EN COURS uniquement (20)',
    'map.side_empty': 'Cliquez sur une communauté<br>pour voir sa fiche détaillée',

    /* Statistiques */
    'charts.regions_title': '🌍 Répartition par région',
    'charts.regions_explain': "Ce graphique montre le nombre de communautés pilotes sélectionnées dans chaque région administrative du Sénégal. <strong>Kolda et Sédhiou</strong> concentrent le plus grand nombre car Tostan y est le plus implanté historiquement. Plus une barre est longue, plus la région a de communautés participantes.",
    'charts.zones_title': '🏅 Communautés par zone',
    'charts.zones_explain': "Les 300 communautés sont réparties en <strong>3 zones géographiques</strong> d'intervention. La Zone 1 (Kolda & Sédhiou) représente près de la moitié du total (141), suivie de la Zone 3 (Matam, 100) et de la Zone 2 (Tamba & Kédougou, 59).",
    'charts.prcc_title': '📅 Statuts PRCC (Top 10)',
    'charts.prcc_explain': "Le <strong>PRCC (Programme de Renforcement des Communautés et des Capacités)</strong> indique l'année à laquelle Tostan est intervenu dans la communauté. Les <strong>20 communautés \"EN COURS\"</strong> (violet) sont la priorité absolue car elles bénéficient d'un accompagnement actif au moment de la sélection. Les autres communautés ont terminé leur programme entre 2015 et 2026.",
    'charts.scores_title': '🎯 Distribution des scores /100',
    'charts.scores_explain': "Chaque communauté a obtenu un <strong>score de sélection sur 100 points</strong>. Ce graphique regroupe les 300 communautés en 4 catégories selon leur score :<br>• <strong>35–45 pts</strong> : communautés sélectionnées avec un score faible<br>• <strong>46–55 pts</strong> : score moyen<br>• <strong>56–70 pts</strong> : bon score — c'est la majorité des communautés<br>• <strong>71–80 pts</strong> : très bon score — les meilleures communautés<br>La hauteur de chaque barre indique le <strong>nombre de communautés</strong> dans cette fourchette.",
    'charts.jeunes_title': '👥 Jeunes 15-35 estimés par zone (milliers)',
    'charts.jeunes_explain': "Ce graphique compare le <strong>nombre total de jeunes de 15 à 35 ans estimés</strong> dans les communautés sélectionnées de chaque zone. C'est l'indicateur clé de l'impact potentiel du programme JO'TALI : plus la barre est haute, plus la zone touchera un grand nombre de jeunes. Le total toutes zones confondues est de <strong>91 219 jeunes</strong>.",
    'charts.programmes_title': '🔗 Couverture RPP & P&S',
    'charts.programmes_explain': "<strong>RPP</strong> (Renforcement des Pratiques Parentales) et <strong>P&S</strong> (Paix & Sécurité) sont deux programmes complémentaires de Tostan. Ce graphique montre combien de communautés bénéficient de ces accompagnements en plus du PRCC. La catégorie <strong>PRCC uniquement</strong> regroupe les communautés qui ont eu un PRCC (terminé ou en cours) mais sans RPP ni P&S actifs.",
    'charts.axis_milliers': 'Milliers de jeunes',
    'charts.label_rpp_only': 'RPP seul',
    'charts.label_ps_only': 'P&S seul',
    'charts.label_both': 'RPP + P&S',
    'charts.label_none': 'PRCC uniquement',

    /* Table */
    'table.search_placeholder': '🔍 Rechercher…',
    'table.all_zones': 'Toutes les zones',
    'table.all_regions': 'Toutes les régions',
    'table.all_prcc': 'Tous statuts PRCC',
    'table.prcc_encours': 'EN COURS',
    'table.rpp_all': 'RPP : Tous',
    'table.rpp_oui': 'RPP : Oui',
    'table.rpp_non': 'RPP : Non',
    'table.th_communaute': 'Communauté ↕',
    'table.th_region': 'Région ↕',
    'table.th_dept': 'Département ↕',
    'table.th_zone': 'Zone ↕',
    'table.th_statut': 'Statut PRCC ↕',
    'table.th_jeunes': 'Jeunes ↕',
    'table.prev': '◀ Préc.',
    'table.next': 'Suiv. ▶',

    /* Analyse spatiale */
    'spatial.mode_global': '🧭 Vue globale',
    'spatial.mode_rayon': '📍 Par rayon',
    'spatial.mode_comparer': '⚖️ Comparer',
    'spatial.mode_isolees': '⚠️ Isolées',
    'spatial.ref_community': 'Communauté de référence',
    'spatial.choose_community': '— Choisir une communauté —',
    'spatial.search_radius': 'Rayon de recherche',
    'spatial.btn_search_radius': '🔍 Rechercher les communautés proches',
    'spatial.community_a': 'Communauté A',
    'spatial.community_b': 'Communauté B',
    'spatial.choose': '— Choisir —',
    'spatial.compare_radius': 'Rayon de comparaison',
    'spatial.btn_compare': '⚖️ Comparer ces 2 communautés',
    'spatial.isolation_threshold': "Seuil d'isolement",
    'spatial.btn_isolees': '⚠️ Identifier les communautés isolées',
    'spatial.global_info': 'Analysez la répartition des 300 communautés pilotes selon le nombre de jeunes 15-35 ans et la zone géographique.',
    'spatial.filter_zone': 'Filtrer par zone',
    'spatial.all_zones_dash': '— Toutes les zones —',
    'spatial.filter_jeunes': 'Filtrer par tranche de jeunes 15-35',
    'spatial.all_tranches_dash': '— Toutes les tranches —',
    'spatial.tranche_0_200': 'Moins de 200 jeunes',
    'spatial.tranche_200_500': '200 à 500 jeunes',
    'spatial.tranche_500_1000': '500 à 1 000 jeunes',
    'spatial.tranche_1000_plus': 'Plus de 1 000 jeunes',
    'spatial.select_ref': 'Sélectionnez une communauté de référence.',
    'spatial.select_two': 'Sélectionnez deux communautés à comparer.',
    'spatial.select_different': 'Choisissez deux communautés différentes.',
    'spatial.no_match': 'Aucune communauté ne correspond à cette sélection.',
    'spatial.ref_tag': 'Communauté de référence',
    'spatial.title_analysis': 'Analyse du point de regroupement',
    'spatial.equivalentes': 'Les deux communautés sont équivalentes.',
    'spatial.title_compare_analysis': '💡 Analyse comparative',
    'spatial.th_communaute': 'Communauté',
    'spatial.th_zone': 'Zone',
    'spatial.th_distance': 'Distance',
    'spatial.th_trajet': 'Trajet',
    'spatial.th_jeunes': 'Jeunes',
    'spatial.th_prcc': 'PRCC',
    'spatial.th_region': 'Région',
    'spatial.th_voisine': 'Voisine la + proche',
    'spatial.th_score': 'Score',
    'spatial.ss_comm_dans': 'Communautés dans {r} km',
    'spatial.ss_jeunes_couverts': 'Jeunes 15-35 couverts',
    'spatial.ss_dist_moy': 'Distance moyenne',
    'spatial.ss_trajet_moy': 'Trajet moyen estimé',
    'spatial.ss_comm_isolees': 'Communautés isolées (> {s} km)',
    'spatial.ss_isolement_max': 'Isolement maximum',
    'spatial.ss_comm': 'Communautés',
    'spatial.ss_jeunes': 'Jeunes 15-35',
    'spatial.ss_pct_300': 'des 300 comm.',
    'spatial.ss_pct_jeunes': 'du total jeunes',
    'spatial.section_repartition_zone': 'Répartition par zone',
    'spatial.section_explore_tranche': 'Explorer par tranche dans cette zone',
    'spatial.section_detail': 'Détail des {n} communautés (triées par jeunes ↓)',
    'spatial.section_title_global': '🧭 Analyse de la répartition des jeunes 15-35 ans',
    'spatial.pct_de_la_zone': '% de la zone',
    'spatial.pct_ici': '% ici',
    'spatial.select_tranche_hint': 'Sélectionnez une tranche ci-dessus pour explorer en détail la répartition géographique et identifier les communautés concernées.',
    'spatial.titre_petite': 'Petite taille',
    'spatial.titre_intermediaire': 'Taille intermédiaire',
    'spatial.titre_fort': 'Fort potentiel',
    'spatial.titre_tresfort': 'Très fort potentiel',
    'spatial.pct_des_comm': '% des comm.',
    'common.jeunes_word': 'jeunes',

    /* Rapport */
    'rapport.docs_title': '📁 Documents officiels',
    'rapport.pptx_name': 'Présentation PowerPoint',
    'rapport.pptx_desc': 'Méthodologie de sélection — 7 slides',
    'rapport.pdf_name': 'Rapport PDF',
    'rapport.pdf_desc': 'Méthodologie complète — 7 pages (non modifiable)',
    'rapport.preview': '👁 Aperçu',
    'rapport.download': '⬇ Télécharger',
    'rapport.summary_title': "📄 Résumé exécutif — Sélection JO'TALI × Tostan 2026",
    'rapport.stat_300': 'communautés sélectionnées dans 3 zones du Sénégal',
    'rapport.stat_jeunes': 'jeunes 15-35 ans estimés touchés',
    'rapport.stat_prcc': 'communautés PRCC EN COURS (priorité absolue)',
    'rapport.stat_rpp': 'communautés avec programme RPP actif',
    'rapport.stat_moy': 'score moyen de sélection sur 100 points',
    'rapport.stat_max': 'score maximum atteint (Boumouda Soucoto, Sédhiou)',
    'rapport.grille_title': '🏆 Grille de sélection — 4 critères sur 100 points',
    'rapport.crit1_nom': 'PRCC récent ou EN COURS',
    'rapport.crit1_desc': 'Lien Tostan le plus frais — priorité absolue',
    'rapport.crit2_nom': 'Nombre de jeunes 15-35 ans (estimés)',
    'rapport.crit2_desc': 'Bassin de participants suffisant',
    'rapport.crit3_nom': 'Communautés Tostan proches (même commune)',
    'rapport.crit3_desc': 'Facilité logistique & rencontres entre jeunes',
    'rapport.crit4_nom': 'Autres programmes actifs (RPP, P&S)',
    'rapport.crit4_desc': 'Accompagnement Tostan renforcé sur le terrain',
    'rapport.export_pdf': '🖨️ Exporter en PDF (Ctrl+P)',
    'rapport.modal_preview': 'Aperçu',
    'rapport.modal_close': 'Fermer',
    'rapport.js_pptx_title': 'Présentation — Méthodologie de sélection',
    'rapport.js_pdf_title': 'Rapport PDF — Méthodologie complète',
    'rapport.top5': '🏆 Top 5 ·',

    /* Carte / panneau latéral (map.js) */
    'map.popup.region': 'Région',
    'map.popup.dept': 'Département',
    'map.popup.jeunes': 'Jeunes 15-35',
    'map.popup.score_label': 'Score de sélection',
    'map.popup.score_total': 'Score total',
    'map.side.jeunes': 'Jeunes 15-35',
    'map.side.score': 'Score /100',
    'map.side.region': 'Région',
    'map.side.dept': 'Département',
    'map.side.commune': 'Commune :',
    'map.side.score_detail': 'Détail des scores',
    'map.side.score_total_row': 'Score total',
    'map.side.statut_prcc': 'Statut PRCC',
    'map.side.programmes': 'Programmes',
    'map.zone_tooltip_communautes': 'communautés',
    'map.score_label_jeunes': 'Jeunes',
    'map.score_label_proximite': 'Proximité',
    'map.score_label_prox': 'Prox',

    /* Tableau (table.js) */
    'table.js.communaute_singular': 'communauté',
    'table.js.communaute_plural': 'communautés',
    'table.js.page_info': '{start}–{end} sur {total}',
  },

  en: {
    'splash.skip': 'Skip ›',
    'splash.quote': "Sport has the power to change the world.<br>It has the power to inspire.<br>It has the power to unite people.",
    'splash.constat1': "The Youth Olympic Games are coming to <strong>Dakar in 2026</strong>.",
    'splash.constat2': "But many young people risk watching from afar —<br>from their village, far from the spotlight.",
    'splash.mission_title': 'What if the spirit of the Games<br>traveled all the way to <span class="gold">them</span>?',
    'splash.mission_sub': "JO'TALI brings sport, dialogue and leadership<br>directly into the communities of Senegal.",
    'splash.pillar1': 'Sport & play',
    'splash.pillar4': 'Legacy',
    'splash.final_title': 'Bringing the Games<br>into the <span class="gold">communities</span>',
    'splash.final_sub': "JO'TALI × Tostan · 2026 Platform",

    'hub.subtitle': 'Choose your space',
    'hub.door_selection_title': 'Selection',
    'hub.door_selection_desc': 'Interactive map, statistics, spatial analysis and the list of 300 pilot communities',
    'hub.door_cta': 'Explore →',

    'app.title': "🏅 JO'TALI × Tostan 2026 — Selection of Pilot Communities",
    'app.subtitle': "Geospatial dashboard · Senegal · 300 communities · 3 intervention zones",
    'nav.hub': '🏠 Hub',
    'nav.selection': '🗺️ Selection',
    'tab.map': '🗺️ Interactive map',
    'tab.charts': '📊 Statistics',
    'tab.table': '📋 Community list',
    'tab.spatial': '🧭 Spatial analysis',
    'tab.rapport': '📄 Report',

    'kpi.total': 'Selected communities',
    'kpi.jeunes': 'Estimated youth 15-35',

    'map.zone_label': 'Zone:',
    'map.zone_all': 'All (300)',
    'map.prcc_toggle': '🟣 IN PROGRESS only (20)',
    'map.side_empty': 'Click on a community<br>to see its detailed profile',

    'charts.regions_title': '🌍 Breakdown by region',
    'charts.regions_explain': "This chart shows the number of pilot communities selected in each administrative region of Senegal. <strong>Kolda and Sédhiou</strong> concentrate the largest number because Tostan has historically been most present there. The longer the bar, the more participating communities the region has.",
    'charts.zones_title': '🏅 Communities by zone',
    'charts.zones_explain': "The 300 communities are split across <strong>3 geographic intervention zones</strong>. Zone 1 (Kolda & Sédhiou) accounts for nearly half of the total (141), followed by Zone 3 (Matam, 100) and Zone 2 (Tamba & Kédougou, 59).",
    'charts.prcc_title': '📅 PRCC statuses (Top 10)',
    'charts.prcc_explain': "The <strong>PRCC (Community and Capacity Strengthening Program)</strong> indicates the year Tostan intervened in the community. The <strong>20 \"IN PROGRESS\" communities</strong> (purple) are the top priority since they benefit from active support at the time of selection. The other communities completed their program between 2015 and 2026.",
    'charts.scores_title': '🎯 Score distribution /100',
    'charts.scores_explain': "Each community received a <strong>selection score out of 100 points</strong>. This chart groups the 300 communities into 4 categories by score:<br>• <strong>35–45 pts</strong>: selected communities with a low score<br>• <strong>46–55 pts</strong>: average score<br>• <strong>56–70 pts</strong>: good score — the majority of communities<br>• <strong>71–80 pts</strong>: very good score — the best communities<br>The height of each bar shows the <strong>number of communities</strong> in that range.",
    'charts.jeunes_title': '👥 Estimated youth 15-35 by zone (thousands)',
    'charts.jeunes_explain': "This chart compares the <strong>total number of estimated youth aged 15 to 35</strong> in the selected communities of each zone. It is the key indicator of JO'TALI's potential impact: the taller the bar, the more young people the zone will reach. The total across all zones is <strong>91,219 youth</strong>.",
    'charts.programmes_title': '🔗 RPP & P&S coverage',
    'charts.programmes_explain': "<strong>RPP</strong> (Parenting Practices Reinforcement) and <strong>P&S</strong> (Peace & Security) are two complementary Tostan programs. This chart shows how many communities benefit from this support in addition to PRCC. The <strong>PRCC only</strong> category groups communities that had a PRCC (completed or in progress) but no active RPP or P&S.",
    'charts.axis_milliers': 'Thousands of youth',
    'charts.label_rpp_only': 'RPP only',
    'charts.label_ps_only': 'P&S only',
    'charts.label_both': 'RPP + P&S',
    'charts.label_none': 'PRCC only',

    'table.search_placeholder': '🔍 Search…',
    'table.all_zones': 'All zones',
    'table.all_regions': 'All regions',
    'table.all_prcc': 'All PRCC statuses',
    'table.prcc_encours': 'IN PROGRESS',
    'table.rpp_all': 'RPP: All',
    'table.rpp_oui': 'RPP: Yes',
    'table.rpp_non': 'RPP: No',
    'table.th_communaute': 'Community ↕',
    'table.th_region': 'Region ↕',
    'table.th_dept': 'Department ↕',
    'table.th_zone': 'Zone ↕',
    'table.th_statut': 'PRCC status ↕',
    'table.th_jeunes': 'Youth ↕',
    'table.prev': '◀ Prev',
    'table.next': 'Next ▶',

    'spatial.mode_global': '🧭 Global view',
    'spatial.mode_rayon': '📍 By radius',
    'spatial.mode_comparer': '⚖️ Compare',
    'spatial.mode_isolees': '⚠️ Isolated',
    'spatial.ref_community': 'Reference community',
    'spatial.choose_community': '— Choose a community —',
    'spatial.search_radius': 'Search radius',
    'spatial.btn_search_radius': '🔍 Search nearby communities',
    'spatial.community_a': 'Community A',
    'spatial.community_b': 'Community B',
    'spatial.choose': '— Choose —',
    'spatial.compare_radius': 'Comparison radius',
    'spatial.btn_compare': '⚖️ Compare these 2 communities',
    'spatial.isolation_threshold': 'Isolation threshold',
    'spatial.btn_isolees': '⚠️ Identify isolated communities',
    'spatial.global_info': 'Analyze the distribution of the 300 pilot communities by number of youth aged 15-35 and geographic zone.',
    'spatial.filter_zone': 'Filter by zone',
    'spatial.all_zones_dash': '— All zones —',
    'spatial.filter_jeunes': 'Filter by youth 15-35 bracket',
    'spatial.all_tranches_dash': '— All brackets —',
    'spatial.tranche_0_200': 'Fewer than 200 youth',
    'spatial.tranche_200_500': '200 to 500 youth',
    'spatial.tranche_500_1000': '500 to 1,000 youth',
    'spatial.tranche_1000_plus': 'More than 1,000 youth',
    'spatial.select_ref': 'Select a reference community.',
    'spatial.select_two': 'Select two communities to compare.',
    'spatial.select_different': 'Choose two different communities.',
    'spatial.no_match': 'No community matches this selection.',
    'spatial.ref_tag': 'Reference community',
    'spatial.title_analysis': 'Gathering point analysis',
    'spatial.equivalentes': 'Both communities are equivalent.',
    'spatial.title_compare_analysis': '💡 Comparative analysis',
    'spatial.th_communaute': 'Community',
    'spatial.th_zone': 'Zone',
    'spatial.th_distance': 'Distance',
    'spatial.th_trajet': 'Travel time',
    'spatial.th_jeunes': 'Youth',
    'spatial.th_prcc': 'PRCC',
    'spatial.th_region': 'Region',
    'spatial.th_voisine': 'Nearest neighbor',
    'spatial.th_score': 'Score',
    'spatial.ss_comm_dans': 'Communities within {r} km',
    'spatial.ss_jeunes_couverts': 'Youth 15-35 covered',
    'spatial.ss_dist_moy': 'Average distance',
    'spatial.ss_trajet_moy': 'Estimated average travel time',
    'spatial.ss_comm_isolees': 'Isolated communities (> {s} km)',
    'spatial.ss_isolement_max': 'Maximum isolation',
    'spatial.ss_comm': 'Communities',
    'spatial.ss_jeunes': 'Youth 15-35',
    'spatial.ss_pct_300': 'of the 300 comm.',
    'spatial.ss_pct_jeunes': 'of total youth',
    'spatial.section_repartition_zone': 'Breakdown by zone',
    'spatial.section_explore_tranche': 'Explore by bracket in this zone',
    'spatial.section_detail': 'Detail of {n} communities (sorted by youth ↓)',
    'spatial.section_title_global': '🧭 Analysis of the youth 15-35 distribution',
    'spatial.pct_de_la_zone': '% of the zone',
    'spatial.pct_ici': '% here',
    'spatial.select_tranche_hint': 'Select a bracket above to explore the geographic breakdown in detail and identify the communities concerned.',
    'spatial.titre_petite': 'Small size',
    'spatial.titre_intermediaire': 'Intermediate size',
    'spatial.titre_fort': 'Strong potential',
    'spatial.titre_tresfort': 'Very strong potential',
    'spatial.pct_des_comm': '% of comm.',
    'common.jeunes_word': 'youth',

    'rapport.docs_title': '📁 Official documents',
    'rapport.pptx_name': 'PowerPoint presentation',
    'rapport.pptx_desc': 'Selection methodology — 7 slides',
    'rapport.pdf_name': 'PDF report',
    'rapport.pdf_desc': 'Full methodology — 7 pages (non-editable)',
    'rapport.preview': '👁 Preview',
    'rapport.download': '⬇ Download',
    'rapport.summary_title': "📄 Executive summary — JO'TALI × Tostan 2026 Selection",
    'rapport.stat_300': 'communities selected across 3 zones in Senegal',
    'rapport.stat_jeunes': 'estimated youth 15-35 reached',
    'rapport.stat_prcc': 'communities with PRCC IN PROGRESS (top priority)',
    'rapport.stat_rpp': 'communities with an active RPP program',
    'rapport.stat_moy': 'average selection score out of 100 points',
    'rapport.stat_max': 'highest score achieved (Boumouda Soucoto, Sédhiou)',
    'rapport.grille_title': '🏆 Selection grid — 4 criteria out of 100 points',
    'rapport.crit1_nom': 'Recent or ongoing PRCC',
    'rapport.crit1_desc': 'Freshest Tostan connection — top priority',
    'rapport.crit2_nom': 'Number of youth 15-35 (estimated)',
    'rapport.crit2_desc': 'Sufficient pool of participants',
    'rapport.crit3_nom': 'Nearby Tostan communities (same commune)',
    'rapport.crit3_desc': 'Logistical ease & youth meetups',
    'rapport.crit4_nom': 'Other active programs (RPP, P&S)',
    'rapport.crit4_desc': 'Stronger Tostan support in the field',
    'rapport.export_pdf': '🖨️ Export to PDF (Ctrl+P)',
    'rapport.modal_preview': 'Preview',
    'rapport.modal_close': 'Close',
    'rapport.js_pptx_title': 'Presentation — Selection methodology',
    'rapport.js_pdf_title': 'PDF report — Full methodology',
    'rapport.top5': '🏆 Top 5 ·',

    'map.popup.region': 'Region',
    'map.popup.dept': 'Department',
    'map.popup.jeunes': 'Youth 15-35',
    'map.popup.score_label': 'Selection score',
    'map.popup.score_total': 'Total score',
    'map.side.jeunes': 'Youth 15-35',
    'map.side.score': 'Score /100',
    'map.side.region': 'Region',
    'map.side.dept': 'Department',
    'map.side.commune': 'Commune:',
    'map.side.score_detail': 'Score breakdown',
    'map.side.score_total_row': 'Total score',
    'map.side.statut_prcc': 'PRCC status',
    'map.side.programmes': 'Programs',
    'map.zone_tooltip_communautes': 'communities',
    'map.score_label_jeunes': 'Youth',
    'map.score_label_proximite': 'Proximity',
    'map.score_label_prox': 'Prox',

    'table.js.communaute_singular': 'community',
    'table.js.communaute_plural': 'communities',
    'table.js.page_info': '{start}–{end} of {total}',
  }
};

/* ── Langue courante ─────────────────────────────────────── */
function getLang() {
  return localStorage.getItem(I18N_LANG_KEY) === 'en' ? 'en' : 'fr';
}

function setLang(lang) {
  localStorage.setItem(I18N_LANG_KEY, lang);
  document.documentElement.lang = lang;
  applyI18n();
  updateLangToggleLabels();
  document.dispatchEvent(new CustomEvent('jojlangchange', { detail: { lang } }));
}

/* ── Traduction d'une clé, avec interpolation {var} ─────────── */
function t(key, vars) {
  const lang = getLang();
  let str = (I18N[lang] && I18N[lang][key]) || I18N.fr[key] || key;
  if (vars) {
    Object.keys(vars).forEach(k => {
      str = str.replace(new RegExp('\\{' + k + '\\}', 'g'), vars[k]);
    });
  }
  return str;
}

/* ── Formatage de nombre selon la langue ────────────────────── */
function fmtNum(n) {
  return n.toLocaleString(getLang() === 'en' ? 'en-US' : 'fr-FR');
}

/* ── Statut PRCC affiché (EN COURS / Terminé YYYY) ──────────── */
function trStatut(statut) {
  if (getLang() !== 'en' || !statut) return statut;
  if (statut === 'EN COURS') return 'IN PROGRESS';
  const m = statut.match(/Terminé\s*(\d{4})/);
  if (m) return 'Completed ' + m[1];
  return statut;
}

/* ── Oui / Non affiché ───────────────────────────────────────── */
function trYesNo(v) {
  if (getLang() !== 'en') return v;
  if (v === 'Oui') return 'Yes';
  if (v === 'Non') return 'No';
  return v;
}

/* ── Appliquer les traductions au DOM ────────────────────────── */
function applyI18n(root) {
  root = root || document;
  root.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.getAttribute('data-i18n'));
  });
  root.querySelectorAll('[data-i18n-html]').forEach(el => {
    el.innerHTML = t(el.getAttribute('data-i18n-html'));
  });
  root.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    el.placeholder = t(el.getAttribute('data-i18n-placeholder'));
  });
  document.documentElement.lang = getLang();
}

/* ── Bouton(s) de bascule de langue ──────────────────────────── */
function updateLangToggleLabels() {
  const lang = getLang();
  document.querySelectorAll('.lang-toggle').forEach(btn => {
    btn.textContent = lang === 'fr' ? '🇬🇧 EN' : '🇫🇷 FR';
    btn.setAttribute('aria-label', lang === 'fr' ? 'Switch to English' : 'Passer en français');
  });
}

function initLangToggle() {
  document.querySelectorAll('.lang-toggle').forEach(btn => {
    btn.addEventListener('click', () => setLang(getLang() === 'fr' ? 'en' : 'fr'));
  });
  updateLangToggleLabels();
}

document.addEventListener('DOMContentLoaded', () => {
  document.documentElement.lang = getLang();
  applyI18n();
  initLangToggle();
});
