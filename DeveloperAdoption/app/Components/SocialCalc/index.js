const SocialCalc = require("./aspiring/SocialCalc.js");

export function getDeviceType() {
  /* Returns the type of the device */
  var device = "default";
  if (navigator.userAgent.match(/iPod/)) device = "iPod";
  if (navigator.userAgent.match(/iPad/)) device = "iPad";
  if (navigator.userAgent.match(/iPhone/)) device = "iPhone";
  if (navigator.userAgent.match(/Android/)) device = "Android";
  return device;
}

export function initializeApp(data) {
  /* Initializes the spreadsheet */

  let tableeditor = document.getElementById("tableeditor");
  let spreadsheet = new SocialCalc.SpreadsheetControl();
  let workbook = new SocialCalc.WorkBook(spreadsheet);
  workbook.InitializeWorkBook("sheet1");

  spreadsheet.InitializeSpreadsheetControl(tableeditor, 0, 0, 0);


 
}
