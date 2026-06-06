/* eslint-disable */
// SocialCalc Spreadsheet Control Module
// Extracted from the main SocialCalc.js file

// UMD wrapper
(function (root, factory) {
  if (typeof define === "function" && define.amd) {
    define([], factory);
  } else if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.SocialCalcSpreadsheetControl = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {

  // Get SocialCalc namespace
  var SocialCalc;
  if (typeof window !== "undefined" && window.SocialCalc) {
    SocialCalc = window.SocialCalc;
  } else if (typeof global !== "undefined" && global.SocialCalc) {
    SocialCalc = global.SocialCalc;
  } else {
    SocialCalc = {};
  }


  //
  // SocialCalcSpreadsheetControl
  //
  /*
// The code module of the SocialCalc package that lets you embed a spreadsheet
// control with toolbar, etc., into a web page.
//
// (c) Copyright 2008, 2009, 2010 Socialtext, Inc.
// All Rights Reserved.
//
*/

  /*

LEGAL NOTICES REQUIRED BY THE COMMON PUBLIC ATTRIBUTION LICENSE:

EXHIBIT A. Common Public Attribution License Version 1.0.

The contents of this file are subject to the Common Public Attribution License Version 1.0 (the 
"License"); you may not use this file except in compliance with the License. You may obtain a copy 
of the License at http://socialcalc.org. The License is based on the Mozilla Public License Version 1.1 but 
Sections 14 and 15 have been added to cover use of software over a computer network and provide for 
limited attribution for the Original Developer. In addition, Exhibit A has been modified to be 
consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis, WITHOUT WARRANTY OF ANY 
KIND, either express or implied. See the License for the specific language governing rights and 
limitations under the License.

The Original Code is SocialCalc JavaScript SpreadsheetControl.

The Original Developer is the Initial Developer.

The Initial Developer of the Original Code is Socialtext, Inc. All portions of the code written by 
Socialtext, Inc., are Copyright (c) Socialtext, Inc. All Rights Reserved.

Contributor: Dan Bricklin.


EXHIBIT B. Attribution Information

When the SpreadsheetControl is producing and/or controlling the display the Graphic Image must be
displayed on the screen visible to the user in a manner comparable to that in the 
Original Code. The Attribution Phrase must be displayed as a "tooltip" or "hover-text" for
that image. The image must be linked to the Attribution URL so as to access that page
when clicked. If the user interface includes a prominent "about" display which includes
factual prominent attribution in a form similar to that in the "about" display included
with the Original Code, including Socialtext copyright notices and URLs, then the image
need not be linked to the Attribution URL but the "tool-tip" is still required.

Attribution Copyright Notice:

 Copyright (C) 2010 Socialtext, Inc.
 All Rights Reserved.

Attribution Phrase (not exceeding 10 words): SocialCalc

Attribution URL: http://www.socialcalc.org/

Graphic Image: The contents of the sc-logo.gif file in the Original Code or
a suitable replacement from http://www.socialcalc.org/licenses specified as
being for SocialCalc.

Display of Attribution Information is required in Larger Works which are defined 
in the CPAL as a work which combines Covered Code or portions thereof with code 
not governed by the terms of the CPAL.

*/

  //
  // Some of the other files in the SocialCalc package are licensed under
  // different licenses. Please note the licenses of the modules you use.
  //
  // Code History:
  //
  // Initially coded by Dan Bricklin of Software Garden, Inc., for Socialtext, Inc.
  // Unless otherwise specified, referring to "SocialCalc" in comments refers to this
  // JavaScript version of the code, not the SocialCalc Perl code.
  //

  /*

See the comments in the main SocialCalc code module file of the SocialCalc package.

*/

  var SocialCalc;
  if (!SocialCalc) {
    alert("Main SocialCalc code module needed");
    SocialCalc = {};
  }
  if (!SocialCalc.TableEditor) {
    alert("SocialCalc TableEditor code module needed");
  }

  // *************************************
  //
  // SpreadsheetControl class:
  //
  // *************************************

  // Global constants:

  SocialCalc.CurrentSpreadsheetControlObject = null; // right now there can only be one active at a time

  // Constructor:

  SocialCalc.SpreadsheetControl = function () {
    var scc = SocialCalc.Constants;

    // Properties:

    this.parentNode = null;
    this.spreadsheetDiv = null;
    this.requestedHeight = 0;
    this.requestedWidth = 0;
    this.requestedSpaceBelow = 0;
    this.height = 0;
    this.width = 0;
    this.viewheight = 0; // calculated amount for views below toolbar, etc.

    // Tab definitions: An array where each tab is an object of the form:
    //
    //    name: "name",
    //    text: "text-on-tab",
    //    html: "html-to-create div",
    //       replacements:
    //         "%s.": "SocialCalc", "%id.": spreadsheet.idPrefix, "%tbt.": spreadsheet.toolbartext
    //         Other replacements from spreadsheet.tabreplacements:
    //            replacementname: {regex: regular-expression-to-match-with-g, replacement: string}
    //    view: "viewname", // view to show when selected; "sheet" or missing/null is spreadsheet
    //    oncreate: function(spreadsheet, tab-name), // called when first created to initialize
    //    onclick: function(spreadsheet, tab-name), missing/null is sheet default
    //    onclickFocus: text, // spreadsheet.idPrefix+text is given the focus if present instead of normal KeyboardFocus
    //       or if text isn't a string, that value (e.g., true) is used for SocialCalc.CmdGotFocus
    //    onunclick: function(spreadsheet, tab-name), missing/null is sheet default

    this.tabs = [];
    this.tabnums = {}; // when adding tabs, add tab-name: array-index to this object
    this.tabreplacements = {}; // see use above
    this.currentTab = -1; // currently selected tab index in this.tabs or -1 (maintained by SocialCalc.SetTab)

    // View definitions: An object where each view is an object of the form:
    //
    //    name: "name", // localized when first set using SocialCalc.LocalizeString
    //    element: node-in-the-dom, // filled in when initialized
    //    replacements: {}, // see below
    //    html: "html-to-create div",
    //       replacements:
    //         "%s.": "SocialCalc", "%id.": spreadsheet.idPrefix, "%tbt.": spreadsheet.toolbartext, "%img.": spreadsheet.imagePrefix,
    //         SocialCalc.LocalizeSubstring replacements ("%loc!string!" and "%ssc!constant-name!")
    //         Other replacements from viewobject.replacements:
    //            replacementname: {regex: regular-expression-to-match-with-g, replacement: string}
    //    divStyle: attributes for sheet div (SocialCalc.setStyles format)
    //    oncreate: function(spreadsheet, viewobject), // called when first created to initialize
    //    needsresize: true/false/null, // if true, do resize calc after displaying
    //    onresize: function(spreadsheet, viewobject), // called if needs resize
    //    values: {} // optional values to share with onclick handlers, etc.
    //
    // There is always a "sheet" view.

    this.views = {}; // {viewname: view-object, ...}

    // Dynamic properties:

    this.sheet = null;
    this.context = null;
    this.editor = null;

    this.spreadsheetDiv = null;
    this.editorDiv = null;

    this.sortrange = ""; // remembered range for sort tab

    this.moverange = ""; // remembered range from movefrom used by movepaste/moveinsert

    // Constants:

    this.idPrefix = "SocialCalc-"; // prefix added to element ids used here, should end in "-"
    this.multipartBoundary = "SocialCalcSpreadsheetControlSave"; // boundary used by SpreadsheetControlCreateSpreadsheetSave
    this.imagePrefix = scc.defaultImagePrefix; // prefix added to img src

    this.toolbarbackground = scc.SCToolbarbackground;
    this.tabbackground = scc.SCTabbackground; // "background-color:#CCC;";
    this.tabselectedCSS = scc.SCTabselectedCSS;
    this.tabplainCSS = scc.SCTabplainCSS;
    this.toolbartext = scc.SCToolbartext;

    this.formulabarheight = scc.SCFormulabarheight; // in pixels, will contain a text input box

    if (scc.doWorkBook) {
      this.sheetbarheight = scc.SCSheetBarHeight;
      this.sheetbarCSS = scc.SCSheetBarCSS;
    } else {
      this.sheetbarheight = 0;
    }

    this.statuslineheight = scc.SCStatuslineheight; // in pixels
    this.statuslineCSS = scc.SCStatuslineCSS;

    // Callbacks:

    this.ExportCallback = null; // a function called for Clipboard Export button: this.ExportCallback(spreadsheet_control_object)

    // Initialization Code:

    this.sheet = new SocialCalc.Sheet();
    this.context = new SocialCalc.RenderContext(this.sheet);
    this.context.showGrid = true;
    this.context.showRCHeaders = true;
    this.editor = new SocialCalc.TableEditor(this.context);
    this.editor.StatusCallback.statusline = {
      func: SocialCalc.SpreadsheetControlStatuslineCallback,
      params: {
        statuslineid: this.idPrefix + "statusline",
        recalcid1: this.idPrefix + "divider_recalc",
        recalcid2: this.idPrefix + "button_recalc",
      },
    };

    SocialCalc.CurrentSpreadsheetControlObject = this; // remember this for rendezvousing on events

    this.editor.MoveECellCallback.movefrom = function (editor) {
      var cr;
      var spreadsheet = SocialCalc.GetSpreadsheetControlObject();
      spreadsheet.context.cursorsuffix = "";
      if (editor.range2.hasrange && !editor.cellhandles.noCursorSuffix) {
        if (
          editor.ecell.row == editor.range2.top &&
          (editor.ecell.col < editor.range2.left ||
            editor.ecell.col > editor.range2.right + 1)
        ) {
          spreadsheet.context.cursorsuffix = "insertleft";
        }
        if (
          editor.ecell.col == editor.range2.left &&
          (editor.ecell.row < editor.range2.top ||
            editor.ecell.row > editor.range2.bottom + 1)
        ) {
          spreadsheet.context.cursorsuffix = "insertup";
        }
      }
    };

    // formula bar buttons

    this.formulabuttons = {
      formulafunctions: {
        image: "formuladialog.gif",
        tooltip: "Functions", // tooltips are localized when set below
        command: SocialCalc.SpreadsheetControl.DoFunctionList,
      },
      multilineinput: {
        image: "multilinedialog.gif",
        tooltip: "Multi-line Input Box",
        command: SocialCalc.SpreadsheetControl.DoMultiline,
      },
      link: {
        image: "linkdialog.gif",
        tooltip: "Link Input Box",
        command: SocialCalc.SpreadsheetControl.DoLink,
      },
      sum: {
        image: "sumdialog.gif",
        tooltip: "Auto Sum",
        command: SocialCalc.SpreadsheetControl.DoSum,
      },
      /*   image: {image: "sumdialog.gif", tooltip: "Insert",
                   command: SocialCalc.Images.Insert }*/
    };

    // Default tabs:

    // Edit

    this.tabnums.edit = this.tabs.length;
    this.tabs.push({
      name: "edit",
      text: "Edit",
      html:
        ' <div id="%id.edittools" style="padding:10px 0px 0px 0px;">' +
        '&nbsp;<img id="%id.button_undo" src="%img.undo.gif" style="vertical-align:bottom;">' +
        ' <img id="%id.button_redo" src="%img.redo.gif" style="vertical-align:bottom;">' +
        ' &nbsp;<img src="%img.divider1.gif" style="vertical-align:bottom;">&nbsp; ' +
        '<img id="%id.button_copy" src="%img.copy.gif" style="vertical-align:bottom;">' +
        ' <img id="%id.button_cut" src="%img.cut.gif" style="vertical-align:bottom;">' +
        ' <img id="%id.button_paste" src="%img.paste.gif" style="vertical-align:bottom;">' +
        ' &nbsp;<img src="%img.divider1.gif" style="vertical-align:bottom;">&nbsp; ' +
        '<img id="%id.button_delete" src="%img.delete.gif" style="vertical-align:bottom;">' +
        ' <img id="%id.button_pasteformats" src="%img.pasteformats.gif" style="vertical-align:bottom;">' +
        ' &nbsp;<img src="%img.divider1.gif" style="vertical-align:bottom;">&nbsp; ' +
        '<img id="%id.button_filldown" src="%img.filldown.gif" style="vertical-align:bottom;">' +
        ' <img id="%id.button_fillright" src="%img.fillright.gif" style="vertical-align:bottom;">' +
        ' &nbsp;<img src="%img.divider1.gif" style="vertical-align:bottom;">&nbsp; ' +
        '<img id="%id.button_movefrom" src="%img.movefromoff.gif" style="vertical-align:bottom;">' +
        ' <img id="%id.button_movepaste" src="%img.movepasteoff.gif" style="vertical-align:bottom;">' +
        ' <img id="%id.button_moveinsert" src="%img.moveinsertoff.gif" style="vertical-align:bottom;">' +
        ' &nbsp;<img src="%img.divider1.gif" style="vertical-align:bottom;">&nbsp; ' +
        '<img id="%id.button_alignleft" src="%img.alignleft.gif" style="vertical-align:bottom;">' +
        ' <img id="%id.button_aligncenter" src="%img.aligncenter.gif" style="vertical-align:bottom;">' +
        ' <img id="%id.button_alignright" src="%img.alignright.gif" style="vertical-align:bottom;">' +
        ' &nbsp;<img src="%img.divider1.gif" style="vertical-align:bottom;">&nbsp; ' +
        '<img id="%id.button_borderon" src="%img.borderson.gif" style="vertical-align:bottom;"> ' +
        ' <img id="%id.button_borderoff" src="%img.bordersoff.gif" style="vertical-align:bottom;"> ' +
        ' <img id="%id.button_swapcolors" src="%img.swapcolors.gif" style="vertical-align:bottom;"> ' +
        ' &nbsp;<img src="%img.divider1.gif" style="vertical-align:bottom;">&nbsp; ' +
        '<img id="%id.button_merge" src="%img.merge.gif" style="vertical-align:bottom;"> ' +
        ' <img id="%id.button_unmerge" src="%img.unmerge.gif" style="vertical-align:bottom;"> ' +
        ' &nbsp;<img src="%img.divider1.gif" style="vertical-align:bottom;">&nbsp; ' +
        '<img id="%id.button_insertrow" src="%img.insertrow.gif" style="vertical-align:bottom;"> ' +
        ' <img id="%id.button_insertcol" src="%img.insertcol.gif" style="vertical-align:bottom;"> ' +
        '&nbsp; <img id="%id.button_deleterow" src="%img.deleterow.gif" style="vertical-align:bottom;"> ' +
        ' <img id="%id.button_deletecol" src="%img.deletecol.gif" style="vertical-align:bottom;"> ' +
        ' &nbsp;<img id="%id.divider_recalc" src="%img.divider1.gif" style="vertical-align:bottom;">&nbsp; ' +
        '<img id="%id.button_recalc" src="%img.recalc.gif" style="vertical-align:bottom;"> ' +
        " </div>",
      oncreate: null, //function(spreadsheet, viewobject) {SocialCalc.DoCmd(null, "fill-rowcolstuff");},
      onclick: null,
    });

    // Settings (Format)

    this.tabnums.settings = this.tabs.length;
    this.tabs.push({
      name: "settings",
      text: "Format",
      html:
        '<div id="%id.settingstools" style="display:none;">' +
        ' <div id="%id.sheetsettingstoolbar" style="display:none;">' +
        '  <table cellspacing="0" cellpadding="0"><tr><td>' +
        '   <div style="%tbt.">%loc!SHEET SETTINGS!:</div>' +
        "   </td></tr><tr><td>" +
        '   <input id="%id.settings-savesheet" type="button" value="%loc!Save!" onclick="SocialCalc.SettingsControlSave(\'sheet\');">' +
        '   <input type="button" value="%loc!Cancel!" onclick="SocialCalc.SettingsControlSave(\'cancel\');">' +
        '   <input type="button" value="%loc!Show Cell Settings!" onclick="SocialCalc.SpreadsheetControlSettingsSwitch(\'cell\');return false;">' +
        "   </td></tr></table>" +
        " </div>" +
        ' <div id="%id.cellsettingstoolbar" style="display:none;">' +
        '  <table cellspacing="0" cellpadding="0"><tr><td>' +
        '   <div style="%tbt.">%loc!CELL SETTINGS!: <span id="%id.settingsecell">&nbsp;</span></div>' +
        "   </td></tr><tr><td>" +
        '  <input id="%id.settings-savecell" type="button" value="%loc!Save!" onclick="SocialCalc.SettingsControlSave(\'cell\');">' +
        '  <input type="button" value="%loc!Cancel!" onclick="SocialCalc.SettingsControlSave(\'cancel\');">' +
        '  <input type="button" value="%loc!Show Sheet Settings!" onclick="SocialCalc.SpreadsheetControlSettingsSwitch(\'sheet\');return false;">' +
        "  </td></tr></table>" +
        " </div>" +
        "</div>",
      view: "settings",
      onclick: function (s, t) {
        SocialCalc.SettingsControls.idPrefix = s.idPrefix; // used to get color chooser div
        SocialCalc.SettingControlReset();
        var sheetattribs = s.sheet.EncodeSheetAttributes();
        var cellattribs = s.sheet.EncodeCellAttributes(s.editor.ecell.coord);
        SocialCalc.SettingsControlLoadPanel(
          s.views.settings.values.sheetspanel,
          sheetattribs
        );
        SocialCalc.SettingsControlLoadPanel(
          s.views.settings.values.cellspanel,
          cellattribs
        );
        document.getElementById(s.idPrefix + "settingsecell").innerHTML =
          s.editor.ecell.coord;
        SocialCalc.SpreadsheetControlSettingsSwitch("cell");
        s.views.settings.element.style.height = s.viewheight + "px";
        s.views.settings.element.firstChild.style.height = s.viewheight + "px";

        var range; // set save message
        if (s.editor.range.hasrange) {
          range =
            SocialCalc.crToCoord(s.editor.range.left, s.editor.range.top) +
            ":" +
            SocialCalc.crToCoord(s.editor.range.right, s.editor.range.bottom);
        } else {
          range = s.editor.ecell.coord;
        }
        document.getElementById(s.idPrefix + "settings-savecell").value =
          SocialCalc.LocalizeString("Save to") + ": " + range;
      },
      onclickFocus: true,
    });

    this.views["settings"] = {
      name: "settings",
      values: {},
      oncreate: function (s, viewobj) {
        var scc = SocialCalc.Constants;

        viewobj.values.sheetspanel = {
          //            name: "sheet",
          colorchooser: { id: s.idPrefix + "scolorchooser" },
          formatnumber: {
            setting: "numberformat",
            type: "PopupList",
            id: s.idPrefix + "formatnumber",
            initialdata: scc.SCFormatNumberFormats,
          },
          formattext: {
            setting: "textformat",
            type: "PopupList",
            id: s.idPrefix + "formattext",
            initialdata: scc.SCFormatTextFormats,
          },
          fontfamily: {
            setting: "fontfamily",
            type: "PopupList",
            id: s.idPrefix + "fontfamily",
            initialdata: scc.SCFormatFontfamilies,
          },
          fontlook: {
            setting: "fontlook",
            type: "PopupList",
            id: s.idPrefix + "fontlook",
            initialdata: scc.SCFormatFontlook,
          },
          fontsize: {
            setting: "fontsize",
            type: "PopupList",
            id: s.idPrefix + "fontsize",
            initialdata: scc.SCFormatFontsizes,
          },
          textalignhoriz: {
            setting: "textalignhoriz",
            type: "PopupList",
            id: s.idPrefix + "textalignhoriz",
            initialdata: scc.SCFormatTextAlignhoriz,
          },
          numberalignhoriz: {
            setting: "numberalignhoriz",
            type: "PopupList",
            id: s.idPrefix + "numberalignhoriz",
            initialdata: scc.SCFormatNumberAlignhoriz,
          },
          alignvert: {
            setting: "alignvert",
            type: "PopupList",
            id: s.idPrefix + "alignvert",
            initialdata: scc.SCFormatAlignVertical,
          },
          textcolor: {
            setting: "textcolor",
            type: "ColorChooser",
            id: s.idPrefix + "textcolor",
          },
          bgcolor: {
            setting: "bgcolor",
            type: "ColorChooser",
            id: s.idPrefix + "bgcolor",
          },
          padtop: {
            setting: "padtop",
            type: "PopupList",
            id: s.idPrefix + "padtop",
            initialdata: scc.SCFormatPadsizes,
          },
          padright: {
            setting: "padright",
            type: "PopupList",
            id: s.idPrefix + "padright",
            initialdata: scc.SCFormatPadsizes,
          },
          padbottom: {
            setting: "padbottom",
            type: "PopupList",
            id: s.idPrefix + "padbottom",
            initialdata: scc.SCFormatPadsizes,
          },
          padleft: {
            setting: "padleft",
            type: "PopupList",
            id: s.idPrefix + "padleft",
            initialdata: scc.SCFormatPadsizes,
          },
          colwidth: {
            setting: "colwidth",
            type: "PopupList",
            id: s.idPrefix + "colwidth",
            initialdata: scc.SCFormatColwidth,
          },
          recalc: {
            setting: "recalc",
            type: "PopupList",
            id: s.idPrefix + "recalc",
            initialdata: scc.SCFormatRecalc,
          },
        };
        viewobj.values.cellspanel = {
          name: "cell",
          colorchooser: { id: s.idPrefix + "scolorchooser" },
          cformatnumber: {
            setting: "numberformat",
            type: "PopupList",
            id: s.idPrefix + "cformatnumber",
            initialdata: scc.SCFormatNumberFormats,
          },
          cformattext: {
            setting: "textformat",
            type: "PopupList",
            id: s.idPrefix + "cformattext",
            initialdata: scc.SCFormatTextFormats,
          },
          cfontfamily: {
            setting: "fontfamily",
            type: "PopupList",
            id: s.idPrefix + "cfontfamily",
            initialdata: scc.SCFormatFontfamilies,
          },
          cfontlook: {
            setting: "fontlook",
            type: "PopupList",
            id: s.idPrefix + "cfontlook",
            initialdata: scc.SCFormatFontlook,
          },
          cfontsize: {
            setting: "fontsize",
            type: "PopupList",
            id: s.idPrefix + "cfontsize",
            initialdata: scc.SCFormatFontsizes,
          },
          calignhoriz: {
            setting: "alignhoriz",
            type: "PopupList",
            id: s.idPrefix + "calignhoriz",
            initialdata: scc.SCFormatTextAlignhoriz,
          },
          calignvert: {
            setting: "alignvert",
            type: "PopupList",
            id: s.idPrefix + "calignvert",
            initialdata: scc.SCFormatAlignVertical,
          },
          ctextcolor: {
            setting: "textcolor",
            type: "ColorChooser",
            id: s.idPrefix + "ctextcolor",
          },
          cbgcolor: {
            setting: "bgcolor",
            type: "ColorChooser",
            id: s.idPrefix + "cbgcolor",
          },
          cbt: { setting: "bt", type: "BorderSide", id: s.idPrefix + "cbt" },
          cbr: { setting: "br", type: "BorderSide", id: s.idPrefix + "cbr" },
          cbb: { setting: "bb", type: "BorderSide", id: s.idPrefix + "cbb" },
          cbl: { setting: "bl", type: "BorderSide", id: s.idPrefix + "cbl" },
          cpadtop: {
            setting: "padtop",
            type: "PopupList",
            id: s.idPrefix + "cpadtop",
            initialdata: scc.SCFormatPadsizes,
          },
          cpadright: {
            setting: "padright",
            type: "PopupList",
            id: s.idPrefix + "cpadright",
            initialdata: scc.SCFormatPadsizes,
          },
          cpadbottom: {
            setting: "padbottom",
            type: "PopupList",
            id: s.idPrefix + "cpadbottom",
            initialdata: scc.SCFormatPadsizes,
          },
          cpadleft: {
            setting: "padleft",
            type: "PopupList",
            id: s.idPrefix + "cpadleft",
            initialdata: scc.SCFormatPadsizes,
          },
        };

        SocialCalc.SettingsControlInitializePanel(viewobj.values.sheetspanel);
        SocialCalc.SettingsControlInitializePanel(viewobj.values.cellspanel);
      },
      replacements: {
        itemtitle: {
          regex: /\%itemtitle\./g,
          replacement:
            'style="padding:12px 10px 0px 10px;font-weight:bold;text-align:right;vertical-align:top;font-size:small;"',
        },
        sectiontitle: {
          regex: /\%sectiontitle\./g,
          replacement:
            'style="padding:16px 10px 0px 0px;font-weight:bold;vertical-align:top;font-size:small;color:#C00;"',
        },
        parttitle: {
          regex: /\%parttitle\./g,
          replacement:
            'style="font-weight:bold;font-size:x-small;padding:0px 0px 3px 0px;"',
        },
        itembody: {
          regex: /\%itembody\./g,
          replacement:
            'style="padding:12px 0px 0px 0px;vertical-align:top;font-size:small;"',
        },
        bodypart: {
          regex: /\%bodypart\./g,
          replacement:
            'style="padding:0px 10px 0px 0px;font-size:small;vertical-align:top;"',
        },
      },
      divStyle: "border:1px solid black;overflow:auto;",
      html:
        '<div id="%id.scolorchooser" style="display:none;position:absolute;z-index:20;"></div>' +
        '<table cellspacing="0" cellpadding="0">' +
        ' <tr><td style="vertical-align:top;">' +
        '<table id="%id.sheetsettingstable" style="display:none;" cellspacing="0" cellpadding="0">' +
        "<tr>" +
        " <td %itemtitle.><br>%loc!Default Format!:</td>" +
        " <td %itembody.>" +
        '   <table cellspacing="0" cellpadding="0"><tr>' +
        "    <td %bodypart.>" +
        "     <div %parttitle.>%loc!Number!</div>" +
        '     <span id="%id.formatnumber"></span>' +
        "    </td>" +
        "    <td %bodypart.>" +
        "     <div %parttitle.>%loc!Text!</div>" +
        '     <span id="%id.formattext"></span>' +
        "    </td>" +
        "   </tr></table>" +
        " </td>" +
        "</tr>" +
        "<tr>" +
        " <td %itemtitle.><br>%loc!Default Alignment!:</td>" +
        " <td %itembody.>" +
        '   <table cellspacing="0" cellpadding="0"><tr>' +
        "    <td %bodypart.>" +
        "     <div %parttitle.>%loc!Text Horizontal!</div>" +
        '     <span id="%id.textalignhoriz"></span>' +
        "    </td>" +
        "    <td %bodypart.>" +
        "     <div %parttitle.>%loc!Number Horizontal!</div>" +
        '     <span id="%id.numberalignhoriz"></span>' +
        "    </td>" +
        "    <td %bodypart.>" +
        "     <div %parttitle.>%loc!Vertical!</div>" +
        '     <span id="%id.alignvert"></span>' +
        "    </td>" +
        "   </tr></table>" +
        " </td>" +
        "</tr>" +
        "<tr>" +
        " <td %itemtitle.><br>%loc!Default Font!:</td>" +
        " <td %itembody.>" +
        '   <table cellspacing="0" cellpadding="0"><tr>' +
        "    <td %bodypart.>" +
        "     <div %parttitle.>%loc!Family!</div>" +
        '     <span id="%id.fontfamily"></span>' +
        "    </td>" +
        "    <td %bodypart.>" +
        "     <div %parttitle.>%loc!Bold &amp; Italics!</div>" +
        '     <span id="%id.fontlook"></span>' +
        "    </td>" +
        "    <td %bodypart.>" +
        "     <div %parttitle.>%loc!Size!</div>" +
        '     <span id="%id.fontsize"></span>' +
        "    </td>" +
        "    <td %bodypart.>" +
        "     <div %parttitle.>%loc!Color!</div>" +
        '     <div id="%id.textcolor"></div>' +
        "    </td>" +
        "    <td %bodypart.>" +
        "     <div %parttitle.>%loc!Background!</div>" +
        '     <div id="%id.bgcolor"></div>' +
        "    </td>" +
        "   </tr></table>" +
        " </td>" +
        "</tr>" +
        "<tr>" +
        " <td %itemtitle.><br>%loc!Default Padding!:</td>" +
        " <td %itembody.>" +
        '   <table cellspacing="0" cellpadding="0"><tr>' +
        "    <td %bodypart.>" +
        "     <div %parttitle.>%loc!Top!</div>" +
        '     <span id="%id.padtop"></span>' +
        "    </td>" +
        "    <td %bodypart.>" +
        "     <div %parttitle.>%loc!Right!</div>" +
        '     <span id="%id.padright"></span>' +
        "    </td>" +
        "    <td %bodypart.>" +
        "     <div %parttitle.>%loc!Bottom!</div>" +
        '     <span id="%id.padbottom"></span>' +
        "    </td>" +
        "    <td %bodypart.>" +
        "     <div %parttitle.>%loc!Left!</div>" +
        '     <span id="%id.padleft"></span>' +
        "    </td>" +
        "   </tr></table>" +
        " </td>" +
        "</tr>" +
        "<tr>" +
        " <td %itemtitle.><br>%loc!Default Column Width!:</td>" +
        " <td %itembody.>" +
        '   <table cellspacing="0" cellpadding="0"><tr>' +
        "    <td %bodypart.>" +
        "     <div %parttitle.>&nbsp;</div>" +
        '     <span id="%id.colwidth"></span>' +
        "    </td>" +
        "   </tr></table>" +
        " </td>" +
        "</tr>" +
        "<tr>" +
        " <td %itemtitle.><br>%loc!Recalculation!:</td>" +
        " <td %itembody.>" +
        '   <table cellspacing="0" cellpadding="0"><tr>' +
        "    <td %bodypart.>" +
        "     <div %parttitle.>&nbsp;</div>" +
        '     <span id="%id.recalc"></span>' +
        "    </td>" +
        "   </tr></table>" +
        " </td>" +
        "</tr>" +
        "</table>" +
        '<table id="%id.cellsettingstable" cellspacing="0" cellpadding="0">' +
        "<tr>" +
        " <td %itemtitle.><br>%loc!Format!:</td>" +
        " <td %itembody.>" +
        '   <table cellspacing="0" cellpadding="0"><tr>' +
        "    <td %bodypart.>" +
        "     <div %parttitle.>%loc!Number!</div>" +
        '     <span id="%id.cformatnumber"></span>' +
        "    </td>" +
        "    <td %bodypart.>" +
        "     <div %parttitle.>%loc!Text!</div>" +
        '     <span id="%id.cformattext"></span>' +
        "    </td>" +
        "   </tr></table>" +
        " </td>" +
        "</tr>" +
        "<tr>" +
        " <td %itemtitle.><br>%loc!Alignment!:</td>" +
        " <td %itembody.>" +
        '   <table cellspacing="0" cellpadding="0"><tr>' +
        "    <td %bodypart.>" +
        "     <div %parttitle.>%loc!Horizontal!</div>" +
        '     <span id="%id.calignhoriz"></span>' +
        "    </td>" +
        "    <td %bodypart.>" +
        "     <div %parttitle.>%loc!Vertical!</div>" +
        '     <span id="%id.calignvert"></span>' +
        "    </td>" +
        "   </tr></table>" +
        " </td>" +
        "</tr>" +
        "<tr>" +
        " <td %itemtitle.><br>%loc!Font!:</td>" +
        " <td %itembody.>" +
        '   <table cellspacing="0" cellpadding="0"><tr>' +
        "    <td %bodypart.>" +
        "     <div %parttitle.>%loc!Family!</div>" +
        '     <span id="%id.cfontfamily"></span>' +
        "    </td>" +
        "    <td %bodypart.>" +
        "     <div %parttitle.>%loc!Bold &amp; Italics!</div>" +
        '     <span id="%id.cfontlook"></span>' +
        "    </td>" +
        "    <td %bodypart.>" +
        "     <div %parttitle.>%loc!Size!</div>" +
        '     <span id="%id.cfontsize"></span>' +
        "    </td>" +
        "    <td %bodypart.>" +
        "     <div %parttitle.>%loc!Color!</div>" +
        '     <div id="%id.ctextcolor"></div>' +
        "    </td>" +
        "    <td %bodypart.>" +
        "     <div %parttitle.>%loc!Background!</div>" +
        '     <div id="%id.cbgcolor"></div>' +
        "    </td>" +
        "   </tr></table>" +
        " </td>" +
        "</tr>" +
        "<tr>" +
        " <td %itemtitle.><br>%loc!Borders!:</td>" +
        " <td %itembody.>" +
        '   <table cellspacing="0" cellpadding="0">' +
        '    <tr><td %bodypart. colspan="3"><div %parttitle.>%loc!Top Border!</div></td>' +
        '     <td %bodypart. colspan="3"><div %parttitle.>%loc!Right Border!</div></td>' +
        '     <td %bodypart. colspan="3"><div %parttitle.>%loc!Bottom Border!</div></td>' +
        '     <td %bodypart. colspan="3"><div %parttitle.>%loc!Left Border!</div></td>' +
        "    </tr><tr>" +
        "    <td %bodypart.>" +
        '     <input id="%id.cbt-onoff-bcb" onclick="SocialCalc.SettingsControlOnchangeBorder(this);" type="checkbox">' +
        "    </td>" +
        "    <td %bodypart.>" +
        '     <div id="%id.cbt-color"></div>' +
        "    </td>" +
        "    <td>&nbsp;&nbsp;&nbsp;&nbsp;</td>" +
        "    <td %bodypart.>" +
        '     <input id="%id.cbr-onoff-bcb" onclick="SocialCalc.SettingsControlOnchangeBorder(this);" type="checkbox">' +
        "    </td>" +
        "    <td %bodypart.>" +
        '     <div id="%id.cbr-color"></div>' +
        "    </td>" +
        "    <td>&nbsp;&nbsp;&nbsp;&nbsp;</td>" +
        "    <td %bodypart.>" +
        '     <input id="%id.cbb-onoff-bcb" onclick="SocialCalc.SettingsControlOnchangeBorder(this);" type="checkbox">' +
        "    </td>" +
        "    <td %bodypart.>" +
        '     <div id="%id.cbb-color"></div>' +
        "    </td>" +
        "    <td>&nbsp;&nbsp;&nbsp;&nbsp;</td>" +
        "    <td %bodypart.>" +
        '     <input id="%id.cbl-onoff-bcb" onclick="SocialCalc.SettingsControlOnchangeBorder(this);" type="checkbox">' +
        "    </td>" +
        "    <td %bodypart.>" +
        '     <div id="%id.cbl-color"></div>' +
        "    </td>" +
        "    <td>&nbsp;&nbsp;&nbsp;&nbsp;</td>" +
        "   </tr></table>" +
        " </td>" +
        "</tr>" +
        "<tr>" +
        " <td %itemtitle.><br>%loc!Padding!:</td>" +
        " <td %itembody.>" +
        '   <table cellspacing="0" cellpadding="0"><tr>' +
        "    <td %bodypart.>" +
        "     <div %parttitle.>%loc!Top!</div>" +
        '     <span id="%id.cpadtop"></span>' +
        "    </td>" +
        "    <td %bodypart.>" +
        "     <div %parttitle.>%loc!Right!</div>" +
        '     <span id="%id.cpadright"></span>' +
        "    </td>" +
        "    <td %bodypart.>" +
        "     <div %parttitle.>%loc!Bottom!</div>" +
        '     <span id="%id.cpadbottom"></span>' +
        "    </td>" +
        "    <td %bodypart.>" +
        "     <div %parttitle.>%loc!Left!</div>" +
        '     <span id="%id.cpadleft"></span>' +
        "    </td>" +
        "   </tr></table>" +
        " </td>" +
        "</tr>" +
        "</table>" +
        ' </td><td style="vertical-align:top;padding:12px 0px 0px 12px;">' +
        '  <div style="width:100px;height:100px;overflow:hidden;border:1px solid black;background-color:#EEE;padding:6px;">' +
        '   <table cellspacing="0" cellpadding="0"><tr>' +
        '    <td id="sample-text" style="height:100px;width:100px;"><div>%loc!This is a<br>sample!</div><div>-1234.5</div></td>' +
        "   </tr></table>" +
        "  </div>" +
        " </td></tr></table>" +
        "<br>",
    };

    // Sort

    this.tabnums.sort = this.tabs.length;
    this.tabs.push({
      name: "sort",
      text: "Sort",
      html:
        ' <div id="%id.sorttools" style="display:none;">' +
        '  <table cellspacing="0" cellpadding="0"><tr>' +
        '   <td style="vertical-align:top;padding-right:4px;width:160px;">' +
        '    <div style="%tbt.">%loc!Set Cells To Sort!</div>' +
        '    <select id="%id.sortlist" size="1" onfocus="%s.CmdGotFocus(this);"><option selected>[select range]</option></select>' +
        '    <input type="button" value="%loc!OK!" onclick="%s.DoCmd(this, \'ok-setsort\');" style="font-size:x-small;">' +
        "   </td>" +
        '   <td style="vertical-align:middle;padding-right:16px;width:100px;text-align:right;">' +
        '    <div style="%tbt.">&nbsp;</div>' +
        '    <input type="button" id="%id.sortbutton" value="%loc!Sort Cells! A1:A1" onclick="%s.DoCmd(this, \'dosort\');" style="visibility:hidden;">' +
        "   </td>" +
        '   <td style="vertical-align:top;padding-right:16px;">' +
        '    <table cellspacing="0" cellpadding="0"><tr>' +
        '     <td style="vertical-align:top;">' +
        '      <div style="%tbt.">%loc!Major Sort!</div>' +
        '      <select id="%id.majorsort" size="1" onfocus="%s.CmdGotFocus(this);"></select>' +
        "     </td><td>" +
        '      <input type="radio" name="majorsort" id="%id.majorsortup" value="up" checked><span style="font-size:x-small;color:#FFF;">%loc!Up!</span><br>' +
        '      <input type="radio" name="majorsort" id="%id.majorsortdown" value="down"><span style="font-size:x-small;color:#FFF;">%loc!Down!</span>' +
        "     </td>" +
        "    </tr></table>" +
        "   </td>" +
        '   <td style="vertical-align:top;padding-right:16px;">' +
        '    <table cellspacing="0" cellpadding="0"><tr>' +
        '     <td style="vertical-align:top;">' +
        '      <div style="%tbt.">%loc!Minor Sort!</div>' +
        '      <select id="%id.minorsort" size="1" onfocus="%s.CmdGotFocus(this);"></select>' +
        "     </td><td>" +
        '      <input type="radio" name="minorsort" id="%id.minorsortup" value="up" checked><span style="font-size:x-small;color:#FFF;">%loc!Up!</span><br>' +
        '      <input type="radio" name="minorsort" id="%id.minorsortdown" value="down"><span style="font-size:x-small;color:#FFF;">%loc!Down!</span>' +
        "     </td>" +
        "    </tr></table>" +
        "   </td>" +
        '   <td style="vertical-align:top;padding-right:16px;">' +
        '    <table cellspacing="0" cellpadding="0"><tr>' +
        '     <td style="vertical-align:top;">' +
        '      <div style="%tbt.">%loc!Last Sort!</div>' +
        '      <select id="%id.lastsort" size="1" onfocus="%s.CmdGotFocus(this);"></select>' +
        "     </td><td>" +
        '      <input type="radio" name="lastsort" id="%id.lastsortup" value="up" checked><span style="font-size:x-small;color:#FFF;">%loc!Up!</span><br>' +
        '      <input type="radio" name="lastsort" id="%id.lastsortdown" value="down"><span style="font-size:x-small;color:#FFF;">%loc!Down!</span>' +
        "     </td>" +
        "    </tr></table>" +
        "   </td>" +
        "  </tr></table>" +
        " </div>",
      onclick: SocialCalc.SpreadsheetControlSortOnclick,
    });
    this.editor.SettingsCallbacks.sort = {
      save: SocialCalc.SpreadsheetControlSortSave,
      load: SocialCalc.SpreadsheetControlSortLoad,
    };

    // Audit

    this.tabnums.audit = this.tabs.length;
    this.tabs.push({
      name: "audit",
      text: "Audit",
      html:
        '<div id="%id.audittools" style="display:none;">' +
        ' <div style="%tbt.">&nbsp;</div>' +
        "</div>",
      view: "audit",
      onclick: function (s, t) {
        var SCLoc = SocialCalc.LocalizeString;
        var i, j;
        var str =
          '<table cellspacing="0" cellpadding="0" style="margin-bottom:10px;"><tr><td style="font-size:small;padding:6px;"><b>' +
          SCLoc("Audit Trail This Session") +
          ":</b><br><br>";
        var stack = s.sheet.changes.stack;
        var tos = s.sheet.changes.tos;
        for (i = 0; i < stack.length; i++) {
          if (i == tos + 1)
            str +=
              '<br></td></tr><tr><td style="font-size:small;background-color:#EEE;padding:6px;">' +
              SCLoc("UNDONE STEPS") +
              ":<br>";
          for (j = 0; j < stack[i].command.length; j++) {
            str += SocialCalc.special_chars(stack[i].command[j]) + "<br>";
          }
        }
        s.views.audit.element.innerHTML = str + "</td></tr></table>";
        SocialCalc.CmdGotFocus(true);
      },
      onclickFocus: true,
    });

    this.views["audit"] = {
      name: "audit",
      divStyle: "border:1px solid black;overflow:auto;",
      html: "Audit Trail",
    };

    // Comment

    this.tabnums.comment = this.tabs.length;
    this.tabs.push({
      name: "comment",
      text: "Comment",
      html:
        '<div id="%id.commenttools" style="display:none;">' +
        '<table cellspacing="0" cellpadding="0"><tr><td>' +
        '<textarea id="%id.commenttext" style="font-size:small;height:32px;width:600px;overflow:auto;" onfocus="%s.CmdGotFocus(this);"></textarea>' +
        '</td><td style="vertical-align:top;">' +
        '&nbsp;<input type="button" value="%loc!Save!" onclick="%s.SpreadsheetControlCommentSet();" style="font-size:x-small;">' +
        "</td></tr></table>" +
        "</div>",
      view: "sheet",
      onclick: SocialCalc.SpreadsheetControlCommentOnclick,
      onunclick: SocialCalc.SpreadsheetControlCommentOnunclick,
    });

    // Names

    this.tabnums.names = this.tabs.length;
    this.tabs.push({
      name: "names",
      text: "Names",
      html:
        '<div id="%id.namestools" style="display:none;">' +
        '  <table cellspacing="0" cellpadding="0"><tr>' +
        '   <td style="vertical-align:top;padding-right:24px;">' +
        '    <div style="%tbt.">%loc!Existing Names!</div>' +
        '    <select id="%id.nameslist" size="1" onchange="%s.SpreadsheetControlNamesChangedName();" onfocus="%s.CmdGotFocus(this);"><option selected>[New]</option></select>' +
        "   </td>" +
        '   <td style="vertical-align:top;padding-right:6px;">' +
        '    <div style="%tbt.">%loc!Name!</div>' +
        '    <input type="text" id="%id.namesname" style="font-size:x-small;width:75px;" onfocus="%s.CmdGotFocus(this);">' +
        "   </td>" +
        '   <td style="vertical-align:top;padding-right:6px;">' +
        '    <div style="%tbt.">%loc!Description!</div>' +
        '    <input type="text" id="%id.namesdesc" style="font-size:x-small;width:150px;" onfocus="%s.CmdGotFocus(this);">' +
        "   </td>" +
        '   <td style="vertical-align:top;padding-right:6px;">' +
        '    <div style="%tbt.">%loc!Value!</div>' +
        '    <input type="text" id="%id.namesvalue" width="16" style="font-size:x-small;width:100px;" onfocus="%s.CmdGotFocus(this);">' +
        "   </td>" +
        '   <td style="vertical-align:top;padding-right:12px;width:100px;">' +
        '    <div style="%tbt.">%loc!Set Value To!</div>' +
        '    <input type="button" id="%id.namesrangeproposal" value="A1" onclick="%s.SpreadsheetControlNamesSetValue();" style="font-size:x-small;">' +
        "   </td>" +
        '   <td style="vertical-align:top;padding-right:6px;">' +
        '    <div style="%tbt.">&nbsp;</div>' +
        '    <input type="button" value="%loc!Save!" onclick="%s.SpreadsheetControlNamesSave();" style="font-size:x-small;">' +
        '    <input type="button" value="%loc!Delete!" onclick="%s.SpreadsheetControlNamesDelete()" style="font-size:x-small;">' +
        "   </td>" +
        "  </tr></table>" +
        "</div>",
      view: "sheet",
      onclick: SocialCalc.SpreadsheetControlNamesOnclick,
      onunclick: SocialCalc.SpreadsheetControlNamesOnunclick,
    });

    // Clipboard

    this.tabnums.clipboard = this.tabs.length;
    this.tabs.push({
      name: "clipboard",
      text: "Clipboard",
      html:
        '<div id="%id.clipboardtools" style="display:none;">' +
        '  <table cellspacing="0" cellpadding="0"><tr>' +
        '   <td style="vertical-align:top;padding-right:24px;">' +
        '    <div style="%tbt.">' +
        "     &nbsp;" +
        "    </div>" +
        "   </td>" +
        "  </tr></table>" +
        "</div>",
      view: "clipboard",
      onclick: SocialCalc.SpreadsheetControlClipboardOnclick,
      onclickFocus: "clipboardtext",
    });

    this.views["clipboard"] = {
      name: "clipboard",
      divStyle: "overflow:auto;",
      html:
        ' <div style="font-size:x-small;padding:5px 0px 10px 0px;">' +
        "  <b>%loc!Display Clipboard in!:</b>" +
        '  <input type="radio" id="%id.clipboardformat-tab" name="%id.clipboardformat" checked onclick="%s.SpreadsheetControlClipboardFormat(\'tab\');"> %loc!Tab-delimited format! &nbsp;' +
        '  <input type="radio" id="%id.clipboardformat-csv" name="%id.clipboardformat" onclick="%s.SpreadsheetControlClipboardFormat(\'csv\');"> %loc!CSV format! &nbsp;' +
        '  <input type="radio" id="%id.clipboardformat-scsave" name="%id.clipboardformat" onclick="%s.SpreadsheetControlClipboardFormat(\'scsave\');"> %loc!SocialCalc-save format!' +
        " </div>" +
        ' <input type="button" value="%loc!Load SocialCalc Clipboard With This!" style="font-size:x-small;" onclick="%s.SpreadsheetControlClipboardLoad();">&nbsp; ' +
        ' <input type="button" value="%loc!Clear SocialCalc Clipboard!" style="font-size:x-small;" onclick="%s.SpreadsheetControlClipboardClear();">&nbsp; ' +
        " <br>" +
        ' <textarea id="%id.clipboardtext" style="font-size:small;height:350px;width:800px;overflow:auto;" onfocus="%s.CmdGotFocus(this);"></textarea>',
    };

    return;
  };

  // Methods:

  SocialCalc.SpreadsheetControl.prototype.InitializeSpreadsheetControl =
    function (node, height, width, spacebelow) {
      return SocialCalc.InitializeSpreadsheetControl(
        this,
        node,
        height,
        width,
        spacebelow
      );
    };
  SocialCalc.SpreadsheetControl.prototype.DoOnResize = function () {
    return SocialCalc.DoOnResize(this);
  };
  SocialCalc.SpreadsheetControl.prototype.SizeSSDiv = function () {
    return SocialCalc.SizeSSDiv(this);
  };
  SocialCalc.SpreadsheetControl.prototype.ExecuteCommand = function (
    combostr,
    sstr
  ) {
    return SocialCalc.SpreadsheetControlExecuteCommand(this, combostr, sstr);
  };
  SocialCalc.SpreadsheetControl.prototype.CreateSheetHTML = function () {
    return SocialCalc.SpreadsheetControlCreateSheetHTML(this);
  };
  SocialCalc.SpreadsheetControl.prototype.CreateSpreadsheetSave = function (
    otherparts
  ) {
    return SocialCalc.SpreadsheetControlCreateSpreadsheetSave(this, otherparts);
  };
  SocialCalc.SpreadsheetControl.prototype.DecodeSpreadsheetSave = function (
    str
  ) {
    return SocialCalc.SpreadsheetControlDecodeSpreadsheetSave(this, str);
  };
  SocialCalc.SpreadsheetControl.prototype.CreateCellHTML = function (coord) {
    return SocialCalc.SpreadsheetControlCreateCellHTML(this, coord);
  };
  SocialCalc.SpreadsheetControl.prototype.CreateCellHTMLSave = function (
    range
  ) {
    return SocialCalc.SpreadsheetControlCreateCellHTMLSave(this, range);
  };

  // Sheet Methods to make things a little easier:

  SocialCalc.SpreadsheetControl.prototype.ParseSheetSave = function (str) {
    return this.sheet.ParseSheetSave(str);
  };
  SocialCalc.SpreadsheetControl.prototype.CreateSheetSave = function () {
    return this.sheet.CreateSheetSave();
  };

  // Functions:

  //
  // InitializeSpreadsheetControl(spreadsheet, node, height, width, spacebelow)
  //
  // Creates the control elements and makes them the child of node (string or element).
  // If present, height and width specify size.
  // If either is 0 or null (missing), the maximum that fits on the screen
  // (taking spacebelow into account) is used.
  //
  // Displays the tabs and creates the views (other than "sheet").
  // The first tab is set as selected, but onclick is not invoked.
  //
  // You should do a redisplay or recalc (which redisplays) after running this.
  //

  SocialCalc.InitializeSpreadsheetControl = function (
    spreadsheet,
    node,
    height,
    width,
    spacebelow
  ) {
    var scc = SocialCalc.Constants;
    var SCLoc = SocialCalc.LocalizeString;
    var SCLocSS = SocialCalc.LocalizeSubstrings;

    var html, child, i, vname, v, style, button, bele;
    var tabs = spreadsheet.tabs;
    var views = spreadsheet.views;

    spreadsheet.requestedHeight = height;
    spreadsheet.requestedWidth = width;
    spreadsheet.requestedSpaceBelow = spacebelow;

    if (typeof node == "string") node = document.getElementById(node);

    if (node == null) {
      alert("SocialCalc.SpreadsheetControl not given parent node.");
    }

    spreadsheet.parentNode = node;

    // create node to hold spreadsheet control

    spreadsheet.spreadsheetDiv = document.createElement("div");

    spreadsheet.SizeSSDiv(); // calculate and fill in the size values

    for (child = node.firstChild; child != null; child = node.firstChild) {
      node.removeChild(child);
    }

    // create the tabbed UI at the top

    html =
      '<div><div style="' +
      spreadsheet.toolbarbackground +
      'padding:12px 10px 10px 4px;height:0px;display:none;">';

    for (i = 0; i < tabs.length; i++) {
      html += tabs[i].html;
    }

    html +=
      "</div>" +
      '<div style="' +
      spreadsheet.tabbackground +
      'padding-bottom:4px;margin:0px 0px 8px 0px;display:none;">' +
      '<table cellpadding="0" cellspacing="0"><tr>';

    for (i = 0; i < tabs.length; i++) {
      html +=
        '  <td id="%id.' +
        tabs[i].name +
        'tab" style="' +
        (i == 0 ? spreadsheet.tabselectedCSS : spreadsheet.tabplainCSS) +
        '" onclick="%s.SetTab(this);">' +
        SCLoc(tabs[i].text) +
        "</td>";
    }

    html += " </tr></table></div></div>";

    spreadsheet.currentTab = 0; // this is where we started

    for (style in spreadsheet.tabreplacements) {
      html = html.replace(
        spreadsheet.tabreplacements[style].regex,
        spreadsheet.tabreplacements[style].replacement
      );
    }
    html = html.replace(/\%s\./g, "SocialCalc.");
    html = html.replace(/\%id\./g, spreadsheet.idPrefix);
    html = html.replace(/\%tbt\./g, spreadsheet.toolbartext);
    html = html.replace(/\%img\./g, spreadsheet.imagePrefix);

    html = SCLocSS(html); // localize with %loc!string! and %scc!constant!

    spreadsheet.spreadsheetDiv.innerHTML = html;

    node.appendChild(spreadsheet.spreadsheetDiv);

    // Initialize SocialCalc buttons

    spreadsheet.Buttons = {
      button_undo: { tooltip: "Undo", command: "undo" },
      button_redo: { tooltip: "Redo", command: "redo" },
      button_copy: { tooltip: "Copy", command: "copy" },
      button_cut: { tooltip: "Cut", command: "cut" },
      button_paste: { tooltip: "Paste", command: "paste" },
      button_pasteformats: {
        tooltip: "Paste Formats",
        command: "pasteformats",
      },
      button_delete: { tooltip: "Delete Contents", command: "delete" },
      button_filldown: { tooltip: "Fill Down", command: "filldown" },
      button_fillright: { tooltip: "Fill Right", command: "fillright" },
      button_movefrom: { tooltip: "Set/Clear Move From", command: "movefrom" },
      button_movepaste: { tooltip: "Move Paste", command: "movepaste" },
      button_moveinsert: { tooltip: "Move Insert", command: "moveinsert" },
      button_alignleft: { tooltip: "Align Left", command: "align-left" },
      button_aligncenter: { tooltip: "Align Center", command: "align-center" },
      button_alignright: { tooltip: "Align Right", command: "align-right" },
      button_borderon: { tooltip: "Borders On", command: "borderon" },
      button_borderoff: { tooltip: "Borders Off", command: "borderoff" },
      button_swapcolors: { tooltip: "Swap Colors", command: "swapcolors" },
      button_merge: { tooltip: "Merge Cells", command: "merge" },
      button_unmerge: { tooltip: "Unmerge Cells", command: "unmerge" },
      button_insertrow: { tooltip: "Insert Row", command: "insertrow" },
      button_insertcol: { tooltip: "Insert Column", command: "insertcol" },
      button_deleterow: { tooltip: "Delete Row", command: "deleterow" },
      button_deletecol: { tooltip: "Delete Column", command: "deletecol" },
      button_recalc: { tooltip: "Recalc", command: "recalc" },
    };

    for (button in spreadsheet.Buttons) {
      bele = document.getElementById(spreadsheet.idPrefix + button);
      if (!bele) {
        /*alert("Button "+(spreadsheet.idPrefix+button)+" missing");*/ continue;
      }
      bele.style.border = "1px solid " + scc.ISCButtonBorderNormal;
      SocialCalc.TooltipRegister(
        bele,
        SCLoc(spreadsheet.Buttons[button].tooltip),
        {}
      );
      SocialCalc.ButtonRegister(
        bele,
        {
          normalstyle:
            "border:1px solid " +
            scc.ISCButtonBorderNormal +
            ";backgroundColor:" +
            scc.ISCButtonBorderNormal +
            ";",
          hoverstyle:
            "border:1px solid " +
            scc.ISCButtonBorderHover +
            ";backgroundColor:" +
            scc.ISCButtonBorderNormal +
            ";",
          downstyle:
            "border:1px solid " +
            scc.ISCButtonBorderDown +
            ";backgroundColor:" +
            scc.ISCButtonDownBackground +
            ";",
        },
        {
          MouseDown: SocialCalc.DoButtonCmd,
          command: spreadsheet.Buttons[button].command,
        }
      );
    }

    // create formula bar

    spreadsheet.dummyFormulaDiv = document.createElement("div");
    spreadsheet.dummyFormulaDiv.style.height =
      spreadsheet.formulabarheight + "px";
    spreadsheet.spreadsheetDiv.appendChild(spreadsheet.dummyFormulaDiv);

    spreadsheet.formulabarDiv = document.createElement("div");
    spreadsheet.formulabarDiv.id = "formulabardiv";
    spreadsheet.formulabarDiv.style.height =
      spreadsheet.formulabarheight + "px";
    spreadsheet.formulabarDiv.innerHTML =
      '<input type="text" size="20" value="" disabled="true">'; //'<textarea rows="4" cols="60" style="z-index:5;background-color:white;position:relative;"></textarea>&nbsp;';
    //spreadsheet.spreadsheetDiv.appendChild(spreadsheet.formulabarDiv);
    var inputbox = new SocialCalc.InputBox(
      spreadsheet.formulabarDiv.firstChild,
      spreadsheet.editor
    );

    bele = document.createElement("img");
    bele.id = "testtest";
    bele.src = "/assets/images/delete24.png";
    bele.style.verticalAlign = "middle";
    //bele.style.border = "1px solid #FFF";
    //bele.style.marginLeft = "4px";
    bele.style.display = "none";
    SocialCalc.ButtonRegister(
      bele,
      { normalstyle: "", hoverstyle: "", downstyle: "" },
      { MouseDown: SocialCalc.InputLineClearText }
    );

    // spreadsheet.formulabarDiv.appendChild(bele);

    /*
   for (button in spreadsheet.formulabuttons) {
      bele = document.createElement("img");
      bele.id = spreadsheet.idPrefix+button;
      bele.src = spreadsheet.imagePrefix+spreadsheet.formulabuttons[button].image;
      bele.style.verticalAlign = "middle";
      bele.style.border = "1px solid #FFF";
      bele.style.marginLeft = "4px";
      SocialCalc.TooltipRegister(bele, SCLoc(spreadsheet.formulabuttons[button].tooltip), {});
      SocialCalc.ButtonRegister(bele,
         {normalstyle: "border:1px solid #FFF;backgroundColor:#FFF;",
          hoverstyle: "border:1px solid #CCC;backgroundColor:#FFF;",
          downstyle: "border:1px solid #000;backgroundColor:#FFF;"}, 
         {MouseDown: spreadsheet.formulabuttons[button].command});
      spreadsheet.formulabarDiv.appendChild(bele);
      }
   */
    // initialize tabs that need it

    for (i = 0; i < tabs.length; i++) {
      // execute any tab-specific initialization code
      if (tabs[i].oncreate) {
        tabs[i].oncreate(spreadsheet, tabs[i].name);
      }
    }

    // create sheet view and others
    if (!scc.doWorkBook) {
      spreadsheet.nonviewheight =
        spreadsheet.statuslineheight +
        spreadsheet.spreadsheetDiv.firstChild.offsetHeight +
        spreadsheet.spreadsheetDiv.lastChild.offsetHeight;
    } else {
      spreadsheet.nonviewheight =
        28 +
        spreadsheet.sheetbarheight +
        spreadsheet.spreadsheetDiv.firstChild.offsetHeight +
        spreadsheet.spreadsheetDiv.lastChild.offsetHeight;
    }
    spreadsheet.viewheight = spreadsheet.height - spreadsheet.nonviewheight;
    spreadsheet.editorDiv = spreadsheet.editor.CreateTableEditor(
      spreadsheet.width,
      spreadsheet.viewheight
    );

    spreadsheet.spreadsheetDiv.appendChild(spreadsheet.editorDiv);

    for (vname in views) {
      html = views[vname].html;
      for (style in views[vname].replacements) {
        html = html.replace(
          views[vname].replacements[style].regex,
          views[vname].replacements[style].replacement
        );
      }
      html = html.replace(/\%s\./g, "SocialCalc.");
      html = html.replace(/\%id\./g, spreadsheet.idPrefix);
      html = html.replace(/\%tbt\./g, spreadsheet.toolbartext);
      html = html.replace(/\%img\./g, spreadsheet.imagePrefix);
      v = document.createElement("div");
      SocialCalc.setStyles(v, views[vname].divStyle);
      v.style.display = "none";
      v.style.width = spreadsheet.width + "px";
      v.style.height = spreadsheet.viewheight + "px";

      html = SCLocSS(html); // localize with %loc!string!, etc.

      v.innerHTML = html;
      spreadsheet.spreadsheetDiv.appendChild(v);
      views[vname].element = v;
      if (views[vname].oncreate) {
        views[vname].oncreate(spreadsheet, views[vname]);
      }
    }

    views.sheet = { name: "sheet", element: spreadsheet.editorDiv };

    // create statusline

    if (!scc.doWorkBook) {
      spreadsheet.statuslineDiv = document.createElement("div");
      spreadsheet.statuslineDiv.style.cssText = spreadsheet.statuslineCSS;
      //   spreadsheet.statuslineDiv.style.height = spreadsheet.statuslineheight + "px"; // didn't take padding into account!
      spreadsheet.statuslineDiv.style.height =
        spreadsheet.statuslineheight -
        (spreadsheet.statuslineDiv.style.paddingTop.slice(0, -2) - 0) -
        (spreadsheet.statuslineDiv.style.paddingBottom.slice(0, -2) - 0) +
        "px";
      spreadsheet.statuslineDiv.id = spreadsheet.idPrefix + "statusline";
      spreadsheet.spreadsheetDiv.appendChild(spreadsheet.statuslineDiv);
    } else {
      SocialCalc.CreateSheetStatusBar(spreadsheet, scc);
    }

    // done - refresh screen needed

    return;
  };

  SocialCalc.CreateSheetStatusBar = function (spreadsheet, scc) {
    // create sheetbar
    if (!scc.doWorkBook) {
      return;
    }

    // create a table with 1 row, containing 3 columns, 1 for sheetbar, 1 for separator, 1 for statusline

    spreadsheet.sheetstatusbarDiv = document.createElement("div");
    spreadsheet.sheetstatusbarDiv.style.height =
      spreadsheet.sheetbarheight + 3 + "px";
    spreadsheet.sheetstatusbarDiv.style.backgroundColor = "#CCC";
    spreadsheet.sheetstatusbarDiv.id = spreadsheet.idPrefix + "sheetstatusbar";

    spreadsheet.sheetbarDiv = document.createElement("div");
    //spreadsheet.sheetbarDiv.style.cssText = spreadsheet.sheetbarCSS;
    spreadsheet.sheetbarDiv.id = spreadsheet.idPrefix + "sheetbar";

    spreadsheet.statuslineDiv = document.createElement("div");
    spreadsheet.statuslineDiv.style.cssText = spreadsheet.statuslineCSS;
    spreadsheet.statuslineDiv.id = spreadsheet.idPrefix + "statusline";

    var table = document.createElement("table");
    spreadsheet.sheetstatusbartable = table;
    table.cellSpacing = 0;
    table.cellPadding = 0;
    table.width = "100%";

    var tbody = document.createElement("tbody");
    table.appendChild(tbody);

    var tr = document.createElement("tr");
    tbody.appendChild(tr);
    var td = document.createElement("td");
    td.appendChild(spreadsheet.sheetbarDiv);
    td.width = scc.SCSheetBarWidth;
    tr.appendChild(td);

    td = document.createElement("td");
    td.innerHTML = "<span>&nbsp|&nbsp</span>";
    td.width = "1%";
    tr.appendChild(td);

    td = document.createElement("td");
    td.appendChild(spreadsheet.statuslineDiv);
    tr.appendChild(td);

    spreadsheet.sheetstatusbarDiv.appendChild(table);

    spreadsheet.spreadsheetDiv.appendChild(spreadsheet.sheetstatusbarDiv);

    spreadsheet.sheetstatusbarDiv.style.display = "none";
  };

  //
  // outstr = SocialCalc.LocalizeString(str)
  //
  // SocialCalc function to make localization easier.
  // If str is "Text to localize", it returns
  // SocialCalc.Constants.s_loc_text_to_localize if
  // it exists, or else with just "Text to localize".
  // Note that spaces are replaced with "_" and other special
  // chars with "X" in the name of the constant (e.g., "A & B"
  // would look for SocialCalc.Constants.s_loc_a_X_b.
  //

  SocialCalc.LocalizeString = function (str) {
    var cstr = SocialCalc.LocalizeStringList[str]; // found already this session?
    if (!cstr) {
      // no - look up
      cstr =
        SocialCalc.Constants[
        "s_loc_" + str.toLowerCase().replace(/\s/g, "_").replace(/\W/g, "X")
        ] || str;
      SocialCalc.LocalizeStringList[str] = cstr;
    }
    return cstr;
  };

  SocialCalc.LocalizeStringList = {}; // a list of strings to localize accumulated by the routine

  //
  // outstr = SocialCalc.LocalizeSubstrings(str)
  //
  // SocialCalc function to make localization easier using %loc and %scc.
  //
  // Replaces sections of str with:
  //    %loc!Text to localize!
  // with SocialCalc.Constants.s_loc_text_to_localize if
  // it exists, or else with just "Text to localize".
  // Note that spaces are replaced with "_" and other special
  // chars with "X" in the name of the constant (e.g., %loc!A & B!
  // would look for SocialCalc.Constants.s_loc_a_X_b.
  // Uses SocialCalc.LocalizeString for this.
  //
  // Replaces sections of str with:
  //    %ssc!constant-name!
  // with SocialCalc.Constants.constant-name.
  // If the constant doesn't exist, throws and alert.
  //

  SocialCalc.LocalizeSubstrings = function (str) {
    var SCLoc = SocialCalc.LocalizeString;

    return str.replace(/%(loc|ssc)!(.*?)!/g, function (a, t, c) {
      if (t == "ssc") {
        return SocialCalc.Constants[c] || alert("Missing constant: " + c);
      } else {
        return SCLoc(c);
      }
    });
  };

  //
  // obj = GetSpreadsheetControlObject()
  //
  // Returns the current spreadsheet control object
  //

  SocialCalc.GetSpreadsheetControlObject = function () {
    var csco = SocialCalc.CurrentSpreadsheetControlObject;
    if (csco) return csco;

    //   throw ("No current SpreadsheetControl object.");
  };

  //
  // SocialCalc.DoOnResize(spreadsheet)
  //
  // Processes an onResize event, setting the different views.
  //

  SocialCalc.DoOnResize = function (spreadsheet) {
    var v;
    var views = spreadsheet.views;

    var needresize = spreadsheet.SizeSSDiv();
    if (!needresize) return;

    for (vname in views) {
      v = views[vname].element;
      v.style.width = spreadsheet.width + "px";
      v.style.height = spreadsheet.height - spreadsheet.nonviewheight + "px";
    }

    spreadsheet.editor.ResizeTableEditor(
      spreadsheet.width,
      spreadsheet.height - spreadsheet.nonviewheight
    );
  };

  //
  // resized = SocialCalc.SizeSSDiv(spreadsheet)
  //
  // Figures out a reasonable size for the spreadsheet, given any requested values and viewport.
  // Sets ssdiv to that.
  // Return true if different than existing values.
  //

  SocialCalc.SizeSSDiv = function (spreadsheet) {
    var sizes, pos, resized, nodestyle, newval;
    var fudgefactorX = 10; // for IE
    var fudgefactorY = 10;

    resized = false;

    sizes = SocialCalc.GetViewportInfo();
    pos = SocialCalc.GetElementPosition(spreadsheet.parentNode);
    pos.bottom = 0;
    pos.right = 0;

    nodestyle = spreadsheet.parentNode.style;

    if (nodestyle.marginTop) {
      pos.top += nodestyle.marginTop.slice(0, -2) - 0;
    }
    if (nodestyle.marginBottom) {
      pos.bottom += nodestyle.marginBottom.slice(0, -2) - 0;
    }
    if (nodestyle.marginLeft) {
      pos.left += nodestyle.marginLeft.slice(0, -2) - 0;
    }
    if (nodestyle.marginRight) {
      pos.right += nodestyle.marginRight.slice(0, -2) - 0;
    }

    newval =
      spreadsheet.requestedHeight ||
      sizes.height -
      (pos.top + pos.bottom + fudgefactorY) -
      (spreadsheet.requestedSpaceBelow || 0);
    if (spreadsheet.height != newval) {
      spreadsheet.height = newval;
      spreadsheet.spreadsheetDiv.style.height = newval + "px";
      resized = true;
    }
    newval =
      spreadsheet.requestedWidth ||
      sizes.width - (pos.left + pos.right + fudgefactorX) ||
      700;
    if (spreadsheet.width != newval) {
      spreadsheet.width = newval;
      spreadsheet.spreadsheetDiv.style.width = newval + "px";
      resized = true;
    }

    return resized;
  };

  //
  // SocialCalc.SetTab(obj)
  //
  // The obj argument is either a string with the tab name or a DOM element with an ID
  //

  SocialCalc.SetTab = function (obj) {
    var newtab, tname, newtabnum, newview, i, vname, ele;
    var menutabs = {};
    var tools = {};
    var spreadsheet = SocialCalc.GetSpreadsheetControlObject();
    var tabs = spreadsheet.tabs;
    var views = spreadsheet.views;

    if (typeof obj == "string") {
      newtab = obj;
    } else {
      newtab = obj.id.slice(spreadsheet.idPrefix.length, -3);
    }

    if (
      spreadsheet.editor.busy && // if busy and switching from "sheet", ignore
      (!tabs[spreadsheet.currentTab].view ||
        tabs[spreadsheet.currentTab].view == "sheet")
    ) {
      for (i = 0; i < tabs.length; i++) {
        if (tabs[i].name == newtab && tabs[i].view && tabs[i].view != "sheet") {
          return;
        }
      }
    }

    if (spreadsheet.tabs[spreadsheet.currentTab].onunclick) {
      spreadsheet.tabs[spreadsheet.currentTab].onunclick(
        spreadsheet,
        spreadsheet.tabs[spreadsheet.currentTab].name
      );
    }

    for (i = 0; i < tabs.length; i++) {
      tname = tabs[i].name;
      menutabs[tname] = document.getElementById(
        spreadsheet.idPrefix + tname + "tab"
      );
      tools[tname] = document.getElementById(
        spreadsheet.idPrefix + tname + "tools"
      );
      if (tname == newtab) {
        newtabnum = i;
        tools[tname].style.display = "block";
        menutabs[tname].style.cssText = spreadsheet.tabselectedCSS;
      } else {
        tools[tname].style.display = "none";
        menutabs[tname].style.cssText = spreadsheet.tabplainCSS;
      }
    }

    spreadsheet.currentTab = newtabnum;

    if (tabs[newtabnum].onclick) {
      tabs[newtabnum].onclick(spreadsheet, newtab);
    }

    for (vname in views) {
      if (
        (!tabs[newtabnum].view && vname == "sheet") ||
        tabs[newtabnum].view == vname
      ) {
        views[vname].element.style.display = "block";
        newview = vname;
      } else {
        views[vname].element.style.display = "none";
      }
    }

    if (tabs[newtabnum].onclickFocus) {
      ele = tabs[newtabnum].onclickFocus;
      if (typeof ele == "string") {
        ele = document.getElementById(spreadsheet.idPrefix + ele);
        ele.focus();
      }
      SocialCalc.CmdGotFocus(ele);
    } else {
      SocialCalc.KeyboardFocus();
    }

    if (views[newview].needsresize && views[newview].onresize) {
      views[newview].needsresize = false;
      views[newview].onresize(spreadsheet, views[newview]);
    }

    if (newview == "sheet") {
      spreadsheet.statuslineDiv.style.display = "block";
      spreadsheet.editor.ScheduleRender();
    } else {
      spreadsheet.statuslineDiv.style.display = "none";
    }

    return;
  };

  //
  // SocialCalc.SpreadsheetControlStatuslineCallback
  //

  SocialCalc.SpreadsheetControlStatuslineCallback = function (
    editor,
    status,
    arg,
    params
  ) {
    var rele1, rele2;

    var ele = document.getElementById(params.statuslineid);

    if (ele) {
      ele.innerHTML = editor.GetStatuslineString(status, arg, params);
    }

    switch (status) {
      case "cmdendnorender":
      case "calcfinished":
      case "doneposcalc":
        rele1 = document.getElementById(params.recalcid1);
        rele2 = document.getElementById(params.recalcid2);
        if (!rele1 || !rele2) break;
        if (editor.context.sheetobj.attribs.needsrecalc == "yes") {
          rele1.style.display = "inline";
          rele2.style.display = "inline";
        } else {
          rele1.style.display = "none";
          rele2.style.display = "none";
        }
        break;

      default:
        break;
    }
  };

  //
  // SocialCalc.UpdateSortRangeProposal(editor)
  //
  // Updates sort range proposed in the UI in element idPrefix+sortlist
  //

  SocialCalc.UpdateSortRangeProposal = function (editor) {
    var ele = document.getElementById(
      SocialCalc.GetSpreadsheetControlObject().idPrefix + "sortlist"
    );
    if (editor.range.hasrange) {
      ele.options[0].text =
        SocialCalc.crToCoord(editor.range.left, editor.range.top) +
        ":" +
        SocialCalc.crToCoord(editor.range.right, editor.range.bottom);
    } else {
      ele.options[0].text = SocialCalc.LocalizeString("[select range]");
    }
  };

  //
  // SocialCalc.LoadColumnChoosers(spreadsheet)
  //
  // Updates list of columns for choosing which to sort for Major, Minor, and Last sort
  //

  SocialCalc.LoadColumnChoosers = function (spreadsheet) {
    var SCLoc = SocialCalc.LocalizeString;

    var sortrange, nrange, rparts, col, colname, sele, oldindex;

    if (spreadsheet.sortrange && spreadsheet.sortrange.indexOf(":") == -1) {
      // sortrange is a named range
      nrange = SocialCalc.Formula.LookupName(
        spreadsheet.sheet,
        spreadsheet.sortrange || ""
      );
      if (nrange.type == "range") {
        rparts = nrange.value.match(/^(.*)\|(.*)\|$/);
        sortrange = rparts[1] + ":" + rparts[2];
      } else {
        sortrange = "A1:A1";
      }
    } else {
      sortrange = spreadsheet.sortrange;
    }
    var range = SocialCalc.ParseRange(sortrange);
    sele = document.getElementById(spreadsheet.idPrefix + "majorsort");
    oldindex = sele.selectedIndex;
    sele.options.length = 0;
    sele.options[sele.options.length] = new Option(SCLoc("[None]"), "");
    for (var col = range.cr1.col; col <= range.cr2.col; col++) {
      colname = SocialCalc.rcColname(col);
      sele.options[sele.options.length] = new Option(
        SCLoc("Column ") + colname,
        colname
      );
    }
    sele.selectedIndex =
      oldindex > 1 && oldindex <= range.cr2.col - range.cr1.col + 1
        ? oldindex
        : 1; // restore what was there if reasonable
    sele = document.getElementById(spreadsheet.idPrefix + "minorsort");
    oldindex = sele.selectedIndex;
    sele.options.length = 0;
    sele.options[sele.options.length] = new Option(SCLoc("[None]"), "");
    for (var col = range.cr1.col; col <= range.cr2.col; col++) {
      colname = SocialCalc.rcColname(col);
      sele.options[sele.options.length] = new Option(colname, colname);
    }
    sele.selectedIndex =
      oldindex > 0 && oldindex <= range.cr2.col - range.cr1.col + 1
        ? oldindex
        : 0; // default to [none]
    sele = document.getElementById(spreadsheet.idPrefix + "lastsort");
    oldindex = sele.selectedIndex;
    sele.options.length = 0;
    sele.options[sele.options.length] = new Option(SCLoc("[None]"), "");
    for (var col = range.cr1.col; col <= range.cr2.col; col++) {
      colname = SocialCalc.rcColname(col);
      sele.options[sele.options.length] = new Option(colname, colname);
    }
    sele.selectedIndex =
      oldindex > 0 && oldindex <= range.cr2.col - range.cr1.col + 1
        ? oldindex
        : 0; // default to [none]
  };

  //
  // SocialCalc.CmdGotFocus(obj)
  //
  // Sets SocialCalc.Keyboard.passThru: obj should be element with focus or "true"
  //

  SocialCalc.CmdGotFocus = function (obj) {
    SocialCalc.Keyboard.passThru = obj;
  };

  //
  // SocialCalc.DoButtonCmd(e, buttoninfo, bobj)
  //

  SocialCalc.DoButtonCmd = function (e, buttoninfo, bobj) {
    SocialCalc.DoCmd(bobj.element, bobj.functionobj.command);
  };

  //
  // SocialCalc.DoCmd(obj, which)
  //
  // xxx
  //

  SocialCalc.DoCmd = function (obj, which) {
    var combostr,
      sstr,
      cl,
      i,
      clele,
      slist,
      slistele,
      str,
      sele,
      rele,
      lele,
      ele,
      sortrange,
      nrange,
      rparts;
    var sheet, cell, color, bgcolor, defaultcolor, defaultbgcolor;

    var spreadsheet = SocialCalc.GetSpreadsheetControlObject();
    var editor = spreadsheet.editor;

    switch (which) {
      case "undo":
        spreadsheet.ExecuteCommand("undo", "");
        break;

      case "redo":
        spreadsheet.ExecuteCommand("redo", "");
        break;

      case "fill-rowcolstuff":
      case "fill-text":
        cl = which.substring(5);
        clele = document.getElementById(spreadsheet.idPrefix + cl + "list");
        clele.length = 0;
        for (i = 0; i < SocialCalc.SpreadsheetCmdTable[cl].length; i++) {
          clele.options[i] = new Option(
            SocialCalc.SpreadsheetCmdTable[cl][i].t
          );
        }
        which = "changed-" + cl; // fall through to changed code

      case "changed-rowcolstuff":
      case "changed-text":
        cl = which.substring(8);
        clele = document.getElementById(spreadsheet.idPrefix + cl + "list");
        slist =
          SocialCalc.SpreadsheetCmdTable.slists[
          SocialCalc.SpreadsheetCmdTable[cl][clele.selectedIndex].s
          ]; // get sList for this command
        slistele = document.getElementById(spreadsheet.idPrefix + cl + "slist");
        slistele.length = 0; // reset
        for (i = 0; i < (slist.length || 0); i++) {
          slistele.options[i] = new Option(slist[i].t, slist[i].s);
        }
        return; // nothing else to do

      case "ok-rowcolstuff":
      case "ok-text":
        cl = which.substring(3);
        clele = document.getElementById(spreadsheet.idPrefix + cl + "list");
        slistele = document.getElementById(spreadsheet.idPrefix + cl + "slist");
        combostr = SocialCalc.SpreadsheetCmdTable[cl][clele.selectedIndex].c;
        sstr = slistele[slistele.selectedIndex].value;
        SocialCalc.SpreadsheetControlExecuteCommand(obj, combostr, sstr);
        break;

      case "ok-setsort":
        lele = document.getElementById(spreadsheet.idPrefix + "sortlist");
        if (lele.selectedIndex == 0) {
          if (editor.range.hasrange) {
            spreadsheet.sortrange =
              SocialCalc.crToCoord(editor.range.left, editor.range.top) +
              ":" +
              SocialCalc.crToCoord(editor.range.right, editor.range.bottom);
          } else {
            spreadsheet.sortrange =
              editor.ecell.coord + ":" + editor.ecell.coord;
          }
        } else {
          spreadsheet.sortrange = lele.options[lele.selectedIndex].value;
        }
        ele = document.getElementById(spreadsheet.idPrefix + "sortbutton");
        ele.value = SocialCalc.LocalizeString("Sort ") + spreadsheet.sortrange;
        ele.style.visibility = "visible";
        SocialCalc.LoadColumnChoosers(spreadsheet);
        if (obj && obj.blur) obj.blur();
        SocialCalc.KeyboardFocus();
        return;

      case "dosort":
        if (spreadsheet.sortrange && spreadsheet.sortrange.indexOf(":") == -1) {
          // sortrange is a named range
          nrange = SocialCalc.Formula.LookupName(
            spreadsheet.sheet,
            spreadsheet.sortrange || ""
          );
          if (nrange.type != "range") return;
          rparts = nrange.value.match(/^(.*)\|(.*)\|$/);
          sortrange = rparts[1] + ":" + rparts[2];
        } else {
          sortrange = spreadsheet.sortrange;
        }
        if (sortrange == "A1:A1") return;
        str = "sort " + sortrange + " ";
        sele = document.getElementById(spreadsheet.idPrefix + "majorsort");
        rele = document.getElementById(spreadsheet.idPrefix + "majorsortup");
        str +=
          sele.options[sele.selectedIndex].value +
          (rele.checked ? " up" : " down");
        sele = document.getElementById(spreadsheet.idPrefix + "minorsort");
        if (sele.selectedIndex > 0) {
          rele = document.getElementById(spreadsheet.idPrefix + "minorsortup");
          str +=
            " " +
            sele.options[sele.selectedIndex].value +
            (rele.checked ? " up" : " down");
        }
        sele = document.getElementById(spreadsheet.idPrefix + "lastsort");
        if (sele.selectedIndex > 0) {
          rele = document.getElementById(spreadsheet.idPrefix + "lastsortup");
          str +=
            " " +
            sele.options[sele.selectedIndex].value +
            (rele.checked ? " up" : " down");
        }
        spreadsheet.ExecuteCommand(str, "");
        break;

      case "merge":
        combostr = SocialCalc.SpreadsheetCmdLookup[which] || "";
        sstr = SocialCalc.SpreadsheetCmdSLookup[which] || "";
        spreadsheet.ExecuteCommand(combostr, sstr);
        if (editor.range.hasrange) {
          // set ecell to upper left
          editor.MoveECell(
            SocialCalc.crToCoord(editor.range.left, editor.range.top)
          );
          editor.RangeRemove();
        }
        break;

      case "movefrom":
        if (editor.range2.hasrange) {
          // toggle if already there
          spreadsheet.context.cursorsuffix = "";
          editor.Range2Remove();
          spreadsheet.ExecuteCommand("redisplay", "");
        } else if (editor.range.hasrange) {
          // set range2 to range or one cell
          editor.range2.top = editor.range.top;
          editor.range2.right = editor.range.right;
          editor.range2.bottom = editor.range.bottom;
          editor.range2.left = editor.range.left;
          editor.range2.hasrange = true;
          editor.MoveECell(
            SocialCalc.crToCoord(editor.range.left, editor.range.top)
          );
        } else {
          editor.range2.top = editor.ecell.row;
          editor.range2.right = editor.ecell.col;
          editor.range2.bottom = editor.ecell.row;
          editor.range2.left = editor.ecell.col;
          editor.range2.hasrange = true;
        }
        str = editor.range2.hasrange ? "" : "off";
        ele = document.getElementById(spreadsheet.idPrefix + "button_movefrom");
        ele.src = spreadsheet.imagePrefix + "movefrom" + str + ".gif";
        ele = document.getElementById(
          spreadsheet.idPrefix + "button_movepaste"
        );
        ele.src = spreadsheet.imagePrefix + "movepaste" + str + ".gif";
        ele = document.getElementById(
          spreadsheet.idPrefix + "button_moveinsert"
        );
        ele.src = spreadsheet.imagePrefix + "moveinsert" + str + ".gif";
        if (editor.range2.hasrange) editor.RangeRemove();
        break;

      case "movepaste":
      case "moveinsert":
        if (editor.range2.hasrange) {
          spreadsheet.context.cursorsuffix = "";
          combostr =
            which +
            " " +
            SocialCalc.crToCoord(editor.range2.left, editor.range2.top) +
            ":" +
            SocialCalc.crToCoord(editor.range2.right, editor.range2.bottom) +
            " " +
            editor.ecell.coord;
          spreadsheet.ExecuteCommand(combostr, "");
          editor.Range2Remove();
          ele = document.getElementById(
            spreadsheet.idPrefix + "button_movefrom"
          );
          ele.src = spreadsheet.imagePrefix + "movefromoff.gif";
          ele = document.getElementById(
            spreadsheet.idPrefix + "button_movepaste"
          );
          ele.src = spreadsheet.imagePrefix + "movepasteoff.gif";
          ele = document.getElementById(
            spreadsheet.idPrefix + "button_moveinsert"
          );
          ele.src = spreadsheet.imagePrefix + "moveinsertoff.gif";
        }
        break;

      case "swapcolors":
        sheet = spreadsheet.sheet;
        cell = sheet.GetAssuredCell(editor.ecell.coord);
        defaultcolor = sheet.attribs.defaultcolor
          ? sheet.colors[sheet.attribs.defaultcolor]
          : "rgb(0,0,0)";
        defaultbgcolor = sheet.attribs.defaultbgcolor
          ? sheet.colors[sheet.attribs.defaultbgcolor]
          : "rgb(255,255,255)";
        color = cell.color ? sheet.colors[cell.color] : defaultcolor; // get color
        if (color == defaultbgcolor) color = ""; // going to swap, so if same as background default, use default
        bgcolor = cell.bgcolor ? sheet.colors[cell.bgcolor] : defaultbgcolor;
        if (bgcolor == defaultcolor) bgcolor = ""; // going to swap, so if same as foreground default, use default
        spreadsheet.ExecuteCommand(
          "set %C color " + bgcolor + "%Nset %C bgcolor " + color,
          ""
        );
        break;

      default:
        combostr = SocialCalc.SpreadsheetCmdLookup[which] || "";
        sstr = SocialCalc.SpreadsheetCmdSLookup[which] || "";
        spreadsheet.ExecuteCommand(combostr, sstr);
        break;
    }

    if (obj && obj.blur) obj.blur();
    SocialCalc.KeyboardFocus();
  };

  SocialCalc.SpreadsheetCmdLookup = {
    copy: "copy %C all",
    cut: "cut %C all",
    paste: "paste %C all",
    pasteformats: "paste %C formats",
    delete: "erase %C formulas",
    filldown: "filldown %C all",
    fillright: "fillright %C all",
    erase: "erase %C all",
    borderon: "set %C bt %S%Nset %C br %S%Nset %C bb %S%Nset %C bl %S",
    borderoff: "set %C bt %S%Nset %C br %S%Nset %C bb %S%Nset %C bl %S",
    merge: "merge %C",
    unmerge: "unmerge %C",
    "align-left": "set %C cellformat left",
    "align-center": "set %C cellformat center",
    "align-right": "set %C cellformat right",
    "align-default": "set %C cellformat",
    insertrow: "insertrow %C",
    insertcol: "insertcol %C",
    deleterow: "deleterow %C",
    deletecol: "deletecol %C",
    undo: "undo",
    redo: "redo",
    recalc: "recalc",
  };

  SocialCalc.SpreadsheetCmdSLookup = {
    borderon: "1px solid rgb(0,0,0)",
    borderoff: "",
  };

  /******* NO LONGER USED

SocialCalc.SpreadsheetCmdTable = {
 cmd: [
  {t:"Fill Right", s:"ffal", c:"fillright %C %S"},
  {t:"Fill Down", s:"ffal", c:"filldown %C %S"},
  {t:"Copy", s:"all", c:"copy %C %S"},
  {t:"Cut", s:"all", c:"cut %C %S"},
  {t:"Paste", s:"ffal", c:"paste %C %S"},
  {t:"Erase", s:"ffal", c:"erase %C %S"},
  {t:"Insert", s:"rowcol", c:"insert%S %C"},
  {t:"Delete", s:"rowcol", c:"delete%S %C"},
  {t:"Merge Cells", s:"none", c:"merge %C"},
  {t:"Unmerge", s:"none", c:"unmerge %C"},
  {t:"Sort", s:"sortcol", c:"sort %R %S"},
  {t:"Cell Color", s:"colors", c:"set %C color %S"},
  {t:"Cell Background", s:"colors", c:"set %C bgcolor %S"},
  {t:"Cell Number Format", s:"ntvf", c:"set %C nontextvalueformat %S"},
  {t:"Cell Font", s:"fonts", c:"set %C font %S"},
  {t:"Cell Align", s:"cellformat", c:"set %C cellformat %S"},
  {t:"Cell Borders", s:"borderOnOff", c:"set %C bt %S%Nset %C br %S%Nset %C bb %S%Nset %C bl %S"},
  {t:"Column Width", s:"colWidths", c:"set %W width %S"},
  {t:"Default Color", s:"colors", c:"set sheet defaultcolor %S"},
  {t:"Default Background", s:"colors", c:"set sheet defaultbgcolor %S"},
  {t:"Default Number Format", s:"ntvf", c:"set sheet defaultnontextvalueformat %S"},
  {t:"Default Font", s:"fonts", c:"set sheet defaultfont %S"},
  {t:"Default Text Align", s:"cellformat", c:"set sheet defaulttextformat %S"},
  {t:"Default Number Align", s:"cellformat", c:"set sheet defaultnontextformat %S"},
  {t:"Default Column Width", s:"colWidths", c:"set sheet defaultcolwidth %S"}
  ],
 rowcolstuff: [
  {t:"Insert", s:"rowcol", c:"insert%S %C"},
  {t:"Delete", s:"rowcol", c:"delete%S %C"},
  {t:"Paste", s:"ffal", c:"paste %C %S"},
  {t:"Erase", s:"ffal", c:"erase %C %S"},
  {t:"Fill Right", s:"ffal", c:"fillright %C %S"},
  {t:"Fill Down", s:"ffal", c:"filldown %C %S"}
  ],
 text: [
  {t:"Cell Color", s:"colors", c:"set %C color %S"},
  {t:"Cell Background", s:"colors", c:"set %C bgcolor %S"},
  {t:"Cell Number Format", s:"ntvf", c:"set %C nontextvalueformat %S"},
  {t:"Cell Text Format", s:"tvf", c:"set %C textvalueformat %S"},
  {t:"Cell Font", s:"fonts", c:"set %C font %S"},
  {t:"Cell Align", s:"cellformat", c:"set %C cellformat %S"},
  {t:"Default Color", s:"colors", c:"set sheet defaultcolor %S"},
  {t:"Default Background", s:"colors", c:"set sheet defaultbgcolor %S"},
  {t:"Default Number Format", s:"ntvf", c:"set sheet defaultnontextvalueformat %S"},
  {t:"Default Text Format", s:"tvf", c:"set sheet defaulttextvalueformat %S"},
  {t:"Default Font", s:"fonts", c:"set sheet defaultfont %S"},
  {t:"Default Text Align", s:"cellformat", c:"set sheet defaulttextformat %S"},
  {t:"Default Number Align", s:"cellformat", c:"set sheet defaultnontextformat %S"}
  ],
 slists: {
  "colors": [
   {t:"Default", s:""},
   {t:"Black", s:"rgb(0,0,0)"},
   {t:"Dark Gray", s:"rgb(102,102,102)"}, // #666
   {t:"Gray", s:"rgb(204,204,204)"}, // #CCC
   {t:"White", s:"rgb(255,255,255)"},
   {t:"Red", s:"rgb(255,0,0)"},
   {t:"Dark Red", s:"rgb(153,0,0)"},
   {t:"Orange", s:"rgb(255,153,0)"},
   {t:"Yellow", s:"rgb(255,255,0)"},
   {t:"Light Yellow", s:"rgb(255,255,204)"},
   {t:"Green", s:"rgb(0,255,0)"},
   {t:"Dark Green", s:"rgb(0,153,0)"},
   {t:"Blue", s:"rgb(0,0,255)"},
   {t:"Dark Blue", s:"rgb(0,0,153)"},
   {t:"Light Blue", s:"rgb(204,204,255)"}
   ],
  "fonts": [ // style weight size family
   {t:"Default", s:""},
   {t:"Bold", s:"normal bold * *"},
   {t:"Italic", s:"italic normal * *"},
   {t:"Small", s:"* small *"},
   {t:"Medium", s:"* medium *"},
   {t:"Large", s:"* large *"},
   {t:"Bold Small", s:"normal bold small *"},
   {t:"Bold Medium", s:"normal bold medium *"},
   {t:"Bold Large", s:"normal bold large *"}
   ],
  "cellformat": [
   {t:"Default", s:""},
   {t:"Left", s:"left"},
   {t:"Right", s:"right"},
   {t:"Center", s:"center"}
   ],
  "borderOnOff": [
   {t:"On", s:"1px solid rgb(0,0,0)"},
   {t:"Off", s:""}
   ],
  "colWidths": [
   {t:"Default", s:""},
   {t:"20", s:"20"},
   {t:"40", s:"40"},
   {t:"60", s:"60"},
   {t:"80", s:"80"},
   {t:"100", s:"100"},
   {t:"120", s:"120"},
   {t:"140", s:"140"},
   {t:"160", s:"160"},
   {t:"180", s:"180"},
   {t:"200", s:"200"},
   {t:"220", s:"220"},
   {t:"240", s:"240"},
   {t:"260", s:"260"},
   {t:"280", s:"280"},
   {t:"300", s:"300"}
   ],
  "ntvf": [
   {t:"Default", s:""},
   {t:"1234", s:"0"},
   {t:"1,234", s:"#,##0"},
   {t:"1,234.5", s:"#,##0.0"},
   {t:"1,234.56", s:"#,##0.00"},
   {t:"1,234.567", s:"#,##0.000"},
   {t:"1,234%", s:"#,##0%"},
   {t:"1,234.5%", s:"#,##0.0%"},
   {t:"(1,234)", s:"#,##0_);(#,##0)"},
   {t:"(1,234.5)", s:"#,##0.0_);(#,##0.0)"},
   {t:"(1,234.56)", s:"#,##0.00_);(#,##0.00)"},
   {t:"00", s:"00"},
   {t:"000", s:"000"},
   {t:"0000", s:"0000"},
   {t:"$1,234.56", s:"$#,##0.00"},
   {t:"2006-01-04", s:"yyyy-mm-dd"},
   {t:"01:23:45", s:"hh:mm:ss"},
   {t:"2006-01-04 01:23:45", s:"yyyy-mm-dd hh:mm:ss"},
   {t:"Hidden", s:"hidden"}
   ],
  "tvf": [
   {t:"Default", s:""},
   {t:"Automatic", s:"general"},
   {t:"Plain Text", s:"text-plain"},
   {t:"HTML", s:"text-html"},
   {t:"Wiki", s:"text-wiki"},
   {t:"Hidden", s:"hidden"}
   ],
  "ffal": [ // Formulas, Formats, All
   {t:"All", s:"all"},
   {t:"Contents", s:"formulas"},
   {t:"Formats", s:"formats"}
   ],
  "all": [ // All
   {t:"All", s:"all"}
   ],
  "rowcol": [
   {t:"Row", s:"row"},
   {t:"Column", s:"col"}
   ],
  "sortcol": [
   {t:"A up", s:"A up"},
   {t:"B up", s:"B up"},
   {t:"C up", s:"C up"},
   {t:"A down", s:"A down"},
   {t:"B down", s:"B down"},
   {t:"C down", s:"C down"},
   {t:"A, B, C up", s:"A up B up C up"}
   ],
  "none": [ // nothing
   {t:" ", s:" "}
   ]
  }
 }
*********/

  //
  // SocialCalc.SpreadsheetControlExecuteCommand(obj, combostr, sstr)
  //
  // xxx
  //

  SocialCalc.SpreadsheetControlExecuteCommand = function (obj, combostr, sstr) {
    var i, commands;
    var spreadsheet = SocialCalc.GetSpreadsheetControlObject();
    var eobj = spreadsheet.editor;

    var str = {};
    str.P = "%";
    str.N = "\n";
    if (eobj.range.hasrange) {
      str.R =
        SocialCalc.crToCoord(eobj.range.left, eobj.range.top) +
        ":" +
        SocialCalc.crToCoord(eobj.range.right, eobj.range.bottom);
      str.C = str.R;
      str.W =
        SocialCalc.rcColname(eobj.range.left) +
        ":" +
        SocialCalc.rcColname(eobj.range.right);
    } else {
      str.C = eobj.ecell.coord;
      str.R = eobj.ecell.coord + ":" + eobj.ecell.coord;
      str.W = SocialCalc.rcColname(SocialCalc.coordToCr(eobj.ecell.coord).col);
    }
    str.S = sstr;
    combostr = combostr.replace(/%C/g, str.C);
    combostr = combostr.replace(/%R/g, str.R);
    combostr = combostr.replace(/%N/g, str.N);
    combostr = combostr.replace(/%S/g, str.S);
    combostr = combostr.replace(/%W/g, str.W);
    combostr = combostr.replace(/%P/g, str.P);

    eobj.EditorScheduleSheetCommands(combostr, true, false);
  };

  //
  // result = SocialCalc.SpreadsheetControlCreateSheetHTML(spreadsheet)
  //
  // Returns the HTML representation of the whole spreadsheet
  //

  SocialCalc.SpreadsheetControlCreateSheetHTML = function (spreadsheet) {
    var context, div, ele;

    var result = "";

    context = new SocialCalc.RenderContext(spreadsheet.sheet);
    div = document.createElement("div");
    ele = context.RenderSheet(null, { type: "html" });
    div.appendChild(ele);
    context = undefined;
    result = div.innerHTML;
    ele = undefined;
    div = undefined;
    return result;
  };

  //
  // result = SocialCalc.SpreadsheetControlCreateCellHTML(spreadsheet, coord, linkstyle)
  //
  // Returns the HTML representation of a cell. Blank is "", not "&nbsp;".
  //

  SocialCalc.SpreadsheetControlCreateCellHTML = function (
    spreadsheet,
    coord,
    linkstyle
  ) {
    var result = "";
    var cell = spreadsheet.sheet.cells[coord];

    if (!cell) return "";

    if (cell.displaystring == undefined) {
      result = SocialCalc.FormatValueForDisplay(
        spreadsheet.sheet,
        cell.datavalue,
        coord,
        linkstyle || spreadsheet.context.defaultHTMLlinkstyle
      );
    } else {
      result = cell.displaystring;
    }

    if (result == "&nbsp;") result = "";

    return result;
  };

  //
  // result = SocialCalc.SpreadsheetControlCreateCellHTMLSave(spreadsheet, range, linkstyle)
  //
  // Returns the HTML representation of a range of cells, or the whole sheet if range is null.
  // The form is:
  //    version:1.0
  //    coord:cell-HTML
  //    coord:cell-HTML
  //    ...
  //
  // Empty cells are skipped. The cell-HTML is encoded with ":"=>"\c", newline=>"\n", and "\"=>"\b".
  //

  SocialCalc.SpreadsheetControlCreateCellHTMLSave = function (
    spreadsheet,
    range,
    linkstyle
  ) {
    var cr1, cr2, row, col, coord, cell, cellHTML;
    var result = [];
    var prange;

    if (range) {
      prange = SocialCalc.ParseRange(range);
    } else {
      prange = {
        cr1: { row: 1, col: 1 },
        cr2: {
          row: spreadsheet.sheet.attribs.lastrow,
          col: spreadsheet.sheet.attribs.lastcol,
        },
      };
    }
    cr1 = prange.cr1;
    cr2 = prange.cr2;

    result.push("version:1.0");

    for (row = cr1.row; row <= cr2.row; row++) {
      for (col = cr1.col; col <= cr2.col; col++) {
        coord = SocialCalc.crToCoord(col, row);
        cell = spreadsheet.sheet.cells[coord];
        if (!cell) continue;
        if (cell.displaystring == undefined) {
          cellHTML = SocialCalc.FormatValueForDisplay(
            spreadsheet.sheet,
            cell.datavalue,
            coord,
            linkstyle || spreadsheet.context.defaultHTMLlinkstyle
          );
        } else {
          cellHTML = cell.displaystring;
        }
        if (cellHTML == "&nbsp;") continue;
        result.push(coord + ":" + SocialCalc.encodeForSave(cellHTML));
      }
    }

    result.push(""); // one extra to get extra \n
    return result.join("\n");
  };

  //
  // Formula Bar Button Routines
  //

  SocialCalc.SpreadsheetControl.DoFunctionList = function () {
    var i, cname, str, f, ele;

    var scf = SocialCalc.Formula;
    var scc = SocialCalc.Constants;
    var fcl = scc.function_classlist;

    var spreadsheet = SocialCalc.GetSpreadsheetControlObject();
    var idp = spreadsheet.idPrefix + "function";

    ele = document.getElementById(idp + "dialog");
    if (ele) return; // already have one

    scf.FillFunctionInfo();

    str =
      '<table><tr><td><span style="font-size:x-small;font-weight:bold">%loc!Category!</span><br>' +
      '<select id="' +
      idp +
      'class" size="' +
      fcl.length +
      '" style="width:120px;" onchange="SocialCalc.SpreadsheetControl.FunctionClassChosen(this.options[this.selectedIndex].value);">';
    for (i = 0; i < fcl.length; i++) {
      str +=
        '<option value="' +
        fcl[i] +
        '"' +
        (i == 0 ? " selected>" : ">") +
        SocialCalc.special_chars(scf.FunctionClasses[fcl[i]].name) +
        "</option>";
    }
    str +=
      '</select></td><td>&nbsp;&nbsp;</td><td id="' +
      idp +
      'list"><span style="font-size:x-small;font-weight:bold">%loc!Functions!</span><br>' +
      '<select id="' +
      idp +
      'name" size="' +
      fcl.length +
      '" style="width:240px;" ' +
      'onchange="SocialCalc.SpreadsheetControl.FunctionChosen(this.options[this.selectedIndex].value);" ondblclick="SocialCalc.SpreadsheetControl.DoFunctionPaste();">';
    str += SocialCalc.SpreadsheetControl.GetFunctionNamesStr("all");
    str +=
      '</td></tr><tr><td colspan="3">' +
      '<div id="' +
      idp +
      'desc" style="width:380px;height:80px;overflow:auto;font-size:x-small;">' +
      SocialCalc.SpreadsheetControl.GetFunctionInfoStr(
        scf.FunctionClasses[fcl[0]].items[0]
      ) +
      "</div>" +
      '<div style="width:380px;text-align:right;padding-top:6px;font-size:small;">' +
      '<input type="button" value="%loc!Paste!" style="font-size:smaller;" onclick="SocialCalc.SpreadsheetControl.DoFunctionPaste();">&nbsp;' +
      '<input type="button" value="%loc!Cancel!" style="font-size:smaller;" onclick="SocialCalc.SpreadsheetControl.HideFunctions();"></div>' +
      "</td></tr></table>";

    var main = document.createElement("div");
    main.id = idp + "dialog";

    main.style.position = "absolute";

    var vp = SocialCalc.GetViewportInfo();

    main.style.top = vp.height / 3 + "px";
    main.style.left = vp.width / 3 + "px";
    main.style.zIndex = 100;
    main.style.backgroundColor = "#FFF";
    main.style.border = "1px solid black";

    main.style.width = "400px";

    str =
      '<table cellspacing="0" cellpadding="0" style="border-bottom:1px solid black;"><tr>' +
      '<td style="font-size:10px;cursor:default;width:100%;background-color:#999;color:#FFF;">' +
      "&nbsp;%loc!Function List!" +
      "</td>" +
      '<td style="font-size:10px;cursor:default;color:#666;" onclick="SocialCalc.SpreadsheetControl.HideFunctions();">&nbsp;X&nbsp;</td></tr></table>' +
      '<div style="background-color:#DDD;">' +
      str +
      "</div>";

    str = SocialCalc.LocalizeSubstrings(str);

    main.innerHTML = str;

    SocialCalc.DragRegister(
      main.firstChild.firstChild.firstChild.firstChild,
      true,
      true,
      {
        MouseDown: SocialCalc.DragFunctionStart,
        MouseMove: SocialCalc.DragFunctionPosition,
        MouseUp: SocialCalc.DragFunctionPosition,
        Disabled: null,
        positionobj: main,
      }
    );

    spreadsheet.spreadsheetDiv.appendChild(main);

    ele = document.getElementById(idp + "name");
    ele.focus();
    SocialCalc.CmdGotFocus(ele);
    //!!! need to do keyboard handling: if esc, hide; if All, letter scrolls to there
  };

  SocialCalc.SpreadsheetControl.GetFunctionNamesStr = function (cname) {
    var i, f;
    var scf = SocialCalc.Formula;
    var str = "";

    f = scf.FunctionClasses[cname];
    for (i = 0; i < f.items.length; i++) {
      str +=
        '<option value="' +
        f.items[i] +
        '"' +
        (i == 0 ? " selected>" : ">") +
        f.items[i] +
        "</option>";
    }

    return str;
  };

  SocialCalc.SpreadsheetControl.FillFunctionNames = function (cname, ele) {
    var i, f;
    var scf = SocialCalc.Formula;

    ele.length = 0;
    f = scf.FunctionClasses[cname];
    for (i = 0; i < f.items.length; i++) {
      ele.options[i] = new Option(f.items[i], f.items[i]);
      if (i == 0) {
        ele.options[i].selected = true;
      }
    }
  };

  SocialCalc.SpreadsheetControl.GetFunctionInfoStr = function (fname) {
    var scf = SocialCalc.Formula;
    var f = scf.FunctionList[fname];
    var scsc = SocialCalc.special_chars;

    var str =
      "<b>" + fname + "(" + scsc(scf.FunctionArgString(fname)) + ")</b><br>";
    str += scsc(f[3]);

    return str;
  };

  SocialCalc.SpreadsheetControl.FunctionClassChosen = function (cname) {
    var spreadsheet = SocialCalc.GetSpreadsheetControlObject();
    var idp = spreadsheet.idPrefix + "function";
    var scf = SocialCalc.Formula;

    SocialCalc.SpreadsheetControl.FillFunctionNames(
      cname,
      document.getElementById(idp + "name")
    );

    SocialCalc.SpreadsheetControl.FunctionChosen(
      scf.FunctionClasses[cname].items[0]
    );
  };

  SocialCalc.SpreadsheetControl.FunctionChosen = function (fname) {
    var spreadsheet = SocialCalc.GetSpreadsheetControlObject();
    var idp = spreadsheet.idPrefix + "function";

    document.getElementById(idp + "desc").innerHTML =
      SocialCalc.SpreadsheetControl.GetFunctionInfoStr(fname);
  };

  SocialCalc.SpreadsheetControl.HideFunctions = function () {
    var spreadsheet = SocialCalc.GetSpreadsheetControlObject();

    var ele = document.getElementById(spreadsheet.idPrefix + "functiondialog");
    ele.innerHTML = "";

    SocialCalc.DragUnregister(ele);

    SocialCalc.KeyboardFocus();

    if (ele.parentNode) {
      ele.parentNode.removeChild(ele);
    }
  };

  SocialCalc.SpreadsheetControl.DoFunctionPaste = function () {
    var spreadsheet = SocialCalc.GetSpreadsheetControlObject();
    var editor = spreadsheet.editor;
    var ele = document.getElementById(spreadsheet.idPrefix + "functionname");
    var mele = document.getElementById(
      spreadsheet.idPrefix + "multilinetextarea"
    );

    var text = ele.value + "(";

    SocialCalc.SpreadsheetControl.HideFunctions();

    if (mele) {
      // multi-line editing is in progress
      mele.value += text;
      mele.focus();
      SocialCalc.CmdGotFocus(mele);
    } else {
      editor.EditorAddToInput(text, "=");
    }
  };

  SocialCalc.SpreadsheetControl.DoMultiline = function () {
    var SCLocSS = SocialCalc.LocalizeSubstrings;

    var str, ele, text;

    var scc = SocialCalc.Constants;
    var spreadsheet = SocialCalc.GetSpreadsheetControlObject();
    var editor = spreadsheet.editor;
    var wval = editor.workingvalues;

    var spreadsheet = SocialCalc.GetSpreadsheetControlObject();
    var idp = spreadsheet.idPrefix + "multiline";

    ele = document.getElementById(idp + "dialog");
    if (ele) return; // already have one

    switch (editor.state) {
      case "start":
        wval.ecoord = editor.ecell.coord;
        wval.erow = editor.ecell.row;
        wval.ecol = editor.ecell.col;
        editor.RangeRemove();
        text = SocialCalc.GetCellContents(editor.context.sheetobj, wval.ecoord);
        break;

      case "input":
      case "inputboxdirect":
        text = editor.inputBox.GetText();
        break;
    }

    editor.inputBox.element.disabled = true;

    text = SocialCalc.special_chars(text);

    str =
      '<textarea id="' +
      idp +
      'textarea" style="width:380px;height:120px;margin:10px 0px 0px 6px;">' +
      text +
      "</textarea>" +
      '<div style="width:380px;text-align:right;padding:6px 0px 4px 6px;font-size:small;">' +
      SCLocSS(
        '<input type="button" value="%loc!Set Cell Contents!" style="font-size:smaller;" onclick="SocialCalc.SpreadsheetControl.DoMultilinePaste();">&nbsp;' +
        '<input type="button" value="%loc!Clear!" style="font-size:smaller;" onclick="SocialCalc.SpreadsheetControl.DoMultilineClear();">&nbsp;' +
        '<input type="button" value="%loc!Cancel!" style="font-size:smaller;" onclick="SocialCalc.SpreadsheetControl.HideMultiline();"></div>' +
        "</div>"
      );

    var main = document.createElement("div");
    main.id = idp + "dialog";

    main.style.position = "absolute";

    var vp = SocialCalc.GetViewportInfo();

    main.style.top = vp.height / 3 + "px";
    main.style.left = vp.width / 3 + "px";
    main.style.zIndex = 100;
    main.style.backgroundColor = "#FFF";
    main.style.border = "1px solid black";

    main.style.width = "400px";

    main.innerHTML =
      '<table cellspacing="0" cellpadding="0" style="border-bottom:1px solid black;"><tr>' +
      '<td style="font-size:10px;cursor:default;width:100%;background-color:#999;color:#FFF;">' +
      SCLocSS("&nbsp;%loc!Multi-line Input Box!") +
      "</td>" +
      '<td style="font-size:10px;cursor:default;color:#666;" onclick="SocialCalc.SpreadsheetControl.HideMultiline();">&nbsp;X&nbsp;</td></tr></table>' +
      '<div style="background-color:#DDD;">' +
      str +
      "</div>";

    SocialCalc.DragRegister(
      main.firstChild.firstChild.firstChild.firstChild,
      true,
      true,
      {
        MouseDown: SocialCalc.DragFunctionStart,
        MouseMove: SocialCalc.DragFunctionPosition,
        MouseUp: SocialCalc.DragFunctionPosition,
        Disabled: null,
        positionobj: main,
      }
    );

    spreadsheet.spreadsheetDiv.appendChild(main);

    ele = document.getElementById(idp + "textarea");
    ele.focus();
    SocialCalc.CmdGotFocus(ele);
    //!!! need to do keyboard handling: if esc, hide?
  };

  SocialCalc.SpreadsheetControl.HideMultiline = function () {
    var scc = SocialCalc.Constants;
    var spreadsheet = SocialCalc.GetSpreadsheetControlObject();
    var editor = spreadsheet.editor;

    var ele = document.getElementById(spreadsheet.idPrefix + "multilinedialog");
    ele.innerHTML = "";

    SocialCalc.DragUnregister(ele);

    SocialCalc.KeyboardFocus();

    if (ele.parentNode) {
      ele.parentNode.removeChild(ele);
    }

    switch (editor.state) {
      case "start":
        editor.inputBox.DisplayCellContents(null);
        break;

      case "input":
      case "inputboxdirect":
        editor.inputBox.element.disabled = false;
        editor.inputBox.Focus();
        break;
    }
  };

  SocialCalc.SpreadsheetControl.DoMultilineClear = function () {
    var spreadsheet = SocialCalc.GetSpreadsheetControlObject();

    var ele = document.getElementById(
      spreadsheet.idPrefix + "multilinetextarea"
    );

    ele.value = "";
    ele.focus();
  };

  SocialCalc.SpreadsheetControl.DoMultilinePaste = function () {
    var spreadsheet = SocialCalc.GetSpreadsheetControlObject();
    var editor = spreadsheet.editor;
    var wval = editor.workingvalues;

    var ele = document.getElementById(
      spreadsheet.idPrefix + "multilinetextarea"
    );

    var text = ele.value;

    SocialCalc.SpreadsheetControl.HideMultiline();

    switch (editor.state) {
      case "start":
        wval.partialexpr = "";
        wval.ecoord = editor.ecell.coord;
        wval.erow = editor.ecell.row;
        wval.ecol = editor.ecell.col;
        break;
      case "input":
      case "inputboxdirect":
        editor.inputBox.Blur();
        editor.inputBox.ShowInputBox(false);
        editor.state = "start";
        break;
    }

    editor.EditorSaveEdit(text);
  };

  SocialCalc.SpreadsheetControl.DoLink = function () {
    var SCLoc = SocialCalc.LocalizeString;

    var str, ele, text, cell, setformat, popup;

    var scc = SocialCalc.Constants;
    var spreadsheet = SocialCalc.GetSpreadsheetControlObject();
    var editor = spreadsheet.editor;
    var wval = editor.workingvalues;

    var spreadsheet = SocialCalc.GetSpreadsheetControlObject();
    var idp = spreadsheet.idPrefix + "link";

    ele = document.getElementById(idp + "dialog");
    if (ele) return; // already have one

    switch (editor.state) {
      case "start":
        wval.ecoord = editor.ecell.coord;
        wval.erow = editor.ecell.row;
        wval.ecol = editor.ecell.col;
        editor.RangeRemove();
        text = SocialCalc.GetCellContents(editor.context.sheetobj, wval.ecoord);
        break;

      case "input":
      case "inputboxdirect":
        text = editor.inputBox.GetText();
        break;
    }

    editor.inputBox.element.disabled = true;

    if (text.charAt(0) == "'") {
      text = text.slice(1);
    }

    var parts = SocialCalc.ParseCellLinkText(text);

    text = SocialCalc.special_chars(text);

    cell = spreadsheet.sheet.cells[editor.ecell.coord];
    if (!cell || !cell.textvalueformat) {
      // set to link format, but don't override
      setformat = " checked";
    } else {
      setformat = "";
    }

    popup = parts.newwin ? " checked" : "";

    str =
      '<div style="padding:6px 0px 4px 6px;">' +
      '<span style="font-size:smaller;">' +
      SCLoc("Description") +
      "</span><br>" +
      '<input type="text" id="' +
      idp +
      'desc" style="width:380px;" value="' +
      SocialCalc.special_chars(parts.desc) +
      '"><br>' +
      '<span style="font-size:smaller;">' +
      SCLoc("URL") +
      "</span><br>" +
      '<input type="text" id="' +
      idp +
      'url" style="width:380px;" value="' +
      SocialCalc.special_chars(parts.url) +
      '"><br>';
    if (SocialCalc.Callbacks.MakePageLink) {
      // only show if handling pagenames here
      str +=
        '<span style="font-size:smaller;">' +
        SCLoc("Page Name") +
        "</span><br>" +
        '<input type="text" id="' +
        idp +
        'pagename" style="width:380px;" value="' +
        SocialCalc.special_chars(parts.pagename) +
        '"><br>' +
        '<span style="font-size:smaller;">' +
        SCLoc("Workspace") +
        "</span><br>" +
        '<input type="text" id="' +
        idp +
        'workspace" style="width:380px;" value="' +
        SocialCalc.special_chars(parts.workspace) +
        '"><br>';
    }
    str += SocialCalc.LocalizeSubstrings(
      '<input type="checkbox" id="' +
      idp +
      'format"' +
      setformat +
      ">&nbsp;" +
      '<span style="font-size:smaller;">%loc!Set to Link format!</span><br>' +
      '<input type="checkbox" id="' +
      idp +
      'popup"' +
      popup +
      ">&nbsp;" +
      '<span style="font-size:smaller;">%loc!Show in new browser window!</span>' +
      "</div>" +
      '<div style="width:380px;text-align:right;padding:6px 0px 4px 6px;font-size:small;">' +
      '<input type="button" value="%loc!Set Cell Contents!" style="font-size:smaller;" onclick="SocialCalc.SpreadsheetControl.DoLinkPaste();">&nbsp;' +
      '<input type="button" value="%loc!Clear!" style="font-size:smaller;" onclick="SocialCalc.SpreadsheetControl.DoLinkClear();">&nbsp;' +
      '<input type="button" value="%loc!Cancel!" style="font-size:smaller;" onclick="SocialCalc.SpreadsheetControl.HideLink();"></div>' +
      "</div>"
    );

    var main = document.createElement("div");
    main.id = idp + "dialog";

    main.style.position = "absolute";

    var vp = SocialCalc.GetViewportInfo();

    main.style.top = vp.height / 3 + "px";
    main.style.left = vp.width / 3 + "px";
    main.style.zIndex = 100;
    main.style.backgroundColor = "#FFF";
    main.style.border = "1px solid black";

    main.style.width = "400px";

    main.innerHTML =
      '<table cellspacing="0" cellpadding="0" style="border-bottom:1px solid black;"><tr>' +
      '<td style="font-size:10px;cursor:default;width:100%;background-color:#999;color:#FFF;">' +
      "&nbsp;" +
      SCLoc("Link Input Box") +
      "</td>" +
      '<td style="font-size:10px;cursor:default;color:#666;" onclick="SocialCalc.SpreadsheetControl.HideLink();">&nbsp;X&nbsp;</td></tr></table>' +
      '<div style="background-color:#DDD;">' +
      str +
      "</div>";

    SocialCalc.DragRegister(
      main.firstChild.firstChild.firstChild.firstChild,
      true,
      true,
      {
        MouseDown: SocialCalc.DragFunctionStart,
        MouseMove: SocialCalc.DragFunctionPosition,
        MouseUp: SocialCalc.DragFunctionPosition,
        Disabled: null,
        positionobj: main,
      }
    );

    spreadsheet.spreadsheetDiv.appendChild(main);

    ele = document.getElementById(idp + "url");
    ele.focus();
    SocialCalc.CmdGotFocus(ele);
    //!!! need to do keyboard handling: if esc, hide?
  };

  SocialCalc.SpreadsheetControl.HideLink = function () {
    var scc = SocialCalc.Constants;
    var spreadsheet = SocialCalc.GetSpreadsheetControlObject();
    var editor = spreadsheet.editor;

    var ele = document.getElementById(spreadsheet.idPrefix + "linkdialog");
    ele.innerHTML = "";

    SocialCalc.DragUnregister(ele);

    SocialCalc.KeyboardFocus();

    if (ele.parentNode) {
      ele.parentNode.removeChild(ele);
    }

    switch (editor.state) {
      case "start":
        editor.inputBox.DisplayCellContents(null);
        break;

      case "input":
      case "inputboxdirect":
        editor.inputBox.element.disabled = false;
        editor.inputBox.Focus();
        break;
    }
  };

  SocialCalc.SpreadsheetControl.DoLinkClear = function () {
    var spreadsheet = SocialCalc.GetSpreadsheetControlObject();

    document.getElementById(spreadsheet.idPrefix + "linkdesc").value = "";
    document.getElementById(spreadsheet.idPrefix + "linkpagename").value = "";
    document.getElementById(spreadsheet.idPrefix + "linkworkspace").value = "";

    var ele = document.getElementById(spreadsheet.idPrefix + "linkurl");
    ele.value = "";
    ele.focus();
  };

  SocialCalc.SpreadsheetControl.DoLinkPaste = function () {
    var spreadsheet = SocialCalc.GetSpreadsheetControlObject();
    var editor = spreadsheet.editor;
    var wval = editor.workingvalues;

    var descele = document.getElementById(spreadsheet.idPrefix + "linkdesc");
    var urlele = document.getElementById(spreadsheet.idPrefix + "linkurl");
    var pagenameele = document.getElementById(
      spreadsheet.idPrefix + "linkpagename"
    );
    var workspaceele = document.getElementById(
      spreadsheet.idPrefix + "linkworkspace"
    );
    var formatele = document.getElementById(
      spreadsheet.idPrefix + "linkformat"
    );
    var popupele = document.getElementById(spreadsheet.idPrefix + "linkpopup");

    var text = "";

    var ltsym, gtsym, obsym, cbsym;

    if (popupele.checked) {
      ltsym = "<<";
      gtsym = ">>";
      obsym = "[[";
      cbsym = "]]";
    } else {
      ltsym = "<";
      gtsym = ">";
      obsym = "[";
      cbsym = "]";
    }

    if (pagenameele && pagenameele.value) {
      if (workspaceele.value) {
        text =
          descele.value +
          "{" +
          workspaceele.value +
          obsym +
          pagenameele.value +
          cbsym +
          "}";
      } else {
        text = descele.value + obsym + pagenameele.value + cbsym;
      }
    } else {
      text = descele.value + ltsym + urlele.value + gtsym;
    }

    SocialCalc.SpreadsheetControl.HideLink();

    switch (editor.state) {
      case "start":
        wval.partialexpr = "";
        wval.ecoord = editor.ecell.coord;
        wval.erow = editor.ecell.row;
        wval.ecol = editor.ecell.col;
        break;
      case "input":
      case "inputboxdirect":
        editor.inputBox.Blur();
        editor.inputBox.ShowInputBox(false);
        editor.state = "start";
        break;
    }

    if (formatele.checked) {
      SocialCalc.SpreadsheetControlExecuteCommand(
        null,
        "set %C textvalueformat text-link",
        ""
      );
    }

    editor.EditorSaveEdit(text);
  };

  SocialCalc.SpreadsheetControl.DoSum = function () {
    var cmd, cell, row, col, sel, cr, foundvalue;

    var spreadsheet = SocialCalc.GetSpreadsheetControlObject();
    var editor = spreadsheet.editor;
    var sheet = editor.context.sheetobj;

    if (editor.range.hasrange) {
      sel =
        SocialCalc.crToCoord(editor.range.left, editor.range.top) +
        ":" +
        SocialCalc.crToCoord(editor.range.right, editor.range.bottom);
      cmd =
        "set " +
        SocialCalc.crToCoord(editor.range.right, editor.range.bottom + 1) +
        " formula sum(" +
        sel +
        ")";
    } else {
      row = editor.ecell.row - 1;
      col = editor.ecell.col;
      if (row <= 1) {
        cmd = "set " + editor.ecell.coord + " constant e#REF! 0 #REF!";
      } else {
        foundvalue = false;
        while (row > 0) {
          cr = SocialCalc.crToCoord(col, row);
          cell = sheet.GetAssuredCell(cr);
          if (!cell.datatype || cell.datatype == "t") {
            if (foundvalue) {
              row++;
              break;
            }
          } else {
            foundvalue = true;
          }
          row--;
        }
        cmd =
          "set " +
          editor.ecell.coord +
          " formula sum(" +
          SocialCalc.crToCoord(col, row) +
          ":" +
          SocialCalc.crToCoord(col, editor.ecell.row - 1) +
          ")";
      }
    }

    editor.EditorScheduleSheetCommands(cmd, true, false);
  };

  //
  // TAB Routines
  //

  // Sort

  SocialCalc.SpreadsheetControlSortOnclick = function (s, t) {
    var name, i;
    var namelist = [];
    var nl = document.getElementById(s.idPrefix + "sortlist");
    SocialCalc.LoadColumnChoosers(s);
    s.editor.RangeChangeCallback.sort = SocialCalc.UpdateSortRangeProposal;

    for (name in s.sheet.names) {
      namelist.push(name);
    }
    namelist.sort();
    nl.length = 0;
    nl.options[0] = new Option(SocialCalc.LocalizeString("[select range]"));
    for (i = 0; i < namelist.length; i++) {
      name = namelist[i];
      nl.options[i + 1] = new Option(name, name);
      if (name == s.sortrange) {
        nl.options[i + 1].selected = true;
      }
    }
    if (s.sortrange == "") {
      nl.options[0].selected = true;
    }

    SocialCalc.UpdateSortRangeProposal(s.editor);
    SocialCalc.KeyboardFocus();
    return;
  };

  SocialCalc.SpreadsheetControlSortSave = function (editor, setting) {
    // Format is:
    //    sort:sortrange:major:up/down:minor:up/down:last:up/down

    var spreadsheet = SocialCalc.GetSpreadsheetControlObject();
    var str, sele, rele;

    str = "sort:" + SocialCalc.encodeForSave(spreadsheet.sortrange) + ":";
    sele = document.getElementById(spreadsheet.idPrefix + "majorsort");
    rele = document.getElementById(spreadsheet.idPrefix + "majorsortup");
    str += sele.selectedIndex + (rele.checked ? ":up" : ":down");
    sele = document.getElementById(spreadsheet.idPrefix + "minorsort");
    if (sele.selectedIndex > 0) {
      rele = document.getElementById(spreadsheet.idPrefix + "minorsortup");
      str += ":" + sele.selectedIndex + (rele.checked ? ":up" : ":down");
    } else {
      str += "::";
    }
    sele = document.getElementById(spreadsheet.idPrefix + "lastsort");
    if (sele.selectedIndex > 0) {
      rele = document.getElementById(spreadsheet.idPrefix + "lastsortup");
      str += ":" + sele.selectedIndex + (rele.checked ? ":up" : ":down");
    } else {
      str += "::";
    }
    return str + "\n";
  };

  SocialCalc.SpreadsheetControlSortLoad = function (
    editor,
    setting,
    line,
    flags
  ) {
    var parts, ele;

    var spreadsheet = SocialCalc.GetSpreadsheetControlObject();

    parts = line.split(":");
    spreadsheet.sortrange = SocialCalc.decodeFromSave(parts[1]);
    ele = document.getElementById(spreadsheet.idPrefix + "sortbutton");
    if (spreadsheet.sortrange) {
      ele.value = SocialCalc.LocalizeString("Sort ") + spreadsheet.sortrange;
      ele.style.visibility = "visible";
    } else {
      ele.style.visibility = "hidden";
    }
    SocialCalc.LoadColumnChoosers(spreadsheet);

    sele = document.getElementById(spreadsheet.idPrefix + "majorsort");
    sele.selectedIndex = parts[2] - 0;
    document.getElementById(
      spreadsheet.idPrefix + "majorsort" + parts[3]
    ).checked = true;
    sele = document.getElementById(spreadsheet.idPrefix + "minorsort");
    if (parts[4]) {
      sele.selectedIndex = parts[4] - 0;
      document.getElementById(
        spreadsheet.idPrefix + "minorsort" + parts[5]
      ).checked = true;
    } else {
      sele.selectedIndex = 0;
      document.getElementById(
        spreadsheet.idPrefix + "minorsortup"
      ).checked = true;
    }
    sele = document.getElementById(spreadsheet.idPrefix + "lastsort");
    if (parts[6]) {
      sele.selectedIndex = parts[6] - 0;
      document.getElementById(
        spreadsheet.idPrefix + "lastsort" + parts[7]
      ).checked = true;
    } else {
      sele.selectedIndex = 0;
      document.getElementById(
        spreadsheet.idPrefix + "lastsortup"
      ).checked = true;
    }

    return true;
  };

  // Comment

  SocialCalc.SpreadsheetControlCommentOnclick = function (s, t) {
    s.editor.MoveECellCallback.comment =
      SocialCalc.SpreadsheetControlCommentMoveECell;
    SocialCalc.SpreadsheetControlCommentDisplay(s, t);
    SocialCalc.KeyboardFocus();
    return;
  };

  SocialCalc.SpreadsheetControlCommentDisplay = function (s, t) {
    var c = "";
    if (
      s.editor.ecell &&
      s.editor.ecell.coord &&
      s.sheet.cells[s.editor.ecell.coord]
    ) {
      c = s.sheet.cells[s.editor.ecell.coord].comment || "";
    }
    document.getElementById(s.idPrefix + "commenttext").value = c;
  };

  SocialCalc.SpreadsheetControlCommentMoveECell = function (editor) {
    SocialCalc.SpreadsheetControlCommentDisplay(
      SocialCalc.GetSpreadsheetControlObject(),
      "comment"
    );
  };

  SocialCalc.SpreadsheetControlCommentSet = function () {
    var s = SocialCalc.GetSpreadsheetControlObject();
    s.ExecuteCommand(
      "set %C comment " +
      SocialCalc.encodeForSave(
        document.getElementById(s.idPrefix + "commenttext").value
      )
    );
    var cell = SocialCalc.GetEditorCellElement(
      s.editor,
      s.editor.ecell.row,
      s.editor.ecell.col
    );
    s.editor.UpdateCellCSS(cell, s.editor.ecell.row, s.editor.ecell.col);
    SocialCalc.KeyboardFocus();
  };

  SocialCalc.SpreadsheetControlCommentOnunclick = function (s, t) {
    delete s.editor.MoveECellCallback.comment;
  };

  // Names

  SocialCalc.SpreadsheetControlNamesOnclick = function (s, t) {
    document.getElementById(s.idPrefix + "namesname").value = "";
    document.getElementById(s.idPrefix + "namesdesc").value = "";
    document.getElementById(s.idPrefix + "namesvalue").value = "";
    s.editor.RangeChangeCallback.names =
      SocialCalc.SpreadsheetControlNamesRangeChange;
    s.editor.MoveECellCallback.names =
      SocialCalc.SpreadsheetControlNamesRangeChange;
    SocialCalc.SpreadsheetControlNamesRangeChange(s.editor);
    SocialCalc.SpreadsheetControlNamesFillNameList();
    SocialCalc.SpreadsheetControlNamesChangedName();
  };

  SocialCalc.SpreadsheetControlNamesFillNameList = function () {
    var SCLoc = SocialCalc.LocalizeString;
    var name, i;
    var namelist = [];
    var s = SocialCalc.GetSpreadsheetControlObject();
    var nl = document.getElementById(s.idPrefix + "nameslist");
    var currentname = document
      .getElementById(s.idPrefix + "namesname")
      .value.toUpperCase()
      .replace(/[^A-Z0-9_\.]/g, "");
    for (name in s.sheet.names) {
      namelist.push(name);
    }
    namelist.sort();
    nl.length = 0;
    if (namelist.length > 0) {
      nl.options[0] = new Option(SCLoc("[New]"));
    } else {
      nl.options[0] = new Option(SCLoc("[None]"));
    }
    for (i = 0; i < namelist.length; i++) {
      name = namelist[i];
      nl.options[i + 1] = new Option(name, name);
      if (name == currentname) {
        nl.options[i + 1].selected = true;
      }
    }
    if (currentname == "") {
      nl.options[0].selected = true;
    }
  };

  SocialCalc.SpreadsheetControlNamesChangedName = function () {
    var s = SocialCalc.GetSpreadsheetControlObject();
    var nl = document.getElementById(s.idPrefix + "nameslist");
    var name = nl.options[nl.selectedIndex].value;
    if (s.sheet.names[name]) {
      document.getElementById(s.idPrefix + "namesname").value = name;
      document.getElementById(s.idPrefix + "namesdesc").value =
        s.sheet.names[name].desc || "";
      document.getElementById(s.idPrefix + "namesvalue").value =
        s.sheet.names[name].definition || "";
    } else {
      document.getElementById(s.idPrefix + "namesname").value = "";
      document.getElementById(s.idPrefix + "namesdesc").value = "";
      document.getElementById(s.idPrefix + "namesvalue").value = "";
    }
  };

  SocialCalc.SpreadsheetControlNamesRangeChange = function (editor) {
    var s = SocialCalc.GetSpreadsheetControlObject();
    var ele = document.getElementById(s.idPrefix + "namesrangeproposal");
    if (editor.range.hasrange) {
      ele.value =
        SocialCalc.crToCoord(editor.range.left, editor.range.top) +
        ":" +
        SocialCalc.crToCoord(editor.range.right, editor.range.bottom);
    } else {
      ele.value = editor.ecell.coord;
    }
  };

  SocialCalc.SpreadsheetControlNamesOnunclick = function (s, t) {
    delete s.editor.RangeChangeCallback.names;
    delete s.editor.MoveECellCallback.names;
  };

  SocialCalc.SpreadsheetControlNamesSetValue = function () {
    var s = SocialCalc.GetSpreadsheetControlObject();
    document.getElementById(s.idPrefix + "namesvalue").value =
      document.getElementById(s.idPrefix + "namesrangeproposal").value;
    SocialCalc.KeyboardFocus();
  };

  SocialCalc.SpreadsheetControlNamesSave = function () {
    var s = SocialCalc.GetSpreadsheetControlObject();
    var name = document.getElementById(s.idPrefix + "namesname").value;
    SocialCalc.SetTab(s.tabs[0].name); // return to first tab
    SocialCalc.KeyboardFocus();
    if (name != "") {
      s.ExecuteCommand(
        "name define " +
        name +
        " " +
        document.getElementById(s.idPrefix + "namesvalue").value +
        "\n" +
        "name desc " +
        name +
        " " +
        document.getElementById(s.idPrefix + "namesdesc").value
      );
    }
  };

  SocialCalc.SpreadsheetControlNamesDelete = function () {
    var s = SocialCalc.GetSpreadsheetControlObject();
    var name = document.getElementById(s.idPrefix + "namesname").value;
    SocialCalc.SetTab(s.tabs[0].name); // return to first tab
    SocialCalc.KeyboardFocus();
    if (name != "") {
      s.ExecuteCommand("name delete " + name);
      //      document.getElementById(s.idPrefix+"namesname").value = "";
      //      document.getElementById(s.idPrefix+"namesvalue").value = "";
      //      document.getElementById(s.idPrefix+"namesdesc").value = "";
      //      SocialCalc.SpreadsheetControlNamesFillNameList();
    }
    SocialCalc.KeyboardFocus();
  };

  // Clipboard

  SocialCalc.SpreadsheetControlClipboardOnclick = function (s, t) {
    var s = SocialCalc.GetSpreadsheetControlObject();
    clipele = document.getElementById(s.idPrefix + "clipboardtext");
    document.getElementById(s.idPrefix + "clipboardformat-tab").checked = true;
    clipele.value = SocialCalc.ConvertSaveToOtherFormat(
      SocialCalc.Clipboard.clipboard,
      "tab"
    );
    return;
  };

  SocialCalc.SpreadsheetControlClipboardFormat = function (which) {
    var s = SocialCalc.GetSpreadsheetControlObject();
    clipele = document.getElementById(s.idPrefix + "clipboardtext");
    clipele.value = SocialCalc.ConvertSaveToOtherFormat(
      SocialCalc.Clipboard.clipboard,
      which
    );
  };

  SocialCalc.SpreadsheetControlClipboardLoad = function () {
    var s = SocialCalc.GetSpreadsheetControlObject();
    var savetype = "tab";
    SocialCalc.SetTab(s.tabs[0].name); // return to first tab
    SocialCalc.KeyboardFocus();
    if (document.getElementById(s.idPrefix + "clipboardformat-csv").checked) {
      savetype = "csv";
    } else if (
      document.getElementById(s.idPrefix + "clipboardformat-scsave").checked
    ) {
      savetype = "scsave";
    }
    s.editor.EditorScheduleSheetCommands(
      "loadclipboard " +
      SocialCalc.encodeForSave(
        SocialCalc.ConvertOtherFormatToSave(
          document.getElementById(s.idPrefix + "clipboardtext").value,
          savetype
        )
      ),
      true,
      false
    );
  };

  SocialCalc.SpreadsheetControlClipboardClear = function () {
    var s = SocialCalc.GetSpreadsheetControlObject();
    var clipele = document.getElementById(s.idPrefix + "clipboardtext");
    clipele.value = "";
    s.editor.EditorScheduleSheetCommands("clearclipboard", true, false);
    clipele.focus();
  };

  SocialCalc.SpreadsheetControlClipboardExport = function () {
    var s = SocialCalc.GetSpreadsheetControlObject();
    if (s.ExportCallback) {
      s.ExportCallback(s);
    }
    SocialCalc.SetTab(s.tabs[0].name); // return to first tab
    SocialCalc.KeyboardFocus();
  };

  // Settings

  SocialCalc.SpreadsheetControlSettingsSwitch = function (target) {
    SocialCalc.SettingControlReset();
    var s = SocialCalc.GetSpreadsheetControlObject();
    var sheettable = document.getElementById(s.idPrefix + "sheetsettingstable");
    var celltable = document.getElementById(s.idPrefix + "cellsettingstable");
    var sheettoolbar = document.getElementById(
      s.idPrefix + "sheetsettingstoolbar"
    );
    var celltoolbar = document.getElementById(
      s.idPrefix + "cellsettingstoolbar"
    );
    if (target == "sheet") {
      sheettable.style.display = "block";
      celltable.style.display = "none";
      sheettoolbar.style.display = "block";
      celltoolbar.style.display = "none";
      SocialCalc.SettingsControlSetCurrentPanel(
        s.views.settings.values.sheetspanel
      );
    } else {
      sheettable.style.display = "none";
      celltable.style.display = "block";
      sheettoolbar.style.display = "none";
      celltoolbar.style.display = "block";
      SocialCalc.SettingsControlSetCurrentPanel(
        s.views.settings.values.cellspanel
      );
    }
  };

  SocialCalc.SettingsControlSave = function (target) {
    var range, cmdstr;
    var s = SocialCalc.GetSpreadsheetControlObject();
    var sc = SocialCalc.SettingsControls;
    var panelobj = sc.CurrentPanel;
    var attribs = SocialCalc.SettingsControlUnloadPanel(panelobj);

    SocialCalc.SetTab(s.tabs[0].name); // return to first tab
    SocialCalc.KeyboardFocus();

    if (target == "sheet") {
      cmdstr = s.sheet.DecodeSheetAttributes(attribs);
    } else if (target == "cell") {
      if (s.editor.range.hasrange) {
        range =
          SocialCalc.crToCoord(s.editor.range.left, s.editor.range.top) +
          ":" +
          SocialCalc.crToCoord(s.editor.range.right, s.editor.range.bottom);
      }
      cmdstr = s.sheet.DecodeCellAttributes(
        s.editor.ecell.coord,
        attribs,
        range
      );
    } else {
      // Cancel
    }
    if (cmdstr) {
      s.editor.EditorScheduleSheetCommands(cmdstr, true, false);
    }
  };

  ///////////////////////
  //
  // SAVE / LOAD ROUTINES
  //
  ///////////////////////

  //
  // result = SocialCalc.SpreadsheetControlCreateSpreadsheetSave(spreadsheet, otherparts)
  //
  // Saves the spreadsheet's sheet data, editor settings, and audit trail (redo stack).
  // The serialized data strings are concatenated together in multi-part MIME format.
  // The first part lists the types of the subsequent parts (e.g., "sheet", "editor", and "audit")
  // in this format:
  //   # comments
  //   version:1.0
  //   part:type1
  //   part:type2
  //   ...
  //
  // If otherparts is non-null, it is an object with:
  //   partname1: "part contents - should end with \n",
  //   partname2: "part contents - should end with \n"
  //

  SocialCalc.SpreadsheetControlCreateSpreadsheetSave = function (
    spreadsheet,
    otherparts
  ) {
    var result;

    var otherpartsstr = "";
    var otherpartsnames = "";
    var partname, extranl;

    if (otherparts) {
      for (partname in otherparts) {
        if (otherparts[partname].charAt(otherparts[partname] - 1) != "\n") {
          extranl = "\n";
        } else {
          extranl = "";
        }
        otherpartsstr +=
          "--" +
          spreadsheet.multipartBoundary +
          "\nContent-type: text/plain; charset=UTF-8\n\n" +
          otherparts[partname] +
          extranl;
        otherpartsnames += "part:" + partname + "\n";
      }
    }

    result =
      "socialcalc:version:1.0\n" +
      "MIME-Version: 1.0\nContent-Type: multipart/mixed; boundary=" +
      spreadsheet.multipartBoundary +
      "\n" +
      "--" +
      spreadsheet.multipartBoundary +
      "\nContent-type: text/plain; charset=UTF-8\n\n" +
      "# SocialCalc Spreadsheet Control Save\nversion:1.0\npart:sheet\npart:edit\npart:audit\n" +
      otherpartsnames +
      "--" +
      spreadsheet.multipartBoundary +
      "\nContent-type: text/plain; charset=UTF-8\n\n" +
      spreadsheet.CreateSheetSave() +
      "--" +
      spreadsheet.multipartBoundary +
      "\nContent-type: text/plain; charset=UTF-8\n\n" +
      spreadsheet.editor.SaveEditorSettings() +
      "--" +
      spreadsheet.multipartBoundary +
      "\nContent-type: text/plain; charset=UTF-8\n\n" +
      spreadsheet.sheet.CreateAuditString() +
      otherpartsstr +
      "--" +
      spreadsheet.multipartBoundary +
      "--\n";

    return result;
  };

  //
  // parts = SocialCalc.SpreadsheetControlDecodeSpreadsheetSave(spreadsheet, str)
  //
  // Separates the parts from a spreadsheet save string, returning an object with the sub-strings.
  //
  //    {type1: {start: startpos, end: endpos}, type2:...}
  //

  SocialCalc.SpreadsheetControlDecodeSpreadsheetSave = function (
    spreadsheet,
    str
  ) {
    var pos1,
      mpregex,
      searchinfo,
      boundary,
      boundaryregex,
      blanklineregex,
      start,
      ending,
      lines,
      i,
      lines,
      p,
      pnun;
    var parts = {};
    var partlist = [];

    pos1 = str.search(/^MIME-Version:\s1\.0/im);
    if (pos1 < 0) return parts;

    mpregex = /^Content-Type:\s*multipart\/mixed;\s*boundary=(\S+)/gim;
    mpregex.lastIndex = pos1;

    searchinfo = mpregex.exec(str);
    if (mpregex.lastIndex <= 0) return parts;
    boundary = searchinfo[1];

    boundaryregex = new RegExp("^--" + boundary + "(?:\r\n|\n)", "mg");
    boundaryregex.lastIndex = mpregex.lastIndex;

    searchinfo = boundaryregex.exec(str); // find header top boundary
    blanklineregex = /(?:\r\n|\n)(?:\r\n|\n)/gm;
    blanklineregex.lastIndex = boundaryregex.lastIndex;
    searchinfo = blanklineregex.exec(str); // skip to after blank line
    if (!searchinfo) return parts;
    start = blanklineregex.lastIndex;
    boundaryregex.lastIndex = start;
    searchinfo = boundaryregex.exec(str); // find end of header
    if (!searchinfo) return parts;
    ending = searchinfo.index;

    lines = str.substring(start, ending).split(/\r\n|\n/); // get header as lines
    for (i = 0; i < lines.length; i++) {
      line = lines[i];
      p = line.split(":");
      switch (p[0]) {
        case "version":
          break;
        case "part":
          partlist.push(p[1]);
          break;
      }
    }

    for (pnum = 0; pnum < partlist.length; pnum++) {
      // get each part
      blanklineregex.lastIndex = ending;
      searchinfo = blanklineregex.exec(str); // find blank line ending mime-part header
      if (!searchinfo) return parts;
      start = blanklineregex.lastIndex;
      if (pnum == partlist.length - 1) {
        // last one has different boundary
        boundaryregex = new RegExp("^--" + boundary + "--$", "mg");
      }
      boundaryregex.lastIndex = start;
      searchinfo = boundaryregex.exec(str); // find ending boundary
      if (!searchinfo) return parts;
      ending = searchinfo.index;
      parts[partlist[pnum]] = { start: start, end: ending }; // return position within full string
    }

    return parts;
  };

  /*
   * SettingsControls
   *
   * Each settings panel has an object in the following form:
   *
   *    {ctrl-name1: {setting: setting-nameA, type: ctrl-type, id: id-component},
   *     ctrl-name2: {setting: setting-nameB, type: ctrl-type, id: id-component, initialdata: optional-initialdata-override},
   *     ...}
   *
   * The ctrl-types are names that correspond to:
   *
   *    SocialCalc.SettingsControls.Controls = {
   *       ctrl-type1: {
   *          SetValue: function(panel-obj, ctrl-name, {def: true/false, val: value}) {...;},
   *          ColorValues: if true, Onchanged converts between hex and RGB
   *          GetValue: function(panel-obj, ctrl-name) {...return {def: true/false, val: value};},
   *          Initialize: function(panel-obj, ctrl-name) {...;}, // used to fill dropdowns, etc.
   *          InitialData: control-dependent, // used by Initialize (if no panel ctrlname.initialdata)
   *          OnReset: function(ctrl-name) {...;}, // called to put down popups, etc.
   *          ChangedCallback: function(ctrl-name) {...;} // if not null, called by control when user changes value
   *       }
   *
   */

  SocialCalc.SettingsControls = {
    Controls: {},
    CurrentPanel: null, // panel object to search on events
  };

  //
  // SocialCalc.SettingsControlSetCurrentPanel(panel-object)
  //

  SocialCalc.SettingsControlSetCurrentPanel = function (panelobj) {
    SocialCalc.SettingsControls.CurrentPanel = panelobj;

    SocialCalc.SettingsControls.PopupChangeCallback(
      { panelobj: panelobj },
      "",
      null
    );
  };

  //
  // SocialCalc.SettingsControlInitializePanel(panel-object)
  //

  SocialCalc.SettingsControlInitializePanel = function (panelobj) {
    var ctrlname;
    var sc = SocialCalc.SettingsControls;
    var ctrl;

    for (ctrlname in panelobj) {
      if (ctrlname == "name") continue;
      ctrl = sc.Controls[panelobj[ctrlname].type];
      if (ctrl && ctrl.Initialize) ctrl.Initialize(panelobj, ctrlname);
    }
  };

  //
  // SocialCalc.SettingsControlLoadPanel(panel-object, attribs)
  //

  SocialCalc.SettingsControlLoadPanel = function (panelobj, attribs) {
    var ctrlname;
    var sc = SocialCalc.SettingsControls;

    for (ctrlname in panelobj) {
      if (ctrlname == "name") continue;
      ctrl = sc.Controls[panelobj[ctrlname].type];
      if (ctrl && ctrl.SetValue)
        ctrl.SetValue(panelobj, ctrlname, attribs[panelobj[ctrlname].setting]);
    }
  };

  //
  // attribs = SocialCalc.SettingsControlUnloadPanel(panel-object)
  //

  SocialCalc.SettingsControlUnloadPanel = function (panelobj) {
    var ctrlname;
    var sc = SocialCalc.SettingsControls;
    var attribs = {};

    for (ctrlname in panelobj) {
      if (ctrlname == "name") continue;
      ctrl = sc.Controls[panelobj[ctrlname].type];
      if (ctrl && ctrl.GetValue)
        attribs[panelobj[ctrlname].setting] = ctrl.GetValue(panelobj, ctrlname);
    }

    return attribs;
  };

  //
  // SocialCalc.SettingsControls.PopupChangeCallback
  //

  SocialCalc.SettingsControls.PopupChangeCallback = function (
    attribs,
    id,
    value
  ) {
    var sc = SocialCalc.Constants;

    var ele = document.getElementById("sample-text");

    if (!ele || !attribs || !attribs.panelobj) return;

    var idPrefix = SocialCalc.CurrentSpreadsheetControlObject.idPrefix;

    var c = attribs.panelobj.name == "cell" ? "c" : "";

    var v, a, parts, str1, str2, i;

    parts =
      sc.defaultCellLayout.match(
        /^padding.(\S+) (\S+) (\S+) (\S+).vertical.align.(\S+);$/
      ) || [];

    var cv = {
      color: ["textcolor"],
      backgroundColor: ["bgcolor", "#FFF"],
      fontSize: ["fontsize", sc.defaultCellFontSize],
      fontFamily: ["fontfamily"],
      paddingTop: ["padtop", parts[1]],
      paddingRight: ["padright", parts[2]],
      paddingBottom: ["padbottom", parts[3]],
      paddingLeft: ["padleft", parts[4]],
      verticalAlign: ["alignvert", parts[5]],
    };

    for (a in cv) {
      v = SocialCalc.Popup.GetValue(idPrefix + c + cv[a][0]) || cv[a][1] || "";
      ele.style[a] = v;
    }

    if (c == "c") {
      cv = {
        borderTop: "cbt",
        borderRight: "cbr",
        borderBottom: "cbb",
        borderLeft: "cbl",
      };
      for (a in cv) {
        v = SocialCalc.SettingsControls.BorderSideGetValue(
          attribs.panelobj,
          cv[a]
        );
        ele.style[a] = v ? v.val || "" : "";
      }
      v = SocialCalc.Popup.GetValue(idPrefix + "calignhoriz");
      ele.style.textAlign = v || "left";
      ele.childNodes[1].style.textAlign = v || "right";
    } else {
      ele.style.border = "";
      v = SocialCalc.Popup.GetValue(idPrefix + "textalignhoriz");
      ele.style.textAlign = v || "left";
      v = SocialCalc.Popup.GetValue(idPrefix + "numberalignhoriz");
      ele.childNodes[1].style.textAlign = v || "right";
    }

    v = SocialCalc.Popup.GetValue(idPrefix + c + "fontlook");
    parts = v ? v.match(/^(\S+) (\S+)$/) || [] : [];
    ele.style.fontStyle = parts[1] || "";
    ele.style.fontWeight = parts[2] || "";

    v = SocialCalc.Popup.GetValue(idPrefix + c + "formatnumber") || "General";
    str1 = SocialCalc.FormatNumber.formatNumberWithFormat(9.8765, v, "");
    str2 = SocialCalc.FormatNumber.formatNumberWithFormat(-1234.5, v, "");
    if (str2 != "??-???-??&nbsp;??:??:??") {
      // not bad date from negative number
      str1 += "<br>" + str2;
    }

    ele.childNodes[1].innerHTML = str1;
  };

  //
  // PopupList Control
  //

  SocialCalc.SettingsControls.PopupListSetValue = function (
    panelobj,
    ctrlname,
    value
  ) {
    if (!value) {
      alert(ctrlname + " no value");
      return;
    }

    var sp = SocialCalc.Popup;

    if (!value.def) {
      sp.SetValue(panelobj[ctrlname].id, value.val);
    } else {
      sp.SetValue(panelobj[ctrlname].id, "");
    }
  };

  //
  // SocialCalc.SettingsControls.PopupListGetValue
  //

  SocialCalc.SettingsControls.PopupListGetValue = function (
    panelobj,
    ctrlname
  ) {
    var ctl = panelobj[ctrlname];
    if (!ctl) return null;

    var value = SocialCalc.Popup.GetValue(ctl.id);
    if (value) {
      return { def: false, val: value };
    } else {
      return { def: true, val: 0 };
    }
  };

  //
  // SocialCalc.SettingsControls.PopupListInitialize
  //

  SocialCalc.SettingsControls.PopupListInitialize = function (
    panelobj,
    ctrlname
  ) {
    var i, val, pos, otext;
    var sc = SocialCalc.SettingsControls;
    var initialdata =
      panelobj[ctrlname].initialdata ||
      sc.Controls[panelobj[ctrlname].type].InitialData ||
      "";
    initialdata = SocialCalc.LocalizeSubstrings(initialdata);
    var optionvals = initialdata.split(/\|/);

    var options = [];

    for (i = 0; i < (optionvals.length || 0); i++) {
      val = optionvals[i];
      pos = val.indexOf(":");
      otext = val.substring(0, pos);
      if (otext.indexOf("\\") != -1) {
        // escape any colons
        otext = otext.replace(/\\c/g, ":");
        otext = otext.replace(/\\b/g, "\\");
      }
      otext = SocialCalc.special_chars(otext);
      if (otext == "[custom]") {
        options[i] = {
          o: SocialCalc.Constants.s_PopupListCustom,
          v: val.substring(pos + 1),
          a: { custom: true },
        };
      } else if (otext == "[cancel]") {
        options[i] = {
          o: SocialCalc.Constants.s_PopupListCancel,
          v: "",
          a: { cancel: true },
        };
      } else if (otext == "[break]") {
        options[i] = { o: "-----", v: "", a: { skip: true } };
      } else if (otext == "[newcol]") {
        options[i] = { o: "", v: "", a: { newcol: true } };
      } else {
        options[i] = { o: otext, v: val.substring(pos + 1) };
      }
    }

    SocialCalc.Popup.Create("List", panelobj[ctrlname].id, {});
    SocialCalc.Popup.Initialize(panelobj[ctrlname].id, {
      options: options,
      attribs: {
        changedcallback: SocialCalc.SettingsControls.PopupChangeCallback,
        panelobj: panelobj,
      },
    });
  };

  //
  // SocialCalc.SettingsControls.PopupListReset
  //

  SocialCalc.SettingsControls.PopupListReset = function (ctrlname) {
    SocialCalc.Popup.Reset("List");
  };

  SocialCalc.SettingsControls.Controls.PopupList = {
    SetValue: SocialCalc.SettingsControls.PopupListSetValue,
    GetValue: SocialCalc.SettingsControls.PopupListGetValue,
    Initialize: SocialCalc.SettingsControls.PopupListInitialize,
    OnReset: SocialCalc.SettingsControls.PopupListReset,
    ChangedCallback: null,
  };

  //
  // ColorChooser Control
  //

  SocialCalc.SettingsControls.ColorChooserSetValue = function (
    panelobj,
    ctrlname,
    value
  ) {
    if (!value) {
      alert(ctrlname + " no value");
      return;
    }

    var sp = SocialCalc.Popup;

    if (!value.def) {
      sp.SetValue(panelobj[ctrlname].id, value.val);
    } else {
      sp.SetValue(panelobj[ctrlname].id, "");
    }
  };

  //
  // SocialCalc.SettingsControls.ColorChooserGetValue
  //

  SocialCalc.SettingsControls.ColorChooserGetValue = function (
    panelobj,
    ctrlname
  ) {
    var value = SocialCalc.Popup.GetValue(panelobj[ctrlname].id);
    if (value) {
      return { def: false, val: value };
    } else {
      return { def: true, val: 0 };
    }
  };

  //
  // SocialCalc.SettingsControls.ColorChooserInitialize
  //

  SocialCalc.SettingsControls.ColorChooserInitialize = function (
    panelobj,
    ctrlname
  ) {
    var i, val, pos, otext;
    var sc = SocialCalc.SettingsControls;

    SocialCalc.Popup.Create("ColorChooser", panelobj[ctrlname].id, {});
    SocialCalc.Popup.Initialize(panelobj[ctrlname].id, {
      attribs: {
        title: "&nbsp;",
        moveable: true,
        width: "106px",
        changedcallback: SocialCalc.SettingsControls.PopupChangeCallback,
        panelobj: panelobj,
      },
    });
  };

  //
  // SocialCalc.SettingsControls.ColorChooserReset
  //

  SocialCalc.SettingsControls.ColorChooserReset = function (ctrlname) {
    SocialCalc.Popup.Reset("ColorChooser");
  };

  SocialCalc.SettingsControls.Controls.ColorChooser = {
    SetValue: SocialCalc.SettingsControls.ColorChooserSetValue,
    GetValue: SocialCalc.SettingsControls.ColorChooserGetValue,
    Initialize: SocialCalc.SettingsControls.ColorChooserInitialize,
    OnReset: SocialCalc.SettingsControls.ColorChooserReset,
    ChangedCallback: null,
  };

  //
  // SocialCalc.SettingsControls.BorderSideSetValue
  //

  SocialCalc.SettingsControls.BorderSideSetValue = function (
    panelobj,
    ctrlname,
    value
  ) {
    var sc = SocialCalc.SettingsControls;
    var ele, found, idname, parts;
    var idstart = panelobj[ctrlname].id;

    if (!value) {
      alert(ctrlname + " no value");
      return;
    }

    ele = document.getElementById(idstart + "-onoff-bcb"); // border checkbox
    if (!ele) return;

    if (value.val) {
      // border does not use default: it looks only to the value currently
      ele.checked = true;
      ele.value = value.val;
      parts = value.val.match(/(\S+)\s+(\S+)\s+(\S.+)/);
      idname = idstart + "-color";
      SocialCalc.Popup.SetValue(idname, parts[3]);
      SocialCalc.Popup.SetDisabled(idname, false);
    } else {
      ele.checked = false;
      ele.value = value.val;
      idname = idstart + "-color";
      SocialCalc.Popup.SetValue(idname, "");
      SocialCalc.Popup.SetDisabled(idname, true);
    }
  };

  //
  // SocialCalc.SettingsControls.BorderSideGetValue
  //

  SocialCalc.SettingsControls.BorderSideGetValue = function (
    panelobj,
    ctrlname
  ) {
    var sc = SocialCalc.SettingsControls;
    var ele, value;
    var idstart = panelobj[ctrlname].id;

    ele = document.getElementById(idstart + "-onoff-bcb"); // border checkbox
    if (!ele) return;

    if (ele.checked) {
      // on
      value = SocialCalc.Popup.GetValue(idstart + "-color");
      value = "1px solid " + (value || "rgb(0,0,0)");
      return { def: false, val: value };
    } else {
      // off
      return { def: false, val: "" };
    }
  };

  //
  // SocialCalc.SettingsControls.BorderSideInitialize
  //

  SocialCalc.SettingsControls.BorderSideInitialize = function (
    panelobj,
    ctrlname
  ) {
    var sc = SocialCalc.SettingsControls;
    var idstart = panelobj[ctrlname].id;

    SocialCalc.Popup.Create("ColorChooser", idstart + "-color", {});
    SocialCalc.Popup.Initialize(idstart + "-color", {
      attribs: {
        title: "&nbsp;",
        width: "106px",
        moveable: true,
        changedcallback: SocialCalc.SettingsControls.PopupChangeCallback,
        panelobj: panelobj,
      },
    });
  };

  //
  // SocialCalc.SettingsControlOnchangeBorder = function(ele)
  //

  SocialCalc.SettingsControlOnchangeBorder = function (ele) {
    var idname, value, found, ele2;
    var sc = SocialCalc.SettingsControls;
    var panelobj = sc.CurrentPanel;

    var nameparts = ele.id.match(/(^.*\-)(\w+)\-(\w+)\-(\w+)$/);
    if (!nameparts) return;
    var prefix = nameparts[1];
    var ctrlname = nameparts[2];
    var ctrlsubid = nameparts[3];
    var ctrlidsuffix = nameparts[4];
    var ctrltype = panelobj[ctrlname].type;

    switch (ctrlidsuffix) {
      case "bcb": // border checkbox
        if (ele.checked) {
          sc.Controls[ctrltype].SetValue(sc.CurrentPanel, ctrlname, {
            def: false,
            val: ele.value || "1px solid rgb(0,0,0)",
          });
        } else {
          sc.Controls[ctrltype].SetValue(sc.CurrentPanel, ctrlname, {
            def: false,
            val: "",
          });
        }
        break;
    }
  };

  SocialCalc.SettingsControls.Controls.BorderSide = {
    SetValue: SocialCalc.SettingsControls.BorderSideSetValue,
    GetValue: SocialCalc.SettingsControls.BorderSideGetValue,
    OnClick: SocialCalc.SettingsControls.ColorComboOnClick,
    Initialize: SocialCalc.SettingsControls.BorderSideInitialize,
    InitialData: { thickness: "1 pixel:1px", style: "Solid:solid" },
    ChangedCallback: null,
  };

  SocialCalc.SettingControlReset = function () {
    var sc = SocialCalc.SettingsControls;
    var ctrlname;

    for (ctrlname in sc.Controls) {
      if (sc.Controls[ctrlname].OnReset)
        sc.Controls[ctrlname].OnReset(ctrlname);
    }
  };

  /**********************
   *
   * CtrlSEditor implementation for editing SocialCalc.OtherSaveParts
   *
   */

  SocialCalc.OtherSaveParts = {}; // holds other parts to save - must be set when loaded if you want to keep

  SocialCalc.CtrlSEditor = function (whichpart) {
    var strtoedit, partname;
    if (whichpart.length > 0) {
      strtoedit = SocialCalc.special_chars(
        SocialCalc.OtherSaveParts[whichpart] || ""
      );
    } else {
      strtoedit = "Listing of Parts\n";
      for (partname in SocialCalc.OtherSaveParts) {
        strtoedit += SocialCalc.special_chars(
          "\nPart: " +
          partname +
          "\n=====\n" +
          SocialCalc.OtherSaveParts[partname] +
          "\n"
        );
      }
    }
    var editbox = document.createElement("div");
    editbox.style.cssText =
      "position:absolute;z-index:500;width:300px;height:300px;left:100px;top:200px;border:1px solid black;background-color:#EEE;text-align:center;";
    editbox.id = "socialcalc-editbox";
    editbox.innerHTML =
      whichpart +
      '<br><br><textarea id="socialcalc-editbox-textarea" style="width:250px;height:200px;">' +
      strtoedit +
      "</textarea><br><br><input type=button " +
      "onclick=\"SocialCalc.CtrlSEditorDone ('socialcalc-editbox', '" +
      whichpart +
      '\');" value="OK">';
    document.body.appendChild(editbox);

    var ebta = document.getElementById("socialcalc-editbox-textarea");
    ebta.focus();
    SocialCalc.CmdGotFocus(ebta);
  };

  SocialCalc.CtrlSEditorDone = function (idprefix, whichpart) {
    var edittextarea = document.getElementById(idprefix + "-textarea");
    var text = edittextarea.value;
    if (whichpart.length > 0) {
      if (text.length > 0) {
        SocialCalc.OtherSaveParts[whichpart] = text;
      } else {
        delete SocialCalc.OtherSaveParts[whichpart];
      }
    }

    var editbox = document.getElementById(idprefix);
    SocialCalc.KeyboardFocus();
    editbox.parentNode.removeChild(editbox);
  };

  //
  // Workbook is a collection of sheets that are worked upon together
  //
  // The WorkBook class models and manages the collection of sheets
  //
  // Author: Ramu Ramamurthy
  //
  //

  var SocialCalc;
  if (!SocialCalc) {
    alert("Main SocialCalc code module needed");
    SocialCalc = {};
  }

  // Constructor:

  SocialCalc.WorkBook = function (spread) {
    this.spreadsheet = spread; // this is the spreadsheet control
    this.defaultsheetname = null;
    this.sheetArr = {}; // misnomer, this is not really an array
    this.clipsheet = {}; // for copy paste of sheets
  };

  // Methods

  SocialCalc.WorkBook.prototype.InitializeWorkBook = function (defaultsheet) {
    return SocialCalc.InitializeWorkBook(this, defaultsheet);
  };

  SocialCalc.WorkBook.prototype.AddNewWorkBookSheetNoSwitch = function (
    sheetid,
    sheetname,
    savestr
  ) {
    return SocialCalc.AddNewWorkBookSheetNoSwitch(
      this,
      sheetid,
      sheetname,
      savestr
    );
  };
  SocialCalc.WorkBook.prototype.AddNewWorkBookSheet = function (
    sheetname,
    oldsheetname,
    fromclip,
    spread
  ) {
    return SocialCalc.AddNewWorkBookSheet(
      this,
      sheetname,
      oldsheetname,
      fromclip,
      spread
    );
  };
  SocialCalc.WorkBook.prototype.ActivateWorkBookSheet = function (
    sheetname,
    oldsheetname
  ) {
    return SocialCalc.ActivateWorkBookSheet(this, sheetname, oldsheetname);
  };
  SocialCalc.WorkBook.prototype.DeleteWorkBookSheet = function (
    sheetname,
    cursheetname
  ) {
    return SocialCalc.DeleteWorkBookSheet(this, sheetname, cursheetname);
  };
  SocialCalc.WorkBook.prototype.SaveWorkBookSheet = function (sheetid) {
    return SocialCalc.SaveWorkBookSheet(this, sheetid);
  };
  SocialCalc.WorkBook.prototype.LoadRenameWorkBookSheet = function (
    sheetid,
    savestr,
    newname
  ) {
    return SocialCalc.LoadRenameWorkBookSheet(this, sheetid, savestr, newname);
  };
  SocialCalc.WorkBook.prototype.RenameWorkBookSheet = function (
    oldname,
    newname,
    sheetid
  ) {
    return SocialCalc.RenameWorkBookSheet(this, oldname, newname, sheetid);
  };
  SocialCalc.WorkBook.prototype.CopyWorkBookSheet = function (sheetid) {
    return SocialCalc.CopyWorkBookSheet(this, sheetid);
  };
  SocialCalc.WorkBook.prototype.PasteWorkBookSheet = function (newid, oldid) {
    return SocialCalc.PasteWorkBookSheet(this, newid, oldid);
  };
  SocialCalc.WorkBook.prototype.RenderWorkBookSheet = function () {
    return SocialCalc.RenderWorkBookSheet(this);
  };

  SocialCalc.WorkBook.prototype.SheetNameExistsInWorkBook = function (name) {
    return SocialCalc.SheetNameExistsInWorkBook(this, name);
  };

  SocialCalc.WorkBook.prototype.WorkbookScheduleCommand = function (
    cmd,
    isremote
  ) {
    return SocialCalc.WorkbookScheduleCommand(this, cmd, isremote);
  };

  SocialCalc.WorkBook.prototype.WorkbookScheduleSheetCommand = function (
    cmd,
    isremote
  ) {
    return SocialCalc.WorkbookScheduleSheetCommand(this, cmd, isremote);
  };

  // schedule some command - could be for sheet or for the workbook itself
  SocialCalc.WorkbookScheduleCommand = function WorkbookScheduleCommand(
    workbook,
    cmd,
    isremote
  ) {
    //console.log("cmd ", cmd.cmdstr, cmd.cmdtype);

    if (cmd.cmdtype == "scmd") {
      workbook.WorkbookScheduleSheetCommand(cmd, isremote);
    }
  };

  SocialCalc.WorkbookScheduleSheetCommand =
    function WorkbookScheduleSheetCommand(workbook, cmd, isremote) {
      //console.log(cmd.cmdtype,cmd.id,cmd.cmdstr);

      // check if sheet exists first
      if (workbook.sheetArr[cmd.id]) {
        workbook.sheetArr[cmd.id].sheet.ScheduleSheetCommands(
          cmd.cmdstr,
          cmd.saveundo,
          isremote
        );
      }
    };

  SocialCalc.InitializeWorkBook = function InitializeWorkBook(
    workbook,
    defaultsheet
  ) {
    workbook.defaultsheetname = defaultsheet;

    var spreadsheet = workbook.spreadsheet;
    var defaultsheetname = workbook.defaultsheetname;

    // Initialize the Spreadsheet Control and display it

    SocialCalc.Formula.SheetCache.sheets[defaultsheetname] = {
      sheet: spreadsheet.sheet,
      name: defaultsheetname,
    };

    spreadsheet.sheet.sheetid = defaultsheetname;
    spreadsheet.sheet.sheetname = defaultsheetname;

    workbook.sheetArr[defaultsheetname] = {};
    workbook.sheetArr[defaultsheetname].sheet = spreadsheet.sheet;
    workbook.sheetArr[defaultsheetname].context = spreadsheet.context;

    // if these were properties of the sheet, then we wouldnt need to do this !
    workbook.sheetArr[defaultsheetname].editorprop = {};
    workbook.sheetArr[defaultsheetname].editorprop.ecell = null;
    workbook.sheetArr[defaultsheetname].editorprop.range = null;
    workbook.sheetArr[defaultsheetname].editorprop.range2 = null;

    workbook.clipsheet.savestr = null;
    workbook.clipsheet.copiedfrom = null;
    workbook.clipsheet.editorprop = {};

    spreadsheet.editor.workingvalues.currentsheet = spreadsheet.sheet.sheetname;
    spreadsheet.editor.workingvalues.startsheet =
      spreadsheet.editor.workingvalues.currentsheet;
    spreadsheet.editor.workingvalues.currentsheetid = spreadsheet.sheet.sheetid;
  };

  SocialCalc.AddNewWorkBookSheetNoSwitch = function AddNewWorkBookSheetNoSwitch(
    workbook,
    sheetid,
    sheetname,
    savestr
  ) {
    //alert(sheetid+","+sheetname+","+savestr);

    var spreadsheet = workbook.spreadsheet;

    var newsheet = new SocialCalc.Sheet();

    SocialCalc.Formula.SheetCache.sheets[sheetname] = {
      sheet: newsheet,
      name: sheetname,
    };

    newsheet.sheetid = sheetid;
    newsheet.sheetname = sheetname;

    if (savestr) {
      newsheet.ParseSheetSave(savestr);
    }

    workbook.sheetArr[sheetid] = {};
    workbook.sheetArr[sheetid].sheet = newsheet;
    workbook.sheetArr[sheetid].context = null;

    if (workbook.sheetArr[sheetid].sheet.attribs) {
      workbook.sheetArr[sheetid].sheet.attribs.needsrecalc = "yes";
    }

    workbook.sheetArr[sheetid].editorprop = {};
    workbook.sheetArr[sheetid].editorprop.ecell = {
      coord: "A1",
      row: 1,
      col: 1,
    };
    workbook.sheetArr[sheetid].editorprop.range = null;
    workbook.sheetArr[sheetid].editorprop.range2 = null;
  };

  SocialCalc.AddNewWorkBookSheet = function AddNewWorkBookSheet(
    workbook,
    sheetid,
    oldsheetid,
    fromclip,
    spread
  ) {
    var spreadsheet = workbook.spreadsheet;

    //alert("create new sheet "+sheetid+" old="+oldsheetid+" def="+workbook.defaultsheetname);

    if (spread == null) {
      spreadsheet.sheet = new SocialCalc.Sheet();
      SocialCalc.Formula.SheetCache.sheets[sheetid] = {
        sheet: spreadsheet.sheet,
        name: sheetid,
      };
      spreadsheet.sheet.sheetid = sheetid;
      spreadsheet.sheet.sheetname = sheetid;
    } else {
      //alert("existing spread")
      spreadsheet.sheet = spread;
    }

    spreadsheet.context = new SocialCalc.RenderContext(spreadsheet.sheet);

    spreadsheet.sheet.statuscallback = SocialCalc.EditorSheetStatusCallback;
    spreadsheet.sheet.statuscallbackparams = spreadsheet.editor;

    workbook.sheetArr[sheetid] = {};
    workbook.sheetArr[sheetid].sheet = spreadsheet.sheet;
    workbook.sheetArr[sheetid].context = spreadsheet.context;

    workbook.sheetArr[sheetid].editorprop = {};
    workbook.sheetArr[sheetid].editorprop.ecell = null;
    workbook.sheetArr[sheetid].editorprop.range = null;
    workbook.sheetArr[sheetid].editorprop.range2 = null;

    if (oldsheetid != null) {
      workbook.sheetArr[oldsheetid].editorprop.ecell = spreadsheet.editor.ecell;
      workbook.sheetArr[oldsheetid].editorprop.range = spreadsheet.editor.range;
      workbook.sheetArr[oldsheetid].editorprop.range2 =
        spreadsheet.editor.range2;
    }

    spreadsheet.context.showGrid = true;
    spreadsheet.context.showRCHeaders = true;
    spreadsheet.editor.context = spreadsheet.context;

    if (!fromclip) {
      spreadsheet.editor.ecell = {
        coord: "A1",
        row: 1,
        col: 1,
      };

      spreadsheet.editor.range = {
        hasrange: false,
      };
      spreadsheet.editor.range2 = {
        hasrange: false,
      };
    }

    // set highlights
    spreadsheet.context.highlights[spreadsheet.editor.ecell.coord] = "cursor";

    if (fromclip) {
      // this is the result of a paste sheet
      //alert("from clip");

      if (workbook.clipsheet.savestr != null) {
        //alert("sheetdata = "+workbook.clipsheet.savestr);
        spreadsheet.sheet.ParseSheetSave(workbook.clipsheet.savestr);
      }

      spreadsheet.editor.ecell = workbook.clipsheet.editorprop.ecell;
      spreadsheet.context.highlights[spreadsheet.editor.ecell.coord] = "cursor";

      // range is not pasted ??!??
    }

    spreadsheet.editor.workingvalues.currentsheet = spreadsheet.sheet.sheetname;
    spreadsheet.editor.workingvalues.startsheet =
      spreadsheet.editor.workingvalues.currentsheet;
    spreadsheet.editor.workingvalues.currentsheetid = spreadsheet.sheet.sheetid;

    spreadsheet.editor.FitToEditTable();
    spreadsheet.editor.ScheduleRender();
    //spreadsheet.ExecuteCommand('recalc', '');
  };

  SocialCalc.ActivateWorkBookSheet = function ActivateWorkBookSheet(
    workbook,
    sheetnamestr,
    oldsheetnamestr
  ) {
    var spreadsheet = workbook.spreadsheet;

    //alert("activate "+sheetnamestr+" old="+oldsheetnamestr);

    spreadsheet.sheet = workbook.sheetArr[sheetnamestr].sheet;
    spreadsheet.context = workbook.sheetArr[sheetnamestr].context;

    if (spreadsheet.context == null) {
      //alert("context null")
      //for (var sheet in workbook.sheetArr) alert(sheet+spreadsheet.sheet )
      workbook.AddNewWorkBookSheet(
        sheetnamestr,
        oldsheetnamestr,
        false,
        spreadsheet.sheet
      );
      return;
    }

    spreadsheet.editor.context = spreadsheet.context;

    if (oldsheetnamestr != null) {
      workbook.sheetArr[oldsheetnamestr].editorprop.ecell =
        spreadsheet.editor.ecell;
    }
    spreadsheet.editor.ecell = workbook.sheetArr[sheetnamestr].editorprop.ecell;

    if (oldsheetnamestr != null) {
      workbook.sheetArr[oldsheetnamestr].editorprop.range =
        spreadsheet.editor.range;
    }
    spreadsheet.editor.range = workbook.sheetArr[sheetnamestr].editorprop.range;

    if (oldsheetnamestr != null) {
      workbook.sheetArr[oldsheetnamestr].editorprop.range2 =
        spreadsheet.editor.range2;
    }
    spreadsheet.editor.range2 =
      workbook.sheetArr[sheetnamestr].editorprop.range2;

    spreadsheet.sheet.statuscallback = SocialCalc.EditorSheetStatusCallback;
    spreadsheet.sheet.statuscallbackparams = spreadsheet.editor;

    // reset highlights ??

    //spreadsheet.editor.FitToEditTable();

    spreadsheet.editor.workingvalues.currentsheet = spreadsheet.sheet.sheetname;
    spreadsheet.editor.workingvalues.currentsheetid = spreadsheet.sheet.sheetid;

    if (spreadsheet.editor.state != "start" && spreadsheet.editor.inputBox)
      spreadsheet.editor.inputBox.element.focus();

    if (spreadsheet.editor.state == "start") {
      spreadsheet.editor.workingvalues.startsheet =
        spreadsheet.editor.workingvalues.currentsheet;
    }

    //spreadsheet.editor.ScheduleRender();

    if (spreadsheet.editor.state != "start" && spreadsheet.editor.inputBox) {
      spreadsheet.editor.ScheduleRender();
    } else {
      if (spreadsheet.sheet.attribs) {
        spreadsheet.sheet.attribs.needsrecalc = "yes";
      } else {
        spreadsheet.sheet.attribs = {};
        spreadsheet.sheet.attribs.needsrecalc = "yes";
      }

      spreadsheet.ExecuteCommand("redisplay", "");
    }
  };

  SocialCalc.DeleteWorkBookSheet = function DeleteWorkBookSheet(
    workbook,
    oldname,
    curname
  ) {
    //alert("delete "+oldname+","+curname);

    delete workbook.sheetArr[oldname].context;
    delete workbook.sheetArr[oldname].sheet;
    delete workbook.sheetArr[oldname];
    // take sheet out of the formula cache
    delete SocialCalc.Formula.SheetCache.sheets[curname];
  };

  SocialCalc.SaveWorkBookSheet = function CreateSaveWorkBook(
    workbook,
    sheetid
  ) {
    var sheetstr = {};
    sheetstr.savestr = workbook.sheetArr[sheetid].sheet.CreateSheetSave();
    return sheetstr;
  };

  SocialCalc.LoadRenameWorkBookSheet = function LoadRenameWorkBookSheet(
    workbook,
    sheetid,
    savestr,
    newname
  ) {
    workbook.sheetArr[sheetid].sheet.ResetSheet();
    workbook.sheetArr[sheetid].sheet.ParseSheetSave(savestr);

    if (workbook.sheetArr[sheetid].sheet.attribs) {
      workbook.sheetArr[sheetid].sheet.attribs.needsrecalc = "yes";
    }

    delete SocialCalc.Formula.SheetCache.sheets[
      workbook.sheetArr[sheetid].sheet.sheetname
    ];
    workbook.sheetArr[sheetid].sheet.sheetname = newname;
    SocialCalc.Formula.SheetCache.sheets[newname] = {
      sheet: workbook.sheetArr[sheetid].sheet,
      name: newname,
    };
  };

  SocialCalc.RenderWorkBookSheet = function RenderWorkBookSheet(workbook) {
    workbook.spreadsheet.editor.ScheduleRender();
  };

  SocialCalc.RenameWorkBookSheetCell = function (formula, oldname, newname) {
    var ttype, ttext, i, newcr;
    var updatedformula = "";
    var sheetref = false;
    var scf = SocialCalc.Formula;
    if (!scf) {
      return "Need SocialCalc.Formula";
    }
    var tokentype = scf.TokenType;
    var token_op = tokentype.op;
    var token_string = tokentype.string;
    var token_coord = tokentype.coord;
    var tokenOpExpansion = scf.TokenOpExpansion;

    var parseinfo = SocialCalc.Formula.ParseFormulaIntoTokens(formula);

    for (i = 0; i < parseinfo.length; i++) {
      ttype = parseinfo[i].type;
      ttext = parseinfo[i].text;
      //alert(ttype+","+ttext);
      //console.log (scf.NormalizeSheetName(ttext) + "   " + oldname);
      if (
        ttype == tokentype.name &&
        scf.NormalizeSheetName(ttext) == oldname &&
        i < parseinfo.length
      ) {
        if (parseinfo[i + 1].type == token_op && parseinfo[i + 1].text == "!") {
          updatedformula += newname; //console.log (updatedformula);
        } else {
          updatedformula += ttext; //console.log (updatedformula);
        }
      } else {
        updatedformula += ttext;
      }
    }
    //alert(updatedformula);
    return updatedformula;
  };

  SocialCalc.RenameWorkBookSheet = function RenameWorkBookSheet(
    workbook,
    oldname,
    newname,
    sheetid
  ) {
    // for each sheet, fix up all the formula references
    //
    //alert (sheetid);
    var oldsheet = SocialCalc.Formula.SheetCache.sheets[oldname].sheet;
    delete SocialCalc.Formula.SheetCache.sheets[oldname];
    //alert (newname); // to check the newname
    SocialCalc.Formula.SheetCache.sheets[newname] = {
      sheet: oldsheet,
      name: newname,
    };
    workbook.sheetArr[sheetid].sheet.sheetname = newname;
    //
    // fix up formulas for sheet rename
    // if formulas should not be fixed up upon sheet rename, then comment out the following
    // block
    //
    for (var sheet in workbook.sheetArr) {
      //alert("found sheet-"+sheet)
      for (var cr in workbook.sheetArr[sheet].sheet.cells) {
        // update cell references to sheet name
        //alert(cr);
        var cell = workbook.sheetArr[sheet].sheet.cells[cr];
        //if (cell) alert(cell.datatype)
        if (cell && cell.datatype == "f") {
          cell.formula = SocialCalc.RenameWorkBookSheetCell(
            cell.formula,
            oldname,
            newname
          );
          if (cell.parseinfo) {
            delete cell.parseinfo;
          }
        }
      }
    }
    // recalculate
    workbook.spreadsheet.ExecuteCommand("recalc", "");
  };

  SocialCalc.CopyWorkBookSheet = function CopyWorkBookSheet(workbook, sheetid) {
    //alert("in copy "+sheetid);
    workbook.clipsheet.savestr =
      workbook.sheetArr[sheetid].sheet.CreateSheetSave();
    //alert("in copy save="+workbook.clipsheet.savestr);
    workbook.clipsheet.copiedfrom = sheetid;
    workbook.clipsheet.editorprop = {};
    workbook.clipsheet.editorprop.ecell = workbook.spreadsheet.editor.ecell;
    //workbook.clipsheet.editorprop.range = workbook.spreadsheet.editor.range;
    //workbook.clipsheet.editorprop.range2 = workbook.spreadsheet.editor.range2;
    //workbook.clipsheet.highlights = workbook.spreadsheet.context.highlights;

    //alert("copied "+sheetid);
  };

  SocialCalc.PasteWorkBookSheet = function PasteWorkBookSheet(
    workbook,
    newsheetid,
    oldsheetid
  ) {
    //alert(newsheetid+oldsheetid);
    workbook.AddNewWorkBookSheet(newsheetid, oldsheetid, true);

    // clear the clip ?
  };

  SocialCalc.SheetNameExistsInWorkBook = function SheetNameExistsInWorkBook(
    workbook,
    name
  ) {
    for (var sheet in workbook.sheetArr) {
      if (workbook.sheetArr[sheet].sheet.sheetname == name) {
        return sheet;
      }
    }
    return null;
  };

  //
  // Workbook Control controls workbook actions (add/del/rename etc) and can appear at the
  // bottom of the screen (?). Right now its just a proof of concept
  // and appears at the top of the screen
  //
  // Author: Ramu Ramamurthy
  //
  //

  var SocialCalc;
  if (!SocialCalc) {
    alert("Main SocialCalc code module needed");
    SocialCalc = {};
  }

  SocialCalc.CurrentWorkbookControlObject = null;

  SocialCalc.TestWorkBookSaveStr = "";

  // Constructor:

  SocialCalc.WorkBookControl = function (book, divid, defaultsheetname) {
    this.workbook = book;
    this.div = divid;
    this.defaultsheetname = defaultsheetname;
    this.sheetButtonArr = {};
    this.sheetCnt = 0;
    this.numSheets = 0;
    this.currentSheetButton = null;
    this.renameDialogId = "sheetRenameDialog";
    this.deleteDialogId = "sheetDeleteDialog";
    this.hideDialogId = "sheetHideDialog";
    this.unhideDialogId = "sheetUnhideDialog";

    this.sheetshtml =
      '<div id="fooBar" style="background-color:#80A9F3;display:none"></div>';

    //this.buttonshtml =
    //'<form>'+
    //'<div id="workbookControls" style="padding:6px;background-color:#80A9F3;">'+
    //'<input type="button" value="add sheet" onclick="SocialCalc.WorkBookControlAddSheet(true)" class="smaller">'+
    //'<input type="button" value="delete sheet" onclick="SocialCalc.WorkBookControlDelSheet()" class="smaller">'+
    //'<input type="button" value="rename sheet" onclick="SocialCalc.WorkBookControlRenameSheet()" class="smaller">'+

    // '<input type="button" value="save workbook" onclick="SocialCalc.WorkBookControlSaveSheet()" class="smaller">'+
    // '<input type="button" value="new workbook" onclick="SocialCalc.WorkBookControlNewBook()" class="smaller">'+
    // '<input type="button" value="load workbook" onclick="SocialCalc.WorkBookControlLoad()" class="smaller">'+

    //'<input type="button" value="copy sheet" onclick="SocialCalc.WorkBookControlCopySheet()" class="smaller">'+
    //'<input type="button" value="paste sheet" onclick="SocialCalc.WorkBookControlPasteSheet()" class="smaller">'+
    //'</div>'+
    //'</form>';

    SocialCalc.CurrentWorkbookControlObject = this;
    this.sheetbar = new SocialCalc.SheetBar();
  };

  // methods
  SocialCalc.WorkBookControl.prototype.GetCurrentWorkBookControl = function () {
    return SocialCalc.GetCurrentWorkBookControl();
  };
  SocialCalc.WorkBookControl.prototype.InitializeWorkBookControl = function () {
    return SocialCalc.InitializeWorkBookControl(this);
  };

  SocialCalc.WorkBookControl.prototype.ExecuteWorkBookControlCommand =
    function (cmd, isremote) {
      return SocialCalc.ExecuteWorkBookControlCommand(this, cmd, isremote);
    };

  SocialCalc.ExecuteWorkBookControlCommand = function (control, cmd, isremote) {
    //console.log("cmd ", cmd.cmdstr, cmd.cmdtype);

    //if (!isremote) {
    // return;
    //}

    if (cmd.cmdtype == "scmd") {
      // dispatch a sheet command
      control.workbook.WorkbookScheduleCommand(cmd, isremote);
      return;
    }

    if (cmd.cmdtype != "wcmd") {
      return;
    }

    var parseobj = new SocialCalc.Parse(cmd.cmdstr);

    var cmd1 = parseobj.NextToken();

    switch (cmd1) {
      case "addsheet":
        SocialCalc.WorkBookControlAddSheetRemote(null);
        break;

      case "addsheetstr":
        var sheetstr = cmd.sheetstr;
        SocialCalc.WorkBookControlAddSheetRemote(sheetstr);
        break;

      case "delsheet":
        var sheetid = parseobj.NextToken();
        SocialCalc.WorkBookControlDelSheetRemote(sheetid);
        break;

      case "rensheet":
        var sheetid = parseobj.NextToken();
        var oldname = parseobj.NextToken();
        var newname = parseobj.NextToken();
        SocialCalc.WorkBookControlRenameSheetRemote(sheetid, oldname, newname);
        break;

      case "activatesheet":
        var sheetid = parseobj.NextToken();
        SocialCalc.WorkBookControlActivateSheet(sheetid);
        break;

      case "hidesheet":
        var sheetid = parseobj.NextToken();

        break;

      case "unhidesheet":
        var sheetid = parseobj.NextToken();

        break;
    }
  };

  SocialCalc.GetCurrentWorkBookControl = function () {
    return SocialCalc.CurrentWorkbookControlObject;
  };

  SocialCalc.InitializeWorkBookControl = function (control) {
    var element = document.createElement("div");
    element.innerHTML = control.sheetshtml;
    var foo = document.getElementById(control.div);
    foo.appendChild(element);
    //var element2 = document.createElement("div");
    //element2.innerHTML = control.buttonshtml;
    //foo.appendChild(element2);
    SocialCalc.WorkBookControlAddSheet(false); // this is for the default sheet
  };

  SocialCalc.WorkBookControlDelSheetRemote = function (sheetid) {
    var control = SocialCalc.GetCurrentWorkBookControl();
    if (sheetid == control.currentSheetButton.id) {
      // the active sheet is being deleted
      SocialCalc.WorkBookControlDelSheet();
      return;
    }
    // some non active sheet is being deleted
    var foo = document.getElementById("fooBar");
    var deletedbutton = document.getElementById(sheetid);

    var did = deletedbutton.id;
    var dname = deletedbutton.value;
    delete control.sheetButtonArr[did];

    foo.removeChild(deletedbutton);
    var sheetbar = document.getElementById("SocialCalc-sheetbar-buttons");
    var sheetbarbutton = document.getElementById("sbsb-" + did);
    // unregister with mouse ? etc
    sheetbar.removeChild(sheetbarbutton);

    // delete the sheet
    control.workbook.DeleteWorkBookSheet(did, dname);
    control.numSheets = control.numSheets - 1;
  };

  // assumes that the current active sheet is being deleted
  SocialCalc.WorkBookControlDelSheet = function () {
    var control = SocialCalc.GetCurrentWorkBookControl();
    if (control.workbook.spreadsheet.editor.state != "start") {
      // if in edit mode return
      return;
    }
    if (control.numSheets == 1) {
      //disallow this
      var str =
        '<div style="padding:6px 0px 4px 6px;">' +
        "<span>" +
        "<b> A workbook must contain at least one worksheet </b>" +
        "</span><br/><br/>";
      str +=
        "<span>To delete the selected sheet, you must first insert a new sheet. </span><br/></div>";
      str +=
        '<div style="width:380px;text-align:right;padding:6px 0px 4px 6px;font-size:small;">' +
        '<input type="button" value="Ok" style="font-size:smaller;" onclick="SocialCalc.WorkBookControlDeleteSheetHide();"></div>';
      var main = document.createElement("div");
      main.id = control.deleteDialogId;

      main.style.position = "absolute";

      var vp = SocialCalc.GetViewportInfo();

      main.style.top = vp.height / 3 + "px";
      main.style.left = vp.width / 3 + "px";
      main.style.zIndex = 100;
      main.style.backgroundColor = "#FFF";
      main.style.border = "1px solid black";

      main.style.width = "400px";

      main.innerHTML =
        '<table cellspacing="0" cellpadding="0" style="border-bottom:1px solid black;"><tr>' +
        '<td style="font-size:10px;cursor:default;width:100%;background-color:#999;color:#FFF;">' +
        "&nbsp;" +
        "</td>" +
        '<td style="font-size:10px;cursor:default;color:#666;" onclick="SocialCalc.WorkBookControlDeleteSheetHide();">&nbsp;X&nbsp;</td></tr></table>' +
        '<div style="background-color:#DDD;">' +
        str +
        "</div>";

      //alert(main.innerHTML);

      SocialCalc.DragRegister(
        main.firstChild.firstChild.firstChild.firstChild,
        true,
        true,
        {
          MouseDown: SocialCalc.DragFunctionStart,
          MouseMove: SocialCalc.DragFunctionPosition,
          MouseUp: SocialCalc.DragFunctionPosition,
          Disabled: null,
          positionobj: main,
        }
      );

      control.workbook.spreadsheet.spreadsheetDiv.appendChild(main);
      return;
    }

    // do a popup to reaffirm the deletion of the sheet
    // the popup has two buttons : Confirm and Cancel
    var element = document.getElementById(control.deleteDialogId);
    if (element) return;

    var currentsheet = control.currentSheetButton.value;
    var str =
      '<div style="padding:6px 0px 4px 6px;">' +
      "<span>" +
      "<b>The selected sheet will be permanently deleted.</b>" +
      "</span><br/>";
    str += "<span><ul>";
    str += "<li> To delete the selected sheet, click OK.</li>";
    str += "<li> To cancel the deletion, click cancel.</li>";
    str += "</ul></span></div>";
    str +=
      '<div style="width:380px;text-align:right;padding:6px 0px 4px 6px;font-size:small;">' +
      '<input type="button" value="Cancel" style="font-size:smaller;" onclick="SocialCalc.WorkBookControlDeleteSheetHide();">&nbsp;' +
      '<input type="button" value="OK" style="font-size:smaller;" onclick="SocialCalc.WorkBookControlDeleteSheetSubmit();"></div>';

    var main = document.createElement("div");
    main.id = control.deleteDialogId;

    main.style.position = "absolute";

    var vp = SocialCalc.GetViewportInfo();

    main.style.top = vp.height / 3 + "px";
    main.style.left = vp.width / 3 + "px";
    main.style.zIndex = 100;
    main.style.backgroundColor = "#FFF";
    main.style.border = "1px solid black";

    main.style.width = "400px";

    main.innerHTML =
      '<table cellspacing="0" cellpadding="0" style="border-bottom:1px solid black;"><tr>' +
      '<td style="font-size:10px;cursor:default;width:100%;background-color:#999;color:#FFF;">' +
      "&nbsp;" +
      "</td>" +
      '<td style="font-size:10px;cursor:default;color:#666;" onclick="SocialCalc.WorkBookControlDeleteSheetHide();">&nbsp;X&nbsp;</td></tr></table>' +
      '<div style="background-color:#DDD;">' +
      str +
      "</div>";

    //alert(main.innerHTML);

    SocialCalc.DragRegister(
      main.firstChild.firstChild.firstChild.firstChild,
      true,
      true,
      {
        MouseDown: SocialCalc.DragFunctionStart,
        MouseMove: SocialCalc.DragFunctionPosition,
        MouseUp: SocialCalc.DragFunctionPosition,
        Disabled: null,
        positionobj: main,
      }
    );

    control.workbook.spreadsheet.spreadsheetDiv.appendChild(main);
  };

  SocialCalc.WorkBookControlDeleteSheetHide = function () {
    var control = SocialCalc.GetCurrentWorkBookControl();
    var spreadsheet = control.workbook.spreadsheet;

    var ele = document.getElementById(control.deleteDialogId);
    ele.innerHTML = "";

    SocialCalc.DragUnregister(ele);

    SocialCalc.KeyboardFocus();

    if (ele.parentNode) {
      ele.parentNode.removeChild(ele);
    }
  };

  SocialCalc.WorkBookControlDeleteSheetSubmit = function () {
    var control = SocialCalc.GetCurrentWorkBookControl();
    SocialCalc.WorkBookControlDeleteSheetHide();
    var foo = document.getElementById("fooBar");
    var current = document.getElementById(control.currentSheetButton.id);

    var name = current.id;
    var curname = control.currentSheetButton.value;
    delete control.sheetButtonArr[name];

    foo.removeChild(current);

    var sheetbar = document.getElementById("SocialCalc-sheetbar-buttons");
    var sheetbarbutton = document.getElementById("sbsb-" + current.id);
    // unregister with mouse ? etc
    sheetbar.removeChild(sheetbarbutton);

    control.currentSheetButton = null;
    // delete the sheets
    control.workbook.DeleteWorkBookSheet(name, curname);
    control.numSheets = control.numSheets - 1;

    var cmdstr = "delsheet " + name;
    SocialCalc.Callbacks.broadcast("execute", {
      cmdtype: "wcmd",
      id: "0",
      cmdstr: cmdstr,
    });

    // reset current sheet
    for (var sheet in control.sheetButtonArr) {
      if (sheet != null) {
        control.currentSheetButton = control.sheetButtonArr[sheet];
        control.currentSheetButton.setAttribute(
          "style",
          "background-color:lightgreen"
        );
        SocialCalc.SheetBarButtonActivate(control.currentSheetButton.id, true);
        break;
      }
    }
    if (control.currentSheetButton != null) {
      control.workbook.ActivateWorkBookSheet(
        control.currentSheetButton.id,
        null
      );
    }
  };

  // assumes that the current active sheet is being hidden
  SocialCalc.WorkBookControlHideSheet = function () {
    var control = SocialCalc.GetCurrentWorkBookControl();

    var control = SocialCalc.GetCurrentWorkBookControl();
    if (control.workbook.spreadsheet.editor.state != "start") {
      // if in edit mode return
      return;
    }
    if (control.numSheets == 1) {
      //disallow this
      var str =
        '<div style="padding:6px 0px 4px 6px;">' +
        "<span>" +
        "<b> A workbook must contain at least one worksheet </b>" +
        "</span><br/><br/>";
      str +=
        "<span>Before hiding the selected sheet, you must first insert a new sheet. </span><br/></div>";
      str +=
        '<div style="width:380px;text-align:right;padding:6px 0px 4px 6px;font-size:small;">' +
        '<input type="button" value="Ok" style="font-size:smaller;" onclick="SocialCalc.WorkBookControlHideSheetHide();"></div>';
      var main = document.createElement("div");
      main.id = control.hideDialogId;

      main.style.position = "absolute";

      var vp = SocialCalc.GetViewportInfo();

      main.style.top = vp.height / 3 + "px";
      main.style.left = vp.width / 3 + "px";
      main.style.zIndex = 100;
      main.style.backgroundColor = "#FFF";
      main.style.border = "1px solid black";

      main.style.width = "400px";

      main.innerHTML =
        '<table cellspacing="0" cellpadding="0" style="border-bottom:1px solid black;"><tr>' +
        '<td style="font-size:10px;cursor:default;width:100%;background-color:#999;color:#FFF;">' +
        "&nbsp;" +
        "</td>" +
        '<td style="font-size:10px;cursor:default;color:#666;" onclick="SocialCalc.WorkBookControlHideSheetHide();">&nbsp;X&nbsp;</td></tr></table>' +
        '<div style="background-color:#DDD;">' +
        str +
        "</div>";

      //alert(main.innerHTML);

      SocialCalc.DragRegister(
        main.firstChild.firstChild.firstChild.firstChild,
        true,
        true,
        {
          MouseDown: SocialCalc.DragFunctionStart,
          MouseMove: SocialCalc.DragFunctionPosition,
          MouseUp: SocialCalc.DragFunctionPosition,
          Disabled: null,
          positionobj: main,
        }
      );

      control.workbook.spreadsheet.spreadsheetDiv.appendChild(main);
      return;
    }

    // do a popup to reaffirm the hiding of the sheet
    // the popup has two buttons : Confirm and Cancel
    var element = document.getElementById(control.hideDialogId);
    if (element) return;

    var currentsheet = control.currentSheetButton.value;
    var str =
      '<div style="padding:6px 0px 4px 6px;">' +
      "<span>" +
      "<b>The selected sheet will be hidden.</b>" +
      "</span><br/>";
    str += "<span><ul>";
    str += "<li> To hide the selected sheet, click OK.</li>";
    str += "<li> To cancel the hiding, click cancel.</li>";
    str += "</ul></span></div>";
    str +=
      '<div style="width:380px;text-align:right;padding:6px 0px 4px 6px;font-size:small;">' +
      '<input type="button" value="Cancel" style="font-size:smaller;" onclick="SocialCalc.WorkBookControlHideSheetHide();">&nbsp;' +
      '<input type="button" value="OK" style="font-size:smaller;" onclick="SocialCalc.WorkBookControlHideSheetSubmit();"></div>';

    var main = document.createElement("div");
    main.id = control.hideDialogId;

    main.style.position = "absolute";

    var vp = SocialCalc.GetViewportInfo();

    main.style.top = vp.height / 3 + "px";
    main.style.left = vp.width / 3 + "px";
    main.style.zIndex = 100;
    main.style.backgroundColor = "#FFF";
    main.style.border = "1px solid black";

    main.style.width = "400px";

    main.innerHTML =
      '<table cellspacing="0" cellpadding="0" style="border-bottom:1px solid black;"><tr>' +
      '<td style="font-size:10px;cursor:default;width:100%;background-color:#999;color:#FFF;">' +
      "&nbsp;" +
      "</td>" +
      '<td style="font-size:10px;cursor:default;color:#666;" onclick="SocialCalc.WorkBookControlHideSheetHide();">&nbsp;X&nbsp;</td></tr></table>' +
      '<div style="background-color:#DDD;">' +
      str +
      "</div>";

    //alert(main.innerHTML);

    SocialCalc.DragRegister(
      main.firstChild.firstChild.firstChild.firstChild,
      true,
      true,
      {
        MouseDown: SocialCalc.DragFunctionStart,
        MouseMove: SocialCalc.DragFunctionPosition,
        MouseUp: SocialCalc.DragFunctionPosition,
        Disabled: null,
        positionobj: main,
      }
    );

    control.workbook.spreadsheet.spreadsheetDiv.appendChild(main);
  };

  SocialCalc.WorkBookControlHideSheetHide = function () {
    var control = SocialCalc.GetCurrentWorkBookControl();
    var spreadsheet = control.workbook.spreadsheet;

    var ele = document.getElementById(control.hideDialogId);
    ele.innerHTML = "";

    SocialCalc.DragUnregister(ele);

    SocialCalc.KeyboardFocus();

    if (ele.parentNode) {
      ele.parentNode.removeChild(ele);
    }
  };

  SocialCalc.WorkBookControlHideSheetSubmit = function () {
    var control = SocialCalc.GetCurrentWorkBookControl();
    SocialCalc.WorkBookControlHideSheetHide();
    var foo = document.getElementById("fooBar");
    var current = document.getElementById(control.currentSheetButton.id);

    var name = current.id;
    var curname = control.currentSheetButton.value;

    var sheetbar = document.getElementById("SocialCalc-sheetbar-buttons");
    var sheetbarbutton = document.getElementById("sbsb-" + current.id);
    // unregister with mouse ? etc
    SocialCalc.SheetBarButtonActivate(control.currentSheetButton.id, false);
    sheetbarbutton.style.display = "none";
    control.currentSheetButton = null;
    // delete the sheets

    control.numSheets = control.numSheets - 1;

    var cmdstr = "hidesheet " + name;
    SocialCalc.Callbacks.broadcast("execute", {
      cmdtype: "wcmd",
      id: "0",
      cmdstr: cmdstr,
    });

    // reset current sheet
    for (var sheet in control.sheetButtonArr) {
      if (
        sheet != null &&
        document.getElementById("sbsb-" + sheet).style.display != "none"
      ) {
        control.currentSheetButton = control.sheetButtonArr[sheet];
        break;
      }
    }
    if (control.currentSheetButton != null) {
      control.currentSheetButton.setAttribute(
        "style",
        "background-color:lightgreen"
      );
      SocialCalc.SheetBarButtonActivate(control.currentSheetButton.id, true);
      control.workbook.ActivateWorkBookSheet(
        control.currentSheetButton.id,
        null
      );
    }
  };

  // displays all hidden sheets, and then unhides whatever is selected
  SocialCalc.WorkBookControlUnhideSheet = function () {
    var control = SocialCalc.GetCurrentWorkBookControl();
    if (control.workbook.spreadsheet.editor.state != "start") {
      // if in edit mode return
      return;
    }

    var unhiddencount = 0;
    for (var sheet in control.sheetButtonArr) {
      if (document.getElementById("sbsb-" + sheet).style.display == "none") {
        unhiddencount++;
      }
    }

    if (unhiddencount == 0) {
      //no hidden sheets, error message here
      var str =
        '<div style="padding:6px 0px 4px 6px;">' +
        "<span>" +
        "<b> There are no hidden worksheets. </b>" +
        "</span><br/><br/>";
      str +=
        "<span>Before unhiding any sheets, you must first hide a sheet. </span><br/></div>";
      str +=
        '<div style="width:380px;text-align:right;padding:6px 0px 4px 6px;font-size:small;">' +
        '<input type="button" value="Ok" style="font-size:smaller;" onclick="SocialCalc.WorkBookControlUnhideSheetHide();"></div>';
      var main = document.createElement("div");
      main.id = control.unhideDialogId;

      main.style.position = "absolute";

      var vp = SocialCalc.GetViewportInfo();

      main.style.top = vp.height / 3 + "px";
      main.style.left = vp.width / 3 + "px";
      main.style.zIndex = 100;
      main.style.backgroundColor = "#FFF";
      main.style.border = "1px solid black";

      main.style.width = "400px";

      main.innerHTML =
        '<table cellspacing="0" cellpadding="0" style="border-bottom:1px solid black;"><tr>' +
        '<td style="font-size:10px;cursor:default;width:100%;background-color:#999;color:#FFF;">' +
        "&nbsp;" +
        "</td>" +
        '<td style="font-size:10px;cursor:default;color:#666;" onclick="SocialCalc.WorkBookControlUnhideSheetHide();">&nbsp;<b>X</b>&nbsp;</td></tr></table>' +
        '<div style="background-color:#DDD;">' +
        str +
        "</div>";

      //alert(main.innerHTML);

      SocialCalc.DragRegister(
        main.firstChild.firstChild.firstChild.firstChild,
        true,
        true,
        {
          MouseDown: SocialCalc.DragFunctionStart,
          MouseMove: SocialCalc.DragFunctionPosition,
          MouseUp: SocialCalc.DragFunctionPosition,
          Disabled: null,
          positionobj: main,
        }
      );

      control.workbook.spreadsheet.spreadsheetDiv.appendChild(main);
      return;
    }

    var element = document.getElementById(control.unhideDialogId);
    if (element) return;

    var currentsheet = control.currentSheetButton.value;
    var str =
      '<div style="padding:6px 0px 4px 6px;">' +
      "<span>" +
      "<b>The following sheets are hidden.</b>" +
      '</span><br/><form id="unhidesheetform"><ul>' +
      '<input type="hidden" name="unhidesheet" value=""/>';
    for (var sheet in control.sheetButtonArr) {
      if (document.getElementById("sbsb-" + sheet).style.display == "none") {
        str +=
          '<input type="radio" value="' +
          sheet +
          '" onclick="document.getElementById(&quot;unhidesheetform&quot;).unhidesheet.value=&quot;' +
          sheet +
          '&quot;;"/>' +
          control.sheetButtonArr[sheet].value +
          "<br/>";
      }
    }

    str += "</ul></form>\n<span><ul>";
    str += "<li> To unhide the selected sheet, click OK.</li>";
    str += "<li> To cancel the unhiding, click cancel.</li>";
    str += "</ul></span></div>";
    str +=
      '<div style="width:380px;text-align:right;padding:6px 0px 4px 6px;font-size:small;">' +
      '<input type="button" value="Cancel" style="font-size:smaller;" onclick="SocialCalc.WorkBookControlUnhideSheetHide();">&nbsp;' +
      '<input type="button" value="OK" style="font-size:smaller;" onclick="SocialCalc.WorkBookControlUnhideSheetSubmit(document.getElementById(&quot;unhidesheetform&quot;).unhidesheet.value);"></div>';

    var main = document.createElement("div");
    main.id = control.unhideDialogId;

    main.style.position = "absolute";

    var vp = SocialCalc.GetViewportInfo();

    main.style.top = vp.height / 3 + "px";
    main.style.left = vp.width / 3 + "px";
    main.style.zIndex = 100;
    main.style.backgroundColor = "#FFF";
    main.style.border = "1px solid black";

    main.style.width = "400px";

    main.innerHTML =
      '<table cellspacing="0" cellpadding="0" style="border-bottom:1px solid black;"><tr>' +
      '<td style="font-size:10px;cursor:default;width:100%;background-color:#999;color:#FFF;">' +
      "&nbsp;" +
      "</td>" +
      '<td style="font-size:10px;cursor:default;color:#666;" onclick="SocialCalc.WorkBookControlUnhideSheetHide();">&nbsp;X&nbsp;</td></tr></table>' +
      '<div style="background-color:#DDD;">' +
      str +
      "</div>";

    //alert(main.innerHTML);

    SocialCalc.DragRegister(
      main.firstChild.firstChild.firstChild.firstChild,
      true,
      true,
      {
        MouseDown: SocialCalc.DragFunctionStart,
        MouseMove: SocialCalc.DragFunctionPosition,
        MouseUp: SocialCalc.DragFunctionPosition,
        Disabled: null,
        positionobj: main,
      }
    );

    control.workbook.spreadsheet.spreadsheetDiv.appendChild(main);
  };

  SocialCalc.WorkBookControlUnhideSheetHide = function () {
    var control = SocialCalc.GetCurrentWorkBookControl();
    var spreadsheet = control.workbook.spreadsheet;

    var ele = document.getElementById(control.unhideDialogId);
    ele.innerHTML = "";

    SocialCalc.DragUnregister(ele);

    SocialCalc.KeyboardFocus();

    if (ele.parentNode) {
      ele.parentNode.removeChild(ele);
    }
  };

  SocialCalc.WorkBookControlUnhideSheetSubmit = function (name) {
    var control = SocialCalc.GetCurrentWorkBookControl();
    SocialCalc.WorkBookControlUnhideSheetHide();
    var current = document.getElementById(control.currentSheetButton.id);

    var curid = current.id;
    var curname = control.currentSheetButton.value;

    control.currentSheetButton.setAttribute("style", "");
    var old = control.currentSheetButton.id;
    console.log(old);
    SocialCalc.SheetBarButtonActivate(old, false);

    var sheetbarbutton = document.getElementById("sbsb-" + name);
    // unhide the button
    sheetbarbutton.style.display = "inline";
    control.currentSheetButton = null;

    control.numSheets = control.numSheets + 1;

    var cmdstr = "unhidesheet " + name;
    SocialCalc.Callbacks.broadcast("execute", {
      cmdtype: "wcmd",
      id: "0",
      cmdstr: cmdstr,
    });

    // reset current sheet
    for (var sheet in control.sheetButtonArr) {
      if (
        sheet != null &&
        document.getElementById("sbsb-" + sheet).style.display != "none"
      ) {
        control.currentSheetButton = control.sheetButtonArr[sheet];
        break;
      }
    }

    if (control.currentSheetButton != null) {
      control.currentSheetButton.setAttribute(
        "style",
        "background-color:lightgreen"
      );
      SocialCalc.SheetBarButtonActivate(control.currentSheetButton.id, true);
      control.workbook.ActivateWorkBookSheet(
        control.currentSheetButton.id,
        null
      );
    }
  };

  SocialCalc.WorkBookControlAddSheetButton = function (sheetname, sheetid) {
    var control = SocialCalc.GetCurrentWorkBookControl();

    //Create an input type dynamically.
    var element = document.createElement("input");

    var name = null;

    if (sheetid != null) {
      name = sheetid;
    } else {
      name = "sheet" + (control.sheetCnt + 1).toString();
      control.sheetCnt = control.sheetCnt + 1;
    }

    //Assign different attributes to the element.
    element.setAttribute("type", "button");
    if (sheetname == null) {
      element.setAttribute("value", name);
    } else {
      element.setAttribute("value", sheetname);
    }
    element.setAttribute("id", name);
    element.setAttribute("name", name);

    var fnname =
      "SocialCalc.WorkBookControlActivateSheet(" + "'" + name + "'" + ")";

    element.setAttribute("onclick", fnname);

    control.sheetButtonArr[name] = element;

    var foo = document.getElementById("fooBar");

    //Append the element in page (in span).
    foo.appendChild(element);

    control.numSheets = control.numSheets + 1;

    var el = new SocialCalc.SheetBarSheetButton(
      "sbsb-" + name,
      sheetname ? sheetname : name,
      document.getElementById("SocialCalc-sheetbar-buttons"),
      {
        //normalstyle: "border:1px solid #000;backgroundColor:#FFF;",
        //downstyle: "border:1px solid #000;backgroundColor:#CCC;",
        //hoverstyle: "border:1px solid #000;backgroundColor:#FFF;"
      },
      {
        MouseDown: function () {
          SocialCalc.SheetBarSheetButtonPress(name);
        },
        Repeat: function () { },
        Disabled: function () { },
      }
    );

    return element;
  };

  SocialCalc.WorkBookControlAddSheet = function (addworksheet, sheetname) {
    var control = SocialCalc.GetCurrentWorkBookControl();

    if (control.workbook.spreadsheet.editor.state != "start") {
      // if in edit return
      return;
    }

    // first add the button
    var element = SocialCalc.WorkBookControlAddSheetButton(sheetname);

    // then change the highlight

    var old = "sheet1";
    if (control.currentSheetButton != null) {
      control.currentSheetButton.setAttribute("style", "");
      old = control.currentSheetButton.id;
      SocialCalc.SheetBarButtonActivate(old, false);
    }

    element.setAttribute("style", "background-color:lightgreen");
    control.currentSheetButton = element;
    var newsheetid = element.id;
    SocialCalc.SheetBarButtonActivate(newsheetid, true);

    // create the sheet
    if (addworksheet) {
      control.workbook.AddNewWorkBookSheet(newsheetid, old, false);
      // broadcast an add command here
      var cmdstr = "addsheet";
      SocialCalc.Callbacks.broadcast("execute", {
        cmdtype: "wcmd",
        id: "0",
        cmdstr: cmdstr,
      });
    }
  };

  SocialCalc.WorkBookControlAddSheetRemote = function (savestr) {
    var control = SocialCalc.GetCurrentWorkBookControl();

    // first add the button
    var element = SocialCalc.WorkBookControlAddSheetButton();

    // add the sheet, dont switch to it
    control.workbook.AddNewWorkBookSheetNoSwitch(
      element.id,
      element.value,
      savestr
    );
  };

  SocialCalc.WorkBookControlActivateSheet = function (name) {
    //alert("in activate sheet="+name)

    var control = SocialCalc.GetCurrentWorkBookControl();

    var foo = document.getElementById(name);
    foo.setAttribute("style", "background-color:lightgreen;");
    SocialCalc.SheetBarButtonActivate(name, true);

    var old = control.currentSheetButton.id;
    if (control.currentSheetButton.id != foo.id) {
      control.currentSheetButton.setAttribute("style", "");
      SocialCalc.SheetBarButtonActivate(old, false);
    }

    control.currentSheetButton = foo;

    control.workbook.ActivateWorkBookSheet(name, old);
  };

  SocialCalc.WorkBookControlHttpRequest = null;

  SocialCalc.WorkBookControlAlertContents = function () {
    var loadedstr = "";
    var http_request = SocialCalc.WorkBookControlHttpRequest;

    if (http_request.readyState == 4) {
      //addmsg("received:" + http_request.responseText.length + " chars");
      try {
        if (http_request.status == 200) {
          loadedstr = http_request.responseText || "";
          http_request = null;
        } else {
        }
      } catch (e) { }
      // do something with loaded str
      //alert("loaded="+loadedstr);
      SocialCalc.TestWorkBookSaveStr = loadedstr;
      SocialCalc.Clipboard.clipboard = loadedstr;
    }
  };

  SocialCalc.WorkBookControlAjaxCall = function (url, contents) {
    var http_request = null;

    alert("in ajax");
    if (window.XMLHttpRequest) {
      // Mozilla, Safari,...
      http_request = new XMLHttpRequest();
    } else if (window.ActiveXObject) {
      // IE
      try {
        http_request = new ActiveXObject("Msxml2.XMLHTTP");
      } catch (e) {
        try {
          http_request = new ActiveXObject("Microsoft.XMLHTTP");
        } catch (e) { }
      }
    }
    if (!http_request) {
      alert("Giving up :( Cannot create an XMLHTTP instance");
      return false;
    }

    // Make the actual request
    SocialCalc.WorkBookControlHttpRequest = http_request;

    http_request.onreadystatechange = SocialCalc.WorkBookControlAlertContents;
    http_request.open("POST", document.URL, true); // async
    http_request.setRequestHeader(
      "Content-Type",
      "application/x-www-form-urlencoded"
    );
    http_request.send(contents);

    return true;
  };

  SocialCalc.WorkBookControlSaveSheet = function () {
    var control = SocialCalc.GetCurrentWorkBookControl();

    var sheetsave = {};

    sheetsave.numsheets = control.numSheets;
    sheetsave.currentid = control.currentSheetButton.id;
    sheetsave.currentname = control.currentSheetButton.value;

    sheetsave.sheetArr = {};
    for (var sheet in control.sheetButtonArr) {
      var sheetstr = control.workbook.SaveWorkBookSheet(sheet);
      sheetsave.sheetArr[sheet] = {};
      sheetsave.sheetArr[sheet].sheetstr = sheetstr;
      sheetsave.sheetArr[sheet].name = control.sheetButtonArr[sheet].value;
      sheetsave.sheetArr[sheet].hidden =
        document.getElementById("sbsb-" + sheet).style.display == "none"
          ? "1"
          : "0";
    }

    // Save the editable cells if specified
    if (SocialCalc.EditableCells && SocialCalc.EditableCells.allow) {
      sheetsave.EditableCells = {};
      for (var i in SocialCalc.EditableCells) {
        sheetsave.EditableCells[i] = SocialCalc.EditableCells[i];
      }
    }

    var d = new Date();
    sheetsave["timestamp"] = d.toString();

    SocialCalc.TestWorkBookSaveStr = JSON.stringify(sheetsave);
    //alert(SocialCalc.TestWorkBookSaveStr);
    // send it to the backend
    // SocialCalc.WorkBookControlAjaxCall("/", "&sheetdata="+encodeURIComponent(SocialCalc.TestWorkBookSaveStr));
    return SocialCalc.TestWorkBookSaveStr;
  };

  // insert another workbook into an existing workbook
  // assumption is at least 1 sheet exists in existing workbook
  // sheets with same names will be overwritten !
  SocialCalc.WorkBookControlInsertWorkbook = function (savestr) {
    var sheetsave;
    if (savestr) {
      sheetsave = JSON.parse(savestr);
    }
    var control = SocialCalc.GetCurrentWorkBookControl();
    for (var sheet in sheetsave.sheetArr) {
      var savestr = sheetsave.sheetArr[sheet].sheetstr.savestr;
      var parts = control.workbook.spreadsheet.DecodeSpreadsheetSave(savestr);
      if (parts) {
        if (parts.sheet) {
          savestr = savestr.substring(parts.sheet.start, parts.sheet.end);
        }
      }
      // check if sheetname already exists
      var sheetname = sheetsave.sheetArr[sheet].name;
      var sheetid = control.workbook.SheetNameExistsInWorkBook(sheetname);
      if (sheetid) {
        console.log(sheetname + "exists");
        control.workbook.LoadRenameWorkBookSheet(sheetid, savestr, sheetname);
      } else {
        //just test-brand new insert first
        sheetid = "sheet" + (control.sheetCnt + 1).toString();
        control.sheetCnt = control.sheetCnt + 1;
        SocialCalc.WorkBookControlAddSheetButton(
          sheetsave.sheetArr[sheet].name,
          sheetid
        );
        // create the sheet
        control.workbook.AddNewWorkBookSheetNoSwitch(
          sheetid,
          sheetsave.sheetArr[sheet].name,
          savestr
        );
      }
    }
  };

  SocialCalc.WorkBookControlLoad = function (savestr) {
    var sheetsave;

    if (savestr == "") return;

    if (savestr) {
      sheetsave = JSON.parse(savestr);
    } else {
      sheetsave = JSON.parse(SocialCalc.TestWorkBookSaveStr);
    }
    //alert(sheetsave.currentid+","+sheetsave.currentname)

    // first create a new workbook
    var control = SocialCalc.GetCurrentWorkBookControl();

    SocialCalc.WorkBookControlCreateNewBook();

    // at this point there is one sheet, and 1 button
    // create the sequence of buttons, and sheets
    var firstrun = true;
    var newbuttons = 0;
    var sheetid = null;
    var currentsheetid = sheetsave.currentid;
    //alert("button="+newbuttons)
    for (var sheet in sheetsave.sheetArr) {
      //alert(sheet);
      if (newbuttons > sheetsave.numsheets) {
        break;
      }
      //alert("button="+newbuttons)
      var savestr = sheetsave.sheetArr[sheet].sheetstr.savestr;
      var parts = control.workbook.spreadsheet.DecodeSpreadsheetSave(savestr);
      if (parts) {
        if (parts.sheet) {
          savestr = savestr.substring(parts.sheet.start, parts.sheet.end);
        }
      }
      if (firstrun) {
        firstrun = false;
        // set the first button's name correctly
        sheetid = control.currentSheetButton.id;
        control.currentSheetButton.value = sheetsave.sheetArr[sheet].name;
        SocialCalc.SheetBarButtonSetName(
          sheetid,
          sheetsave.sheetArr[sheet].name
        );
        // set the sheet data for the first sheet which already exists
        control.workbook.LoadRenameWorkBookSheet(
          sheetid,
          savestr,
          control.currentSheetButton.value
        );
        // need to also set the formula cache
        currentsheetid = sheetid;
      } else {
        sheetid = "sheet" + (control.sheetCnt + 1).toString();
        control.sheetCnt = control.sheetCnt + 1;
        SocialCalc.WorkBookControlAddSheetButton(
          sheetsave.sheetArr[sheet].name,
          sheetid
        );
        // create the sheet
        control.workbook.AddNewWorkBookSheetNoSwitch(
          sheetid,
          sheetsave.sheetArr[sheet].name,
          savestr
        );
      }
      if (sheetsave.sheetArr[sheet].hidden == "1") {
        // unregister with mouse ? etc
        var sheetbarbutton = document.getElementById("sbsb-" + sheetid);
        sheetbarbutton.style.display = "none";
        SocialCalc.SheetBarButtonActivate(sheet, false);
        newbuttons = newbuttons - 1;
      }
      if (sheet == sheetsave.currentid) {
        currentsheetid = sheetid;
      }
      newbuttons = newbuttons + 1;
    }
    // Save the user script data
    if (sheetsave.EditableCells) {
      SocialCalc.EditableCells = {};
      for (var i in sheetsave.EditableCells) {
        SocialCalc.EditableCells[i] = sheetsave.EditableCells[i];
      }

      // If allow=true but no cells are defined, default to fully editable to avoid locking the sheet
      var editableCells = SocialCalc.EditableCells.cells || {};
      if (
        SocialCalc.EditableCells.allow &&
        (!editableCells || Object.keys(editableCells).length === 0)
      ) {
        console.warn(
          "SocialCalc: EditableCells.allow=true but no cells provided. Falling back to allow=false so the sheet stays editable."
        );
        SocialCalc.EditableCells.allow = false;
      }
    }
    var timeoutFn = function () {
      SocialCalc.WorkBookControlActivateSheet(currentsheetid);
    };
    window.setTimeout(timeoutFn, 200);
  };

  SocialCalc.WorkBookControlRenameSheet = function () {
    var control = SocialCalc.GetCurrentWorkBookControl();

    if (control.workbook.spreadsheet.editor.state != "start") {
      // if in edit return
      return;
    }

    // do a popup to get the new name of the sheet
    // the popup has an input element with submit, and cancel buttons
    var element = document.getElementById(control.renameDialogId);
    if (element) return;

    var currentsheet = control.currentSheetButton.value;
    var str =
      '<div style="padding:6px 0px 4px 6px;">' +
      '<span style="font-size:smaller;">' +
      "Rename-" +
      currentsheet +
      "</span><br>" +
      '<span style="font-size:smaller;">' +
      "Please ensure that you DO NOT have ANY spaces in the sheet name." +
      "</span>" +
      '<input type="text" id="newSheetName" style="width:380px;" value="' +
      currentsheet +
      '"><br>' +
      "</div>";

    str +=
      '<div style="width:380px;text-align:right;padding:6px 0px 4px 6px;font-size:small;">' +
      '<input type="button" value="Submit" style="font-size:smaller;" onclick="SocialCalc.WorkBookControlRenameSheetSubmit();">&nbsp;' +
      '<input type="button" value="Cancel" style="font-size:smaller;" onclick="SocialCalc.WorkBookControlRenameSheetHide();"></div>';

    var main = document.createElement("div");
    main.id = control.renameDialogId;

    main.style.position = "absolute";

    var vp = SocialCalc.GetViewportInfo();

    main.style.top = vp.height / 3 + "px";
    main.style.left = vp.width / 3 + "px";
    main.style.zIndex = 100;
    main.style.backgroundColor = "#FFF";
    main.style.border = "1px solid black";

    main.style.width = "400px";

    main.innerHTML =
      '<table cellspacing="0" cellpadding="0" style="border-bottom:1px solid black;"><tr>' +
      '<td style="font-size:10px;cursor:default;width:100%;background-color:#999;color:#FFF;">' +
      "&nbsp;" +
      "</td>" +
      '<td style="font-size:10px;cursor:default;color:#666;" onclick="SocialCalc.WorkBookControlRenameSheetHide();">&nbsp;X&nbsp;</td></tr></table>' +
      '<div style="background-color:#DDD;">' +
      str +
      "</div>";

    SocialCalc.DragRegister(
      main.firstChild.firstChild.firstChild.firstChild,
      true,
      true,
      {
        MouseDown: SocialCalc.DragFunctionStart,
        MouseMove: SocialCalc.DragFunctionPosition,
        MouseUp: SocialCalc.DragFunctionPosition,
        Disabled: null,
        positionobj: main,
      }
    );

    control.workbook.spreadsheet.spreadsheetDiv.appendChild(main);

    var ele = document.getElementById("newSheetName");
    ele.focus();
    SocialCalc.CmdGotFocus(ele);
  };

  SocialCalc.WorkBookControlRenameSheetHide = function () {
    var control = SocialCalc.GetCurrentWorkBookControl();
    var spreadsheet = control.workbook.spreadsheet;

    var ele = document.getElementById(control.renameDialogId);
    ele.innerHTML = "";

    SocialCalc.DragUnregister(ele);

    SocialCalc.KeyboardFocus();

    if (ele.parentNode) {
      ele.parentNode.removeChild(ele);
    }
  };

  SocialCalc.WorkBookControlRenameSheetSubmit = function () {
    // this handles all the rename action
    var ele = document.getElementById("newSheetName");
    //console.log(ele.value);
    var control = SocialCalc.GetCurrentWorkBookControl();
    if (ele.value.length == 0) {
      ele.focus();
      return;
    }
    var oldname = control.currentSheetButton.value;
    var newname = ele.value;
    if (newname.indexOf(" ") != -1) {
      alert(
        "A space was found in the new name. Please ensure that the new name has no sapces"
      );
      return;
    }
    SocialCalc.WorkBookControlRenameSheetHide();
    // verify newname does not clash with any existing sheet name
    // if so reject
    var smallname = newname.toLowerCase(); //converting to lower case to normalise
    //console.log(smallname + " old " + ele.value);
    for (var sheet in workbook.sheetArr) {
      console.log(workbook.sheetArr[sheet].sheet.sheetname); //checking in sheetarr for repeated names
      if (workbook.sheetArr[sheet].sheet.sheetname == smallname) {
        alert(newname + " already exists");
        return;
      }
    } // variation of Case in letters of a sheet name will give an error if smallname is used.

    control.currentSheetButton.value = smallname;

    SocialCalc.SheetBarButtonSetName(control.currentSheetButton.id, newname);

    // perform a rename for formula references to this sheet in all the
    // sheets in the workbook
    control.workbook.RenameWorkBookSheet(
      oldname,
      smallname,
      control.currentSheetButton.id
    );

    var cmdstr =
      "rensheet " +
      control.currentSheetButton.id +
      " " +
      oldname +
      " " +
      newname;
    //console.log(cmdstr);
    SocialCalc.Callbacks.broadcast("execute", {
      cmdtype: "wcmd",
      id: "0",
      cmdstr: cmdstr,
    });
  };

  SocialCalc.WorkBookControlRenameSheetRemote = function (
    sheetid,
    oldname,
    newname
  ) {
    //console.log("rename sheet ",sheetid, oldname, newname)
    var control = SocialCalc.GetCurrentWorkBookControl();

    var foo = document.getElementById("fooBar");
    var renbutton = document.getElementById(sheetid);

    renbutton.value = newname;

    SocialCalc.SheetBarButtonSetName(sheetid, newname);

    control.workbook.RenameWorkBookSheet(oldname, newname, sheetid);
  };

  SocialCalc.WorkBookControlCreateNewBook = function () {
    var control = SocialCalc.GetCurrentWorkBookControl();

    // delete all the sheets except 1
    for (var sheet in control.sheetButtonArr) {
      if (sheet != control.currentSheetButton.id) {
        control.workbook.DeleteWorkBookSheet(
          control.sheetButtonArr[sheet].id,
          control.sheetButtonArr[sheet].value
        );
      }
    }
    // Reset that 1 sheet

    control.workbook.LoadRenameWorkBookSheet(
      control.currentSheetButton.id,
      "",
      control.workbook.defaultsheetname
    );

    // delete all the buttons except 1
    for (var sheet in control.sheetButtonArr) {
      if (sheet != control.currentSheetButton.id) {
        var foo = document.getElementById("fooBar");
        var current = document.getElementById(control.sheetButtonArr[sheet].id);

        var name = current.id;
        delete control.sheetButtonArr[name];

        foo.removeChild(current);

        var sheetbar = document.getElementById("SocialCalc-sheetbar-buttons");
        var sheetbarbutton = document.getElementById("sbsb-" + name);
        // unregister with mouse ? etc
        sheetbar.removeChild(sheetbarbutton);

        control.numSheets = control.numSheets - 1;
      }
    }
    // rename that button
    control.currentSheetButton.value = control.workbook.defaultsheetname;
    //alert("done new workbook")
  };

  SocialCalc.WorkBookControlNewBook = function () {
    var control = SocialCalc.GetCurrentWorkBookControl();
    SocialCalc.WorkBookControlCreateNewBook();
    control.workbook.RenderWorkBookSheet();
  };

  SocialCalc.WorkBookControlMove = function (direction) {
    var control = SocialCalc.GetCurrentWorkBookControl();
    if (control.workbook.spreadsheet.editor.state != "start") {
      return;
    }
    var sheetArr = control.sheetButtonArr;
    var newSheetArr = {};
    var sheetid = control.currentSheetButton.id;

    var curr_button = document.getElementById(sheetid);
    var curr_sb_button = document.getElementById("sbsb-" + sheetid);
    var sib_button = null;
    var sib_sb_button = null;
    if (direction == "left") {
      sib_button = curr_button.previousSibling;
      sib_sb_button = curr_sb_button.previousSibling;
      if (!sib_sb_button) {
        alert("Cannot move leftmost Sheet further to the left");
        return;
      }
    } else {
      sib_button = curr_button.nextSibling;
      sib_sb_button = curr_sb_button.nextSibling;
      if (!sib_sb_button) {
        alert("Cannot move rightmost Sheet further to the right");
        return;
      }
    }
    var currid = sheetid;
    var sibid = sib_button.id;
    var parent = curr_button.parentNode;
    var sb_parent = curr_sb_button.parentNode;

    var cloned = {};
    var clonedsb = {};
    for (button in sheetArr) {
      clonedsb[button] = document.getElementById("sbsb-" + button);
      cloned[button] = document.getElementById(button);
      sb_parent.removeChild(document.getElementById("sbsb-" + button));
      parent.removeChild(document.getElementById(button));
    }
    for (button in sheetArr) {
      if (button != currid && button != sibid) {
        newSheetArr[button] = sheetArr[button];
        sb_parent.appendChild(clonedsb[button]);
        parent.appendChild(cloned[button]);
      } else if (button == currid) {
        if (direction == "left") {
          newSheetArr[currid] = sheetArr[currid];
          newSheetArr[sibid] = sheetArr[sibid];
          sb_parent.appendChild(clonedsb[currid]);
          parent.appendChild(cloned[currid]);
          sb_parent.appendChild(clonedsb[sibid]);
          parent.appendChild(cloned[sibid]);
        } else {
          newSheetArr[sibid] = sheetArr[sibid];
          newSheetArr[currid] = sheetArr[currid];
          sb_parent.appendChild(clonedsb[sibid]);
          parent.appendChild(cloned[sibid]);
          sb_parent.appendChild(clonedsb[currid]);
          parent.appendChild(cloned[currid]);
        }
      }
    }
    control.sheetButtonArr = newSheetArr;
    SocialCalc.SheetBarButtonActivate(currid, true);
  };

  SocialCalc.WorkBookControlMoveLeft = function () {
    SocialCalc.WorkBookControlMove("left");
  };
  SocialCalc.WorkBookControlMoveRight = function () {
    SocialCalc.WorkBookControlMove("right");
  };

  SocialCalc.WorkBookControlCopySheet = function () {
    //alert("in copy");

    var control = SocialCalc.GetCurrentWorkBookControl();

    if (control.workbook.spreadsheet.editor.state != "start") {
      // if in edit return
      return;
    }

    control.workbook.CopyWorkBookSheet(control.currentSheetButton.id);

    alert("copied sheet:" + control.currentSheetButton.value);
  };

  SocialCalc.WorkBookControlPasteSheet = function () {
    //alert("in paste");

    var control = SocialCalc.GetCurrentWorkBookControl();

    if (control.workbook.spreadsheet.editor.state != "start") {
      // if in edit return
      return;
    }

    var oldid = control.currentSheetButton.id;

    SocialCalc.WorkBookControlAddSheet(false);

    var newid = control.currentSheetButton.id;

    //alert(newid+oldid);

    control.workbook.PasteWorkBookSheet(newid, oldid);

    var cmdstr = "addsheetstr";
    SocialCalc.Callbacks.broadcast("execute", {
      cmdtype: "wcmd",
      id: "0",
      cmdstr: cmdstr,
      sheetstr: control.workbook.clipsheet.savestr,
    });
  };

  SocialCalc.SheetBar = function () {
    this.baseDiv = document.getElementById("SocialCalc-sheetbar");

    this.prebuttonsDiv = document.createElement("div");
    this.prebuttonsDiv.style.cssText = "display:inline;";
    this.prebuttonsDiv.innerHTML = "&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp";
    this.prebuttonsDiv.id = "SocialCalc-sheetbar-prebuttons";

    this.buttonsDiv = document.createElement("div");
    this.buttonsDiv.id = "SocialCalc-sheetbar-buttons";
    this.buttonsDiv.style.cssText = "display:inline;";

    this.buttonActionsDiv = document.createElement("div");
    this.buttonActionsDiv.id = "SocialCalc-sheetbar-buttonactions";
    this.buttonActionsDiv.style.display = "inline";
    var addbutton = new SocialCalc.SheetBarSheetButton(
      "sbsba-add",
      "sbsba-add",
      this.buttonActionsDiv,
      {},
      {
        MouseDown: function () {
          var abc = SocialCalc.WorkBookControlAddSheet(true);
        },
      },
      "add-2.png"
    );

    this.baseDiv.appendChild(this.prebuttonsDiv);
    this.baseDiv.appendChild(this.buttonsDiv);
    this.baseDiv.appendChild(this.buttonActionsDiv);
  };

  // define a new class for sheetbarsheetbutton

  SocialCalc.SheetBarSheetButton = function (
    id,
    name,
    parentdiv,
    params,
    functions,
    img
  ) {
    this.ele = document.createElement("div");
    this.ele.id = id;
    this.ele.name = name;
    if (!img) {
      this.ele.innerHTML = name;
      this.ele.style.cssText =
        "font-size:small;display:inline;padding:5px 5px 2px 5px;border:1px solid #000;";
      imgele = document.createElement("img");
      imgele.id = id + "-img";
      imgele.src =
        SocialCalc.Constants.defaultImagePrefix + "menu-dropdown.png";
      imgele.style.cssText =
        "padding:0px 2px;width:16px;height:16px;vertical-align:middle;";
      this.ele.appendChild(imgele);
      SocialCalc.ButtonRegister(this.ele, params, functions);
      SocialCalc.ButtonRegister(imgele, params, functions);
    } else {
      var imgele = document.createElement("img");
      imgele.src = SocialCalc.Constants.defaultImagePrefix + img;
      imgele.style.cssText = "width:16px;height:16px;vertical-align:middle;";
      this.ele.appendChild(imgele);
      this.ele.style.cssText = "display:inline;padding:5px 5px 2px 5px;";
      SocialCalc.ButtonRegister(imgele, params, functions);
    }
    parentdiv.appendChild(this.ele);
  };

  SocialCalc.SheetBarButtonActivate = function (id, active) {
    var sbbutton = document.getElementById("sbsb-" + id);
    sbbutton.isactive = active;
    if (active) {
      sbbutton.style.backgroundColor = "#FFF";
      var imgele = document.getElementById("sbsb-" + id + "-img");
      if (!imgele) {
        imgele = document.createElement("img");
        imgele.id = "sbsb-" + id + "-img";
        imgele.src =
          SocialCalc.Constants.defaultImagePrefix + "menu-dropdown.png";
        imgele.style.cssText =
          "padding:0px 2px;width:16px;height:16px;vertical-align:middle;";
      }
      sbbutton.appendChild(imgele);
      SocialCalc.ButtonRegister(
        imgele,
        {},
        {
          MouseDown: function () {
            SocialCalc.SheetBarSheetButtonPress(id);
          },
          Repeat: function () { },
          Disabled: function () { },
        }
      );
    } else {
      sbbutton.style.backgroundColor = "#CCC";
      var imgele = document.getElementById("sbsb-" + id + "-img");
      if (imgele) {
        sbbutton.removeChild(imgele);
      }
    }
    var menu = document.getElementById("sbsb-menu");
    if (menu && menu.style.display != "none") {
      menu.style.display = "none";
    }
  };

  SocialCalc.SheetBarButtonSetName = function (id, name) {
    var sbbutton = document.getElementById("sbsb-" + id);
    sbbutton.name = name;
    sbbutton.innerHTML = name;
    if (sbbutton.isactive) {
      SocialCalc.SheetBarButtonActivate(id, true);
    }
  };

  SocialCalc.SheetBarSheetButtonPress = function (id) {
    //console.log("button press")
    var sbbutton = document.getElementById("sbsb-" + id);
    if (sbbutton && sbbutton.isactive) {
      var menu = document.getElementById("sbsb-menu");
      if (!menu) {
        var sbsbm = new SocialCalc.SheetBarSheetButtonMenu("sbsb-menu", id);
      } else {
        menu.clickedsheetid = id;
        if (menu.style.display == "none") {
          menu.style.display = "inline";
          SocialCalc.SheetBarSheetButtonMenuPosition(menu, id);
        } else {
          menu.style.display = "none";
        }
      }
    } else if (sbbutton) {
      SocialCalc.WorkBookControlActivateSheet(id);
    }
  };

  // define a new class for sheetbarsheet button menu item

  SocialCalc.SheetBarSheetButtonMenuItem = function (id, t) {
    this.ele = document.createElement("div");
    this.ele.id = id;
    this.ele.innerHTML = t;
    this.ele.className = "";
    this.ele.style.cssText =
      "padding:3px 4px;width:100px;height:20px;background-color:#FFF;";

    var params = {
      normalstyle: "backgroundColor:#FFF;",
      downstyle: "backgroundColor:#CCC;",
      hoverstyle: "backgroundColor:#CCC;",
    };
    var functions = {
      MouseDown: function () {
        SocialCalc.SheetBarMenuItemPress(id);
      },
      Repeat: function () { },
      Disabled: function () { },
    };

    SocialCalc.ButtonRegister(this.ele, params, functions);

    SocialCalc.TouchRegister(this.ele, { SingleTap: functions.MouseDown });

    return this.ele;
  };

  SocialCalc.SheetBarMenuItemPress = function (id) {
    var menu = document.getElementById("sbsb-menu");
    if (!menu) return;

    var clickedsheetid = menu.clickedsheetid;

    switch (id) {
      case "sbsb_deletesheet":
        //console.log("delete "+clickedsheetid);
        SocialCalc.WorkBookControlDelSheet();
        break;
      case "sbsb_hidesheet":
        //console.log("hide" +clickedsheetid);
        SocialCalc.WorkBookControlHideSheet();
        break;
      case "sbsb_unhidesheet":
        //console.log("hide" +clickedsheetid);
        SocialCalc.WorkBookControlUnhideSheet();
        break;
      case "sbsb_copysheet":
        //console.log("copy "+clickedsheetid);
        SocialCalc.WorkBookControlCopySheet();
        break;
      case "sbsb_moveleft":
        //console.log("rename "+clickedsheetid);
        SocialCalc.WorkBookControlMoveLeft();
        break;
      case "sbsb_moveright":
        //console.log("rename "+clickedsheetid);
        SocialCalc.WorkBookControlMoveRight();
        break;

      case "sbsb_pastesheet":
        //console.log("paste "+clickedsheetid);
        SocialCalc.WorkBookControlPasteSheet();
        break;
      case "sbsb_renamesheet":
        //console.log("rename "+clickedsheetid);
        SocialCalc.WorkBookControlRenameSheet();
        break;
      case "sbsb_closemenu":
        //console.log("rename "+clickedsheetid);
        menu.style.display = "none";
        break;
      default:
        break;
    }
    menu.style.display = "none";
  };

  // define a new class for sheetbarsheet button menu
  SocialCalc.SheetBarSheetButtonMenu = function (id, clickedsheetid) {
    this.ele = document.createElement("div");
    this.ele.id = id;
    this.ele.className = "";
    this.ele.clickedsheetid = clickedsheetid;
    this.ele.style.cssText =
      "border:1px solid #000;position:absolute;top:200px;left:0px;width=100px;z-index:120";

    var ele1 = new SocialCalc.SheetBarSheetButtonMenuItem(
      "sbsb_deletesheet",
      " Delete Sheet"
    );
    this.ele.appendChild(ele1);
    ele1 = new SocialCalc.SheetBarSheetButtonMenuItem(
      "sbsb_hidesheet",
      " Hide Sheet "
    );
    this.ele.appendChild(ele1);
    ele1 = new SocialCalc.SheetBarSheetButtonMenuItem(
      "sbsb_unhidesheet",
      " Unhide Sheet "
    );
    this.ele.appendChild(ele1);
    ele1 = new SocialCalc.SheetBarSheetButtonMenuItem(
      "sbsb_renamesheet",
      " Rename Sheet "
    );
    this.ele.appendChild(ele1);
    ele1 = new SocialCalc.SheetBarSheetButtonMenuItem(
      "sbsb_moveleft",
      " Move Left "
    );
    this.ele.appendChild(ele1);
    ele1 = new SocialCalc.SheetBarSheetButtonMenuItem(
      "sbsb_moveright",
      " Move Right "
    );
    this.ele.appendChild(ele1);
    ele1 = new SocialCalc.SheetBarSheetButtonMenuItem(
      "sbsb_copysheet",
      " Copy Sheet "
    );
    this.ele.appendChild(ele1);
    ele1 = new SocialCalc.SheetBarSheetButtonMenuItem(
      "sbsb_pastesheet",
      " Paste Sheet "
    );
    this.ele.appendChild(ele1);
    ele1 = new SocialCalc.SheetBarSheetButtonMenuItem(
      "sbsb_closemenu",
      " Cancel"
    );
    this.ele.appendChild(ele1);

    SocialCalc.SheetBarSheetButtonMenuPosition(this.ele, clickedsheetid);

    //var clickedsheet = document.getElementById(clickedsheetid);
    //var position = SocialCalc.GetElementPosition(clickedsheet);
    //console.log(clickedsheet.offsetHeight,clickedsheet.offsetWidth,clickedsheet.offsetLeft, clickedsheet.offsetTop);

    var control = SocialCalc.GetCurrentWorkBookControl();
    control.workbook.spreadsheet.editor.toplevel.appendChild(this.ele);
  };

  // position the sheet menu
  SocialCalc.SheetBarSheetButtonMenuPosition = function (menu, clickedsheetid) {
    var hlessbutton = document.getElementById("te_lessbuttonh");

    //console.log(hlessbutton.style.top, hlessbutton.style.left);

    var sbbutton = document.getElementById("sbsb-" + clickedsheetid);

    //console.log(sbbutton.offsetLeft,clickedsheetid);

    var top = hlessbutton.style.top.slice(0, -2) - 220;
    var left = sbbutton.offsetLeft + 7;

    menu.style.top = top + "px";
    menu.style.left = left + "px";

    //console.log(menu.style.top, menu.style.left);
  };

  SocialCalc.ScriptInfo = {
    scripts: {},
    handle: null,
  };

  SocialCalc.ScriptCheck = function (sheetid, coord, text) {
    var commentstart = text.indexOf("<!--script");
    var commentend = text.indexOf("script-->");
    if (commentstart != -1 && commentend != -1) {
      script = text.slice(commentstart + 10, commentend);
      //alert(script);
      SocialCalc.ScriptInfo.scripts[coord] = script;
      if (SocialCalc.ScriptInfo.handle == null) {
        SocialCalc.ScriptInfo.handle = window.setTimeout(
          SocialCalc.EvalUserScripts,
          500
        );
      }
      //alert(coord+"-"+sheetid);
    }
  };

  SocialCalc.EvalUserScript = function (data) {
    var head =
      document.getElementsByTagName("head")[0] || document.documentElement;

    if (data == "") return;

    var script = document.createElement("script");

    script.type = "text/javascript";
    try {
      // doesn't work on ie...
      script.appendChild(document.createTextNode(data));
    } catch (e) {
      // IE has funky script nodes
      script.text = data;
    }

    head.insertBefore(script, head.firstChild);
    head.removeChild(script);
  };

  SocialCalc.EvalUserScripts = function () {
    for (var cr in SocialCalc.ScriptInfo.scripts) {
      SocialCalc.EvalUserScript(SocialCalc.ScriptInfo.scripts[cr]);
      //console.log(cr,SocialCalc.ScriptInfo.scripts[cr])
    }
    SocialCalc.ScriptInfo.handle = null;
    SocialCalc.ScriptInfo.scripts = {};
  };

  SocialCalc.CallOutOnRenderCell = function (sheetobj, value, cr) {
    var cell = sheetobj.cells[cr];
    if (!cell) return;
    var valuetype = cell.valuetype || ""; // get type of value to determine formatting
    var valuesubtype = valuetype.substring(1);
    var sheetattribs = sheetobj.attribs;
    var valueformat;
    valuetype = valuetype.charAt(0);
    if (valuetype == "t") {
      valueformat =
        sheetobj.valueformats[cell.textvalueformat - 0] ||
        sheetobj.valueformats[sheetattribs.defaulttextvalueformat - 0] ||
        "";
      if (valueformat == "text-html") {
        SocialCalc.ScriptCheck(sheetobj.sheetid, cr, value);
      }
    }
  };

  SocialCalc.GetCellDataValue = function (coord) {
    var sheetname = null;
    var sheetid = "";
    var bindex = coord.indexOf("!");
    if (bindex != -1) {
      sheetname = coord.slice(0, bindex);
      coord = coord.slice(bindex + 1);
      //console.log(sheetname,coord)
    }
    var control = SocialCalc.GetCurrentWorkBookControl();

    if (sheetname == null) {
      sheetid = control.currentSheetButton.id;
    } else {
      sheetid = control.workbook.SheetNameExistsInWorkBook(sheetname);
    }

    if (sheetid == null || sheetid == "") {
      return "0";
    }

    var sheetobj = control.workbook.sheetArr[sheetid].sheet;

    var cell = sheetobj.cells[coord];

    if (cell) {
      return cell.datavalue;
    } else {
      return 0;
    }
  };

  SocialCalc.GetCellDataArray = function (coordstr, sheetname) {
    var vals = [];
    var coords = coordstr.split(",");
    if (sheetname == null) {
      sheetname = "";
    } else {
      sheetname = sheetname + "!";
    }
    for (var c in coords) {
      vals.push(SocialCalc.GetCellDataValue(sheetname + coords[c]));
    }
    return vals;
  };

  SocialCalc.UserScriptData = {};

  SocialCalc.WorkBookRecalculateInfo = {
    sheets: [],
    calcorder: [],
    current: 0,
    pass: 0,
  };

  SocialCalc.WorkBookRecalculateAll = function () {
    // do it from the last sheet to the first sheet
    // using the recalc-done signal to trigger the next sheet

    // if already in the middle of a recalculate-all, ignore this.
    if (
      SocialCalc.WorkBookRecalculateInfo.current != 0 ||
      SocialCalc.WorkBookRecalculateInfo.calcorder.length != 0 ||
      SocialCalc.WorkBookRecalculateInfo.sheets.length != 0
    ) {
      return;
    }

    var control = SocialCalc.GetCurrentWorkBookControl();

    if (control.workbook.spreadsheet.editor.state != "start") {
      // if in edit return
      return;
    }

    SocialCalc.WorkBookRecalculateInfo.current = 0;

    for (var sheet in control.workbook.sheetArr) {
      SocialCalc.WorkBookRecalculateInfo.sheets.push(sheet);
    }

    var i = 0;
    for (var c = SocialCalc.WorkBookRecalculateInfo.sheets.length; c > 0; c--) {
      SocialCalc.WorkBookRecalculateInfo.calcorder[i] =
        SocialCalc.WorkBookRecalculateInfo.sheets[c - 1];
      i++;
    }
    window.setTimeout(SocialCalc.WorkBookRecalculateStep, 500);
  };

  SocialCalc.WorkBookRecalculateStep = function () {
    if (
      SocialCalc.WorkBookRecalculateInfo.current ==
      SocialCalc.WorkBookRecalculateInfo.calcorder.length
    ) {
      SocialCalc.WorkBookRecalculateInfo.current = 0;
      SocialCalc.WorkBookRecalculateInfo.calcorder = [];
      SocialCalc.WorkBookRecalculateInfo.sheets = [];
      if (SocialCalc.WorkBookRecalculateInfo.pass == 1) {
        SocialCalc.WorkBookRecalculateInfo.pass = 0;
        SocialCalc.SpinnerWaitHide();
        //alert("load done");
        return;
      } else {
        SocialCalc.WorkBookRecalculateInfo.pass++;
        SocialCalc.WorkBookRecalculateAll();
        return;
      }
    }
    var control = SocialCalc.GetCurrentWorkBookControl();
    //alert("recalculate "+
    //   SocialCalc.WorkBookRecalculateInfo.calcorder[
    //     SocialCalc.WorkBookRecalculateInfo.current]
    //   );
    var sheetid =
      SocialCalc.WorkBookRecalculateInfo.calcorder[
      SocialCalc.WorkBookRecalculateInfo.current
      ];
    SocialCalc.WorkBookControlActivateSheet(sheetid);
    SocialCalc.WorkBookRecalculateInfo.current++;

    window.setTimeout(SocialCalc.WorkBookRecalculateStep, 1000);
  };

  SocialCalc.SpinnerWaitCreate = function () {
    // if the div exists already just use it
    var ele = document.getElementById("waitloadingspinner");
    if (ele) {
      return;
    }
    var main = document.createElement("div");
    main.id = "waitloadingspinner";

    main.style.position = "absolute";

    var vp = SocialCalc.GetViewportInfo();
    main.style.top = vp.height / 2 + "px";
    main.style.left = vp.width / 2 + "px";
    main.style.zIndex = 110;

    main.style.width = "50px";
    main.style.height = "50px";
    main.innerHTML =
      '<img src="/assets/images/spinner.gif" alt="Loading..." />';

    var control = SocialCalc.GetCurrentWorkBookControl();
    control.workbook.spreadsheet.spreadsheetDiv.appendChild(main);
  };

  SocialCalc.SpinnerWaitHide = function () {
    // if the div exists already just use it

    var ele = document.getElementById("waitloadingspinner");
    if (ele) {
      ele.innerHTML = "";

      if (ele.parentNode) {
        ele.parentNode.removeChild(ele);
      }
    }
  };

  SocialCalc.EditableCells = {};
  SocialCalc.EditableCells.allow = false;
  SocialCalc.EditableCells.cells = {};

  SocialCalc.Callbacks.IsCoordEditable = function (sheetcoord) {
    if (!SocialCalc.EditableCells.allow) {
      // by default all cells are editable
      return true;
    }
    if (SocialCalc.EditableCells.cells[sheetcoord]) {
      // by default all cells are editable
      return true;
    }

    return false;
  };

  SocialCalc.Callbacks.IsCellEditable = function (editor) {
    var cellname = editor.workingvalues.currentsheet + "!" + editor.ecell.coord;
    if (!SocialCalc.EditableCells.allow) {
      // by default all cells are editable
      return true;
    }
    if (SocialCalc.EditableCells.cells[cellname]) {
      // by default all cells are editable
      return true;
    }

    return false;
  };

  SocialCalc.IsScrollPossible = function (
    lastrow,
    lastcol,
    curr_vpos,
    curr_hpos,
    vamount,
    hamount
  ) {
    //return false;
    //console.log(lastrow+","+lastcol);
    //console.log(curr_vpos+","+curr_hpos);
    //console.log(vamount+","+hamount);

    if (curr_vpos + 10 + vamount > lastrow) {
      return false;
    }
    if (curr_hpos + hamount > lastcol) {
      return false;
    }
    return true;
  };

  // this is for checkmark toggling
  SocialCalc.Callbacks.ToggleCell = function (cellname) {
    var control = SocialCalc.GetCurrentWorkBookControl();
    var sheetid = control.currentSheetButton.id;
    var sheetobj = control.workbook.sheetArr[sheetid].sheet;
    var cell = sheetobj.cells[cellname];
    var sheetname = sheetobj.sheetname;

    // check if cell is in constraints
    //console.log(sheetname);
    //console.log(cellname);

    var constraint =
      SocialCalc.EditableCells.constraints[sheetname + "!" + cellname];
    if (!constraint || constraint[0] != "tc") {
      return;
    }

    var cellinner = document.getElementById("cell_" + cellname);

    if (cellinner.innerHTML.indexOf("&nbsp;") != -1) {
      // set the value to the img value
      cellinner.innerHTML =
        '<div><img src="http://imageshack.com/a/img924/3599/c5fBZx.png" height="15" width="15"></img></div>';
      if (cell) {
        //cell.displaystring = '<div><img src="http://img689.imageshack.us/img689/9234/checkmark.png"></img></div>'    ;
        //cell.datavalue = '<div><img src="http://img689.imageshack.us/img689/9234/checkmark.png"></img></div>'   ;
        //console.log("found cell")
        cell.displaystring =
          '<div><img src="http://imageshack.com/a/img924/3599/c5fBZx.png" height="15" width="15"></img></div>';
        cell.datavalue =
          '<div><img src="http://imageshack.com/a/img924/3599/c5fBZx.png" height="15" width="15"></img></div>';
        //http://img689.imageshack.us/img689/9234/checkmark.png
      }
    } else {
      // set the value to a space
      cellinner.innerHTML = "<div>&nbsp;</div>";
      if (cell) {
        cell.datavalue = "<div>&nbsp;</div>";
        cell.displaystring = "<div>&nbsp;</div>";
      }
    }
  };

  SocialCalc.WorkbookControlCreateSheetHTML = function (sheetlist) {
    var context, div, ele;

    var result = "";

    var control = SocialCalc.GetCurrentWorkBookControl();

    div = document.createElement("div");

    if (!sheetlist) {
      context = new SocialCalc.RenderContext(spreadsheet.sheet);
      ele = context.RenderSheet(null, { type: "html" });
      div.appendChild(ele);
      context = undefined;
    } else {
      for (var sheetid in sheetlist) {
        context = new SocialCalc.RenderContext(
          control.workbook.sheetArr[sheetid].sheet
        );
        ele = context.RenderSheet(null, { type: "html" });
        context = undefined;
        div.appendChild(ele);
        if (sheetid.substring(5) == control.sheetCnt) {
          ele.style.pageBreakAfter = "auto";
        } else {
          ele.style.pageBreakAfter = "always";
        }
      }
    }

    result = div.innerHTML;
    ele = undefined;
    div = undefined;
    //console.log(result);
    return result;
  };

  /*
    http://www.JSON.org/json2.js
    2010-08-25

    Public Domain.

    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    See http://www.JSON.org/js.html


    This code should be minified before deployment.
    See http://javascript.crockford.com/jsmin.html

    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    NOT CONTROL.


    This file creates a global JSON object containing two methods: stringify
    and parse.

        JSON.stringify(value, replacer, space)
            value       any JavaScript value, usually an object or array.

            replacer    an optional parameter that determines how object
                        values are stringified for objects. It can be a
                        function or an array of strings.

            space       an optional parameter that specifies the indentation
                        of nested structures. If it is omitted, the text will
                        be packed without extra whitespace. If it is a number,
                        it will specify the number of spaces to indent at each
                        level. If it is a string (such as '\t' or '&nbsp;'),
                        it contains the characters used to indent at each level.

            This method produces a JSON text from a JavaScript value.

            When an object value is found, if the object contains a toJSON
            method, its toJSON method will be called and the result will be
            stringified. A toJSON method does not serialize: it returns the
            value represented by the name/value pair that should be serialized,
            or undefined if nothing should be serialized. The toJSON method
            will be passed the key associated with the value, and this will be
            bound to the value

            For example, this would serialize Dates as ISO strings.

                Date.prototype.toJSON = function (key) {
                    function f(n) {
                        // Format integers to have at least two digits.
                        return n < 10 ? '0' + n : n;
                    }

                    return this.getUTCFullYear()   + '-' +
                         f(this.getUTCMonth() + 1) + '-' +
                         f(this.getUTCDate())      + 'T' +
                         f(this.getUTCHours())     + ':' +
                         f(this.getUTCMinutes())   + ':' +
                         f(this.getUTCSeconds())   + 'Z';
                };

            You can provide an optional replacer method. It will be passed the
            key and value of each member, with this bound to the containing
            object. The value that is returned from your method will be
            serialized. If your method returns undefined, then the member will
            be excluded from the serialization.

            If the replacer parameter is an array of strings, then it will be
            used to select the members to be serialized. It filters the results
            such that only members with keys listed in the replacer array are
            stringified.

            Values that do not have JSON representations, such as undefined or
            functions, will not be serialized. Such values in objects will be
            dropped; in arrays they will be replaced with null. You can use
            a replacer function to replace those with JSON values.
            JSON.stringify(undefined) returns undefined.

            The optional space parameter produces a stringification of the
            value that is filled with line breaks and indentation to make it
            easier to read.

            If the space parameter is a non-empty string, then that string will
            be used for indentation. If the space parameter is a number, then
            the indentation will be that many spaces.

            Example:

            text = JSON.stringify(['e', {pluribus: 'unum'}]);
            // text is '["e",{"pluribus":"unum"}]'


            text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
            // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

            text = JSON.stringify([new Date()], function (key, value) {
                return this[key] instanceof Date ?
                    'Date(' + this[key] + ')' : value;
            });
            // text is '["Date(---current time---)"]'


        JSON.parse(text, reviver)
            This method parses a JSON text to produce an object or array.
            It can throw a SyntaxError exception.

            The optional reviver parameter is a function that can filter and
            transform the results. It receives each of the keys and values,
            and its return value is used instead of the original value.
            If it returns what it received, then the structure is not modified.
            If it returns undefined then the member is deleted.

            Example:

            // Parse the text. Values that look like ISO date strings will
            // be converted to Date objects.

            myData = JSON.parse(text, function (key, value) {
                var a;
                if (typeof value === 'string') {
                    a =
/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
                    if (a) {
                        return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
                            +a[5], +a[6]));
                    }
                }
                return value;
            });

            myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
                var d;
                if (typeof value === 'string' &&
                        value.slice(0, 5) === 'Date(' &&
                        value.slice(-1) === ')') {
                    d = new Date(value.slice(5, -1));
                    if (d) {
                        return d;
                    }
                }
                return value;
            });


    This is a reference implementation. You are free to copy, modify, or
    redistribute.
*/

  /*jslint evil: true, strict: false */

  /*members "", "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", apply,
    call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
    getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
    lastIndex, length, parse, prototype, push, replace, slice, stringify,
    test, toJSON, toString, valueOf
*/

  // Create a JSON object only if one does not already exist. We create the
  // methods in a closure to avoid creating global variables.

  var globalThis = (function () {
    if (typeof window !== "undefined") return window;
    if (typeof global !== "undefined") return global;
    if (typeof self !== "undefined") return self;
    return this;
  })();

  if (!globalThis.JSON) {
    globalThis.JSON = {};
  }

  (function () {
    function f(n) {
      // Format integers to have at least two digits.
      return n < 10 ? "0" + n : n;
    }

    if (typeof Date.prototype.toJSON !== "function") {
      Date.prototype.toJSON = function (key) {
        return isFinite(this.valueOf())
          ? this.getUTCFullYear() +
          "-" +
          f(this.getUTCMonth() + 1) +
          "-" +
          f(this.getUTCDate()) +
          "T" +
          f(this.getUTCHours()) +
          ":" +
          f(this.getUTCMinutes()) +
          ":" +
          f(this.getUTCSeconds()) +
          "Z"
          : null;
      };

      String.prototype.toJSON =
        Number.prototype.toJSON =
        Boolean.prototype.toJSON =
        function (key) {
          return this.valueOf();
        };
    }

    var cx =
      /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
      escapable =
        /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
      gap,
      indent,
      meta = {
        // table of character substitutions
        "\b": "\\b",
        "\t": "\\t",
        "\n": "\\n",
        "\f": "\\f",
        "\r": "\\r",
        '"': '\\"',
        "\\": "\\\\",
      },
      rep;

    function quote(string) {
      // If the string contains no control characters, no quote characters, and no
      // backslash characters, then we can safely slap some quotes around it.
      // Otherwise we must also replace the offending characters with safe escape
      // sequences.

      escapable.lastIndex = 0;
      return escapable.test(string)
        ? '"' +
        string.replace(escapable, function (a) {
          var c = meta[a];
          return typeof c === "string"
            ? c
            : "\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4);
        }) +
        '"'
        : '"' + string + '"';
    }

    function str(key, holder) {
      // Produce a string from holder[key].

      var i, // The loop counter.
        k, // The member key.
        v, // The member value.
        length,
        mind = gap,
        partial,
        value = holder[key];

      // If the value has a toJSON method, call it to obtain a replacement value.

      if (
        value &&
        typeof value === "object" &&
        typeof value.toJSON === "function"
      ) {
        value = value.toJSON(key);
      }

      // If we were called with a replacer function, then call the replacer to
      // obtain a replacement value.

      if (typeof rep === "function") {
        value = rep.call(holder, key, value);
      }

      // What happens next depends on the value's type.

      switch (typeof value) {
        case "string":
          return quote(value);

        case "number":
          // JSON numbers must be finite. Encode non-finite numbers as null.

          return isFinite(value) ? String(value) : "null";

        case "boolean":
        case "null":
          // If the value is a boolean or null, convert it to a string. Note:
          // typeof null does not produce 'null'. The case is included here in
          // the remote chance that this gets fixed someday.

          return String(value);

        // If the type is 'object', we might be dealing with an object or an array or
        // null.

        case "object":
          // Due to a specification blunder in ECMAScript, typeof null is 'object',
          // so watch out for that case.

          if (!value) {
            return "null";
          }

          // Make an array to hold the partial results of stringifying this object value.

          gap += indent;
          partial = [];

          // Is the value an array?

          if (Object.prototype.toString.apply(value) === "[object Array]") {
            // The value is an array. Stringify every element. Use null as a placeholder
            // for non-JSON values.

            length = value.length;
            for (i = 0; i < length; i += 1) {
              partial[i] = str(i, value) || "null";
            }

            // Join all of the elements together, separated with commas, and wrap them in
            // brackets.

            v =
              partial.length === 0
                ? "[]"
                : gap
                  ? "[\n" + gap + partial.join(",\n" + gap) + "\n" + mind + "]"
                  : "[" + partial.join(",") + "]";
            gap = mind;
            return v;
          }

          // If the replacer is an array, use it to select the members to be stringified.

          if (rep && typeof rep === "object") {
            length = rep.length;
            for (i = 0; i < length; i += 1) {
              k = rep[i];
              if (typeof k === "string") {
                v = str(k, value);
                if (v) {
                  partial.push(quote(k) + (gap ? ": " : ":") + v);
                }
              }
            }
          } else {
            // Otherwise, iterate through all of the keys in the object.

            for (k in value) {
              if (Object.hasOwnProperty.call(value, k)) {
                v = str(k, value);
                if (v) {
                  partial.push(quote(k) + (gap ? ": " : ":") + v);
                }
              }
            }
          }

          // Join all of the member texts together, separated with commas,
          // and wrap them in braces.

          v =
            partial.length === 0
              ? "{}"
              : gap
                ? "{\n" + gap + partial.join(",\n" + gap) + "\n" + mind + "}"
                : "{" + partial.join(",") + "}";
          gap = mind;
          return v;
      }
    }

    // If the JSON object does not yet have a stringify method, give it one.

    if (typeof globalThis.JSON.stringify !== "function") {
      globalThis.JSON.stringify = function (value, replacer, space) {
        // The stringify method takes a value and an optional replacer, and an optional
        // space parameter, and returns a JSON text. The replacer can be a function
        // that can replace values, or an array of strings that will select the keys.
        // A default replacer method can be provided. Use of the space parameter can
        // produce text that is more easily readable.

        var i;
        gap = "";
        indent = "";

        // If the space parameter is a number, make an indent string containing that
        // many spaces.

        if (typeof space === "number") {
          for (i = 0; i < space; i += 1) {
            indent += " ";
          }

          // If the space parameter is a string, it will be used as the indent string.
        } else if (typeof space === "string") {
          indent = space;
        }

        // If there is a replacer, it must be a function or an array.
        // Otherwise, throw an error.

        rep = replacer;
        if (
          replacer &&
          typeof replacer !== "function" &&
          (typeof replacer !== "object" || typeof replacer.length !== "number")
        ) {
          throw new Error("JSON.stringify");
        }

        // Make a fake root object containing our value under the key of ''.
        // Return the result of stringifying the value.

        return str("", { "": value });
      };
    }

    // If the JSON object does not yet have a parse method, give it one.

    if (typeof globalThis.JSON.parse !== "function") {
      globalThis.JSON.parse = function (text, reviver) {
        // The parse method takes a text and an optional reviver function, and returns
        // a JavaScript value if the text is a valid JSON text.

        var j;

        function walk(holder, key) {
          // The walk method is used to recursively walk the resulting structure so
          // that modifications can be made.

          var k,
            v,
            value = holder[key];
          if (value && typeof value === "object") {
            for (k in value) {
              if (Object.hasOwnProperty.call(value, k)) {
                v = walk(value, k);
                if (v !== undefined) {
                  value[k] = v;
                } else {
                  delete value[k];
                }
              }
            }
          }
          return reviver.call(holder, key, value);
        }

        // Parsing happens in four stages. In the first stage, we replace certain
        // Unicode characters with escape sequences. JavaScript handles many characters
        // incorrectly, either silently deleting them, or treating them as line endings.

        text = String(text);
        cx.lastIndex = 0;
        if (cx.test(text)) {
          text = text.replace(cx, function (a) {
            return "\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4);
          });
        }

        // In the second stage, we run the text against regular expressions that look
        // for non-JSON patterns. We are especially concerned with '()' and 'new'
        // because they can cause invocation, and '=' because it can cause mutation.
        // But just to be safe, we want to reject all unexpected forms.

        // We split the second stage into 4 regexp operations in order to work around
        // crippling inefficiencies in IE's and Safari's regexp engines. First we
        // replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
        // replace all simple value tokens with ']' characters. Third, we delete all
        // open brackets that follow a colon or comma or that begin the text. Finally,
        // we look to see that the remaining characters are only whitespace or ']' or
        // ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

        if (
          /^[\],:{}\s]*$/.test(
            text
              .replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, "@")
              .replace(
                /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
                "]"
              )
              .replace(/(?:^|:|,)(?:\s*\[)+/g, "")
          )
        ) {
          // Use JSON.parse instead of eval for security (no XSS risk)
          j = JSON.parse(text);

          // In the optional fourth stage, we recursively walk the new structure, passing
          // each name/value pair to a reviver function for possible transformation.

          return typeof reviver === "function" ? walk({ "": j }, "") : j;
        }

        // If the text is not JSON parseable, then a SyntaxError is thrown.

        throw new SyntaxError("JSON.parse");
      };
    }
  })();

  SocialCalc.oldBtnActive = 1;
  SocialCalc.Constants.defaultImagePrefix = "/assets/images/sc_";
  SocialCalc.Constants.defaultGridCSS = "";
  SocialCalc.Constants.SCNoColNames = true;
  SocialCalc.Constants.SCNoRowName = true;
  SocialCalc.Constants.defaultRownameStyle = "";
  SocialCalc.Constants.defaultSelectedRownameStyle = "";
  SocialCalc.Popup.imagePrefix = "/assets/images/sc_";

  SocialCalc.ToggleInputLineButtons = function (show) {
    var bele = document.getElementById("testtest");
    if (!bele) return;
    if (show) {
      bele.style.display = "inline";
    } else {
      bele.style.display = "none";
    }
  };

  SocialCalc.InputLineClearText = function () {
    spreadsheet.editor.inputBox.SetText("");
  };

  SocialCalc.Callbacks.broadcast = function (type, data) { };

  // END OF FILE

  if ("undefined" === typeof document) {
    // We don't really need a DOM-based presentation layer on the server
    SocialCalc.GetEditorCellElement = function () { };
    SocialCalc.ReplaceCell = function () { };
    SocialCalc.EditorRenderSheet = function () { };
    SocialCalc.SpreadsheetControlSortSave = function () {
      return "";
    };
    SocialCalc.SpreadsheetControlStatuslineCallback = function () { };
    SocialCalc.DoPositionCalculations = function (editor) {
      SocialCalc.EditorSheetStatusCallback(null, "doneposcalc", null, editor);
    };
  }

  // Compatibility with webworker-threads
  if (typeof self !== "undefined" && self.thread) {
    window.setTimeout = function (cb, ms) {
      if (ms <= 1) {
        self.thread.nextTick(cb);
      }
    };
    window.clearTimeout = function () { };
  }

  // Just return a value to define the module export.
  return SocialCalc;
});


