// User prompt and input functions
import { showFormattingButtons } from "./utils.js";

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

export function mustshowprompt(coord) {
  var control = SocialCalc.GetCurrentWorkBookControl();
  var editor = control.workbook.spreadsheet.editor;
  var cellname = editor.workingvalues.currentsheet + "!" + editor.ecell.coord;
  var constraint = SocialCalc.EditableCells.constraints[cellname];
  if (constraint) {
  }
  // for phone apps always show prompt
  return true;
}

export function getinputtype(coord) {
  var control = SocialCalc.GetCurrentWorkBookControl();
  var editor = control.workbook.spreadsheet.editor;
  var cellname = editor.workingvalues.currentsheet + "!" + editor.ecell.coord;
  var constraint = SocialCalc.EditableCells.constraints[cellname];
  if (constraint) {
  }
  return null;
}

export function prompttype(coord) {
  var control = SocialCalc.GetCurrentWorkBookControl();
  var editor = control.workbook.spreadsheet.editor;
  var cellname = editor.workingvalues.currentsheet + "!" + editor.ecell.coord;
  var constraint = SocialCalc.EditableCells.constraints[cellname];

  if (constraint) {
  }
  return null;
}

export function showprompt(coord) {
  // Use the enhanced prompt with formatting buttons
  return enhancedShowPrompt(coord);
}

export function enhancedShowPrompt(coord) {
  var control = SocialCalc.GetCurrentWorkBookControl();
  var editor = control.workbook.spreadsheet.editor;
  var cellname = editor.workingvalues.currentsheet + "!" + editor.ecell.coord;
  var constraint = SocialCalc.EditableCells.constraints[cellname];
  var highlights = editor.context.highlights;

  var wval = editor.workingvalues;
  if (wval.eccord) {
    wval.ecoord = null;
    console.log("return due to ecoord");
    return;
  }
  wval.ecoord = coord;
  if (!coord) coord = editor.ecell.coord;
  var text = SocialCalc.GetCellContents(editor.context.sheetobj, coord);
  console.log("in enhanced prompt, coord = " + coord + " text=" + text);

  if (
    SocialCalc.Constants.SCNoQuoteInInputBox &&
    text.substring(0, 1) === "'"
  ) {
    text = text.substring(1);
  }

  var cell = SocialCalc.GetEditorCellElement(
    editor,
    editor.ecell.row,
    editor.ecell.col
  );

  var okfn = function (val) {
    if (val === null || val === undefined) return;

    var callbackfn = function () {
      console.log("callback val " + val);

      // Create command to set cell text/value
      var cmd = "";
      var cellRef = editor.ecell.coord;

      // Determine if value is number or text
      var numVal = parseFloat(val);
      if (!isNaN(numVal) && isFinite(val) && val.toString().trim() === numVal.toString()) {
        cmd = "set " + cellRef + " value n " + numVal;
      } else {
        // Text value - encode if necessary
        var strVal = val.toString();
        // Simple encoding for now, assuming SocialCalc.encodeForSave might be available or not needed for basic text
        // If SocialCalc has an encode function, use it. Otherwise, basic text escaping might be needed.
        // For now, using 'text t' which handles most things, but we should be careful with newlines etc.
        cmd = "set " + cellRef + " text t " + strVal;
      }

      if (editor.context && editor.context.sheetobj) {
        // Use ExecuteWorkBookControlCommand if available to handle undo/redo properly
        if (control && control.ExecuteWorkBookControlCommand) {
          var commandObj = {
            cmdtype: "scmd",
            id: control.currentSheetButton ? control.currentSheetButton.id : "sheet1",
            cmdstr: cmd,
            saveundo: true
          };
          control.ExecuteWorkBookControlCommand(commandObj, false);
        } else {
          // Fallback to simpler execution if control is not fully available (unlikely)
          editor.EditorScheduleSheetCommands(cmd, true, false);
        }
      }
    };
    // Execute callback synchronously to avoid race conditions with formatting application
    const safeCallbackfn = function () {
      try {
        callbackfn();
      } catch (e) {
        console.error("Error in cell edit callback:", e);
      }
    };
    safeCallbackfn();
  };

  // highlight the cell
  delete highlights[editor.ecell.coord];
  highlights[editor.ecell.coord] = "cursor";
  editor.UpdateCellCSS(cell, editor.ecell.row, editor.ecell.col);

  var celltext = "Enter Value";
  var title = "Input";
  if (constraint) {
  } else {
    console.log("cell text is null");
  }

  var options = { title: title };
  options["message"] = celltext;
  console.log("text is " + text);
  options["textvalue"] = text;

  // Dispatch custom event for React modal to handle
  const cellEditEvent = new CustomEvent('socialcalc:cell-edit-request', {
    detail: {
      coord: coord,
      text: text,
      okfn: okfn,
      // Cleanup function for when modal closes
      cleanup: function () {
        wval.ecoord = null;
        delete highlights[editor.ecell.coord];
        editor.UpdateCellCSS(cell, editor.ecell.row, editor.ecell.col);
      }
    }
  });
  window.dispatchEvent(cellEditEvent);

  return true;
}
