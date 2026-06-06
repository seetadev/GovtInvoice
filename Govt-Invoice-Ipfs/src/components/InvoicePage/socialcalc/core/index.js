/* eslint-disable */
// SocialCalc Core Index - Imports all core modules
// This replaces the monolithic SocialCalc.js file

// Import all core modules in dependency order
import "./constants.js";     // Must be first - defines constants
import "./core.js";          // Core functionality (Cell, Sheet, etc.)
import "./format-number.js"; // Number formatting
import "./formula.js";       // Formula parsing and calculation  
import "./table-editor.js";  // Table editor and UI
import "./spreadsheet-control.js"; // High-level controls

// The modules above all contribute to the global SocialCalc object
// which is available as window.SocialCalc or global.SocialCalc

// Export the global SocialCalc for ES module compatibility
let SocialCalc;
if (typeof window !== "undefined" && window.SocialCalc) {
  SocialCalc = window.SocialCalc;
} else if (typeof global !== "undefined" && global.SocialCalc) {
  SocialCalc = global.SocialCalc;
} else {
  console.error("SocialCalc not found after loading core modules");
  SocialCalc = {}; // Fallback
}

export default SocialCalc;
export { SocialCalc };
