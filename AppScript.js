/*
 * Deploy this script as a Google Apps Script Web App.
 *
 * Suggested spreadsheets:
 *
 * Users:
 * Name | Email | Password | Role
 *
 * Internships:
 * Register Number | Name | Title | Mobile No. | Section | Period |
 * Start Date | End Date | Company Name | Placement thru college / outside |
 * Stipend (In Rs.) | Research/Industry | Abroad / India | Internship Type |
 * Offer Letter | Completion Certificate | Report | Student Feedback |
 * Employer Feedback
 *
 * Configure the spreadsheet ID and Drive folder ID below.
 */

const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID';
const DRIVE_FOLDER_ID = 'YOUR_DRIVE_FOLDER_ID';

function getSheet_(name) {
  return SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(name);
}

function json_(object) {
  return ContentService
    .createTextOutput(JSON.stringify(object))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  const action = e && e.parameter ? e.parameter.action : '';

  if (action === 'users') {
    return getUsers_();
  }

  return getInternships_();
}

function getUsers_() {
  const sheet = getSheet_('Users');

  if (!sheet) {
    return json_({
      result: 'error',
      message: 'Users sheet not found.'
    });
  }

  const values = sheet.getDataRange().getValues();

  if (values.length < 2) {
    return json_({ result: 'success', data: [] });
  }

  const headers = values[0];

  const users = values.slice(1).map(row => {
    const user = {};
    headers.forEach((header, index) => {
      user[String(header)] = row[index];
    });
    return user;
  });

  return json_({
    result: 'success',
    data: users
  });
}

function getInternships_() {
  const sheet = getSheet_('Internships');

  if (!sheet) {
    return json_({
      result: 'error',
      message: 'Internships sheet not found.'
    });
  }

  return json_({
    result: 'success',
    data: sheet.getDataRange().getValues()
  });
}

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents || '{}');

    if (payload.action === 'register') {
      return registerUser_(payload);
    }

    if (payload.action === 'submitInternship') {
      return submitInternship_(payload.data || {});
    }

    if (payload.action === 'uploadFile') {
      return uploadFile_(payload);
    }

    return json_({
      result: 'error',
      message: 'Unknown action.'
    });
  } catch (error) {
    return json_({
      result: 'error',
      message: error.message
    });
  }
}

function registerUser_(payload) {
  const sheet = getSheet_('Users');

  if (!sheet) {
    return json_({
      result: 'error',
      message: 'Users sheet not found.'
    });
  }

  const values = sheet.getDataRange().getValues();
  const headers = values[0].map(String);
  const emailIndex = headers.indexOf('Email');

  if (emailIndex === -1) {
    return json_({
      result: 'error',
      message: 'Users sheet must contain an Email column.'
    });
  }

  const exists = values.slice(1).some(row =>
    String(row[emailIndex]).trim().toLowerCase() ===
    String(payload.email).trim().toLowerCase()
  );

  if (exists) {
    return json_({
      result: 'error',
      message: 'Email already registered.'
    });
  }

  const row = headers.map(header => {
    if (header === 'Name') return payload.name || '';
    if (header === 'Email') return payload.email || '';
    if (header === 'Password') return payload.password || '';
    if (header === 'Role') return payload.role || 'student';
    return '';
  });

  sheet.appendRow(row);

  return json_({
    result: 'success',
    message: 'Registration successful.'
  });
}

function submitInternship_(data) {
  const sheet = getSheet_('Internships');

  if (!sheet) {
    return json_({
      result: 'error',
      message: 'Internships sheet not found.'
    });
  }

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  const row = headers.map(header => data[String(header)] ?? '');

  sheet.appendRow(row);

  return json_({
    result: 'success',
    message: 'Internship record saved.'
  });
}

function uploadFile_(payload) {
  const folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
  const bytes = Utilities.base64Decode(payload.base64);
  const blob = Utilities.newBlob(
    bytes,
    payload.mimeType || 'application/pdf',
    payload.fileName || 'document.pdf'
  );

  const file = folder.createFile(blob);

  return json_({
    result: 'success',
    fileId: file.getId(),
    fileUrl: file.getUrl(),
    fileName: file.getName()
  });
}