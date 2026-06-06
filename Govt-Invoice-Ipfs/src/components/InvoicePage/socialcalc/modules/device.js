// Device detection utilities
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

export function getDeviceType() {
  /* Returns the type of the device */
  var device = "default";
  if (navigator.userAgent.match(/iPod/)) device = "iPod";
  if (navigator.userAgent.match(/iPad/)) device = "iPad";
  if (navigator.userAgent.match(/iPhone/)) device = "iPhone";
  if (navigator.userAgent.match(/Android/)) device = "Android";
  return device;
}
