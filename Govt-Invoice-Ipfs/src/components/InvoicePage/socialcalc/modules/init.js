// Spreadsheet initialization functions
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

export function initializeApp(data) {
  /* Initializes the spreadsheet */
  // Try multiple candidate IDs so the renderer can namespace its elements
  const tableEditorCandidates = ["tableeditor", "app-renderer-tableeditor", "app-tableeditor"];
  const workbookControlCandidates = ["workbookControl", "app-renderer-workbookControl", "app-workbookControl"];
  const containerCandidates = ["container", "app-renderer-container", "app-container"];

  let tableeditor = null;
  for (const id of tableEditorCandidates) {
    const el = document.getElementById(id);
    if (el) {
      tableeditor = el;
      break;
    }
  }

  // Initialize spreadsheet and workbook
  let spreadsheet = new SocialCalc.SpreadsheetControl();
  let workbook = new SocialCalc.WorkBook(spreadsheet);
  workbook.InitializeWorkBook("sheet1");

  // Guard: ensure we have a tableeditor element before calling into SocialCalc
  if (!tableeditor) {
    console.error("initializeApp: tableeditor element not found. Tried:", tableEditorCandidates);
    return;
  }

  spreadsheet.InitializeSpreadsheetControl(tableeditor, 0, 0, 0);
  spreadsheet.ExecuteCommand("redisplay", "");

  // Determine which workbook control id exists (string passed to constructor)
  let workbookControlId = null;
  for (const id of workbookControlCandidates) {
    if (document.getElementById(id)) {
      workbookControlId = id;
      break;
    }
  }

  // Fallback to the first candidate if none exist; WorkBookControl will create inner elements
  if (!workbookControlId) workbookControlId = workbookControlCandidates[0];

  let workbookcontrol = new SocialCalc.WorkBookControl(
    workbook,
    workbookControlId,
    "sheet1"
  );
  workbookcontrol.InitializeWorkBookControl();
  // alert("app: "+JSON.stringify(data));
  SocialCalc.WorkBookControlLoad(data);

  // Calculate proper height for the spreadsheet
  let ele = document.getElementById("te_griddiv");
  if (ele) {
    // Get the available height from the container (try namespaced ids too)
    let container = null;
    for (const id of containerCandidates) {
      const el = document.getElementById(id);
      if (el) {
        container = el;
        break;
      }
    }

    const ionContent = document.querySelector("ion-content");
    const ionHeader = document.querySelector("ion-header");

    if (container && ionContent && ionHeader) {
      const headerHeight = ionHeader.offsetHeight || 0;
      const viewportHeight = window.innerHeight;
      const availableHeight = viewportHeight - headerHeight;

      // Set a more precise height for mobile
      ele.style.height = availableHeight + "px";
      ele.style.marginBottom = "0px";
      ele.style.paddingBottom = "0px";
    }
  }

  spreadsheet.DoOnResize();
}
