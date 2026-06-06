// Export functionality (CSV, etc.)
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

export function getCSVContent() {
  var val = SocialCalc.WorkBookControlSaveSheet();
  var workBookObject = JSON.parse(val);
  var control = SocialCalc.GetCurrentWorkBookControl();
  var currentname = control.currentSheetButton.id;
  var savestrr = workBookObject.sheetArr[currentname].sheetstr.savestr;
  var res = SocialCalc.ConvertSaveToOtherFormat(savestrr, "csv", false);
  return res;
}
