/**
 * TheStarth — Sheets logging backend (Google Apps Script)
 * ------------------------------------------------
 * Mirrors new student sign-ups and payment requests into a Google Sheet,
 * so a curator/accountant can see them without touching Firebase.
 *
 * News, reviews, site settings, and student accounts now live in
 * Firebase — see firebase-backend/FIREBASE_SETUP.md. This script does
 * NOT handle those anymore.
 *
 * SETUP — see SETUP.md in this folder.
 */

const SHEET_NAMES = {
  SIGNUPS: 'Signups',
  PAYMENTS: 'Payments'
};

function getSheet_(name) {
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
}

function jsonOut_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// Both actions below are intentionally public (no token/password) —
// they only ever APPEND a row. They never read or expose existing data,
// so there's nothing sensitive to protect here.
function doPost(e) {
  let data;
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    return jsonOut_({ ok: false, error: 'bad_json' });
  }

  try {
    if (data.action === 'log_signup') {
      const p = data.payload || {};
      getSheet_(SHEET_NAMES.SIGNUPS).appendRow([
        new Date(), p.name || '', p.phone || '', p.nickname || '', p.email || ''
      ]);
      return jsonOut_({ ok: true });
    }

    if (data.action === 'log_payment') {
      const p = data.payload || {};
      getSheet_(SHEET_NAMES.PAYMENTS).appendRow([
        new Date(), p.order_id || '', p.name || '', p.phone || '',
        p.course || '', p.amount || '', p.method || '',
        p.status || 'Ожидает подтверждения'
      ]);
      return jsonOut_({ ok: true });
    }

    return jsonOut_({ ok: false, error: 'unknown_action' });
  } catch (err) {
    return jsonOut_({ ok: false, error: String(err) });
  }
}
