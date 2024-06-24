//
// Autosave functionality -- this is the browser version that saves to the server
//
// External interfaces are from:
// SocialCalcTableEditor (for autosave upon edit)
//

if (!Aspiring) {
    console.log("aspiring not defined");
    var Aspiring = {};
}
Aspiring.AutoSave = {};
Aspiring.AutoSave.selectedFile = "default";
Aspiring.AutoSave.autoSaveTimeoutId  = null;
Aspiring.AutoSave.SaveTimeout = 10000; // 10 seconds


// This is called from the SocialCalcTableEditor
// EditorSaveEdit function
SocialCalc.Callbacks.editAutoSave = function() {
    // start a timer
    //console.log("in auto save");
    //var control = SocialCalc.GetCurrentWorkBookControl();
    //if (Aspiring.AutoSave.autoSaveTimeoutId != null) {
    //    console.log("timer already running");
    //} else {
    //    Aspiring.AutoSave.autoSaveTimeoutId  =
    //	    window.setTimeout(Aspiring.AutoSave.TimerExpiry, Aspiring.AutoSave.SaveTimeout );
    //}
    Aspiring.AutoSave.TimerExpiry();
}

Aspiring.AutoSave.TimerExpiry = function() {
    //console.log("auto save timer");

    // save file
    if ( Aspiring.AutoSave.selectedFile == "default") {
        Aspiring.AutoSave.selectedFile = "Untitled";
    }
        
    var data = SocialCalc.WorkBookControlSaveSheet();
        
    //console.log(data.length);
    var encodedData = encodeURIComponent(data);
    window.localStorage.setItem(Aspiring.getPathFromFilename(Aspiring.AutoSave.selectedFile), encodedData);
    //Aspiring.AutoSave.autoSaveTimeoutId = null;

    updateFileName(Aspiring.AutoSave.selectedFile);

};



