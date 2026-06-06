// Weight tracking functions
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

export function getDayCoordinates() {
  console.log("=== GET DAY COORDINATES ===");

  // Weight tracker coordinates mapping day numbers (1-7) to rows (5-11)
  // Columns: B=Date, C=Weight, D=Goal, E=From Goal
  const coordinates = {
    1: {
      // Day 1 -> Row 5
      date: "B5",
      weight: "C5",
      goal: "D5",
      fromGoal: "E5",
    },
    2: {
      // Day 2 -> Row 6
      date: "B6",
      weight: "C6",
      goal: "D6",
      fromGoal: "E6",
    },
    3: {
      // Day 3 -> Row 7
      date: "B7",
      weight: "C7",
      goal: "D7",
      fromGoal: "E7",
    },
    4: {
      // Day 4 -> Row 8
      date: "B8",
      weight: "C8",
      goal: "D8",
      fromGoal: "E8",
    },
    5: {
      // Day 5 -> Row 9
      date: "B9",
      weight: "C9",
      goal: "D9",
      fromGoal: "E9",
    },
    6: {
      // Day 6 -> Row 10
      date: "B10",
      weight: "C10",
      goal: "D10",
      fromGoal: "E10",
    },
    7: {
      // Day 7 -> Row 11
      date: "B11",
      weight: "C11",
      goal: "D11",
      fromGoal: "E11",
    },
  };

  console.log("Day coordinates mapping:", coordinates);
  console.log("=== END GET DAY COORDINATES ===");

  return coordinates;
}

export function addWeight(dayNumber, date, weight, goal) {
  return new Promise(function (resolve, reject) {
    console.log("=== ADD WEIGHT START ===");
    console.log("Day number:", dayNumber);
    console.log("Date:", date);
    console.log("Weight:", weight);
    console.log("Goal:", goal);

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

      // Get day coordinates
      const coordinates = getDayCoordinates();

      if (!coordinates[dayNumber]) {
        throw new Error(
          `Invalid day number: ${dayNumber}. Must be between 1-7.`
        );
      }

      const dayCoords = coordinates[dayNumber];
      console.log("Using coordinates for day", dayNumber, ":", dayCoords);

      // Calculate "From Goal" (weight - goal)
      const fromGoal = parseFloat(weight) - parseFloat(goal);
      console.log("Calculated From Goal (weight - goal):", fromGoal);

      // Build commands to set all four values
      var commands = [];

      // Set date
      commands.push(`set ${dayCoords.date} text t ${date}`);

      // Set weight
      commands.push(`set ${dayCoords.weight} value n ${weight}`);

      // Set goal
      commands.push(`set ${dayCoords.goal} value n ${goal}`);

      // Set from goal (calculated)
      commands.push(`set ${dayCoords.fromGoal} value n ${fromGoal}`);

      var cmd = commands.join("\n") + "\n";
      console.log("Generated SocialCalc commands:", cmd);

      var commandObj = {
        cmdtype: "scmd",
        id: currsheet,
        cmdstr: cmd,
        saveundo: false,
      };

      console.log("Command object:", commandObj);

      try {
        control.ExecuteWorkBookControlCommand(commandObj, false);
        console.log("✓ Weight data added successfully");
        console.log("=== ADD WEIGHT SUCCESS ===");
        resolve(true);
      } catch (execError) {
        console.error("Error executing command:", execError);
        throw execError;
      }
    } catch (error) {
      console.error("=== ADD WEIGHT ERROR ===");
      console.error("Error details:", error);
      console.error("Stack trace:", error.stack);
      reject(error);
    }
  });
}

export function clearWeight(dayNumber) {
  return new Promise(function (resolve, reject) {
    console.log("=== CLEAR WEIGHT START ===");
    console.log("Day number:", dayNumber);

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

      // Get day coordinates
      const coordinates = getDayCoordinates();

      if (!coordinates[dayNumber]) {
        throw new Error(
          `Invalid day number: ${dayNumber}. Must be between 1-7.`
        );
      }

      const dayCoords = coordinates[dayNumber];
      console.log("Using coordinates for day", dayNumber, ":", dayCoords);

      // Build commands to clear all four values
      var commands = [];

      // Clear all cells for this day
      commands.push(`erase ${dayCoords.date} formulas`);
      commands.push(`erase ${dayCoords.weight} formulas`);
      commands.push(`erase ${dayCoords.goal} formulas`);
      commands.push(`erase ${dayCoords.fromGoal} formulas`);

      var cmd = commands.join("\n") + "\n";
      console.log("Generated SocialCalc clear commands:", cmd);

      var commandObj = {
        cmdtype: "scmd",
        id: currsheet,
        cmdstr: cmd,
        saveundo: false,
      };

      console.log("Command object:", commandObj);

      try {
        control.ExecuteWorkBookControlCommand(commandObj, false);
        console.log("✓ Weight data cleared successfully");
        console.log("=== CLEAR WEIGHT SUCCESS ===");
        resolve(true);
      } catch (execError) {
        console.error("Error executing command:", execError);
        throw execError;
      }
    } catch (error) {
      console.error("=== CLEAR WEIGHT ERROR ===");
      console.error("Error details:", error);
      console.error("Stack trace:", error.stack);
      reject(error);
    }
  });
}

export function getWeightData(dayNumber) {
  console.log("=== GET WEIGHT DATA START ===");
  console.log("Day number:", dayNumber);

  try {
    // Get day coordinates
    const coordinates = getDayCoordinates();

    if (!coordinates[dayNumber]) {
      throw new Error(`Invalid day number: ${dayNumber}. Must be between 1-7.`);
    }

    const dayCoords = coordinates[dayNumber];
    console.log("Using coordinates for day", dayNumber, ":", dayCoords);

    // Get current sheet
    var control = SocialCalc.GetCurrentWorkBookControl();
    if (!control || !control.currentSheetButton) {
      throw new Error("No current sheet available");
    }

    var currsheet = control.currentSheetButton.id;
    console.log("Current active sheet:", currsheet);

    // Read values from cells
    var dateCell = SocialCalc.GetCellDataValue(
      currsheet + "!" + dayCoords.date
    );
    var weightCell = SocialCalc.GetCellDataValue(
      currsheet + "!" + dayCoords.weight
    );
    var goalCell = SocialCalc.GetCellDataValue(
      currsheet + "!" + dayCoords.goal
    );
    var fromGoalCell = SocialCalc.GetCellDataValue(
      currsheet + "!" + dayCoords.fromGoal
    );

    const data = {
      date: dateCell || "",
      weight: weightCell || "",
      goal: goalCell || "",
      fromGoal: fromGoalCell || "",
    };

    console.log("Retrieved weight data:", data);
    console.log("=== GET WEIGHT DATA SUCCESS ===");

    return data;
  } catch (error) {
    console.error("=== GET WEIGHT DATA ERROR ===");
    console.error("Error details:", error);
    console.error("Stack trace:", error.stack);
    return null;
  }
}
