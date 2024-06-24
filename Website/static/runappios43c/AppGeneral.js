//////////////////////////////
//
//  App General -- These form the general UI and other stuff
//  common to all templated apps
//
//////////////////////////////
htmlEncryptionKey = "EncryptionKeyisLooooooooooooooooooongEnough";
applicationName = "Account Balance";
 
var showEmailHtml = function() {
    var control = SocialCalc.GetCurrentWorkBookControl();
    var content = control.workbook.spreadsheet.CreateSheetHTML();
    document.getElementById("mailHtml").innerHTML = content;
}
    $('#emailPage').live('pagebeforeshow', function() {
	    showEmailHtml();
	});
 

    function sendEmail()
        {
          var control = SocialCalc.GetCurrentWorkBookControl();
          var content = control.workbook.spreadsheet.CreateSheetHTML();
	    var message = {}
	    message.to = (document.getElementById('emailto')).value
	    message.appname = Aspiring.appname
	    message.data = content
	    message.subject = document.getElementById('emailSubject').value
	    message.text = document.getElementById('emailText').value

	    alert(message.to);
	    
	    $.postJSON("/runasemailer", message, function(response) {
		msg = response["data"]
		alert("Sent Email to "+msg)
		
	    });
	    changePage('#indexPage');
	    return false;
        }
       function showPrintDialog()
        {
          var control = SocialCalc.GetCurrentWorkBookControl();
          var html = control.workbook.spreadsheet.CreateSheetHTML();
	  // this is for browser based print functionality
            var printWindow = window.open('','','left=100,top=100');
	    printWindow.document.write(html);
	    printWindow.print();
	    printWindow.close()
        }

        function showBuyLink()
        {
            window.open("http://itunes.apple.com/us/app/angry-birds-rio/id420635506?mt=8&uo=4");
        }
        function showHelp()
        {
            var strPath = String(window.location); 
            var path = strPath.substr(0,strPath.lastIndexOf("/")); 
            PhoneGap.exec('ChildBrowserCommand.showWebPage',encodeURI(path + '/help.html')); 

        }


SocialCalc.oldBtnActive = 1;

function getSheetIds() {
var control = SocialCalc.GetCurrentWorkBookControl();
var sheets = [];
for (key in control.sheetButtonArr) {
console.log(key);
sheets.push(key);
}
return sheets;
}

function activateFooterBtn(index) {
   if (index == SocialCalc.oldBtnActive) return;

   var oldbtn = "footerbtn"+ SocialCalc.oldBtnActive;
   var newbtn = "footerbtn"+ index;

   $("#"+newbtn).addClass("ui-btn-active");
   $("#"+oldbtn).removeClass("ui-btn-active");

   var sheets = getSheetIds()
   // disable active edit boxes
    var control = SocialCalc.GetCurrentWorkBookControl();
    var spreadsheet = control.workbook.spreadsheet;      
   var ele = document.getElementById(spreadsheet.formulabarDiv.id);
   if (ele) {
       SocialCalc.ToggleInputLineButtons(false);       
      var input = ele.firstChild;
      input.style.display="none";
      spreadsheet.editor.state = "start";
   }
   SocialCalc.WorkBookControlActivateSheet(sheets[index-1]);

   SocialCalc.oldBtnActive = index;
}

/*
$('#listpage').live('pageshow', function(event) {
  console.log('refreshing')
  //$('#filelist1').refresh();
}
*/


function tweakUpdateList() {
console.log("in list page")
var ele1 = document.getElementById("filelist1");
var str = document.getElementById("filelist").innerHTML;
    
// var passwordObject = window.localStorage.getItem(htmlEncryptionKey);
// if (passwordObject)
// passwordObject = JSON.parse(passwordObject);
//protectedImg = '<span style="vertical-align:middle;position: absolute;top:1.2em;"><img src="lib/jquery/images/protected.png" /></span>'
    
// for each file in the store, replace the template with the filename

    
    var hstr = "";
    var i = 0;

    var message = {}
    message.action = "listdir"
    message.appname = Aspiring.appname
    
    $.postJSON("/webapp", message, function(response) {
	result = response["result"]
	if (result == "ok") {
	    for (i=0; i < response["data"].length; i++) {
		var temp = str;
		filename = response["data"][i];
		temp = temp.replace("!--Template1--",filename); 
		temp = temp.replace("!--Template2--",filename);
		temp = temp.replace("!--Template3--",filename);
		//if (passwordObject && passwordObject[filename])
		//    temp = temp.replace("<!--ProtectedImagePlace-->",protectedImg);
		hstr = hstr + temp;	
	    }
	    // add the default file name
	    var temp = str;
	    temp = temp.replace("!--Template1--", "default");
	    temp = temp.replace("!--Template2--", "default");
	    temp = temp.replace("!--Template3--", "default");
	    hstr = hstr + temp;
	    //console.log(hstr);
	    ele1.innerHTML=hstr;
	    //console.log("edited list page")
	    
	} else {
	    alert("listdir failed ")	    
	}
    });    
}

$('#listPage').live('pagebeforeshow', function(event) {
// fill the list dynamically
tweakUpdateList();
});

changePageToFile = function(str) {
    alert(str);
    var url = window.location.href;
    index = url.indexOf('runappios43c')
    urlbase = url.slice(0, index);
    tailindex = url.indexOf(index, "?v=")
    if (tailindex != -1) {
	tail = "/"+url.slice(tailindex,url.length)
    } else {
	tail = ""
    }
    url = urlbase+"runappios43c/"+str+tail;
    alert("Final url: "+url);
    
    // $.mobile.changePage(url,{ transition: "pop"});
    window.location.replace(url);
}



function changePage(pageid) {
    $.mobile.changePage(($(pageid)), { transition: "slideup"} );
}

function updateFileName(fname) {
    selectedFile = fname;
    document.getElementById("indexPage-fname").innerHTML="Editing: "+fname;
    //document.getElementById("listPage-fname").innerHTML="Editing: "+fname;
    //document.getElementById("filePage-fname").innerHTML="Editing: "+fname;

}


function viewFile(filename) {
    //alert("viewFile: "+selectedFile)
    console.log("view file "+filename);
    //$.mobile.showPageLoadingMsg()
    selectedFile = filename;
    var data = "";
    
    /*Changes for Encryption Implementation Start*/
    
    if (filename != "default") {
	//var decrypt = decryptFileOpen(filename); //change
	//if (decrypt == true){               //change
	//data = window.localStorage.getItem(filename)
	//console.log(data.length)

	var message = {}
	message.action = "getfile"
	message.appname = Aspiring.appname
	message.fname = filename

	
	$.postJSON("/webapp", message, function(response) {
	    result = response["result"]
	    if (result == "ok") {
		filedata = response["data"];
		SocialCalc.WorkBookControlInsertWorkbook(decodeURIComponent(filedata));
		updateFileName(filename);
		SocialCalc.GetCurrentWorkBookControl().workbook.spreadsheet.editor.state = "start";
		
		SocialCalc.GetCurrentWorkBookControl().workbook.spreadsheet.ExecuteCommand('redisplay', '');
		$.mobile.changePage(($("#indexPage")), { transition: "slideup"} );
		
	    } else {
		alert("Error loading file "+filename);
	    }
	});    
	
    } else {
	data = document.getElementById("sheetdata").value;
	SocialCalc.WorkBookControlInsertWorkbook(data);
	updateFileName(filename);
	SocialCalc.GetCurrentWorkBookControl().workbook.spreadsheet.editor.state = "start";
	
	SocialCalc.GetCurrentWorkBookControl().workbook.spreadsheet.ExecuteCommand('redisplay', '');
	$.mobile.changePage(($("#indexPage")), { transition: "slideup"} );

    }
    
}

function deleteFilePrompt(filename) {
    
    
    if (filename == "default") {
	alert("Cannot Delete File"+filename);
	return;
    }
/*Changes for Encryption Implementation Start*/
//    var okfn = function () { 
//        var decrypt = decryptFileDelete(filename); //change
//        if(decrypt == true){                       //change
//        deleteFile(filename);
//        }
//    };
/*Changes for Encryption Implementation End*/

    var confirm = window.confirm("Delete file: "+filename+" ?");
    
    if (confirm) {
	deleteFile(filename)
    }
}

function deleteFile(filename) {

    var message = {}
    message.action = "deletefile"
    message.fname = filename
    message.appname = Aspiring.appname
    
    $.postJSON("/webapp", message, function(response) {
	result = response["result"]
	
	if (result == "ok") {
	    alert("Deleted file: "+filename)

	    if (selectedFile == filename) {
		// set the selected file back to default
		updateFileName("default");
		// load the default file into socialcalc
	    }

	    tweakUpdateList();

	} else {
	    alert("Deleted file: "+filename+" failed")	    
	}
    });
}

function saveAsPrompt(fname) {
    
    var fname = window.prompt("Please enter file name", "somefile");
    // do some validation checks on file name
    if (fname == "default") {
	fname = window.prompt("Cannot update default file \n\n Use another file name","somefile");
    }

    if (fname == "") {
	fname = window.prompt("Please enter file name", "tempfile");
    }

    if (fname.length > 30) {
	fname = window.prompt("Filename too long  \n\n Please enter a file name less than 30 characters","tempfile");
    }

    var val = SocialCalc.WorkBookControlSaveSheet();
    console.log(val.length);
    var val1 = encodeURIComponent(val);
    console.log(val1.length);

    // cloud save the file !!
    var message = {}
    message.action = "savefile"
    message.appname = Aspiring.appname
    message.fname = fname
    message.data = val1
    
    $.postJSON("/webapp", message, function(response) {
	result = response["result"]
	if (result == "ok") {
	    // set the top right file to selected file
	    updateFileName(fname);	    
	    alert("Saved "+fname)
	} else {
	    alert("Save failed "+fname)	    
	}
    });
}

function saveAsCancel() {
    console.log("saveas canceled");
}

function saveCurrentFile() {

    if (selectedFile == "default") {
	alert("Cannot update default file! \n\n Use SaveAs");
	return;
    }

    console.log("saving current file "+selectedFile)
    var val = SocialCalc.WorkBookControlSaveSheet();
    console.log(val.length);
    var val1 = encodeURIComponent(val);
    console.log(val1.length);

    var message = {}
    message.action = "savefile"
    message.appname = Aspiring.appname
    message.fname = selectedFile
    message.data = val1
    
    $.postJSON("/webapp", message, function(response) {
	result = response["result"]
	if (result == "ok") {
	    // set the top right file to selected file
	    alert("Saved file : "+selectedFile);
	} else {
	    alert("Save failed "+selectedFile)	    
	}
    });

    console.log("saved as "+selectedFile);
    
}

function logoAddOk(link) {
    console.log(link)

    var i=1;
    
      
    
    var cmd = 'set F4 text t <img src="'+link+'" height="100px" align="middle"></img>'+"\n"
    console.log(cmd);
    var control = SocialCalc.GetCurrentWorkBookControl();
    
    var currsheet = control.currentSheetButton.id
    
    if (currsheet == "sheet1" || currsheet == "sheet2" || currsheet == "sheet3" || currsheet == "sheet4")   
    {  
    
    cmd = {cmdtype:"scmd", id:currsheet, cmdstr: cmd, saveundo: false};
    control.ExecuteWorkBookControlCommand(cmd, false);  
    
    }
    
    
}







function logoRemoveOk() {
    console.log("remove logo")
    var cmd = 'erase F4 formulas'

    var control = SocialCalc.GetCurrentWorkBookControl();
    var currsheet = control.currentSheetButton.id
    
    if (currsheet == "sheet1" || currsheet == "sheet2" || currsheet == "sheet3" || currsheet == "sheet4")   
    {     
    cmd = {cmdtype:"scmd", id:currsheet, cmdstr: cmd, saveundo: false};
    control.ExecuteWorkBookControlCommand(cmd, false);  
    }

        
}





function showAddLogo() {
    window.plugins.Prompt.show(
	"Enter Image Url",
	logoAddOk,
	saveAsCancel,
	"Submit", // ok button title (optional)
	"Cancel", // cancel button title (optional)
        "yes"
    );
    
    
        
}

function showClearLogo() {
    window.plugins.Prompt.show(
	"Remove Logo ?",
	logoRemoveOk,
	saveAsCancel,
	"Submit", // ok button title
	"Cancel", // cancel button title
        "no"
    );   
    
       
}

function encryptFile(){
	var passwordObject = window.localStorage.getItem(htmlEncryptionKey);
	if (passwordObject)
		passwordObject = JSON.parse(passwordObject);		
	else
		passwordObject = {};
	var promptFile= function(filename){
        
        if(filename ==''){
            navigator.notification.alert("Filename cannot be empty",null,applicationName);
            return;	
        }
        else if(filename.length>=30){
            navigator.notification.alert("Filename cannot be more than 30 characters",null,applicationName);
            return;
        }
        if (window.localStorage.getItem(filename)){
            navigator.notification.alert("File with the same name already exists",null,applicationName);
            return;		
        }
        var promptPass = function passString(passString){
            if(passString ==''){
                navigator.notification.alert("Password cannot be empty",null,applicationName);
                return;	
            }
            else if(passString.length>=30){
                navigator.notification.alert("Password cannot be more than 30 characters",null,applicationName);
                return;
            }
            
            passwordObject[filename] = passString;
            var val = SocialCalc.WorkBookControlSaveSheet();
            console.log(val.length);
            var val1 = encodeURIComponent(val);
            console.log(val1.length);
            window.localStorage.setItem(filename, val1);
            passwordObject = JSON.stringify(passwordObject);
            window.localStorage.setItem(htmlEncryptionKey,passwordObject);
        }
        window.plugins.Prompt.show(
           "Enter Password",
           promptPass,
           null,
           "Submit", // ok button title (optional)
           "Cancel", // cancel button title (optional)
           "yes"
           );
    }
    
    window.plugins.Prompt.show(
       "Enter File Name",
       promptFile,
       null,
       "Submit", // ok button title (optional)
       "Cancel", // cancel button title (optional)
       "yes"
    );
    

}

function decryptFileOpen(filename){
    var passwordObject = window.localStorage.getItem(htmlEncryptionKey);
    console.log(passwordObject);
	passwordObject = JSON.parse(passwordObject);

	
	if (!passwordObject){
		return true;	
	}
	if (!passwordObject[filename]){
		return true;
	}
	
	var promptPass = function(passString){
	
    if (passString == passwordObject[filename])
	{
        data = window.localStorage.getItem(filename);
        console.log(data.length);
        SocialCalc.WorkBookControlInsertWorkbook(decodeURIComponent(data));
        SocialCalc.GetCurrentWorkBookControl().workbook.spreadsheet.editor.state = "start";
        SocialCalc.GetCurrentWorkBookControl().workbook.spreadsheet.ExecuteCommand('redisplay', '');
        $.mobile.changePage(($("#indexPage")), { transition: "slideup"} );

	} 
	else
        {
        navigator.notification.alert("You have entered wrong Password",null,applicationName);
		}
    }
    
    window.plugins.Prompt.show(
       "Enter password for this File",
       promptPass,
       null,
       "Submit", // ok button title (optional)
       "Cancel", // cancel button title (optional)
       "yes"
    );
    return false;
}

function decryptFileDelete(filename){
    var passwordObject = window.localStorage.getItem(htmlEncryptionKey);
    console.log(passwordObject);
	passwordObject = JSON.parse(passwordObject);
    
	
	if (!passwordObject){
		return true;	
	}
	if (!passwordObject[filename]){
		return true;
	}
	
	var promptPass = function(passString){
        
        if (passString == passwordObject[filename])
        {
            deleteFile(filename);
            delete passwordObject[filename];
            passwordObject = JSON.stringify(passwordObject);
            window.localStorage.setItem(htmlEncryptionKey,passwordObject);
        } 
        else
        {
            navigator.notification.alert("You have entered wrong Password",null,applicationName);
		}
    }
    
    window.plugins.Prompt.show(
                               "Enter password for this File",
                               promptPass,
                               null,
                               "Submit", // ok button title (optional)
                               "Cancel", // cancel button title (optional)
                               "yes"
                               );
    return false;
}

function openEmptyFile(){
    
    function promptConfirm(button) {
        
        if (button==1)
        {
        
        sheetData = document.getElementById("emptysheetdata").value;
        console.log(sheetData);
        SocialCalc.WorkBookControlInsertWorkbook(sheetData);
        SocialCalc.GetCurrentWorkBookControl().workbook.spreadsheet.editor.state = "start";
        SocialCalc.GetCurrentWorkBookControl().workbook.spreadsheet.ExecuteCommand('redisplay', '');
        $.mobile.changePage(($("#indexPage")), { transition: "slideup"} );
        }
        
    }
    navigator.notification.confirm("Do you want to open a new file without saving current changes ?",promptConfirm,applicationName,"Yes,No");
}


if (!Aspiring) {
    var Aspiring = {};
}

Aspiring.dropbox = function() {
    //console.log("hello");
    var path = "http://www.dropbox.com";
    
    PhoneGap.exec('ChildBrowserCommand.showWebPage',encodeURI(path)); 
    console.log(path);
};


