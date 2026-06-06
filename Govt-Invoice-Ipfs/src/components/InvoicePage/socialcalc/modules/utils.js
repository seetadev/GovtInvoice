// Utility functions for storage, formatting UI, etc.
import {
  getCellFormatting,
  applySelectedFormatting,
  resetCellFormatting,
} from "./formatting.js";

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

export function showFormattingButtons(coord, callback) {
  console.log("Showing formatting buttons for cell:", coord);

  if (window.cellFormattingInstance) {
    window.cellFormattingInstance.hideButtons();
  }

  window.cellFormattingInstance = {
    coord: coord,
    callback: callback,
    hideButtons: function () {
      const existingButtons = document.getElementById(
        "cell-formatting-buttons"
      );
      if (existingButtons) {
        existingButtons.remove();
      }
    },
  };

  const control = SocialCalc.GetCurrentWorkBookControl();
  const editor = control.workbook.spreadsheet.editor;

  // Get current cell formatting
  const currentFormatting = getCellFormatting(coord);
  console.log("Current cell formatting:", currentFormatting);

  // Create floating formatting buttons
  const buttonsContainer = document.createElement("div");
  buttonsContainer.id = "cell-formatting-buttons";

  // Check if dark theme is active
  const isDarkTheme =
    document.body.classList.contains("dark-theme") ||
    document.querySelector(".dark-theme") !== null;

  const baseStyles = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 10000;
    border-radius: 8px;
    padding: 12px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 220px;
  `;

  const themeStyles = isDarkTheme
    ? "background: #1a1a1a; border: 1px solid #444; color: #fff;"
    : "background: white; border: 1px solid #ccc; color: #000;";

  buttonsContainer.style.cssText = baseStyles + themeStyles;

  // Font Size Section
  const fontSizeSection = document.createElement("div");
  const fontSizeButtonStyle = isDarkTheme
    ? "padding: 4px 8px; border: 1px solid #555; border-radius: 4px; background: #2a2a2a; color: #fff; cursor: pointer; font-size: 10px;"
    : "padding: 4px 8px; border: 1px solid #ccc; border-radius: 4px; background: #f8f9fa; color: #000; cursor: pointer; font-size: 10px;";

  fontSizeSection.innerHTML = `
    <div style="font-weight: bold; margin-bottom: 8px; font-size: 14px;">Font Size</div>
    <div style="display: flex; gap: 4px; flex-wrap: wrap;">
      <button class="format-btn" data-action="font-size" data-value="8pt" style="${fontSizeButtonStyle}">8pt</button>
      <button class="format-btn" data-action="font-size" data-value="10pt" style="${fontSizeButtonStyle}">10pt</button>
      <button class="format-btn" data-action="font-size" data-value="12pt" style="${fontSizeButtonStyle}">12pt</button>
      <button class="format-btn" data-action="font-size" data-value="14pt" style="${fontSizeButtonStyle}">14pt</button>
      <button class="format-btn" data-action="font-size" data-value="16pt" style="${fontSizeButtonStyle}">16pt</button>
      <button class="format-btn" data-action="font-size" data-value="18pt" style="${fontSizeButtonStyle}">18pt</button>
    </div>
  `;

  // Font Color Section
  const fontColorSection = document.createElement("div");
  fontColorSection.innerHTML = `
    <div style="font-weight: bold; margin-bottom: 8px; font-size: 14px;">Font Color</div>
    <div style="display: flex; gap: 4px; flex-wrap: wrap;">
      <button class="format-btn" data-action="font-color" data-value="black" style="padding: 8px; border: 1px solid #ccc; border-radius: 4px; background: black; cursor: pointer; min-width: 30px; min-height: 30px;"></button>
      <button class="format-btn" data-action="font-color" data-value="red" style="padding: 8px; border: 1px solid #ccc; border-radius: 4px; background: red; cursor: pointer; min-width: 30px; min-height: 30px;"></button>
      <button class="format-btn" data-action="font-color" data-value="blue" style="padding: 8px; border: 1px solid #ccc; border-radius: 4px; background: blue; cursor: pointer; min-width: 30px; min-height: 30px;"></button>
      <button class="format-btn" data-action="font-color" data-value="green" style="padding: 8px; border: 1px solid #ccc; border-radius: 4px; background: green; cursor: pointer; min-width: 30px; min-height: 30px;"></button>
      <button class="format-btn" data-action="font-color" data-value="yellow" style="padding: 8px; border: 1px solid #ccc; border-radius: 4px; background: yellow; cursor: pointer; min-width: 30px; min-height: 30px;"></button>
      <button class="format-btn" data-action="font-color" data-value="purple" style="padding: 8px; border: 1px solid #ccc; border-radius: 4px; background: purple; cursor: pointer; min-width: 30px; min-height: 30px;"></button>
    </div>
  `;

  // Background Color Section
  const bgColorSection = document.createElement("div");
  bgColorSection.innerHTML = `
    <div style="font-weight: bold; margin-bottom: 8px; font-size: 14px;">Background Color</div>
    <div style="display: flex; gap: 4px; flex-wrap: wrap;">
      <button class="format-btn" data-action="bg-color" data-value="white" style="padding: 8px; border: 1px solid #ccc; border-radius: 4px; background: white; cursor: pointer; min-width: 30px; min-height: 30px;"></button>
      <button class="format-btn" data-action="bg-color" data-value="lightgray" style="padding: 8px; border: 1px solid #ccc; border-radius: 4px; background: lightgray; cursor: pointer; min-width: 30px; min-height: 30px;"></button>
      <button class="format-btn" data-action="bg-color" data-value="lightblue" style="padding: 8px; border: 1px solid #ccc; border-radius: 4px; background: lightblue; cursor: pointer; min-width: 30px; min-height: 30px;"></button>
      <button class="format-btn" data-action="bg-color" data-value="lightgreen" style="padding: 8px; border: 1px solid #ccc; border-radius: 4px; background: lightgreen; cursor: pointer; min-width: 30px; min-height: 30px;"></button>
      <button class="format-btn" data-action="bg-color" data-value="lightyellow" style="padding: 8px; border: 1px solid #ccc; border-radius: 4px; background: lightyellow; cursor: pointer; min-width: 30px; min-height: 30px;"></button>
      <button class="format-btn" data-action="bg-color" data-value="lightpink" style="padding: 8px; border: 1px solid #ccc; border-radius: 4px; background: lightpink; cursor: pointer; min-width: 30px; min-height: 30px;"></button>
    </div>
  `;

  // Current cell info section
  const cellInfoSection = document.createElement("div");
  cellInfoSection.innerHTML = `
    <div style="font-weight: bold; margin-bottom: 8px; font-size: 14px; border-bottom: 1px solid ${
      isDarkTheme ? "#555" : "#eee"
    }; padding-bottom: 8px;">
      Cell ${coord} Formatting
    </div>
  `;

  // Action Buttons
  const actionButtons = document.createElement("div");
  actionButtons.innerHTML = `
    <div style="display: flex; gap: 8px; margin-top: 12px; padding-top: 12px; border-top: 1px solid ${
      isDarkTheme ? "#555" : "#eee"
    };">
      <button id="apply-formatting" style="padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; flex: 1;">Apply</button>
      <button id="reset-formatting" style="padding: 8px 16px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer; flex: 1;">Reset</button>
      <button id="cancel-formatting" style="padding: 8px 16px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer; flex: 1;">Cancel</button>
    </div>
  `;

  buttonsContainer.appendChild(cellInfoSection);
  buttonsContainer.appendChild(fontSizeSection);
  buttonsContainer.appendChild(fontColorSection);
  buttonsContainer.appendChild(bgColorSection);
  buttonsContainer.appendChild(actionButtons);

  document.body.appendChild(buttonsContainer);

  let selectedFormatting = {
    fontSize: null,
    fontColor: null,
    bgColor: null,
  };

  // Handle button clicks
  buttonsContainer.addEventListener("click", function (e) {
    if (e.target.classList.contains("format-btn")) {
      const action = e.target.getAttribute("data-action");
      const value = e.target.getAttribute("data-value");

      // Remove previous selection in this category
      const categoryButtons = buttonsContainer.querySelectorAll(
        `[data-action="${action}"]`
      );
      categoryButtons.forEach((btn) => {
        if (action === "font-size") {
          btn.style.border = isDarkTheme ? "1px solid #555" : "1px solid #ccc";
        } else {
          btn.style.border = "1px solid #ccc";
        }
      });

      // Highlight selected button
      e.target.style.border = "3px solid #007bff";

      // Store selection
      if (action === "font-size") {
        selectedFormatting.fontSize = value;
      } else if (action === "font-color") {
        selectedFormatting.fontColor = value;
      } else if (action === "bg-color") {
        selectedFormatting.bgColor = value;
      }
    } else if (e.target.id === "apply-formatting") {
      applySelectedFormatting(coord, selectedFormatting);
      window.cellFormattingInstance.hideButtons();
      if (callback) callback();
    } else if (e.target.id === "reset-formatting") {
      resetCellFormatting(coord);
      window.cellFormattingInstance.hideButtons();
      if (callback) callback();
    } else if (e.target.id === "cancel-formatting") {
      window.cellFormattingInstance.hideButtons();
      if (callback) callback();
    }
  });

  // Add close on click outside
  setTimeout(() => {
    document.addEventListener("click", function closeOnClickOutside(e) {
      if (!buttonsContainer.contains(e.target)) {
        window.cellFormattingInstance.hideButtons();
        document.removeEventListener("click", closeOnClickOutside);
        if (callback) callback();
      }
    });
  }, 100);
}

// Additional helper functions for cell formatting
export function formatCurrentCell(options = {}) {
  const control = SocialCalc.GetCurrentWorkBookControl();
  if (!control || !control.workbook || !control.workbook.spreadsheet) {
    console.warn("Spreadsheet not initialized");
    return;
  }

  const editor = control.workbook.spreadsheet.editor;
  const coord = editor.ecell.coord;

  if (!coord) {
    console.warn("No active cell");
    return;
  }

  showFormattingButtons(coord, options.callback);
}

export function toggleCellFormatting() {
  const control = SocialCalc.GetCurrentWorkBookControl();
  if (!control || !control.workbook || !control.workbook.spreadsheet) {
    console.warn("Spreadsheet not initialized");
    return;
  }

  const editor = control.workbook.spreadsheet.editor;
  const coord = editor.ecell.coord;

  if (!coord) {
    console.warn("No active cell");
    return;
  }

  // Check if formatting buttons are already shown
  const existingButtons = document.getElementById("cell-formatting-buttons");
  if (existingButtons) {
    existingButtons.remove();
    return;
  }

  showFormattingButtons(coord);
}
