const SPREADSHEET_NAME = '背單字程式單字表';
const SHEET_NAME = 'Vocabulary';

function doGet() {
  return HtmlService.createTemplateFromFile('index')
      .evaluate()
      .setTitle('背單字程式');
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function getSpreadsheet() {
  const files = DriveApp.getFilesByName(SPREADSHEET_NAME);
  if (files.hasNext()) {
    return SpreadsheetApp.open(files.next());
  }
  return SpreadsheetApp.create(SPREADSHEET_NAME);
}

function getSheet() {
  const spreadsheet = getSpreadsheet();
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['英文', '中文', '詞性', '例句', '新增時間']);
  }
  return sheet;
}

function saveWordsToSheet(words) {
  if (!Array.isArray(words)) {
    throw new Error('words 必須是陣列');
  }

  const sheet = getSheet();
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.deleteRows(2, lastRow - 1);
  }

  const rows = words.map((word) => [
    word.english || '',
    word.chinese || '',
    word.pos || '',
    word.example || '',
    new Date(),
  ]);

  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
  }

  return {
    count: rows.length,
    spreadsheetUrl: sheet.getParent().getUrl(),
  };
}
