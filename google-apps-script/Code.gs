/* ============================================================
   Code.gs — API Google Apps Script pour Planification & Suivi
   JOJ × Tostan 2026

   À coller dans Extensions > Apps Script du Google Sheet
   "JOJ_Tostan_2026_Suivi" (onglet "ActivitesProjet").

   Voir le guide de configuration pour les étapes de déploiement.
   ============================================================ */

const SHEET_NAME = 'ActivitesProjet';
const ADMIN_PASSWORD_PROPERTY = 'ADMIN_PASSWORD';

/* ── Étape 1 : à exécuter UNE FOIS depuis l'éditeur Apps Script ──
   Remplace 'CHANGE_ME' par le mot de passe admin de ton choix,
   puis sélectionne cette fonction dans le menu "Exécuter" et lance-la.
   Tu peux la relancer à tout moment pour changer le mot de passe. */
function setAdminPassword() {
  PropertiesService.getScriptProperties().setProperty(ADMIN_PASSWORD_PROPERTY, 'CHANGE_ME');
}

/* ── Lecture : renvoie toutes les activités en JSON ── */
function doGet(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const rows = data.slice(1)
    .filter(row => row[headers.indexOf('id')] !== '')
    .map(row => {
      const obj = {};
      headers.forEach((h, i) => { obj[h] = row[i]; });
      return obj;
    });
  return jsonResponse({ activitesProjet: rows });
}

/* ── Écriture : met à jour une activité si le mot de passe est correct ──
   Corps de requête attendu (JSON) :
   { "id": 6, "password": "...", "updates": { "statut": "Terminé", ... } } */
function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const expected = PropertiesService.getScriptProperties().getProperty(ADMIN_PASSWORD_PROPERTY);

    if (!expected) {
      return jsonResponse({ ok: false, error: 'Mot de passe admin non configuré côté serveur (lance setAdminPassword).' });
    }
    if (!body.password || body.password !== expected) {
      return jsonResponse({ ok: false, error: 'Mot de passe incorrect.' });
    }

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const idCol = headers.indexOf('id');

    let rowIndex = -1;
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][idCol]) === String(body.id)) { rowIndex = i; break; }
    }
    if (rowIndex === -1) {
      return jsonResponse({ ok: false, error: 'Activité introuvable (id ' + body.id + ').' });
    }

    const updates = body.updates || {};
    Object.keys(updates).forEach(field => {
      const colIndex = headers.indexOf(field);
      if (colIndex !== -1) {
        sheet.getRange(rowIndex + 1, colIndex + 1).setValue(updates[field]);
      }
    });

    return jsonResponse({ ok: true });
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) });
  }
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
