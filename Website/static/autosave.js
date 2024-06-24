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
Aspiring.AutoSave.autoSaveTimeoutId  = null;
Aspiring.AutoSave.SaveTimeout = 10000; // 10 seconds


// This is called from the SocialCalcTableEditor 
// EditorSaveEdit function
SocialCalc.Callbacks.editAutoSave = function() {
    // mark filename dirty
    // start a timer
    console.log("in auto save");
    Aspiring.AutoSave.setCurrentFileDirty();
    if (Aspiring.AutoSave.autoSaveTimeoutId != null) {
        console.log("timer already running");
    } else {
        Aspiring.AutoSave.autoSaveTimeoutId  = 
	    window.setTimeout(Aspiring.AutoSave.TimerExpiry, Aspiring.AutoSave.SaveTimeout );
    }
}

Aspiring.AutoSave.TimerExpiry = function() {
    console.log("auto save timer");
    if (SocialCalc.GetCurrentWorkBookControl().workbook.spreadsheet.editor.state == "start") {
        // save file
        if ( Aspiring.AutoSave.selectedFile == "default") {
            Aspiring.AutoSave.selectedFile = "Untitled";
        }

	var message = {};
	message.fname = Aspiring.AutoSave.selectedFile;
	message.data = SocialCalc.WorkBookControlSaveSheet();
			
	$.postJSON("/save", message, function(response) {
		       msg = response["data"];
		       console.log(msg);
		   });


        console.log("saved as "+Aspiring.AutoSave.selectedFile);
        Aspiring.AutoSave.autoSaveTimeoutId = null;
        // unmark dirty
        Aspiring.AutoSave.updateFileName(Aspiring.AutoSave.selectedFile);
    } else {
        // user is editing
        console.log("skip autosave, user is editing");
        Aspiring.AutoSave.autoSaveTimeoutId  = window.setTimeout(fileAutoSaveTimerExpiry, Aspiring.AutoSave.SaveTimeout);	
    }
};

Aspiring.AutoSave.updateFileName = function(name) {
    Aspiring.AutoSave.selectedFile = name;
    document.getElementById("filenameholder").innerHTML=name;        
};

Aspiring.AutoSave.setCurrentFileDirty = function() {
    if (Aspiring.AutoSave.selectedFile == "default") {
        Aspiring.AutoSave.selectedFile = "Untitled";
    }
    document.getElementById("filenameholder").innerHTML=Aspiring.AutoSave.selectedFile+"(*)";    
};

