//////////////////////////////
//
//  App General -- These form the general UI and other stuff
//  common to all templated apps
//
//////////////////////////////

if (!Aspiring) {
    var Aspiring = {};
}

htmlEncryptionKey = "EncryptionKeyisLooooooooooooooooooongEnough";
metaInfoFileName =  "MetaFileInfoLoooooooooooooooooooooongEnough";
applicationName = "Account Balance";
settingsName = "SettingsFileInfoLoooooooooooooooooooooongEnough"
 
function setLastEditedFileName(filename)
{
    // check meta file exists                                                                                                
    var filedata = window.localStorage.getItem(Aspiring.getPathFromFilename(metaInfoFileName));
    var fileobj = {};
    if (filedata) {
        try {
            fileobj = JSON.parse(filedata);
        } catch (e) {
            fileobj = {};
        }
    } else {
        fileobj = {};
    }
    fileobj["lastedited"] = filename;
    window.localStorage.setItem(Aspiring.getPathFromFilename(metaInfoFileName), JSON.stringify(fileobj));
    console.log("setting lastedited to:"+filename)
}

function getLastEditedFileName()
{
    var filedata = window.localStorage.getItem(Aspiring.getPathFromFilename(metaInfoFileName));
    if (filedata) {
        try {
            var fileobj = JSON.parse(filedata);
            return fileobj["lastedited"]
		} catch (e) {
            return null;
        }
    }
    return null;
}
function getLastEditedFileData()
{
    console.log("in init file data")
	var lasteditedfile = getLastEditedFileName();
    console.log("in init file data name:"+lasteditedfile)
	if (lasteditedfile) {
	    if (lasteditedfile != "default") {
		var filedata = window.localStorage.getItem(Aspiring.getPathFromFilename(lasteditedfile));
		if (filedata != null)
		    return decodeURIComponent(filedata);
	    }
	}
    console.log("no init file data")
    return null;
}


var showEmailHtml = function() {
    var control = SocialCalc.GetCurrentWorkBookControl();
    var content = control.workbook.spreadsheet.CreateSheetHTML();
    document.getElementById("mailHtml").innerHTML = content;
}
    $('#emailPage').live('pagebeforeshow', function() {
	    showEmailHtml();
	});
 
Aspiring.getFilePrefix = function()
{
    return "/"+Aspiring.appname+"/";    
}

Aspiring.getPathFromFilename = function(fname)
{
    var path = Aspiring.getFilePrefix()+fname;
    console.log("from fname "+fname+" path= "+path);
    return path;
}

Aspiring.isFileForApp = function(filename)
{

    var prefix = Aspiring.getFilePrefix();

    if (filename.slice(0,prefix.length) == prefix) {
	return true;
    } 
    
    return false;
}

Aspiring.getFilenameFromPath = function(path)
{
    var prefix = Aspiring.getFilePrefix();

    if (path.slice(0,prefix.length) == prefix) {
	var fname = path.slice(prefix.length,path.length);
	console.log("from path = "+path+" name= "+fname)
	return fname;
    } 

    return null;

}

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

  // alert(message.to);
  $.postJSON("/runasemailer", message, function(response) {
    msg = response["data"]
    alert("Sent Email to "+msg)
  });
  changePage('#indexPage');
  return false;
}

function showPrintDialog(){
  var control = SocialCalc.GetCurrentWorkBookControl();
  var html = control.workbook.spreadsheet.CreateSheetHTML();
// this is for browser based print functionality
  var printWindow = window.open('','','left=100,top=100');
  printWindow.document.write(html);
  printWindow.print();
  printWindow.close();

  var category = Aspiring.getFilePrefix()+"Header";
  var label = "Print";
  sendEventHit(category, label, "Print: Hit sent");
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

function getSheetIndexFromId(sheetid)
{
    console.log(sheetid)
    var sheets = getSheetIds();
    for (i=0; i<sheets.length; i++) {
	console.log(sheets[i])
	if (sheets[i] == sheetid) {
	    return i+1;
	}
    }
    return 1;
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

   var label = document.getElementById('footerbtn'+index).firstChild.firstChild.firstChild.innerHTML;
   var category = Aspiring.getFilePrefix()+'Footers';
   sendEventHit(category, label, "Footers: Hit sent");
   
}

function sendEventHit(category, label, log){
  var log = log;
  ga('send', 'event', category , 'click', label, { 'hitCallback': function() { console.log(log); }});
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
  // for each file in the store, replace the template with the filename
  var hstr = "";
  var i = 0;
  console.log(window.localStorage.length);

  for (i=0; i < window.localStorage.length; i++) {

      if (!(Aspiring.isFileForApp(window.localStorage.key(i)))) {
	       continue;
      }

      if(window.localStorage.key(i).length >=30)
	       continue;

    var fname = Aspiring.getFilenameFromPath(window.localStorage.key(i));
    var temp = str;
    temp = temp.replace("!--Template1--",fname);
    temp = temp.replace("!--Template2--",fname);
    temp = temp.replace("!--Template3--",fname);
    hstr = hstr + temp;
  }

  // add the default file name
  var temp = str;
  temp = temp.replace("!--Template1--", "default");
  temp = temp.replace("!--Template2--", "default");
  temp = temp.replace("!--Template3--", "default");
  hstr = hstr + temp;

  ele1.innerHTML=hstr;
  console.log("edited list page")
    
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

    if (selectedFile != fname) {
	setLastEditedFileName(fname);
    }

    selectedFile = fname;
    Aspiring.AutoSave.selectedFile = fname;

    document.getElementById("indexPage-fname").innerHTML="Editing: "+fname;


}


function viewFile(filename) {
    //alert("viewFile: "+selectedFile)
    console.log("view file "+filename);
    //$.mobile.showPageLoadingMsg()
    //selectedFile = filename;
    
    /*Changes for Encryption Implementation Start*/
    
    if (filename != "default") {
    	//var decrypt = decryptFileOpen(filename); //change
    	//if (decrypt == true){               //change
    	//data = window.localStorage.getItem(filename)
    	//console.log(data.length)
	
      var fileData = window.localStorage.getItem(Aspiring.getPathFromFilename(filename));
      if (fileData)
      {
        SocialCalc.WorkBookControlInsertWorkbook(decodeURIComponent(fileData));
        updateFileName(filename);
        SocialCalc.GetCurrentWorkBookControl().workbook.spreadsheet.editor.state = "start";

        SocialCalc.GetCurrentWorkBookControl().workbook.spreadsheet.ExecuteCommand('redisplay', '');
        $.mobile.changePage(($("#indexPage")), { transition: "slideup"} );
      
      } 
      else {
        alert("Error loading file "+filename);
      }
	
    } else {
    	data = document.getElementById("sheetdata").value;
    	SocialCalc.WorkBookControlInsertWorkbook(data);
    	updateFileName(filename);
    	SocialCalc.GetCurrentWorkBookControl().workbook.spreadsheet.editor.state = "start";
    	
    	SocialCalc.GetCurrentWorkBookControl().workbook.spreadsheet.ExecuteCommand('redisplay', '');
    	$.mobile.changePage(($("#indexPage")), { transition: "slideup"} );
    }

    if(window.localStorage.getItem(Aspiring.getPathFromFilename(settingsName)) && selectedFile == "default"){
        var coordinate = ''; var cmdline = ''
        var control = SocialCalc.GetCurrentWorkBookControl();
        var currsheet = control.currentSheetButton.id;
        var editor = control.workbook.spreadsheet.editor;
         
        var settings = JSON.parse(window.localStorage.getItem(Aspiring.getPathFromFilename(settingsName)));
        if(settings.auto == true){
            console.log("setting is on.incrementing... ");
            var value = settings.value;
            cmdline = "set C16 value n "+value;
            editor.EditorScheduleSheetCommands(cmdline, true, false);
            
        }
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

  window.localStorage.removeItem(Aspiring.getPathFromFilename(filename));
  //alert("Deleted file: "+filename)
  tweakUpdateList();

  if (selectedFile == filename) {
      // set the selected file back to default
      updateFileName("default");
      // load the default file into socialcalc
  }

}

function saveAsOk(fname) {

    // do some validation checks on file name
    if (fname == "default") {
  alert(
  "Cannot update default file! \n\n Use another file name");
      return;
    }

    if (fname == "") {
  alert(
  "Empty filename, Please use another filename");
      return;
    }

    if (fname.length > 30) {
  alert(
  "Filename too long ! \n\n Please enter a file name less than 30 characters");
       return;
    }

    var val = SocialCalc.WorkBookControlSaveSheet();
    console.log(val.length);
    var val1 = encodeURIComponent(val);
    console.log(val1.length);
    window.localStorage.setItem(Aspiring.getPathFromFilename(fname), val1);    
    alert("saved as "+fname);

    // set the top right file to selected file
    updateFileName(fname);
    
    //Upload the saved file to dropbox
    //TODO 

     ///**************** Increment Order #
    
    if(window.localStorage.getItem(Aspiring.getPathFromFilename(settingsName))) {
        var settings = JSON.parse(window.localStorage.getItem(Aspiring.getPathFromFilename(settingsName)));
        if(settings.auto == true){
            settings.value = parseInt(settings.value) + parseInt(1);
            window.localStorage.setItem(Aspiring.getPathFromFilename(settingsName), JSON.stringify(settings));
            console.log("updating json object.. "+JSON.stringify(settings));

        }
    }
}

function saveAsCancel() {
    console.log("saveas canceled");
}

function saveAsPrompt() {
    //alert("in prompt");
  var fname = prompt("Enter File Name","saved");    
  if (fname) {
    if (fname.indexOf("\'") > 0 || fname.indexOf("\"") > 0)
    {
      console.log(fname.indexOf("\"")+ ", "+fname.indexOf("\'"));
      alert("Invalid file name. Quotes are not allowed");
      saveAsCancel();
    }
    else
    {
      saveAsOk(fname);
    }
  } else {
    saveAsCancel();
  }
}

function saveCurrentFile() {

    if (selectedFile == "default") {
  alert(
  "Cannot update default file! \n\n Use SaveAs");
       return;
    }

    console.log("saving current file "+selectedFile)
    var val = SocialCalc.WorkBookControlSaveSheet();
    console.log(val.length);
    var val1 = encodeURIComponent(val);
    console.log(val1.length);
    window.localStorage.setItem(Aspiring.getPathFromFilename(selectedFile), val1);    
    console.log("saved as "+selectedFile);
    
    alert("Saved file : "+selectedFile);

    //Upload the saved file to dropbox
    //TODO 

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
    var passwordObject = window.localStorage.getItem(Aspiring.getPathFromFilename(htmlEncryptionKey));
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
        if (window.localStorage.getItem(Aspiring.getPathFromFilename(filename))){
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
            window.localStorage.setItem(Aspiring.getPathFromFilename(filename), val1);
            passwordObject = JSON.stringify(passwordObject);
            window.localStorage.setItem(Aspiring.getPathFromFilename(htmlEncryptionKey),passwordObject);
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
    var passwordObject = window.localStorage.getItem(Aspiring.getPathFromFilename(htmlEncryptionKey));
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
	    data = window.localStorage.getItem(Aspiring.getPathFromFilename(filename));
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
    var passwordObject = window.localStorage.getItem(Aspiring.getPathFromFilename(htmlEncryptionKey));
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
            window.localStorage.setItem(Aspiring.getPathFromFilename(htmlEncryptionKey),passwordObject);
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

var clicked;

function importSignature(val) {
  console.log("importing...");

  document.getElementById("signature").showModal(); 
  if(val == 1){
    clicked=1;

  }
  else if(val == 2){
    clicked=2;

  }

 
}

function startImportSign(name,src,clicked) {
  

  var res = src.split(";");
  console.log(res);
  var suffix = res[0].split("/");
  console.log(suffix[1]);


  if(clicked == 1){
        var control = SocialCalc.GetCurrentWorkBookControl();
        var currsheet = control.currentSheetButton.id;

        if (currsheet == "sheet1" ){
          var cmd = 'set C38 text t <img src="'+src+'" style="max-width:100%;"></img>'+"\n";
          cmd = {cmdtype:"scmd", id:currsheet, cmdstr: cmd, saveundo: false};
          control.ExecuteWorkBookControlCommand(cmd, false);
        }
        else if(currsheet == "sheet6" || currsheet == "sheet7"){
          var cmd = 'set B42 text t <img src="'+src+'" style="max-width:100%;"></img>'+"\n";
          cmd = {cmdtype:"scmd", id:currsheet, cmdstr: cmd, saveundo: false};
          control.ExecuteWorkBookControlCommand(cmd, false);
        }


  }
  else if(clicked == 2){

        var control = SocialCalc.GetCurrentWorkBookControl();
        var currsheet = control.currentSheetButton.id;

        if (currsheet == "sheet1" || currsheet == "sheet6"){
          var cmd = 'set F6 text t <img src="'+src+'" style="max-width:100%;"></img>'+"\n";
          cmd = {cmdtype:"scmd", id:currsheet, cmdstr: cmd, saveundo: false};
          control.ExecuteWorkBookControlCommand(cmd, false);
        }
        else if(currsheet == "sheet7"){
          var cmd = 'set F7 text t <img src="'+src+'" style="max-width:100%;"></img>'+"\n";
          cmd = {cmdtype:"scmd", id:currsheet, cmdstr: cmd, saveundo: false};
          control.ExecuteWorkBookControlCommand(cmd, false);
        }

  }
  
  
  
  document.getElementById("signature").close(); 


}


function loadTickerStart(){
  var ticker = prompt("Enter ticker","MSFT");
  if(ticker){
    AspiringStock.loadTickerOk(ticker);
  }
  else{
    return;
  }
}

function addLogoStart(){
  // document.getElementById('add-logo-block').style.display = '';
  $("#add-logo-block").slideDown(300);
}

function startLogoImport(name, src){
  var res = src.split(";");
  console.log(res);
  var suffix = res[0].split("/");
  console.log(suffix[1]);

  var control = SocialCalc.GetCurrentWorkBookControl();
  var currsheet = control.currentSheetButton.id;

  //App specific coordinates
  // alert(currsheet);

  if (currsheet == "sheet1" && (Aspiring.appname == "iPayment" || Aspiring.appname == "BillingSuite")) {
    var cmd = 'set E4 text t <img src="'+src+'" height="150" width="150"></img>'+"\n";
    cmd = {cmdtype:"scmd", id:currsheet, cmdstr: cmd, saveundo: false};
    control.ExecuteWorkBookControlCommand(cmd, false);
  }
  if (currsheet == "sheet1" && (Aspiring.appname == "CashReceipt")) {
    var cmd = 'set E3 text t <img src="'+src+'" height="80" width="200"></img>'+"\n";
    cmd = {cmdtype:"scmd", id:currsheet, cmdstr: cmd, saveundo: false};
    control.ExecuteWorkBookControlCommand(cmd, false);

    window.setTimeout(function(){
      var cmd2 = 'set E20 text t <img src="'+src+'" height="80" width="200"></img>'+"\n";
      // alert(cmd2);
      cmd2 = {cmdtype:"scmd", id:currsheet, cmdstr: cmd2, saveundo: false};
      control.ExecuteWorkBookControlCommand(cmd2, false);

    },3000);
  }
  else if (currsheet == "sheet3" && (Aspiring.appname == "CashReceipt")) {
    var cmd = 'set E3 text t <img src="'+src+'" height="80" width="200"></img>'+"\n";
    cmd = {cmdtype:"scmd", id:currsheet, cmdstr: cmd, saveundo: false};
    control.ExecuteWorkBookControlCommand(cmd, false);
  }

  cancelUploadLogo();
}

function removeLogo(){
  var control = SocialCalc.GetCurrentWorkBookControl();
  var currsheet = control.currentSheetButton.id;

  //App specific coordinates for removing logo
  if (currsheet == "sheet1" && (Aspiring.appname == "iPayment" || Aspiring.appname == "BillingSuite")) {
    var cmd = 'erase E4 formulas';
    cmd = {cmdtype:"scmd", id:currsheet, cmdstr: cmd, saveundo: false};
    control.ExecuteWorkBookControlCommand(cmd, false);
  }

  if ((currsheet == "sheet1" || currsheet == "sheet3") && (Aspiring.appname == "CashReceipt")) {
    var cmd = 'erase E3 formulas';
    cmd = {cmdtype:"scmd", id:currsheet, cmdstr: cmd, saveundo: false};
    control.ExecuteWorkBookControlCommand(cmd, false);

    window.setTimeout(function(){
      var cmd2 = 'erase E20 formulas';
      cmd2 = {cmdtype:"scmd", id:currsheet, cmdstr: cmd2, saveundo: false};
      control.ExecuteWorkBookControlCommand(cmd2, false);


    },3000);

  }

  $('#fileDisplayArea').empty();
  $("#fileForm")[0].reset();
}

function cancelUploadLogo(){
  $('#fileDisplayArea').empty();
  $("#fileForm")[0].reset();
  $("#add-logo-block").slideUp(300);
  // document.getElementById('add-logo-block').style.display = "none";
}

function enableIncrement(){

  var ele = document.getElementById("flip-a");
  var state = ele.options[ele.selectedIndex].value;
  console.log("checked: "+state);
  if(state == "On"){
    // set autoincrement to onif (isNaN(x)
    // If autoincrement file present, then turn the setting on
    if(!window.localStorage.getItem(Aspiring.getPathFromFilename(settingsName))) {
      var value = prompt("Initial value","1");
      if(!value){
        ele.options[ele.selectedIndex].value = "Off";
        return;
      }
      if(!isNaN(value)){
        var settings = {'auto': true, 'value': value};
        window.localStorage.setItem(Aspiring.getPathFromFilename(settingsName), JSON.stringify(settings));  
        console.log("created: "+window.localStorage.getItem(Aspiring.getPathFromFilename(settingsName)));
      }
      else{
        alert("Numbers only")
      }
    }
    else{
      var settings = JSON.parse(window.localStorage.getItem(Aspiring.getPathFromFilename(settingsName)));
      settings.auto = true;
      window.localStorage.setItem(Aspiring.getPathFromFilename(settingsName), JSON.stringify(settings));  
      console.log("updated: "+window.localStorage.getItem(Aspiring.getPathFromFilename(settingsName)));
    }

   
  }
  else{
    // set autoincrement to off
    if(window.localStorage.getItem(Aspiring.getPathFromFilename(settingsName))) {
      var settings = JSON.parse(window.localStorage.getItem(Aspiring.getPathFromFilename(settingsName)));
      settings.auto = false;
      window.localStorage.setItem(Aspiring.getPathFromFilename(settingsName), JSON.stringify(settings));  
      console.log("updated: "+window.localStorage.getItem(Aspiring.getPathFromFilename(settingsName)));
    }
  }
}


function startDonation(){
  $("#add-donate-block").slideDown(300);
  $("#image-div").removeClass("ui-btn-hidden");
  var category = Aspiring.getFilePrefix()+"Header";
  var label = "Donate";
  sendEventHit(category, label, "Donate header: Hit sent");
}

function cancelDonation(){
  $("#add-donate-block").slideUp(300);
  var category = Aspiring.getFilePrefix()+"Donate";
  var label = "Cancel";
  sendEventHit(category, label, "Donate block: Hit sent");
}

/** Live functions for sending analytics hit**/
$('#emailPage').live('pageshow', function() {
      var category = Aspiring.getFilePrefix()+"Header";
      var label = "Email";
      sendEventHit(category, label, "Email: Hit sent");
});

$('#filePage').live('pageshow', function() {
      var category = Aspiring.getFilePrefix()+"Header";
      var label = "File";
      sendEventHit(category, label, "File: Hit sent");

      document.getElementById('image-div-paypal').addEventListener("click", function(event){
        var category = Aspiring.getFilePrefix()+"Donate";
        var label = "File/Link";
        sendEventHit(category, label, "Donate block: Hit sent")
    });
      
});

function paypalHttpsLink(page){
  window.open('https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=7XYA5PEFRT6DC','_blank');
  var category = Aspiring.getFilePrefix()+"Donate";
  var label = page+"/Link";
  sendEventHit(category, label, "Donate block: Hit sent");
}

function addExportStart(){
  $("#csv-export-block").slideDown(300);

  function CsvFileName(element, data){
    this.data = data;
    this.element = element;
    element.value = data;
    element.addEventListener("change", this, false);
  }

  CsvFileName.prototype.handleEvent = function (event) {
    switch (event.type) {
        case "change":
            this.change(this.element.value);
    }
  };

  CsvFileName.prototype.change = function (value) {
    this.data = value;
    this.element.value = value;
  };

  var obj = new CsvFileName(document.getElementById("csv-name-div"), "Untitled");
  
  var i = 0;
  setInterval(function () {
    obj.change(obj.element.value);
  }, 3000);
}

function closeExportDialog(){
  $("#csv-export-block").slideUp(300);
  var el = document.getElementById('results');
  while( el.hasChildNodes() ){
    el.removeChild(el.lastChild);
  }
}


function exportAsCsv(){

  var val = SocialCalc.WorkBookControlSaveSheet();
  // alert(val);
  var workBookObject = JSON.parse(val);
  // alert(workBookObject);
  var control = SocialCalc.GetCurrentWorkBookControl();
  currentname = control.currentSheetButton.id; //predefined variable.replace id by name for fixed sheet.
  //alert(currentname);
  var savestrr = workBookObject.sheetArr[currentname].sheetstr.savestr;
  var res = SocialCalc.ConvertSaveToOtherFormat(savestrr, "csv", false);
  // alert(res);
  var data = res;
  var exportLink = document.createElement('a');
  exportLink.setAttribute('href', 'data:text/csv;base64,' + window.btoa(data));

  var name = document.getElementById("csv-name-div").value;
  exportLink.setAttribute('download', name);
  // alert(name);
  var txtNode = document.createTextNode(name+'.csv');
  exportLink.appendChild(txtNode);
  var el = document.getElementById('results');
  while( el.hasChildNodes() ){
    el.removeChild(el.lastChild);
  }
  document.getElementById('results').appendChild(exportLink);

}
