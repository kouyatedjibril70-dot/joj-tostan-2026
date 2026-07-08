/* ============================================================
   data-suivi.js — Données du module Planification & Suivi
   JOJ × Tostan 2026
   Source : Rétroplanning Central V0 (27 activités réelles)
   ============================================================ */

// ── PILOTAGE PROJET : les 27 activités du rétroplanning ──
const ACTIVITES_PROJET = [
  {
    id: 1,
    phase: 'Cadrage immédiat',
    grandePhase: 'Pré-JOJ · Cadrage',
    activite: 'Finaliser le rétroplanning V0 à présenter à Programme',
    livrable: 'Rétroplanning V0 prêt',
    poste: 'Tous postes pilote',
    lead: 'Diarra COULIBALY Philippe Ndene Ndiaye',
    dateLimite: '2026-07-09 00:00:00',
    statut: 'En cours'
  },
  {
    id: 2,
    phase: 'Cadrage immédiat',
    grandePhase: 'Pré-JOJ · Cadrage',
    activite: 'Préparer la présentation Programme',
    livrable: 'Support interne avec rétroplanning + arbitrages',
    poste: 'Sans budget direct',
    lead: 'Mariama FALL Abdoul Issakou Abdoulkader',
    dateLimite: '2026-07-08',
    statut: 'À faire'
  },
  {
    id: 3,
    phase: 'Programme',
    grandePhase: 'Pré-JOJ · Cadrage',
    activite: 'Présenter le rétroplanning V0 et les besoins terrain',
    livrable: 'Retours Programme sur faisabilité, risques et ajustements',
    poste: 'Sans budget direct',
    lead: 'Mariama FALL Abdoul Issakou Abdoulkader',
    dateLimite: '2026-07-12',
    statut: 'À faire'
  },
  {
    id: 5,
    phase: 'Programme',
    grandePhase: 'Pré-JOJ · Cadrage',
    activite: 'Intégrer les retours Programme et figer la V1 opérationnelle',
    livrable: 'Rétroplanning V1 + points d\'action',
    poste: 'Sans budget direct',
    lead: 'Diarra COULIBALY Philippe Ndene Ndiaye',
    dateLimite: '2026-07-16',
    statut: 'À faire'
  },
  {
    id: 6,
    phase: 'Financement pilote',
    grandePhase: 'Pré-JOJ · Préparation',
    activite: 'Arbitrer financement et décaissement du pilote',
    livrable: 'Go financier pilote',
    poste: 'Tous postes pilote',
    lead: 'Avec Sobel',
    dateLimite: '2026-07-15',
    statut: 'Critique'
  },
  {
    id: 7,
    phase: 'Préparation terrain',
    grandePhase: 'Pré-JOJ · Préparation',
    activite: 'Confirmer le regroupement de communautés, la date et les relais',
    livrable: 'Plan terrain pilote',
    poste: 'Mobilisation communautaire / transport',
    lead: 'Alpha Oumar BA Néné Tacko BA Abdou Fata NDOUR Ousmane DIA',
    dateLimite: '2026-07-20',
    statut: 'À faire'
  },
  {
    id: 8,
    phase: 'PEAS & sécurité',
    grandePhase: 'Pré-JOJ · Préparation',
    activite: 'Préparer l\'orientation des organisateurs et les jeux de sensibilisation PEAS',
    livrable: 'Brief PEAS + activités de sensibilisation prêtes',
    poste: 'PEAS et sécurité',
    lead: 'El Hadji Bara NDIAYE Ndéye Astou COMBO Amy DIOP Diedhiou',
    dateLimite: '2026-07-24',
    statut: 'À faire'
  },
  {
    id: 9,
    phase: 'PEAS & sécurité',
    grandePhase: 'Pré-JOJ · Préparation',
    activite: 'Sécuriser secourisme, santé, sécurité et environnement',
    livrable: 'Dispositif sécurité/santé/environnement prêt',
    poste: 'Sécurité, santé et environnement',
    lead: 'El Hadji Bara NDIAYE Ndéye Astou COMBO Amy DIOP Diedhiou',
    dateLimite: '2026-07-27',
    statut: 'À faire'
  },
  {
    id: 10,
    phase: 'Sport & culture',
    grandePhase: 'Pré-JOJ · Préparation',
    activite: 'Préparer les équipements sport & culture du pilote',
    livrable: 'Matériel disponible pour les activités',
    poste: 'Sport et culture',
    lead: 'Mariama FALL Masseck Beye Mouhamed Aidara Assane NGOM',
    dateLimite: '2026-07-30',
    statut: 'À faire'
  },
  {
    id: 11,
    phase: 'Communication',
    grandePhase: 'Pré-JOJ · Préparation',
    activite: 'Préparer les supports de visibilité et documentation pilote',
    livrable: 'Oriflammes/banderoles/T-shirts/couverture photo-vidéo prêts',
    poste: 'Communication',
    lead: 'Waly Mamadou THIAM Waly Mamadou THIAM',
    dateLimite: '2026-07-31',
    statut: 'À faire'
  },
  {
    id: 12,
    phase: 'Supply chain',
    grandePhase: 'Pré-JOJ · Préparation',
    activite: 'Verrouiller logistique : sonorisation, bâches, chaises, bus, restauration, eau,transport,hebergement',
    livrable: 'Check-list logistique prête',
    poste: 'Supply chain / mobilisation communautaire',
    lead: 'À confirmer',
    dateLimite: '2026-08-03',
    statut: 'À faire'
  },
  {
    id: 13,
    phase: 'Mobilisation',
    grandePhase: 'Pré-JOJ · Préparation',
    activite: 'Mobiliser participants, relais et communautés',
    livrable: 'Participation confirmée',
    poste: 'Mobilisation communautaire / transport / restauration',
    lead: 'Mady Camara Mariama FALL Abdou Fata NDOUR points focaux',
    dateLimite: '2026-08-07',
    statut: 'À faire'
  },
  {
    id: 14,
    phase: 'Suivi-évaluation',
    grandePhase: 'Pré-JOJ · Préparation',
    activite: 'Préparer fiches de présence, mini-retours, grille d\'observation et protocole images',
    livrable: 'Outils S&E et documentation prêts',
    poste: 'Suivi-évaluation / communication',
    lead: 'Alpha Oumar BA Djibril KOUYATE Assane NGOM',
    dateLimite: '2026-08-07',
    statut: 'À faire'
  },
  {
    id: 15,
    phase: 'Brief terrain',
    grandePhase: 'Pré-JOJ · Préparation',
    activite: 'Briefer l\'équipe terrain sur le déroulé standard du pilote',
    livrable: 'Équipe prête + rôles clarifiés',
    poste: 'Tous postes opérationnels',
    lead: 'co lead',
    dateLimite: '2026-08-10',
    statut: 'À faire'
  },
  {
    id: 16,
    phase: 'Pilote',
    grandePhase: 'Pré-JOJ · Pilote',
    activite: 'Réaliser le pilote communautaire',
    livrable: 'Pilote réalisé et documenté',
    poste: 'Tous postes pilote',
    lead: 'all',
    dateLimite: '2026-08-16',
    statut: 'À faire'
  },
  {
    id: 17,
    phase: 'Capitalisation du pilote',
    grandePhase: 'Pré-JOJ · Pilote',
    activite: 'Faire le débrief flash 48h après pilote',
    livrable: 'Premiers apprentissages + points de correction',
    poste: 'Suivi-évaluation',
    lead: 'Mariama FALL Néné Tacko BA Néné Sinthiou NDIAYE',
    dateLimite: '2026-08-18',
    statut: 'À faire'
  },
  {
    id: 18,
    phase: 'Capitalisation',
    grandePhase: 'Pré-JOJ · Pilote',
    activite: 'Produire la note courte de capitalisation du pilote',
    livrable: 'Note pilote : coûts réels, retours, risques, recommandations',
    poste: 'Suivi-évaluation / communication',
    lead: 'SERA et Co lead',
    dateLimite: '2026-08-31',
    statut: 'À faire'
  },
  {
    id: 19,
    phase: 'Scale-up',
    grandePhase: 'Amplification',
    activite: 'Ajuster le budget consolidé et le pack partenaires sur la base du pilote',
    livrable: 'Budget consolidé ajusté + pack partenaires',
    poste: 'Partenariats / communication / budget consolidé',
    lead: 'Aissé KANE Abdoul Issakou Abdoulkaderco lead SAN',
    dateLimite: '2026-09-10',
    statut: 'À faire'
  },
  {
    id: 20,
    phase: 'Scale-up',
    grandePhase: 'Amplification',
    activite: 'Standardiser le kit de déploiement en cas de dispatch',
    livrable: 'Kit commun : agenda, messages, outils S&E, check-lists, reporting',
    poste: 'Suivi-évaluation / supply / communication',
    lead: 'À confirmer',
    dateLimite: '2026-09-18',
    statut: 'À faire'
  },
  {
    id: 21,
    phase: 'Partenariats & médias',
    grandePhase: 'Amplification',
    activite: 'Démarcher partenaires pour la mise à l\'échelle',
    livrable: 'Pipeline partenaires + appuis ciblés',
    poste: 'Partenariats et mobilisation de ressources',
    lead: 'Aissé KANE Abdoul Issakou Abdoulkader co lead',
    dateLimite: '2026-10-02',
    statut: 'À faire'
  },
  {
    id: 22,
    phase: 'Partenariats & médias',
    grandePhase: 'Amplification',
    activite: 'Approcher les maisons médiatiques avant saturation JOJ',
    livrable: 'Médias briefés sur l\'angle post-JOJ',
    poste: 'Communication',
    lead: 'Aissé KANE Abdoul Issakou Abdoulkader',
    dateLimite: '2026-10-09',
    statut: 'À faire'
  },
  {
    id: 23,
    phase: 'Pendant JOJ',
    grandePhase: 'Pendant JOJ',
    activite: 'Préparer la présence légère pendant JOJ',
    livrable: 'Plan projections/mini-sensibilisations/contenus',
    poste: 'Communication / mobilisation / supply',
    lead: 'finance logistique com co lead',
    dateLimite: '2026-10-23',
    statut: 'À faire'
  },
  {
    id: 24,
    phase: 'Pendant JOJ',
    grandePhase: 'Pendant JOJ',
    activite: 'Déployer la présence communautaire pendant JOJ',
    livrable: 'Visibilité communautaire sur la période JOJ',
    poste: 'Communication / mobilisation',
    lead: 'Papa Sekhou DIALLOlogistique com co lead',
    dateLimite: '2026-11-13',
    statut: 'À faire'
  },
  {
    id: 25,
    phase: 'Post-JOJ',
    grandePhase: 'Post-JOJ',
    activite: 'Finaliser le plan d\'activités communautaires fortes post-JOJ',
    livrable: 'Calendrier week-end(s) + équipes + zones',
    poste: 'Budget mise à l\'échelle',
    lead: 'all',
    dateLimite: '2026-11-20',
    statut: 'À faire'
  },
  {
    id: 26,
    phase: 'Post-JOJ',
    grandePhase: 'Post-JOJ',
    activite: 'Déployer les activités communautaires fortes post-JOJ',
    livrable: 'Activités post-JOJ réalisées et documentées',
    poste: 'Budget mise à l\'échelle',
    lead: 'all',
    dateLimite: '2026-12-13',
    statut: 'À faire'
  },
  {
    id: 27,
    phase: 'Capitalisation finale',
    grandePhase: 'Post-JOJ',
    activite: 'Produire la capitalisation finale et les supports partenaires',
    livrable: 'Rapport/note finale + contenus partenaires',
    poste: 'S&E / communication',
    lead: 'SERA Amy DIOP Diedhiou Mady Camara',
    dateLimite: '2026-12-20',
    statut: 'À faire'
  },
];

// ── ACTIVITÉS TERRAIN : données de démo par communauté ──
const ACTIVITES_TERRAIN_DEMO = [
  // Aucune activité terrain programmée pour le moment.
  // Les activités seront ajoutées lors de la phase de planification terrain,
  // au fur et à mesure de leur organisation dans les communautés.
];

// Catégories et couleurs
const CAT_COULEURS = { 'Sport': '#27AE60', 'Culture': '#F39C12', 'Citoyenneté': '#2980B9' };
const STATUT_TERRAIN_COULEURS = { 'Planifiée': '#95a5a6', 'En cours': '#F39C12', 'Réalisée': '#27AE60' };
const STATUT_PROJET_COULEURS = { 'À faire': '#95a5a6', 'En cours': '#F39C12', 'Critique': '#E74C3C', 'Terminé': '#27AE60' };