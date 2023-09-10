var SocialCalc = require("./aspiring/SocialCalc.js");

export function getDeviceType() {
  /* Returns the type of the device */
  var device = "default";
  if (navigator.userAgent.match(/iPod/)) device = "iPod";
  if (navigator.userAgent.match(/iPad/)) device = "iPad";
  if (navigator.userAgent.match(/iPhone/)) device = "iPhone";
  if (navigator.userAgent.match(/Android/)) device = "Android";
  console.log("Device is: " + device);
  return device;
}

export function initializeApp(data) {
  /* Initializes the spreadsheet */

  let tableeditor = document.getElementById("tableeditor");
  let spreadsheet = new SocialCalc.SpreadsheetControl();
  let workbook = new SocialCalc.WorkBook(spreadsheet);
  workbook.InitializeWorkBook("sheet1");

  spreadsheet.InitializeSpreadsheetControl(tableeditor, 0, 0, 0);
  spreadsheet.ExecuteCommand("redisplay", "");

  let workbookcontrol = new SocialCalc.WorkBookControl(
    workbook,
    "workbookControl",
    "sheet1"
  );
  workbookcontrol.InitializeWorkBookControl();
  // alert("app: "+JSON.stringify(data));
  SocialCalc.WorkBookControlLoad(data);
  let ele = document.getElementById("te_griddiv");
  ele.style.height = "1600px";
  spreadsheet.DoOnResize();
}

export function activateFooterButton(index) {
  /* Activates the sheet according to the index*/
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

export function getCSVContent() {
  var val = SocialCalc.WorkBookControlSaveSheet();
  var workBookObject = JSON.parse(val);
  var control = SocialCalc.GetCurrentWorkBookControl();
  var currentname = control.currentSheetButton.id;
  var savestrr = workBookObject.sheetArr[currentname].sheetstr.savestr;
  var res = SocialCalc.ConvertSaveToOtherFormat(savestrr, "csv", false);
  return res;
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
  var control = SocialCalc.GetCurrentWorkBookControl();
  var editor = control.workbook.spreadsheet.editor;
  var cellname = editor.workingvalues.currentsheet + "!" + editor.ecell.coord;
  var constraint = SocialCalc.EditableCells.constraints[cellname];
  var highlights = editor.context.highlights;

  //alert(constraint);
  var wval = editor.workingvalues;
  if (wval.eccord) {
    wval.ecoord = null;
    console.log("return due to ecoord");
    return;
  }
  wval.ecoord = coord;
  if (!coord) coord = editor.ecell.coord;
  var text = SocialCalc.GetCellContents(editor.context.sheetobj, coord);
  console.log("in prompt, coord = " + coord + " text=" + text);

  if (
    SocialCalc.Constants.SCNoQuoteInInputBox &&
    text.substring(0, 1) === "'"
  ) {
    text = text.substring(1);
  }
  console.log("continue...");

  var cell = SocialCalc.GetEditorCellElement(
    editor,
    editor.ecell.row,
    editor.ecell.col
  );
  //alert(cell);

  /*var cancelfn = function() {
        wval.ecoord = null;
        delete highlights[editor.ecell.coord];
        editor.UpdateCellCSS(cell, editor.ecell.row, editor.ecell.col);
        
    };*/

  var okfn = function (val) {
    var callbackfn = function () {
      console.log("callback val " + val);
      SocialCalc.EditorSaveEdit(editor, val);
    };
    window.setTimeout(callbackfn, 100);
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

  function onPrompt(results) {
    if (results.buttonIndex === 3) return;
    else if (results.buttonIndex === 2) {
      var onConfirm = function (buttonIndex) {
        console.log(buttonIndex);
        switch (buttonIndex) {
          case 1: //do nothing
            break;
          case 2:
            var onFontConfirm = function (fontIndex) {
              switch (fontIndex) {
                case 1: //do nothing
                  break;
                case 2:
                  SocialCalc.EditorChangefontFromWidget(editor, "a");
                  break;
                case 3:
                  SocialCalc.EditorChangefontFromWidget(editor, "b");
                  break;
                case 4:
                  SocialCalc.EditorChangefontFromWidget(editor, "c");
                  break;
                case 5:
                  SocialCalc.EditorChangefontFromWidget(editor, "d");
                  break;
                default:
                  break;
              }
            };

            navigator.notification.confirm(
              "Customise cell options", // message
              onFontConfirm, // callback to invoke with index of button pressed
              "Customise", // title
              ["Cancel", "Small:8pt", "Medium:12pt", "Big:14pt", "Large:16pt"] // buttonLabels
            );
            break;
          case 3:
            var onColorConfirm = function (colorIndex) {
              switch (colorIndex) {
                case 1: //do nothing
                  break;
                case 2:
                  SocialCalc.EditorChangecolorFromWidget(editor, "red");
                  break;
                case 3:
                  SocialCalc.EditorChangecolorFromWidget(editor, "yellow");
                  break;
                case 4:
                  SocialCalc.EditorChangecolorFromWidget(editor, "blue");
                  break;
                case 5:
                  SocialCalc.EditorChangecolorFromWidget(editor, "green");
                  break;
                case 6:
                  SocialCalc.EditorChangecolorFromWidget(editor, "purple");
                  break;
                case 7:
                  SocialCalc.EditorChangecolorFromWidget(editor, "black");
                  break;
                default:
                  break;
              }
            };

            navigator.notification.confirm(
              "Customise cell options", // message
              onColorConfirm, // callback to invoke with index of button pressed
              "Customise", // title
              ["Cancel", "Red", "Yellow", "Blue", "Green", "Purple", "Black"] // buttonLabels
            );
            break;
          case 4:
            editor.context.sheetobj.SheetUndo();
            break;
          case 5:
            editor.context.sheetobj.SheetRedo();
            break;
          case 6:
            SocialCalc.EditorCut(editor, "a");
            break;
          case 7:
            SocialCalc.EditorCut(editor, "b");
            break;
          case 8:
            SocialCalc.EditorCut(editor, "c");
            break;
          case 9:
            SocialCalc.EditorCut(editor, "d");
            break;
          default:
            break;
        }
      };
      navigator.notification.confirm(
        "Customise cell options", // message
        onConfirm, // callback to invoke with index of button pressed
        "Customise", // title
        [
          "Cancel",
          "Font",
          "Color",
          "Undo",
          "Redo",
          "Cut",
          "Copy",
          "Paste",
          "Clear",
        ] // buttonLabels
      );
    } else if (results.buttonIndex === 1) {
      okfn(results.input1);
    }
  }

  navigator.notification.prompt(
    "Enter value", // message
    onPrompt, // callback to invoke
    "Input", // title
    ["Ok", "Customise", "Cancel"], // buttonLabels
    "" + text + "" // defaultText
  );

  return true;
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

export function saveAs() {
  return new Promise(function (resolve, reject) {
    navigator.notification.prompt(
      "Please enter the filename", // message
      function (results) {
        if (results.buttonIndex === 2) {
          resolve(results.input1);
        }
      }, // callback to invoke
      "Save as", // title
      ["Cancel", "Save"], // buttonLabels
      "" // defaultText
    );
  });
}

export function getAllOldFiles() {
  return new Promise(function (resolve, reject) {
    var files = {};

    for (var i = 0; i < window.localStorage.length; i++) {
      if (window.localStorage.key(i).length >= 30) continue;
      var filename = window.localStorage.key(i);

      if (filename === "logoArray") continue;
      if (filename === "inapp") continue;
      if (filename === "sound") continue;
      if (filename === "cloudInapp") continue;
      if (filename === "inapplocal") continue;
      if (filename === "inappPurchase") continue;
      if (filename === "flag") continue;
      if (filename === "share") continue;
      if (filename === "cellArray") continue;
      if (filename === "sk_receiptForProduct") continue;
      if (filename === "sk_receiptForTransaction") continue;
      if (
        filename === "didTutorial" ||
        filename === "customise" ||
        filename === "rename" ||
        filename === "choice"
      )
        continue;
      /// console.log(filename);
      var filedata = decodeURIComponent(window.localStorage.getItem(filename));

      files[filename] = filedata;
    }
    // console.log(files);
    resolve(files);
  });
}

export function deleteAllOldFiles(files) {
  return new Promise(function (resolve, reject) {
    for (var i in files) {
      console.log("Removing.." + i);
      window.localStorage.removeItem(i);
    }
    resolve(true);
  });
}

export function addLogo(coord, url) {
  return new Promise(function (resolve, reject) {
    console.log(url);

    var control = SocialCalc.GetCurrentWorkBookControl();
    var currsheet = control.currentSheetButton.id;
    // var editor = control.workbook.spreadsheet.editor;

    var cmd = "";
    for (var sheetname in coord) {
      if (coord[sheetname] !== null) {
        if (currsheet === sheetname) {
          console.log(sheetname + " ," + coord[sheetname]); // eslint-disable-next-line
          cmd =
            "set " +
            coord[sheetname] +
            ' text t <img src="' +
            url +
            '" height="100" width="150"></img>' +
            "\n";
          cmd = {
            cmdtype: "scmd",
            id: currsheet,
            cmdstr: cmd,
            saveundo: false,
          };
          control.ExecuteWorkBookControlCommand(cmd, false);
        }
      }
    }
    resolve(true);
  });
}

export function removeLogo(coord) {
  return new Promise(function (resolve, reject) {
    var control = SocialCalc.GetCurrentWorkBookControl();
    var currsheet = control.currentSheetButton.id;
    // var editor = control.workbook.spreadsheet.editor;

    var cmd = "";
    for (var sheetname in coord) {
      if (coord[sheetname] !== null) {
        if (currsheet === sheetname) {
          console.log(sheetname + " ," + coord[sheetname]);
          cmd = "erase " + coord[sheetname] + " formulas";
          cmd = {
            cmdtype: "scmd",
            id: currsheet,
            cmdstr: cmd,
            saveundo: false,
          };
          control.ExecuteWorkBookControlCommand(cmd, false);
        }
      }
    }
    resolve(true);
  });
}

export function undo() {
  var control = SocialCalc.GetCurrentWorkBookControl();
  //alert('control are'+control);
  var editor = control.workbook.spreadsheet.editor;
  editor.context.sheetobj.SheetUndo();
}

export function redo() {
  var control = SocialCalc.GetCurrentWorkBookControl();
  //alert('control are'+control);
  var editor = control.workbook.spreadsheet.editor;
  editor.context.sheetobj.SheetRedo();
}

export function getCurrentSheet() {
  return SocialCalc.GetCurrentWorkBookControl().currentSheetButton.id;
}

export function changeSheetColor(name) {
  var control = SocialCalc.GetCurrentWorkBookControl();
  var editor = control.workbook.spreadsheet.editor;

  name = name.toLowerCase();
  //console.log("changing sheet color to: "+name);
  SocialCalc.EditorChangeSheetcolor(editor, name);
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
