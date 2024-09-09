//
// Autosave functionality -- this is the browser version that saves to the server
//
// External interfaces are from:
// SocialCalcTableEditor (for autosave upon edit)
//

if (!Aspiring) {
  Aspiring = {};
}
Aspiring.AutoSave = {};
Aspiring.AutoSave.selectedFile = "default";
Aspiring.AutoSave.autoSaveTimeoutId = null;
Aspiring.AutoSave.SaveTimeout = 10000; // 10 seconds

// This is called from the SocialCalcTableEditor
// EditorSaveEdit function
SocialCalc.Callbacks.editAutoSave = function () {
  // mark filename dirty
  // start a timer
  console.log("in auto save");
  Aspiring.AutoSave.setCurrentFileDirty();
  if (Aspiring.AutoSave.autoSaveTimeoutId != null) {
    console.log("timer already running");
  } else {
    Aspiring.AutoSave.autoSaveTimeoutId = window.setTimeout(
      Aspiring.AutoSave.TimerExpiry,
      Aspiring.AutoSave.SaveTimeout
    );
  }
};

Aspiring.AutoSave.TimerExpiry = function() {
    console.log("auto save timer");
    if (SocialCalc.GetCurrentWorkBookControl().workbook.spreadsheet.editor.state == "start") {
        // save file
        if (Aspiring.AutoSave.selectedFile == "default") {
            Aspiring.AutoSave.selectedFile = "Untitled";
        }

        // Create a FormData object
        const formData = new FormData();
        formData.append("newFileName", Aspiring.AutoSave.selectedFile);
        formData.append("content", SocialCalc.WorkBookControlSaveSheet());
        formData.append("fid", document.getElementById("fidValueHolder").innerHTML);

        // Use $.ajax to send the FormData
        $.ajax({
            url: "/api/save",
            type: "POST",
            data: formData,
            processData: false, // Prevent jQuery from automatically processing the data
            contentType: false, // Prevent jQuery from setting the Content-Type header
            success: function(response) {
                const msg = response["data"];
                console.log(msg);
            },
            error: function(xhr, status, error) {
                console.error("Auto-save failed: ", status, error);
            }
        });

        console.log("saved as " + Aspiring.AutoSave.selectedFile);
        Aspiring.AutoSave.autoSaveTimeoutId = null;
        // unmark dirty
        Aspiring.AutoSave.updateFileName(Aspiring.AutoSave.selectedFile);
    } else {
        // user is editing
        console.log("skip autosave, user is editing");
        Aspiring.AutoSave.autoSaveTimeoutId = window.setTimeout(fileAutoSaveTimerExpiry, Aspiring.AutoSave.SaveTimeout);    
    }
};


Aspiring.AutoSave.updateFileName = function (name) {
  Aspiring.AutoSave.selectedFile = name;
  document.getElementById("filenameholder").innerHTML = name;
};

Aspiring.AutoSave.setCurrentFileDirty = function () {
  if (Aspiring.AutoSave.selectedFile == "default") {
    Aspiring.AutoSave.selectedFile = "Untitled";
  }
  document.getElementById("filenameholder").innerHTML =
    Aspiring.AutoSave.selectedFile + "(*)";
};
