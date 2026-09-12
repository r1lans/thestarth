/**
 * TheStarth — CMS backend (Google Apps Script)
 * ------------------------------------------------
 * Powers the admin panel (admin.html) and feeds the public site
 * (news, reviews, announcement banner, colors/logo) from a Google Sheet.
 *
 * SETUP — follow SETUP.md step by step. Summary:
 * 1. Create a Google Sheet with 3 tabs: Settings, News, Reviews (see SETUP.md
 *    for exact columns).
 * 2. Extensions → Apps Script, paste this whole file in as Code.gs.
 * 3. Project Settings → Script Properties → add a property named
 *    ADMIN_TOKEN with a long random value. This is your admin password.
 * 4. Deploy → New deployment → type "Web app" → Execute as "Me" →
 *    Who has access "Anyone". Copy the deployment URL.
 * 5. Paste that URL into CMS_API_URL near the top of app.js, and into
 *    admin.html where indicated.
 */

const SHEET_NAMES = {
  SETTINGS: 'Settings',
  NEWS: 'News',
  REVIEWS: 'Reviews'
};

function getSheet_(name) {
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
}

function checkToken_(token) {
  const real = PropertiesService.getScriptProperties().getProperty('ADMIN_TOKEN');
  return real && token === real;
}

function tokenPropertyMissing_() {
  const real = PropertiesService.getScriptProperties().getProperty('ADMIN_TOKEN');
  return !real;
}

function jsonOut_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── Public read endpoint ──
// GET .../exec?action=data
function doGet(e) {
  const action = (e.parameter.action || 'data');

  if (action === 'data') {
    return jsonOut_({
      ok: true,
      settings: readSettings_(),
      news: readRows_(SHEET_NAMES.NEWS).filter(r => String(r.published).toUpperCase() === 'TRUE'),
      reviews: readRows_(SHEET_NAMES.REVIEWS).filter(r => String(r.published).toUpperCase() === 'TRUE')
    });
  }

  // Admin-only read of ALL rows (including unpublished), needs a token
  if (action === 'admin_data') {
    if (!checkToken_(e.parameter.token)) return jsonOut_({ ok: false, error: 'bad_token' });
    return jsonOut_({
      ok: true,
      settings: readSettings_(),
      news: readRows_(SHEET_NAMES.NEWS),
      reviews: readRows_(SHEET_NAMES.REVIEWS)
    });
  }

  return jsonOut_({ ok: false, error: 'unknown_action' });
}

// ── Admin write endpoint ──
// POST body: { token, action, payload }
function doPost(e) {
  let data;
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    return jsonOut_({ ok: false, error: 'bad_json' });
  }

  if (data.action === 'verify') {
    if (tokenPropertyMissing_()) return jsonOut_({ ok: false, error: 'no_token_set' });
    const ok = checkToken_(data.token);
    return jsonOut_(ok ? { ok: true } : { ok: false, error: 'bad_token' });
  }

  if (!checkToken_(data.token)) {
    return jsonOut_({ ok: false, error: 'bad_token' });
  }

  try {
    switch (data.action) {
      case 'save_settings':
        saveSettings_(data.payload);
        break;
      case 'add_news':
        addRow_(SHEET_NAMES.NEWS, data.payload, ['title', 'body', 'date']);
        break;
      case 'update_news':
        updateRow_(SHEET_NAMES.NEWS, data.payload);
        break;
      case 'delete_news':
        deleteRow_(SHEET_NAMES.NEWS, data.payload.id);
        break;
      case 'add_review':
        addRow_(SHEET_NAMES.REVIEWS, data.payload, ['name', 'rating', 'text', 'date']);
        break;
      case 'update_review':
        updateRow_(SHEET_NAMES.REVIEWS, data.payload);
        break;
      case 'delete_review':
        deleteRow_(SHEET_NAMES.REVIEWS, data.payload.id);
        break;
      default:
        return jsonOut_({ ok: false, error: 'unknown_action' });
    }
    return jsonOut_({ ok: true });
  } catch (err) {
    return jsonOut_({ ok: false, error: String(err) });
  }
}

// ── Helpers: generic row read/write over a sheet with a header row ──

function readRows_(sheetName) {
  const sheet = getSheet_(sheetName);
  if (!sheet) return [];
  const values = sheet.getDataRange().getValues();
  const headers = values[0];
  return values.slice(1)
    .filter(row => row.some(cell => cell !== ''))
    .map(row => {
      const obj = {};
      headers.forEach((h, i) => obj[h] = row[i]);
      return obj;
    });
}

function addRow_(sheetName, payload, requiredFields) {
  const sheet = getSheet_(sheetName);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const id = Utilities.getUuid().slice(0, 8);
  const rowObj = Object.assign({ id: id, published: true }, payload);
  const row = headers.map(h => rowObj[h] !== undefined ? rowObj[h] : '');
  sheet.appendRow(row);
}

function updateRow_(sheetName, payload) {
  const sheet = getSheet_(sheetName);
  const values = sheet.getDataRange().getValues();
  const headers = values[0];
  const idCol = headers.indexOf('id');
  for (let r = 1; r < values.length; r++) {
    if (String(values[r][idCol]) === String(payload.id)) {
      headers.forEach((h, c) => {
        if (payload[h] !== undefined) {
          sheet.getRange(r + 1, c + 1).setValue(payload[h]);
        }
      });
      return;
    }
  }
  throw new Error('row_not_found');
}

function deleteRow_(sheetName, id) {
  const sheet = getSheet_(sheetName);
  const values = sheet.getDataRange().getValues();
  const idCol = values[0].indexOf('id');
  for (let r = 1; r < values.length; r++) {
    if (String(values[r][idCol]) === String(id)) {
      sheet.deleteRow(r + 1);
      return;
    }
  }
  throw new Error('row_not_found');
}

// ── Settings: stored as key/value pairs in the Settings tab ──

function readSettings_() {
  const rows = readRows_(SHEET_NAMES.SETTINGS);
  const out = {};
  rows.forEach(r => out[r.key] = r.value);
  return out;
}

function saveSettings_(payload) {
  const sheet = getSheet_(SHEET_NAMES.SETTINGS);
  const values = sheet.getDataRange().getValues();
  const keyCol = 0, valCol = 1;
  const existingKeys = {};
  for (let r = 1; r < values.length; r++) {
    existingKeys[values[r][keyCol]] = r + 1;
  }
  Object.keys(payload).forEach(key => {
    if (existingKeys[key]) {
      sheet.getRange(existingKeys[key], valCol + 1).setValue(payload[key]);
    } else {
      sheet.appendRow([key, payload[key]]);
    }
  });
}
