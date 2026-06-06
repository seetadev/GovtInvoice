// Logo and signature management functions
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

export function addLogo(coord, url) {
  return new Promise(function (resolve, reject) {
    console.log("=== ADD LOGO START ===");
    console.log("URL provided:", url);
    console.log("Coordinates object:", coord);

    try {
      var control = SocialCalc.GetCurrentWorkBookControl();
      console.log("Workbook control:", control ? "Found" : "Not found");

      if (!control) {
        throw new Error("No workbook control available");
      }

      if (!control.currentSheetButton) {
        throw new Error("No current sheet button available");
      }

      var currsheet = control.currentSheetButton.id;
      console.log("Current active sheet:", currsheet);

      var commandExecuted = false;
      var cmd = "";

      console.log("Iterating through coordinate mapping...");
      for (var sheetname in coord) {
        console.log(
          `Checking sheet: ${sheetname}, coordinate: ${coord[sheetname]}`
        );

        if (coord[sheetname] !== null && coord[sheetname] !== undefined) {
          if (currsheet === sheetname) {
            console.log(
              `✓ Match found! Adding logo to sheet: ${sheetname} at cell: ${coord[sheetname]}`
            );

            cmd =
              "set " +
              coord[sheetname] +
              ' text t <img src="' +
              url +
              '" height="100" width="150" alt="Company Logo"></img>' +
              "\n";

            console.log("Generated SocialCalc command:", cmd);

            var commandObj = {
              cmdtype: "scmd",
              id: currsheet,
              cmdstr: cmd,
              saveundo: false,
            };

            console.log("Command object:", commandObj);

            try {
              control.ExecuteWorkBookControlCommand(commandObj, false);
              console.log("✓ Command executed successfully");
              commandExecuted = true;
            } catch (execError) {
              console.error("Error executing command:", execError);
              throw execError;
            }

            break; // Exit loop after processing current sheet
          } else {
            console.log(`- Skipping sheet ${sheetname} (not current sheet)`);
          }
        } else {
          console.log(
            `- Skipping sheet ${sheetname} (null/undefined coordinate)`
          );
        }
      }

      if (!commandExecuted) {
        console.warn(
          "Warning: No logo command was executed. Current sheet may not be in coordinate mapping."
        );
      }

      console.log("=== ADD LOGO SUCCESS ===");
      resolve(true);
    } catch (error) {
      console.error("=== ADD LOGO ERROR ===");
      console.error("Error details:", error);
      console.error("Stack trace:", error.stack);
      reject(error);
    }
  });
}

export function removeLogo(coord) {
  return new Promise(function (resolve, reject) {
    console.log("=== REMOVE LOGO START ===");
    console.log("Coordinates object:", coord);

    try {
      var control = SocialCalc.GetCurrentWorkBookControl();
      console.log("Workbook control:", control ? "Found" : "Not found");

      if (!control) {
        throw new Error("No workbook control available");
      }

      if (!control.currentSheetButton) {
        throw new Error("No current sheet button available");
      }

      var currsheet = control.currentSheetButton.id;
      console.log("Current active sheet:", currsheet);

      var commandExecuted = false;
      var cmd = "";

      console.log("Iterating through coordinate mapping...");
      for (var sheetname in coord) {
        console.log(
          `Checking sheet: ${sheetname}, coordinate: ${coord[sheetname]}`
        );

        if (coord[sheetname] !== null && coord[sheetname] !== undefined) {
          if (currsheet === sheetname) {
            console.log(
              `✓ Match found! Removing logo from sheet: ${sheetname} at cell: ${coord[sheetname]}`
            );

            cmd = "erase " + coord[sheetname] + " formulas";
            console.log("Generated SocialCalc command:", cmd);

            var commandObj = {
              cmdtype: "scmd",
              id: currsheet,
              cmdstr: cmd,
              saveundo: false,
            };

            console.log("Command object:", commandObj);

            try {
              control.ExecuteWorkBookControlCommand(commandObj, false);
              console.log("✓ Command executed successfully");
              commandExecuted = true;
            } catch (execError) {
              console.error("Error executing command:", execError);
              throw execError;
            }

            break; // Exit loop after processing current sheet
          } else {
            console.log(`- Skipping sheet ${sheetname} (not current sheet)`);
          }
        } else {
          console.log(
            `- Skipping sheet ${sheetname} (null/undefined coordinate)`
          );
        }
      }

      if (!commandExecuted) {
        console.warn(
          "Warning: No logo removal command was executed. Current sheet may not be in coordinate mapping."
        );
      }

      console.log("=== REMOVE LOGO SUCCESS ===");
      resolve(true);
    } catch (error) {
      console.error("=== REMOVE LOGO ERROR ===");
      console.error("Error details:", error);
      console.error("Stack trace:", error.stack);
      reject(error);
    }
  });
}
