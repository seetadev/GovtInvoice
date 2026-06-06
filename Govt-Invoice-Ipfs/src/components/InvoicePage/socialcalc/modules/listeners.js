// Cell change listeners and event handling
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

import { enhancedShowPrompt } from "./prompts.js";

export function setupMouseListener() {
  if (!SocialCalc || !SocialCalc.ProcessEditorMouseDown) {
    console.error("SocialCalc.ProcessEditorMouseDown not found");
    return () => { };
  }

  // 1. Capture current editors to re-register them
  const activeEditors = [];
  if (SocialCalc.EditorMouseInfo && SocialCalc.EditorMouseInfo.registeredElements) {
    // Clone the array because Unregister modifies it
    activeEditors.push(...SocialCalc.EditorMouseInfo.registeredElements.map(x => x.editor));
  }

  // 2. Unregister ALL existing editors using the OLD function reference
  // This is critical because removeEventListener requires the exact function ref
  activeEditors.forEach(editor => {
    if (editor && SocialCalc.EditorMouseUnregister) {
      SocialCalc.EditorMouseUnregister(editor);
    }
  });

  const originalMouseDown = SocialCalc.ProcessEditorMouseDown;
  const originalDblClick = SocialCalc.ProcessEditorDblClick;

  // Helper to open our custom modal safely
  const triggerCustomModal = (editor) => {
    // 1. Force blur/hide native input
    if (editor.inputBox) {
      if (editor.inputBox.element) {
        editor.inputBox.element.blur();
        editor.inputBox.element.style.opacity = '0';
        editor.inputBox.element.style.pointerEvents = 'none';
      }
      if (editor.inputBox.ShowInputBox) {
        editor.inputBox.ShowInputBox(false);
      }
    }

    // 2. Trigger Custom Modal if Editable
    if (editor && editor.ecell) {
      let isEditable = true;
      if (SocialCalc.Callbacks && SocialCalc.Callbacks.IsCellEditable) {
        isEditable = SocialCalc.Callbacks.IsCellEditable(editor);
      }

      if (isEditable) {
        enhancedShowPrompt(editor.ecell.coord);
      }
    }
  };


  // Override ProcessEditorMouseDown to prevent native input focus
  SocialCalc.ProcessEditorMouseDown = function (e) {
    // FIX: If a modal is open, ignore SocialCalc interactions to prevent focus stealing
    const modal = document.querySelector('ion-modal');
    if (modal && modal.offsetParent !== null) {
      return;
    }

    var editor, result, coord, range;
    var event = e || window.event;

    // Helper to get viewport info safely
    var viewport = SocialCalc.GetViewportInfo ? SocialCalc.GetViewportInfo() : { horizontalScroll: 0, verticalScroll: 0 };
    var clientX = event.clientX + viewport.horizontalScroll;
    var clientY = event.clientY + viewport.verticalScroll;

    var mouseinfo = SocialCalc.EditorMouseInfo;
    var ele = event.target || event.srcElement;
    var mobj;

    if (mouseinfo.ignore) return;

    // Traverse up to find the editor element
    for (mobj = null; !mobj && ele; ele = ele.parentNode) {
      if (SocialCalc.LookupElement) {
        mobj = SocialCalc.LookupElement(ele, mouseinfo.registeredElements);
      }
    }
    if (!mobj) {
      mouseinfo.editor = null;
      return;
    }

    editor = mobj.editor;
    mouseinfo.element = ele;
    range = editor.range;

    // Get grid position
    if (SocialCalc.GridMousePosition) {
      result = SocialCalc.GridMousePosition(editor, clientX, clientY);
    }

    if (!result || result.rowheader) return;
    mouseinfo.editor = editor;

    // Handle Column Resize
    if (result.colheader && result.coltoresize) {
      if (SocialCalc.ProcessEditorColsizeMouseDown) {
        SocialCalc.ProcessEditorColsizeMouseDown(e, ele, result);
      }
      return;
    }

    if (!result.coord) return;

    // Shift key Range Anchor
    if (!range.hasrange) {
      if (e.shiftKey) editor.RangeAnchor();
    }

    // Toggle Cell Callback
    if (SocialCalc.Callbacks && SocialCalc.Callbacks.ToggleCell) {
      SocialCalc.Callbacks.ToggleCell(result.coord);
    }

    // Move ECell (Updates Selection)
    coord = editor.MoveECell(result.coord);

    // Handle Range Extension
    if (range.hasrange) {
      if (e.shiftKey) editor.RangeExtend();
      else editor.RangeRemove();
    }

    mouseinfo.mousedowncoord = coord;
    mouseinfo.mouselastcoord = coord;

    // Update Mouse Range
    editor.EditorMouseRange(coord);

    // --- CUSTOM LOGIC ---
    triggerCustomModal(editor);
    // --------------------


    // Setup drag listeners (mousemove, mouseup)
    if (document.addEventListener) {
      document.addEventListener("mousemove", SocialCalc.ProcessEditorMouseMove, true);
      document.addEventListener("mouseup", SocialCalc.ProcessEditorMouseUp, true);
    } else if (ele.attachEvent) {
      ele.setCapture();
      ele.attachEvent("onmousemove", SocialCalc.ProcessEditorMouseMove);
      ele.attachEvent("onmouseup", SocialCalc.ProcessEditorMouseUp);
      ele.attachEvent("onlosecapture", SocialCalc.ProcessEditorMouseUp);
    }

    // Prevent default browser actions
    if (event.stopPropagation) event.stopPropagation();
    else event.cancelBubble = true;
    if (event.preventDefault) event.preventDefault();
    else event.returnValue = false;

    return;
  };

  // Override Double Click to suppress native input logic
  SocialCalc.ProcessEditorDblClick = function (e) {
    var event = e || window.event;
    // Just stop propagation and do NOT call EditorOpenCellEdit
    if (event.stopPropagation) event.stopPropagation();
    else event.cancelBubble = true;
    if (event.preventDefault) event.preventDefault();
    else event.returnValue = false;
    return false;
  };

  // --- KB Patch: Prevent SocialCalc from stealing keys when Modal is open ---
  const originalKeyDown = SocialCalc.ProcessKeyDown;
  const originalKeyPress = SocialCalc.ProcessKeyPress;

  const isInputBlocked = () => {
    const modal = document.querySelector('ion-modal');
    // If modal exists and is visible (offsetParent is not null)
    // Note: Ionic 6/7 might use different hiding, but offsetParent is a good check for visibility
    if (modal && modal.offsetParent !== null) return true;
    return false;
  };

  SocialCalc.ProcessKeyDown = function (e) {
    if (isInputBlocked()) return;
    if (originalKeyDown) return originalKeyDown.apply(this, arguments);
  };

  SocialCalc.ProcessKeyPress = function (e) {
    if (isInputBlocked()) return;
    if (originalKeyPress) return originalKeyPress.apply(this, arguments);
  };

  // Replace global handlers if they are currently set to the originals
  if (document.onkeydown === originalKeyDown) document.onkeydown = SocialCalc.ProcessKeyDown;
  if (document.onkeypress === originalKeyPress) document.onkeypress = SocialCalc.ProcessKeyPress;


  // 3. Re-register valid editors using the NEW function reference
  activeEditors.forEach(editor => {
    if (editor && SocialCalc.EditorMouseRegister) {
      // Check if editor element still exists in DOM (safety)
      if (editor.fullgrid && document.body.contains(editor.fullgrid) || true) { // simplified check
        SocialCalc.EditorMouseRegister(editor);
      }
    }
  });


  // Return cleanup function
  return function cleanup() {
    // Restore originals
    SocialCalc.ProcessEditorMouseDown = originalMouseDown;
    SocialCalc.ProcessEditorDblClick = originalDblClick;

    // Restore Keyboard Handlers
    SocialCalc.ProcessKeyDown = originalKeyDown;
    SocialCalc.ProcessKeyPress = originalKeyPress;

    if (document.onkeydown === SocialCalc.ProcessKeyDown) document.onkeydown = originalKeyDown;
    if (document.onkeypress === SocialCalc.ProcessKeyPress) document.onkeypress = originalKeyPress;

    // Note: We are NOT unregistering/re-registering on cleanup to simple revert
    // because that might be too invasive for a cleanup function, 
    // but ideally we should if we wanted to be perfectly clean.
  };
}

export function setupCellChangeListener(callback) {
  var control = SocialCalc.GetCurrentWorkBookControl();

  // Add safety check
  if (!control || !control.workbook || !control.workbook.spreadsheet) {
    // Spreadsheet not initialized yet. Retrying in 100ms...
    setTimeout(() => setupCellChangeListener(callback), 100);
    return () => { }; // Return empty cleanup function
  }

  var editor = control.workbook.spreadsheet.editor;

  // Store original save edit method
  var originalSaveEdit = SocialCalc.EditorSaveEdit;

  SocialCalc.EditorSaveEdit = function (editor, text) {
    var coord = editor.ecell.coord;
    var oldValue = SocialCalc.GetCellContents(editor.context.sheetobj, coord);

    // Call original method
    var result = originalSaveEdit.call(this, editor, text);

    // Trigger callback if value changed
    if (callback && oldValue !== text) {
      var currentControl = SocialCalc.GetCurrentWorkBookControl();
      if (currentControl && currentControl.currentSheetButton) {
        callback({
          coord: coord,
          oldValue: oldValue,
          newValue: text,
          timestamp: new Date(),
          sheetId: currentControl.currentSheetButton.id,
        });
      }
    }

    return result;
  };

  // Return cleanup function that restores original method
  return function cleanup() {
    SocialCalc.EditorSaveEdit = originalSaveEdit;
  };
}
