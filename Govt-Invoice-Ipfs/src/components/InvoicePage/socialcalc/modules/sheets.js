// Sheet management and data functions
let SocialCalc;

// Ensure SocialCalc is loaded from the global scope
if (typeof window !== "undefined" && window.SocialCalc) {
  SocialCalc = window.SocialCalc;
} else if (typeof global !== "undefined" && global.SocialCalc) {
  SocialCalc = global.SocialCalc;
} else {
  console.error("SocialCalc not found in global scope");
  SocialCalc = {}; // Fallback to prevent errors
}

export function activateFooterButton(index) {
  if (index === SocialCalc.oldBtnActive) return;
  var control = SocialCalc.GetCurrentWorkBookControl();

  var sheets = [];
  for (var key in control.sheetButtonArr) {
    //console.log(key);
    sheets.push(key);
  }
  var spreadsheet = control.workbook.spreadsheet;
  var ele = document.getElementById(spreadsheet.formulabarDiv.id);
  if (ele) {
    SocialCalc.ToggleInputLineButtons(false);
    var input = ele.firstChild;
    input.style.display = "none";
    spreadsheet.editor.state = "start";
  }
  SocialCalc.WorkBookControlActivateSheet(sheets[index - 1]);

  SocialCalc.oldBtnActive = index;
}

export function viewFile(filename, data) {
  SocialCalc.WorkBookControlInsertWorkbook(data);

  SocialCalc.GetCurrentWorkBookControl().workbook.spreadsheet.editor.state =
    "start";

  SocialCalc.GetCurrentWorkBookControl().workbook.spreadsheet.ExecuteCommand(
    "redisplay",
    ""
  );

  window.setTimeout(function () {
    SocialCalc.ScrollRelativeBoth(
      SocialCalc.GetCurrentWorkBookControl().workbook.spreadsheet.editor,
      1,
      0
    );
    SocialCalc.ScrollRelativeBoth(
      SocialCalc.GetCurrentWorkBookControl().workbook.spreadsheet.editor,
      -1,
      0
    );
  }, 1000);
}

export function getSpreadsheetContent() {
  return SocialCalc.WorkBookControlSaveSheet();
}

export function getCurrentHTMLContent() {
  var control = SocialCalc.GetCurrentWorkBookControl();
  return control.workbook.spreadsheet.CreateSheetHTML();
}

export function getAllHTMLContent(sheetdata) {
  var appsheets = {};
  // var control = SocialCalc.GetCurrentWorkBookControl();

  for (var i = 1; i <= sheetdata.numsheets; i++) {
    var key = "sheet" + i;
    appsheets[key] = key;
  }

  return SocialCalc.WorkbookControlCreateSheetHTML(appsheets);
}

export function getCurrentSheet() {
  return SocialCalc.GetCurrentWorkBookControl().currentSheetButton.id;
}

export function getAllSheetsData() {
  var control = SocialCalc.GetCurrentWorkBookControl();
  if (!control || !control.workbook || !control.sheetButtonArr) {
    return [];
  }

  var sheetsData = [];
  var currentSheetId = control.currentSheetButton
    ? control.currentSheetButton.id
    : null;

  // Get all sheet names
  for (var sheetId in control.sheetButtonArr) {
    // Temporarily switch to each sheet to get its HTML content
    SocialCalc.WorkBookControlActivateSheet(sheetId);

    var htmlContent = control.workbook.spreadsheet.CreateSheetHTML();

    sheetsData.push({
      id: sheetId,
      name: sheetId.replace("sheet", "Sheet "), // Convert 'sheet1' to 'Sheet 1'
      htmlContent: htmlContent,
    });
  }

  // Switch back to the original sheet if it existed
  if (currentSheetId) {
    SocialCalc.WorkBookControlActivateSheet(currentSheetId);
  }

  return sheetsData;
}

export function getWorkbookInfo() {
  var control = SocialCalc.GetCurrentWorkBookControl();
  if (!control || !control.sheetButtonArr) {
    return { numsheets: 0, sheets: [] };
  }

  var sheets = [];
  for (var sheetId in control.sheetButtonArr) {
    sheets.push(sheetId);
  }

  return {
    numsheets: sheets.length,
    sheets: sheets,
  };
}
