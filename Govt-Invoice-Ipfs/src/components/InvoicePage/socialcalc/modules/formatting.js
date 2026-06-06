// Cell and sheet formatting functions
let SocialCalc;

// Ensure SocialCalc is loaded from the global scope
if (typeof window !== "undefined" && window.SocialCalc) {
  SocialCalc = window.SocialCalc;
} else if (typeof global !== "undefined" && global.SocialCalc) {
  SocialCalc = global.SocialCalc;
} else {
  SocialCalc = {}; // Fallback to prevent errors
}

export function changeSheetColor(name) {
  var control = SocialCalc.GetCurrentWorkBookControl();
  var editor = control.workbook.spreadsheet.editor;

  name = name.toLowerCase();
  SocialCalc.EditorChangeSheetcolor(editor, name);
}

export function changeSheetFontColor(colorName) {
  var control = SocialCalc.GetCurrentWorkBookControl();
  var editor = control.workbook.spreadsheet.editor;

  // Create command to set sheet default font color
  var cmdline = "set sheet defaultcolor " + colorName;
  editor.EditorScheduleSheetCommands(cmdline, true, false);
}

export function changeSheetBackgroundColor(colorName) {
  var control = SocialCalc.GetCurrentWorkBookControl();
  var editor = control.workbook.spreadsheet.editor;

  // Create command to set sheet default background color
  var cmdline = "set sheet defaultbgcolor " + colorName;
  editor.EditorScheduleSheetCommands(cmdline, true, false);
}

export function changeFontSheet(cmdline) {
  var control = SocialCalc.GetCurrentWorkBookControl();
  //alert('control are'+control);
  var editor = control.workbook.spreadsheet.editor;
  editor.EditorScheduleSheetCommands(cmdline, true, false);
}

export function executeCommand(cmdline) {
  var control = SocialCalc.GetCurrentWorkBookControl();
  //alert('control are'+control);
  var editor = control.workbook.spreadsheet.editor;
  editor.EditorScheduleSheetCommands(cmdline, true, false);
}

export function applySelectedFormatting(coord, formatting) {

  const control = SocialCalc.GetCurrentWorkBookControl();
  const editor = control.workbook.spreadsheet.editor;

  if (formatting.fontSize) {
    // Font command format: set coord font style weight size family
    // valid sizes: * or size value
    // We'll preserve existing style/weight/family by using *
    const cmd = `set ${coord} font * * ${formatting.fontSize} *`;
    editor.EditorScheduleSheetCommands(cmd, true, false);
  }

  if (formatting.fontColor) {
    // Color command format: set coord color colorname
    const cmd = `set ${coord} color ${formatting.fontColor}`;
    editor.EditorScheduleSheetCommands(cmd, true, false);
  }

  if (formatting.bgColor) {
    // BgColor command format: set coord bgcolor colorname
    const cmd = `set ${coord} bgcolor ${formatting.bgColor}`;
    editor.EditorScheduleSheetCommands(cmd, true, false);
  }

  // Redisplay to show changes
  editor.context.sheetobj.ScheduleSheetCommands("redisplay", false, false);
}

export function updateCellValueAndFormat(coord, val, formatting) {
  var control = SocialCalc.GetCurrentWorkBookControl();
  if (!control) return;
  var editor = control.workbook.spreadsheet.editor;

  var cmds = [];

  // 1. Handle Value
  if (val !== null && val !== undefined) {
    var numVal = parseFloat(val);
    if (!isNaN(numVal) && isFinite(val) && val.toString().trim() === numVal.toString()) {
      cmds.push("set " + coord + " value n " + numVal);
    } else {
      // Use SocialCalc's native encoding if available, otherwise manual escape
      var strVal;
      if (SocialCalc.encodeForSave) {
        strVal = SocialCalc.encodeForSave(val.toString());
      } else {
        strVal = val.toString().replace(/\\/g, "\\b").replace(/:/g, "\\c").replace(/\n/g, "\\n");
      }
      cmds.push("set " + coord + " text t " + strVal);
    }
  }

  // 2. Handle Formatting
  if (formatting) {
    if (formatting.fontSize) {
      cmds.push("set " + coord + " font * * " + formatting.fontSize + " *");
    }
    if (formatting.fontColor) {
      cmds.push("set " + coord + " color " + formatting.fontColor);
    }
    if (formatting.bgColor) {
      cmds.push("set " + coord + " bgcolor " + formatting.bgColor);
    }
  }

  if (cmds.length === 0) return;

  // Execute all as one transaction
  var cmdstr = cmds.join("\n");

  if (control.ExecuteWorkBookControlCommand) {
    var commandObj = {
      cmdtype: "scmd",
      id: control.currentSheetButton ? control.currentSheetButton.id : "sheet1",
      cmdstr: cmdstr,
      saveundo: true
    };
    control.ExecuteWorkBookControlCommand(commandObj, false);
  } else {
    editor.EditorScheduleSheetCommands(cmdstr, true, false);
  }
}

export function resetCellFormatting(coord) {

  const control = SocialCalc.GetCurrentWorkBookControl();
  const editor = control.workbook.spreadsheet.editor;

  // Reset font to default using SocialCalc command
  const fontCmd = `set ${coord} font * * *`;
  editor.EditorScheduleSheetCommands(fontCmd, true, false);

  // Reset color to default
  const colorCmd = `set ${coord} color *`;
  editor.EditorScheduleSheetCommands(colorCmd, true, false);

  // Reset background color to default
  const bgCmd = `set ${coord} bgcolor *`;
  editor.EditorScheduleSheetCommands(bgCmd, true, false);

  // Redisplay to show changes
  editor.context.sheetobj.ScheduleSheetCommands("redisplay", false, false);
}

export function getCellFormatting(coord) {
  const control = SocialCalc.GetCurrentWorkBookControl();
  if (!control || !control.workbook || !control.workbook.spreadsheet) {
    return null;
  }

  const editor = control.workbook.spreadsheet.editor;
  const sheetobj = editor.context.sheetobj;

  if (!coord) {
    coord = editor.ecell.coord;
  }

  const cell = sheetobj.cells[coord];
  if (!cell) {
    return null;
  }

  // Resolve numeric color indices to actual color strings using sheetobj.colors[]
  const resolvedColor = cell.color ? (sheetobj.colors[cell.color] || null) : null;
  const resolvedBgColor = cell.bgcolor ? (sheetobj.colors[cell.bgcolor] || null) : null;

  return {
    font: cell.font || null,
    color: resolvedColor,
    bgcolor: resolvedBgColor,
    coord: coord,
  };
}
