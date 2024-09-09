//
// Workbook Control controls workbook actions (add/del/rename etc) and can appear at the
// bottom of the screen (?). Right now its just a proof of concept 
// and appears at the top of the screen
//
// Author: Ramu Ramamurthy
//
//

var SocialCalc;
if (!SocialCalc) {
	alert("Main SocialCalc code module needed");
	SocialCalc = {};
}

SocialCalc.CurrentWorkbookControlObject = null; 

SocialCalc.TestWorkBookSaveStr = "";


// Constructor:

SocialCalc.WorkBookControl = function(book, divid, defaultsheetname) {

	this.workbook = book;
	this.div = divid;
	this.defaultsheetname = defaultsheetname;
	this.sheetButtonArr = {};
	this.sheetCnt = 0;
	this.numSheets = 0;
	this.currentSheetButton = null;
	this.renameDialogId = "sheetRenameDialog";
	this.deleteDialogId = "sheetDeleteDialog";
	this.hideDialogId   = "sheetHideDialog";
	this.unhideDialogId = "sheetUnhideDialog";
	
	this.sheetshtml = '<div id="fooBar" style="background-color:#80A9F3;display:none"></div>';
	
//this.buttonshtml = 
//'<form>'+
//'<div id="workbookControls" style="padding:6px;background-color:#80A9F3;">'+
//'<input type="button" value="add sheet" onclick="SocialCalc.WorkBookControlAddSheet(true)" class="smaller">'+
//'<input type="button" value="delete sheet" onclick="SocialCalc.WorkBookControlDelSheet()" class="smaller">'+
//'<input type="button" value="rename sheet" onclick="SocialCalc.WorkBookControlRenameSheet()" class="smaller">'+

// '<input type="button" value="save workbook" onclick="SocialCalc.WorkBookControlSaveSheet()" class="smaller">'+
// '<input type="button" value="new workbook" onclick="SocialCalc.WorkBookControlNewBook()" class="smaller">'+
// '<input type="button" value="load workbook" onclick="SocialCalc.WorkBookControlLoad()" class="smaller">'+

//'<input type="button" value="copy sheet" onclick="SocialCalc.WorkBookControlCopySheet()" class="smaller">'+
//'<input type="button" value="paste sheet" onclick="SocialCalc.WorkBookControlPasteSheet()" class="smaller">'+
//'</div>'+
//'</form>';

	SocialCalc.CurrentWorkbookControlObject = this;
	this.sheetbar = new SocialCalc.SheetBar();
}

// methods
SocialCalc.WorkBookControl.prototype.GetCurrentWorkBookControl = function() {return SocialCalc.GetCurrentWorkBookControl();};
SocialCalc.WorkBookControl.prototype.InitializeWorkBookControl = function() {return SocialCalc.InitializeWorkBookControl(this);};


SocialCalc.WorkBookControl.prototype.ExecuteWorkBookControlCommand = function(cmd, isremote) {
	return SocialCalc.ExecuteWorkBookControlCommand(this, cmd, isremote);
}

SocialCalc.ExecuteWorkBookControlCommand = function(control, cmd, isremote) {
	//console.log("cmd ", cmd.cmdstr, cmd.cmdtype);

	//if (!isremote) {
	//	return;
	//}

	if (cmd.cmdtype == "scmd") {
	// dispatch a sheet command
	control.workbook.WorkbookScheduleCommand(cmd, isremote);
	return;
	
	}
	
	if (cmd.cmdtype != "wcmd") {
	return;
	}

	var parseobj = new SocialCalc.Parse(cmd.cmdstr);
	
	var cmd1 = parseobj.NextToken();

	switch (cmd1) {
	case "addsheet":
	SocialCalc.WorkBookControlAddSheetRemote(null);
	break;
	
	case "addsheetstr":
	var sheetstr = cmd.sheetstr;	
	SocialCalc.WorkBookControlAddSheetRemote(sheetstr);
	break;

	case "delsheet":
	var sheetid = parseobj.NextToken();
	SocialCalc.WorkBookControlDelSheetRemote(sheetid);
	break;

	case "rensheet":
	var sheetid = parseobj.NextToken();
	var oldname = parseobj.NextToken();
	var newname = parseobj.NextToken();	
	SocialCalc.WorkBookControlRenameSheetRemote(sheetid, oldname, newname);
	break;

	case "activatesheet":
	var sheetid = parseobj.NextToken();
	SocialCalc.WorkBookControlActivateSheet(sheetid);
	break;
	
	case "hidesheet":
	var sheetid = parseobj.NextToken();
	
	break;
	
	case "unhidesheet":
	var sheetid = parseobj.NextToken();
	
	break;
	}
}

SocialCalc.GetCurrentWorkBookControl = function() {
	return SocialCalc.CurrentWorkbookControlObject;
}

SocialCalc.InitializeWorkBookControl = function(control) {
	var element = document.createElement("div");
	element.innerHTML = control.sheetshtml;
	var foo = document.getElementById(control.div);
	foo.appendChild(element);
	//var element2 = document.createElement("div");
	//element2.innerHTML = control.buttonshtml;
	//foo.appendChild(element2);
	SocialCalc.WorkBookControlAddSheet(false); // this is for the default sheet
}

SocialCalc.WorkBookControlDelSheetRemote = function(sheetid) {

	var control = SocialCalc.GetCurrentWorkBookControl();
	if (sheetid == control.currentSheetButton.id) {
	// the active sheet is being deleted
	SocialCalc.WorkBookControlDelSheet();
	return;
	}
	// some non active sheet is being deleted
	var foo = document.getElementById("fooBar");
	var deletedbutton = document.getElementById(sheetid);
	
	var did = deletedbutton.id;
	var dname = deletedbutton.value;
	delete control.sheetButtonArr[did];
		
	foo.removeChild(deletedbutton);
	var sheetbar = document.getElementById("SocialCalc-sheetbar-buttons");
	var sheetbarbutton = document.getElementById("sbsb-"+did);
	// unregister with mouse ? etc
	sheetbar.removeChild(sheetbarbutton);


	// delete the sheet
	control.workbook.DeleteWorkBookSheet(did, dname);
	control.numSheets = control.numSheets-1;
	
}

// assumes that the current active sheet is being deleted
SocialCalc.WorkBookControlDelSheet = function() {

	var control = SocialCalc.GetCurrentWorkBookControl();
	if (control.workbook.spreadsheet.editor.state != "start") {
	// if in edit mode return
	return;
	}
if (control.numSheets == 1) {				//disallow this
	var str = '<div style="padding:6px 0px 4px 6px;">'+
		'<span>'+'<b> A workbook must contain at least one worksheet </b>' + '</span><br/><br/>';
	str +='<span>To delete the selected sheet, you must first insert a new sheet. </span><br/></div>';
str +='<div style="width:380px;text-align:right;padding:6px 0px 4px 6px;font-size:small;">'+
		'<input type="button" value="Ok" style="font-size:smaller;" onclick="SocialCalc.WorkBookControlDeleteSheetHide();"></div>';
	var main = document.createElement("div");
main.id = control.deleteDialogId;

main.style.position = "absolute";

var vp = SocialCalc.GetViewportInfo();

main.style.top = (vp.height/3)+"px";
main.style.left = (vp.width/3)+"px";
main.style.zIndex = 100;
main.style.backgroundColor = "#FFF";
main.style.border = "1px solid black";

main.style.width = "400px";

main.innerHTML = '<table cellspacing="0" cellpadding="0" style="border-bottom:1px solid black;"><tr>'+
	'<td style="font-size:10px;cursor:default;width:100%;background-color:#999;color:#FFF;">'+"&nbsp;"+'</td>'+
	'<td style="font-size:10px;cursor:default;color:#666;" onclick="SocialCalc.WorkBookControlDeleteSheetHide();">&nbsp;X&nbsp;</td></tr></table>'+
	'<div style="background-color:#DDD;">'+str+'</div>';

	//alert(main.innerHTML);

SocialCalc.DragRegister(main.firstChild.firstChild.firstChild.firstChild, true, true, {MouseDown: SocialCalc.DragFunctionStart, MouseMove: SocialCalc.DragFunctionPosition,
				MouseUp: SocialCalc.DragFunctionPosition,
				Disabled: null, positionobj: main});

control.workbook.spreadsheet.spreadsheetDiv.appendChild(main);
	return;
	}

	
	// do a popup to reaffirm the deletion of the sheet
	// the popup has two buttons : Confirm and Cancel
var element = document.getElementById(control.deleteDialogId);
if (element) return;

var currentsheet = control.currentSheetButton.value;
var str = '<div style="padding:6px 0px 4px 6px;">'+
		'<span>'+ '<b>The selected sheet will be permanently deleted.</b>'+ '</span><br/>';
str +='<span><ul>';
	str +='<li> To delete the selected sheet, click OK.</li>';
	str +='<li> To cancel the deletion, click cancel.</li>';
str+='</ul></span></div>';
str +='<div style="width:380px;text-align:right;padding:6px 0px 4px 6px;font-size:small;">'+
		'<input type="button" value="Cancel" style="font-size:smaller;" onclick="SocialCalc.WorkBookControlDeleteSheetHide();">&nbsp;'+
		'<input type="button" value="OK" style="font-size:smaller;" onclick="SocialCalc.WorkBookControlDeleteSheetSubmit();"></div>';

var main = document.createElement("div");
main.id = control.deleteDialogId;

main.style.position = "absolute";

var vp = SocialCalc.GetViewportInfo();

main.style.top = (vp.height/3)+"px";
main.style.left = (vp.width/3)+"px";
main.style.zIndex = 100;
main.style.backgroundColor = "#FFF";
main.style.border = "1px solid black";

main.style.width = "400px";

main.innerHTML = '<table cellspacing="0" cellpadding="0" style="border-bottom:1px solid black;"><tr>'+
	'<td style="font-size:10px;cursor:default;width:100%;background-color:#999;color:#FFF;">'+"&nbsp;"+'</td>'+
	'<td style="font-size:10px;cursor:default;color:#666;" onclick="SocialCalc.WorkBookControlDeleteSheetHide();">&nbsp;X&nbsp;</td></tr></table>'+
	'<div style="background-color:#DDD;">'+str+'</div>';

	//alert(main.innerHTML);

SocialCalc.DragRegister(main.firstChild.firstChild.firstChild.firstChild, true, true, {MouseDown: SocialCalc.DragFunctionStart, MouseMove: SocialCalc.DragFunctionPosition,
				MouseUp: SocialCalc.DragFunctionPosition,
				Disabled: null, positionobj: main});

control.workbook.spreadsheet.spreadsheetDiv.appendChild(main);
}

SocialCalc.WorkBookControlDeleteSheetHide = function(){

var control = SocialCalc.GetCurrentWorkBookControl();
var spreadsheet = control.workbook.spreadsheet;

var ele = document.getElementById(control.deleteDialogId);
ele.innerHTML = "";

SocialCalc.DragUnregister(ele);

SocialCalc.KeyboardFocus();

if (ele.parentNode) {
	ele.parentNode.removeChild(ele);
}
}

SocialCalc.WorkBookControlDeleteSheetSubmit = function() {

		var control = SocialCalc.GetCurrentWorkBookControl();
		SocialCalc.WorkBookControlDeleteSheetHide();
		var foo = document.getElementById("fooBar");
		var current = document.getElementById(control.currentSheetButton.id);
		
		var name = current.id;
		var curname = control.currentSheetButton.value;
		delete control.sheetButtonArr[name];
		
		foo.removeChild(current);
			
		var sheetbar = document.getElementById("SocialCalc-sheetbar-buttons");
		var sheetbarbutton = document.getElementById("sbsb-"+current.id);
		// unregister with mouse ? etc
		sheetbar.removeChild(sheetbarbutton);

		control.currentSheetButton = null;
		// delete the sheets
		control.workbook.DeleteWorkBookSheet(name, curname);
		control.numSheets = control.numSheets-1;

		var cmdstr = "delsheet "+name;
		SocialCalc.Callbacks.broadcast('execute', { cmdtype:"wcmd", id:"0", cmdstr: cmdstr});
	
		// reset current sheet
		for (var sheet in control.sheetButtonArr) {
		if (sheet != null) {
			control.currentSheetButton = control.sheetButtonArr[sheet];
			control.currentSheetButton.setAttribute("style","background-color:lightgreen");
				SocialCalc.SheetBarButtonActivate(control.currentSheetButton.id, true)
			break;
		}
	}
	if (control.currentSheetButton != null) {
		control.workbook.ActivateWorkBookSheet(control.currentSheetButton.id, null);
	}
}

// assumes that the current active sheet is being hidden
SocialCalc.WorkBookControlHideSheet = function() {

		var control = SocialCalc.GetCurrentWorkBookControl();

		var control = SocialCalc.GetCurrentWorkBookControl();
		if (control.workbook.spreadsheet.editor.state != "start") {
		// if in edit mode return
		return;
		}
		if (control.numSheets == 1) {				//disallow this
		var str = '<div style="padding:6px 0px 4px 6px;">'+
			'<span>'+'<b> A workbook must contain at least one worksheet </b>' + '</span><br/><br/>';
		str +='<span>Before hiding the selected sheet, you must first insert a new sheet. </span><br/></div>';
		str +='<div style="width:380px;text-align:right;padding:6px 0px 4px 6px;font-size:small;">'+
			'<input type="button" value="Ok" style="font-size:smaller;" onclick="SocialCalc.WorkBookControlHideSheetHide();"></div>';
		var main = document.createElement("div");
		main.id = control.hideDialogId;

	main.style.position = "absolute";

	var vp = SocialCalc.GetViewportInfo();

	main.style.top = (vp.height/3)+"px";
	main.style.left = (vp.width/3)+"px";
	main.style.zIndex = 100;
	main.style.backgroundColor = "#FFF";
	main.style.border = "1px solid black";

	main.style.width = "400px";

	main.innerHTML = '<table cellspacing="0" cellpadding="0" style="border-bottom:1px solid black;"><tr>'+
		'<td style="font-size:10px;cursor:default;width:100%;background-color:#999;color:#FFF;">'+"&nbsp;"+'</td>'+
		'<td style="font-size:10px;cursor:default;color:#666;" onclick="SocialCalc.WorkBookControlHideSheetHide();">&nbsp;X&nbsp;</td></tr></table>'+
		'<div style="background-color:#DDD;">'+str+'</div>';

		//alert(main.innerHTML);

	SocialCalc.DragRegister(main.firstChild.firstChild.firstChild.firstChild, true, true, {MouseDown: SocialCalc.DragFunctionStart, MouseMove: SocialCalc.DragFunctionPosition,
					MouseUp: SocialCalc.DragFunctionPosition,
					Disabled: null, positionobj: main});

	control.workbook.spreadsheet.spreadsheetDiv.appendChild(main);
		return;
		}

		
		// do a popup to reaffirm the hiding of the sheet
		// the popup has two buttons : Confirm and Cancel
	var element = document.getElementById(control.hideDialogId);
	if (element) return;

	var currentsheet = control.currentSheetButton.value;
	var str = '<div style="padding:6px 0px 4px 6px;">'+
			'<span>'+ '<b>The selected sheet will be hidden.</b>'+ '</span><br/>';
	str +='<span><ul>';
		str +='<li> To hide the selected sheet, click OK.</li>';
		str +='<li> To cancel the hiding, click cancel.</li>';
	str+='</ul></span></div>';
	str +='<div style="width:380px;text-align:right;padding:6px 0px 4px 6px;font-size:small;">'+
			'<input type="button" value="Cancel" style="font-size:smaller;" onclick="SocialCalc.WorkBookControlHideSheetHide();">&nbsp;'+
			'<input type="button" value="OK" style="font-size:smaller;" onclick="SocialCalc.WorkBookControlHideSheetSubmit();"></div>';

	var main = document.createElement("div");
	main.id = control.hideDialogId;

	main.style.position = "absolute";

	var vp = SocialCalc.GetViewportInfo();

	main.style.top = (vp.height/3)+"px";
	main.style.left = (vp.width/3)+"px";
	main.style.zIndex = 100;
	main.style.backgroundColor = "#FFF";
	main.style.border = "1px solid black";

	main.style.width = "400px";

	main.innerHTML = '<table cellspacing="0" cellpadding="0" style="border-bottom:1px solid black;"><tr>'+
		'<td style="font-size:10px;cursor:default;width:100%;background-color:#999;color:#FFF;">'+"&nbsp;"+'</td>'+
		'<td style="font-size:10px;cursor:default;color:#666;" onclick="SocialCalc.WorkBookControlHideSheetHide();">&nbsp;X&nbsp;</td></tr></table>'+
		'<div style="background-color:#DDD;">'+str+'</div>';

		//alert(main.innerHTML);

	SocialCalc.DragRegister(main.firstChild.firstChild.firstChild.firstChild, true, true, {MouseDown: SocialCalc.DragFunctionStart, MouseMove: SocialCalc.DragFunctionPosition,
					MouseUp: SocialCalc.DragFunctionPosition,
					Disabled: null, positionobj: main});

	control.workbook.spreadsheet.spreadsheetDiv.appendChild(main);
	}

SocialCalc.WorkBookControlHideSheetHide = function(){

var control = SocialCalc.GetCurrentWorkBookControl();
var spreadsheet = control.workbook.spreadsheet;

var ele = document.getElementById(control.hideDialogId);
ele.innerHTML = "";

SocialCalc.DragUnregister(ele);

SocialCalc.KeyboardFocus();

if (ele.parentNode) {
	ele.parentNode.removeChild(ele);
}
}

SocialCalc.WorkBookControlHideSheetSubmit = function() {

		var control = SocialCalc.GetCurrentWorkBookControl();
		SocialCalc.WorkBookControlHideSheetHide();
		var foo = document.getElementById("fooBar");
		var current = document.getElementById(control.currentSheetButton.id);

		var name = current.id;
		var curname = control.currentSheetButton.value;
			
		var sheetbar = document.getElementById("SocialCalc-sheetbar-buttons");
		var sheetbarbutton = document.getElementById("sbsb-"+current.id);
		// unregister with mouse ? etc
		SocialCalc.SheetBarButtonActivate(control.currentSheetButton.id, false);
		sheetbarbutton.style.display="none";
		control.currentSheetButton = null;
		// delete the sheets

		control.numSheets = control.numSheets-1;

                var cmdstr = "hidesheet "+name;
                SocialCalc.Callbacks.broadcast('execute', { cmdtype:"wcmd", id:"0", cmdstr: cmdstr});
	
		// reset current sheet
		for (var sheet in control.sheetButtonArr) {
			if (sheet != null && document.getElementById("sbsb-"+sheet).style.display != "none") {
				control.currentSheetButton = control.sheetButtonArr[sheet];
				break;
				}
			}
		if (control.currentSheetButton != null) {
			control.currentSheetButton.setAttribute("style","background-color:lightgreen");
		        SocialCalc.SheetBarButtonActivate(control.currentSheetButton.id, true);
			control.workbook.ActivateWorkBookSheet(control.currentSheetButton.id, null);
		}
	}
	
// displays all hidden sheets, and then unhides whatever is selected
SocialCalc.WorkBookControlUnhideSheet = function() {

		var control = SocialCalc.GetCurrentWorkBookControl();
		if (control.workbook.spreadsheet.editor.state != "start") {
		// if in edit mode return
		return;
		}

	var unhiddencount = 0;
	for(var sheet in control.sheetButtonArr) {
		if(document.getElementById("sbsb-" + sheet).style.display == "none") {
			unhiddencount++;
			}
		}

	if(unhiddencount==0) {	//no hidden sheets, error message here
		var str = '<div style="padding:6px 0px 4px 6px;">'+
			'<span>'+'<b> There are no hidden worksheets. </b>' + '</span><br/><br/>';
		str +='<span>Before unhiding any sheets, you must first hide a sheet. </span><br/></div>';
		str +='<div style="width:380px;text-align:right;padding:6px 0px 4px 6px;font-size:small;">'+
			'<input type="button" value="Ok" style="font-size:smaller;" onclick="SocialCalc.WorkBookControlUnhideSheetHide();"></div>';
		var main = document.createElement("div");
		main.id = control.unhideDialogId;

		main.style.position = "absolute";

		var vp = SocialCalc.GetViewportInfo();

		main.style.top = (vp.height/3)+"px";
		main.style.left = (vp.width/3)+"px";
		main.style.zIndex = 100;
		main.style.backgroundColor = "#FFF";
		main.style.border = "1px solid black";

		main.style.width = "400px";

		main.innerHTML = '<table cellspacing="0" cellpadding="0" style="border-bottom:1px solid black;"><tr>'+
			'<td style="font-size:10px;cursor:default;width:100%;background-color:#999;color:#FFF;">'+"&nbsp;"+'</td>'+
			'<td style="font-size:10px;cursor:default;color:#666;" onclick="SocialCalc.WorkBookControlUnhideSheetHide();">&nbsp;<b>X</b>&nbsp;</td></tr></table>'+
			'<div style="background-color:#DDD;">'+str+'</div>';

			//alert(main.innerHTML);

		SocialCalc.DragRegister(main.firstChild.firstChild.firstChild.firstChild, true, true, {MouseDown: SocialCalc.DragFunctionStart, MouseMove: SocialCalc.DragFunctionPosition,
						MouseUp: SocialCalc.DragFunctionPosition,
						Disabled: null, positionobj: main});

		control.workbook.spreadsheet.spreadsheetDiv.appendChild(main);
			return;
		}

	var element = document.getElementById(control.unhideDialogId);
	if (element) return;

	var currentsheet = control.currentSheetButton.value;
	var str = '<div style="padding:6px 0px 4px 6px;">'+
			'<span>'+ '<b>The following sheets are hidden.</b>'+ '</span><br/><form id="unhidesheetform"><ul>' +
			'<input type="hidden" name="unhidesheet" value=""/>';
	for(var sheet in control.sheetButtonArr) {
		if(document.getElementById("sbsb-" + sheet).style.display == "none") {
			str += '<input type="radio" value="'+sheet+'" onclick="document.getElementById(&quot;unhidesheetform&quot;).unhidesheet.value=&quot;'+sheet+'&quot;;"/>' + control.sheetButtonArr[sheet].value +'<br/>';
			}
		}

	str +='</ul></form>\n<span><ul>';
		str +='<li> To unhide the selected sheet, click OK.</li>';
		str +='<li> To cancel the unhiding, click cancel.</li>';
	str+='</ul></span></div>';
	str +='<div style="width:380px;text-align:right;padding:6px 0px 4px 6px;font-size:small;">'+
			'<input type="button" value="Cancel" style="font-size:smaller;" onclick="SocialCalc.WorkBookControlUnhideSheetHide();">&nbsp;'+
			'<input type="button" value="OK" style="font-size:smaller;" onclick="SocialCalc.WorkBookControlUnhideSheetSubmit(document.getElementById(&quot;unhidesheetform&quot;).unhidesheet.value);"></div>';

	var main = document.createElement("div");
	main.id = control.unhideDialogId;

	main.style.position = "absolute";

	var vp = SocialCalc.GetViewportInfo();

	main.style.top = (vp.height/3)+"px";
	main.style.left = (vp.width/3)+"px";
	main.style.zIndex = 100;
	main.style.backgroundColor = "#FFF";
	main.style.border = "1px solid black";

	main.style.width = "400px";

	main.innerHTML = '<table cellspacing="0" cellpadding="0" style="border-bottom:1px solid black;"><tr>'+
		'<td style="font-size:10px;cursor:default;width:100%;background-color:#999;color:#FFF;">'+"&nbsp;"+'</td>'+
		'<td style="font-size:10px;cursor:default;color:#666;" onclick="SocialCalc.WorkBookControlUnhideSheetHide();">&nbsp;X&nbsp;</td></tr></table>'+
		'<div style="background-color:#DDD;">'+str+'</div>';

		//alert(main.innerHTML);

	SocialCalc.DragRegister(main.firstChild.firstChild.firstChild.firstChild, true, true, {MouseDown: SocialCalc.DragFunctionStart, MouseMove: SocialCalc.DragFunctionPosition,
					MouseUp: SocialCalc.DragFunctionPosition,
					Disabled: null, positionobj: main});

	control.workbook.spreadsheet.spreadsheetDiv.appendChild(main);
	}



SocialCalc.WorkBookControlUnhideSheetHide = function(){

var control = SocialCalc.GetCurrentWorkBookControl();
var spreadsheet = control.workbook.spreadsheet;

var ele = document.getElementById(control.unhideDialogId);
ele.innerHTML = "";

SocialCalc.DragUnregister(ele);

SocialCalc.KeyboardFocus();

if (ele.parentNode) {
	ele.parentNode.removeChild(ele);
	}
}


SocialCalc.WorkBookControlUnhideSheetSubmit = function(name) {

		var control = SocialCalc.GetCurrentWorkBookControl();
		SocialCalc.WorkBookControlUnhideSheetHide();
		var current = document.getElementById(control.currentSheetButton.id);
		
		var curid = current.id;
		var curname = control.currentSheetButton.value;
		
		control.currentSheetButton.setAttribute("style","");
		var old = control.currentSheetButton.id;
		console.log(old);
		SocialCalc.SheetBarButtonActivate(old, false);
		
		var sheetbarbutton = document.getElementById("sbsb-"+name);
		// unhide the button
		sheetbarbutton.style.display = "inline";
		control.currentSheetButton = null;
		
		control.numSheets = control.numSheets+1;

                var cmdstr = "unhidesheet "+name;
		SocialCalc.Callbacks.broadcast('execute', { cmdtype:"wcmd", id:"0", cmdstr: cmdstr});
	
		// reset current sheet
		for (var sheet in control.sheetButtonArr) {
		    if (sheet != null && document.getElementById("sbsb-"+sheet).style.display != "none") {
			control.currentSheetButton = control.sheetButtonArr[sheet];
			break;
		    }
		}

		if (control.currentSheetButton != null) {
			control.currentSheetButton.setAttribute("style","background-color:lightgreen");
		        SocialCalc.SheetBarButtonActivate(control.currentSheetButton.id, true);
			control.workbook.ActivateWorkBookSheet(control.currentSheetButton.id, null);
		}
	}



SocialCalc.WorkBookControlAddSheetButton = function(sheetname, sheetid) {
	
	var control = SocialCalc.GetCurrentWorkBookControl();
	
	//Create an input type dynamically.
	var element = document.createElement("input");

	var name = null;

	if (sheetid != null) {
		name = sheetid
	} else {
		name = "sheet"+ (control.sheetCnt+1).toString();
		control.sheetCnt = control.sheetCnt + 1;
	}

	//Assign different attributes to the element.
	element.setAttribute("type", "button");
	if (sheetname == null) {
		element.setAttribute("value", name);
	} else {
		element.setAttribute("value", sheetname);
	}
	element.setAttribute("id", name);
	element.setAttribute("name", name);
	
	var fnname = "SocialCalc.WorkBookControlActivateSheet("+"'"+name+"'"+")";
	
	element.setAttribute("onclick",fnname);

	control.sheetButtonArr[name] = element;
	
	
	var foo = document.getElementById("fooBar");

	//Append the element in page (in span).
	foo.appendChild(element);

	control.numSheets = control.numSheets + 1;
	
		var el = new SocialCalc.SheetBarSheetButton("sbsb-"+name, (sheetname?sheetname:name),
						document.getElementById("SocialCalc-sheetbar-buttons"),
						{
							//normalstyle: "border:1px solid #000;backgroundColor:#FFF;",
							//downstyle: "border:1px solid #000;backgroundColor:#CCC;",
							//hoverstyle: "border:1px solid #000;backgroundColor:#FFF;"
						},
						{
							MouseDown:function() {SocialCalc.SheetBarSheetButtonPress(name);},
							Repeat:function(){},
							Disabled: function() {}
						}
						);

	return element;
}

SocialCalc.WorkBookControlAddSheet = function(addworksheet, sheetname){

	var control = SocialCalc.GetCurrentWorkBookControl();


	if (control.workbook.spreadsheet.editor.state != "start") {
	// if in edit return
	return;
	}	


	// first add the button
	var element = SocialCalc.WorkBookControlAddSheetButton(sheetname);
	
	// then change the highlight
	
	var old="sheet1";
	if (control.currentSheetButton != null) {
		control.currentSheetButton.setAttribute("style", "");
		old = control.currentSheetButton.id;
		SocialCalc.SheetBarButtonActivate(old, false);
		}
	
	element.setAttribute("style","background-color:lightgreen");
	control.currentSheetButton = element;
	var newsheetid = element.id;
	SocialCalc.SheetBarButtonActivate(newsheetid, true);
	
	// create the sheet
	if (addworksheet) {
		control.workbook.AddNewWorkBookSheet(newsheetid, old, false);
			// broadcast an add command here
		var cmdstr = "addsheet"
		SocialCalc.Callbacks.broadcast('execute', { cmdtype:"wcmd", id:"0", cmdstr: cmdstr});
	}
	
}

SocialCalc.WorkBookControlAddSheetRemote = function(savestr){

	var control = SocialCalc.GetCurrentWorkBookControl();
	
	// first add the button
	var element = SocialCalc.WorkBookControlAddSheetButton();

	// add the sheet, dont switch to it
	control.workbook.AddNewWorkBookSheetNoSwitch(element.id,
						element.value, savestr);        
}

	
SocialCalc.WorkBookControlActivateSheet = function(name) {

	//alert("in activate sheet="+name)

	var control = SocialCalc.GetCurrentWorkBookControl();
	
	var foo = document.getElementById(name);
	foo.setAttribute("style","background-color:lightgreen;");
	SocialCalc.SheetBarButtonActivate(name, true)

	var old = control.currentSheetButton.id;
	if (control.currentSheetButton.id != foo.id) {
		control.currentSheetButton.setAttribute("style", "");
		SocialCalc.SheetBarButtonActivate(old, false)
	}
	
	control.currentSheetButton = foo;

	control.workbook.ActivateWorkBookSheet(name, old);
	
}

SocialCalc.WorkBookControlHttpRequest = null;

SocialCalc.WorkBookControlAlertContents = function(){

	var loadedstr = "";
	var http_request = SocialCalc.WorkBookControlHttpRequest;
	
	if (http_request.readyState == 4) {
		//addmsg("received:" + http_request.responseText.length + " chars");
		try {
			if (http_request.status == 200) {
				loadedstr = http_request.responseText || "";
				http_request = null;
			}
			else {
				;
			}
		} 
		catch (e) {
		}
		// do something with loaded str
		//alert("loaded="+loadedstr);
		SocialCalc.TestWorkBookSaveStr = loadedstr;
		SocialCalc.Clipboard.clipboard = loadedstr;
	}
}


SocialCalc.WorkBookControlAjaxCall = function(url, contents) {

	var http_request = null;
	
	alert("in ajax")
	if (window.XMLHttpRequest) { // Mozilla, Safari,...
		http_request = new XMLHttpRequest();
	}
	else 
		if (window.ActiveXObject) { // IE
			try {
				http_request = new ActiveXObject("Msxml2.XMLHTTP");
			} 
			catch (e) {
				try {
					http_request = new ActiveXObject("Microsoft.XMLHTTP");
				} 
				catch (e) {
				}
			}
		}
	if (!http_request) {
		alert('Giving up :( Cannot create an XMLHTTP instance');
		return false;
	}
	
	// Make the actual request
	SocialCalc.WorkBookControlHttpRequest = http_request;
	
	http_request.onreadystatechange = SocialCalc.WorkBookControlAlertContents;
	http_request.open('POST', document.URL, true); // async
	http_request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	http_request.send(contents);
	
	return true;
	
}

SocialCalc.WorkBookControlSaveSheet = function(){

	var control = SocialCalc.GetCurrentWorkBookControl();
	
	var sheetsave = {};

	sheetsave.numsheets = control.numSheets;
	sheetsave.currentid = control.currentSheetButton.id;
	sheetsave.currentname = control.currentSheetButton.value;

	sheetsave.sheetArr = {}
	for (var sheet in control.sheetButtonArr) {
		var sheetstr = control.workbook.SaveWorkBookSheet(sheet);
		sheetsave.sheetArr[sheet] = {}
		sheetsave.sheetArr[sheet].sheetstr = sheetstr;
		sheetsave.sheetArr[sheet].name = control.sheetButtonArr[sheet].value;
		sheetsave.sheetArr[sheet].hidden = document.getElementById("sbsb-" + sheet).style.display == "none" ? "1" : "0";
		}
	
    // Save the editable cells if specified
    if (SocialCalc.EditableCells && SocialCalc.EditableCells.allow) {
	sheetsave.EditableCells = {};
	for (var i in SocialCalc.EditableCells) {
	    sheetsave.EditableCells[i] = SocialCalc.EditableCells[i];
	}
    }

    var d = new Date();
    sheetsave["timestamp"] = d.toString();
    
    
    if (SocialCalc.saveAppData) {
        SocialCalc.saveAppData();
    }
    
    if (SocialCalc.AppData) {
        console.log("saving appdata")
        sheetsave.AppData = {};
        for (var i in SocialCalc.AppData) {
            sheetsave.AppData[i] = SocialCalc.AppData[i];
        }
    } else {
        sheetsave.AppData = null;
        console.log("did not save appdata")
    }
    


	SocialCalc.TestWorkBookSaveStr = JSON.stringify(sheetsave);
		//alert(SocialCalc.TestWorkBookSaveStr);
	// send it to the backend
	// SocialCalc.WorkBookControlAjaxCall("/", "&sheetdata="+encodeURIComponent(SocialCalc.TestWorkBookSaveStr));
		return SocialCalc.TestWorkBookSaveStr;
}


// insert another workbook into an existing workbook 
// assumption is at least 1 sheet exists in existing workbook
// sheets with same names will be overwritten !
SocialCalc.WorkBookControlInsertWorkbook = function(savestr, sheetsave) {
	var sheetsave
	if (savestr)  {
		sheetsave = JSON.parse(savestr);
	}
	var control = SocialCalc.GetCurrentWorkBookControl();
	for (var sheet in sheetsave.sheetArr) {
	
	var savestr = sheetsave.sheetArr[sheet].sheetstr.savestr;
	var parts = control.workbook.spreadsheet.DecodeSpreadsheetSave(savestr);
	if (parts) {
		if (parts.sheet) {
		savestr = savestr.substring(parts.sheet.start, parts.sheet.end)
		}
	}
	// check if sheetname already exists
	var sheetname = sheetsave.sheetArr[sheet].name
	var sheetid = control.workbook.SheetNameExistsInWorkBook(sheetname);
	if (sheetid) {
		console.log(sheetname+"exists")	    
		control.workbook.LoadRenameWorkBookSheet(sheetid, savestr, sheetname)
	}
	else {
		//just test-brand new insert first
		sheetid = "sheet"+(control.sheetCnt+1).toString()
		control.sheetCnt = control.sheetCnt+1
		SocialCalc.WorkBookControlAddSheetButton(sheetsave.sheetArr[sheet].name, sheetid)
		// create the sheet
		control.workbook.AddNewWorkBookSheetNoSwitch(sheetid, sheetsave.sheetArr[sheet].name, savestr)
		
	}
	}

    if(sheetsave.AppData) {
        console.log("appdata found");
        SocialCalc.AppData = {};
        for (var i in sheetsave.AppData) {
            SocialCalc.AppData[i] = sheetsave.AppData[i];
        }
    } else {
        console.log("appdata NOT found");
        SocialCalc.AppData = null;
    }

    
}

SocialCalc.WorkBookControlLoad = function(savestr){

    var sheetsave;
    
    if (savestr == "") return;
    
    if (savestr)  {
	sheetsave = JSON.parse(savestr);
    } else {
		sheetsave = JSON.parse(SocialCalc.TestWorkBookSaveStr);
    }
    //alert(sheetsave.currentid+","+sheetsave.currentname)
    
    // first create a new workbook
    var control = SocialCalc.GetCurrentWorkBookControl();
    
    SocialCalc.WorkBookControlCreateNewBook();
    
    // at this point there is one sheet, and 1 button
    // create the sequence of buttons, and sheets
    var firstrun = true;
    var newbuttons = 0
    var sheetid = null;
    var currentsheetid = sheetsave.currentid;
    //alert("button="+newbuttons)
    for (var sheet in sheetsave.sheetArr) {
	//alert(sheet);
	if (newbuttons > sheetsave.numsheets) {
	    break;
	}
	//alert("button="+newbuttons)
	var savestr = sheetsave.sheetArr[sheet].sheetstr.savestr;
	var parts = control.workbook.spreadsheet.DecodeSpreadsheetSave(savestr);
	if (parts) {
	    if (parts.sheet) {
		savestr = savestr.substring(parts.sheet.start, parts.sheet.end);
	    }
	}
	if (firstrun) {
	    firstrun=false;
	    // set the first button's name correctly
	    sheetid = control.currentSheetButton.id;
	    control.currentSheetButton.value = sheetsave.sheetArr[sheet].name;
	    SocialCalc.SheetBarButtonSetName(sheetid, sheetsave.sheetArr[sheet].name);
	    // set the sheet data for the first sheet which already exists
	    control.workbook.LoadRenameWorkBookSheet(sheetid, savestr, control.currentSheetButton.value);
	    // need to also set the formula cache
	    currentsheetid = sheetid;
	}
	else {
	    sheetid = "sheet"+(control.sheetCnt+1).toString();
	    control.sheetCnt = control.sheetCnt+1;
	    SocialCalc.WorkBookControlAddSheetButton(sheetsave.sheetArr[sheet].name, sheetid);
	    // create the sheet
	    control.workbook.AddNewWorkBookSheetNoSwitch(sheetid, sheetsave.sheetArr[sheet].name, savestr);
	}
	if(sheetsave.sheetArr[sheet].hidden=="1") {
	    // unregister with mouse ? etc
	    var sheetbarbutton = document.getElementById("sbsb-" + sheetid);
	    sheetbarbutton.style.display="none";
	    SocialCalc.SheetBarButtonActivate(sheet, false);
	    newbuttons= newbuttons - 1;
	}
	if (sheet == sheetsave.currentid) {
	    currentsheetid = sheetid
	}
	newbuttons = newbuttons + 1;
    }
   // Save the user script data
    if (sheetsave.EditableCells) {
        SocialCalc.EditableCells = {};
	for (var i in sheetsave.EditableCells) {
	    SocialCalc.EditableCells[i] = sheetsave.EditableCells[i];
	}
    }
    
    if(sheetsave.AppData) {
        console.log("appdata found");
        SocialCalc.AppData = {};
        for (var i in sheetsave.AppData) {
            SocialCalc.AppData[i] = sheetsave.AppData[i];
        }
    } else {
        console.log("appdata NOT found");
        SocialCalc.AppData = null;
    }

    
    var timeoutFn = function() {
	SocialCalc.WorkBookControlActivateSheet(currentsheetid);
    };
    window.setTimeout(timeoutFn, 200);
}


SocialCalc.WorkBookControlRenameSheet = function(){

	var control = SocialCalc.GetCurrentWorkBookControl();

	if (control.workbook.spreadsheet.editor.state != "start") {
	// if in edit return
	return;
	}	

	
	// do a popup to get the new name of the sheet
	// the popup has an input element with submit, and cancel buttons
	var	element = document.getElementById(control.renameDialogId);
if (element) return;

var currentsheet = control.currentSheetButton.value;
var str = '<div style="padding:6px 0px 4px 6px;">'+
		'<span style="font-size:smaller;">'+'Rename-'+ currentsheet + '</span><br>'+
		'<span style="font-size:smaller;">' + 'Please ensure that you DO NOT have ANY spaces in the sheet name.' + '</span>' +
		'<input type="text" id="newSheetName" style="width:380px;" value="'+currentsheet+'"><br>'+'</div>';

str +='<div style="width:380px;text-align:right;padding:6px 0px 4px 6px;font-size:small;">'+
		'<input type="button" value="Submit" style="font-size:smaller;" onclick="SocialCalc.WorkBookControlRenameSheetSubmit();">&nbsp;'+
		'<input type="button" value="Cancel" style="font-size:smaller;" onclick="SocialCalc.WorkBookControlRenameSheetHide();"></div>';

var main = document.createElement("div");
main.id = control.renameDialogId;

main.style.position = "absolute";

var vp = SocialCalc.GetViewportInfo();

main.style.top = (vp.height/3)+"px";
main.style.left = (vp.width/3)+"px";
main.style.zIndex = 100;
main.style.backgroundColor = "#FFF";
main.style.border = "1px solid black";

main.style.width = "400px";

main.innerHTML = '<table cellspacing="0" cellpadding="0" style="border-bottom:1px solid black;"><tr>'+
	'<td style="font-size:10px;cursor:default;width:100%;background-color:#999;color:#FFF;">'+"&nbsp;"+'</td>'+
	'<td style="font-size:10px;cursor:default;color:#666;" onclick="SocialCalc.WorkBookControlRenameSheetHide();">&nbsp;X&nbsp;</td></tr></table>'+
	'<div style="background-color:#DDD;">'+str+'</div>';


SocialCalc.DragRegister(main.firstChild.firstChild.firstChild.firstChild, true, true, {MouseDown: SocialCalc.DragFunctionStart, MouseMove: SocialCalc.DragFunctionPosition,
				MouseUp: SocialCalc.DragFunctionPosition,
				Disabled: null, positionobj: main});

control.workbook.spreadsheet.spreadsheetDiv.appendChild(main);

var ele = document.getElementById("newSheetName");
ele.focus();
SocialCalc.CmdGotFocus(ele);

}

SocialCalc.WorkBookControlRenameSheetHide = function(){

var control = SocialCalc.GetCurrentWorkBookControl();
var spreadsheet = control.workbook.spreadsheet;

var ele = document.getElementById(control.renameDialogId);
ele.innerHTML = "";

SocialCalc.DragUnregister(ele);

SocialCalc.KeyboardFocus();

if (ele.parentNode) {
	ele.parentNode.removeChild(ele);
}
}

SocialCalc.WorkBookControlRenameSheetSubmit = function(){

// this handles all the rename action
var ele = document.getElementById("newSheetName");
//console.log(ele.value);
var control = SocialCalc.GetCurrentWorkBookControl();
if (ele.value.length == 0) {
	ele.focus();
	return;
}
var oldname = control.currentSheetButton.value;
var newname = ele.value;
if(newname.indexOf(" ")!=-1) {
	alert("A space was found in the new name. Please ensure that the new name has no sapces");
	return;
	}
SocialCalc.WorkBookControlRenameSheetHide();
// verify newname does not clash with any existing sheet name
// if so reject
var smallname = newname.toLowerCase();//converting to lower case to normalise
//console.log(smallname + " old " + ele.value);
for (var sheet in workbook.sheetArr) {
	console.log(workbook.sheetArr[sheet].sheet.sheetname);//checking in sheetarr for repeated names
			if (workbook.sheetArr[sheet].sheet.sheetname == smallname) {
			alert(newname+" already exists");
			return;
		}   
	} // variation of Case in letters of a sheet name will give an error if smallname is used.

control.currentSheetButton.value = smallname;

SocialCalc.SheetBarButtonSetName (control.currentSheetButton.id, newname);

// perform a rename for formula references to this sheet in all the 
// sheets in the workbook
control.workbook.RenameWorkBookSheet(oldname, smallname, control.currentSheetButton.id);

	var cmdstr = "rensheet "+control.currentSheetButton.id+" "+oldname+" "+newname;
	//console.log(cmdstr);
	SocialCalc.Callbacks.broadcast('execute', { cmdtype:"wcmd", id:"0", cmdstr: cmdstr});

}

SocialCalc.WorkBookControlRenameSheetRemote = function(sheetid, oldname, newname) {
	//console.log("rename sheet ",sheetid, oldname, newname)
	var control = SocialCalc.GetCurrentWorkBookControl();

	var foo = document.getElementById("fooBar");
	var renbutton = document.getElementById(sheetid);
	
	renbutton.value = newname;

	SocialCalc.SheetBarButtonSetName(sheetid, newname);

control.workbook.RenameWorkBookSheet(oldname, newname, sheetid);
	
}


SocialCalc.WorkBookControlCreateNewBook = function() {

	var control = SocialCalc.GetCurrentWorkBookControl();
	
	// delete all the sheets except 1
	for (var sheet in control.sheetButtonArr) {
		if (sheet != control.currentSheetButton.id) {
			control.workbook.DeleteWorkBookSheet(control.sheetButtonArr[sheet].id, control.sheetButtonArr[sheet].value);
		}
	}
	// Reset that 1 sheet
	
	control.workbook.LoadRenameWorkBookSheet(control.currentSheetButton.id, "", control.workbook.defaultsheetname)
	
	
	// delete all the buttons except 1
	for (var sheet in control.sheetButtonArr) {
		if (sheet != control.currentSheetButton.id) {
			var foo = document.getElementById("fooBar");
			var current = document.getElementById(control.sheetButtonArr[sheet].id);
			
			var name = current.id;
			delete control.sheetButtonArr[name];
			
			foo.removeChild(current);

			var sheetbar = document.getElementById("SocialCalc-sheetbar-buttons");
			var sheetbarbutton = document.getElementById("sbsb-"+name);
			// unregister with mouse ? etc
			sheetbar.removeChild(sheetbarbutton);


			control.numSheets = control.numSheets - 1;
		}
	}
	// rename that button
	control.currentSheetButton.value = control.workbook.defaultsheetname;	
	//alert("done new workbook")
}

SocialCalc.WorkBookControlNewBook = function() {
	var control = SocialCalc.GetCurrentWorkBookControl();
	SocialCalc.WorkBookControlCreateNewBook();
	control.workbook.RenderWorkBookSheet();
}


SocialCalc.WorkBookControlMove = function(direction){

	var control = SocialCalc.GetCurrentWorkBookControl();
	if (control.workbook.spreadsheet.editor.state != "start") {
	    return;
	}
	var sheetArr = control.sheetButtonArr;
	var newSheetArr = {};
	var sheetid = control.currentSheetButton.id;

	var curr_button = document.getElementById(sheetid);
	var curr_sb_button = document.getElementById("sbsb-"+sheetid);
	var sib_button = null;
	var sib_sb_button = null;
	if (direction == "left") {
		sib_button = curr_button.previousSibling;
		sib_sb_button = curr_sb_button.previousSibling;
		if(!sib_sb_button) {
			alert("Cannot move leftmost Sheet further to the left");
			return;
			}
		}
	else {
		sib_button = curr_button.nextSibling;
		sib_sb_button = curr_sb_button.nextSibling;	  
		if(!sib_sb_button) {
			alert("Cannot move rightmost Sheet further to the right");
			return;
			}  
		}
	var currid = sheetid;
	var sibid = sib_button.id;
	var parent = curr_button.parentNode;
	var sb_parent = curr_sb_button.parentNode;

	var cloned = {};
	var clonedsb = {};
	for(button in sheetArr) {
		clonedsb[button] = document.getElementById("sbsb-"+button);
		cloned[button] = document.getElementById(button);
		sb_parent.removeChild(document.getElementById("sbsb-"+button));
		parent.removeChild(document.getElementById(button));
        }
	for(button in sheetArr) {
		if(button != currid && button != sibid) {
		    newSheetArr[button] = sheetArr[button];
		    sb_parent.appendChild(clonedsb[button]);
		    parent.appendChild(cloned[button]);
		}
		else if(button == currid) {
		    if (direction == "left") {
				newSheetArr[currid] = sheetArr[currid];
				newSheetArr[sibid] = sheetArr[sibid];
		        sb_parent.appendChild(clonedsb[currid]);
		        parent.appendChild(cloned[currid]);
		        sb_parent.appendChild(clonedsb[sibid]);
		        parent.appendChild(cloned[sibid]);
		    } else {
				newSheetArr[sibid] = sheetArr[sibid];
				newSheetArr[currid] = sheetArr[currid];
		        sb_parent.appendChild(clonedsb[sibid]);
		        parent.appendChild(cloned[sibid]);
		        sb_parent.appendChild(clonedsb[currid]);
		        parent.appendChild(cloned[currid]);
		    }
		}
	}
	control.sheetButtonArr = newSheetArr;
	SocialCalc.SheetBarButtonActivate(currid,true);
}

SocialCalc.WorkBookControlMoveLeft = function(){
    SocialCalc.WorkBookControlMove("left");
}
SocialCalc.WorkBookControlMoveRight = function(){
    SocialCalc.WorkBookControlMove("right");
}



SocialCalc.WorkBookControlCopySheet = function(){

	//alert("in copy");

	var control = SocialCalc.GetCurrentWorkBookControl();

	if (control.workbook.spreadsheet.editor.state != "start") {
	// if in edit return
	return;
	}	

	
	control.workbook.CopyWorkBookSheet(control.currentSheetButton.id);
	
	alert("copied sheet:"+control.currentSheetButton.value);
}

SocialCalc.WorkBookControlPasteSheet = function() {

	//alert("in paste");

	var control = SocialCalc.GetCurrentWorkBookControl();

	if (control.workbook.spreadsheet.editor.state != "start") {
	// if in edit return
	return;
	}	

	
	var oldid = control.currentSheetButton.id;
	
	SocialCalc.WorkBookControlAddSheet(false);
	
	var newid = control.currentSheetButton.id;
	
	//alert(newid+oldid);
	
	control.workbook.PasteWorkBookSheet(newid, oldid);

		var cmdstr = "addsheetstr";
	SocialCalc.Callbacks.broadcast('execute', { cmdtype:"wcmd", id:"0", cmdstr: cmdstr, sheetstr: control.workbook.clipsheet.savestr});
	
}

SocialCalc.SheetBar = function() {
	this.baseDiv = document.getElementById("SocialCalc-sheetbar");

	this.prebuttonsDiv = document.createElement("div");
	this.prebuttonsDiv.style.cssText = "display:inline;"; 
	this.prebuttonsDiv.innerHTML="&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp";
	this.prebuttonsDiv.id = "SocialCalc-sheetbar-prebuttons";

	this.buttonsDiv = document.createElement("div");
	this.buttonsDiv.id = "SocialCalc-sheetbar-buttons";
	this.buttonsDiv.style.cssText = "display:inline;"; 

	this.buttonActionsDiv = document.createElement("div");
	this.buttonActionsDiv.id = "SocialCalc-sheetbar-buttonactions";
	this.buttonActionsDiv.style.display = "inline"; 
	var addbutton = new SocialCalc.SheetBarSheetButton("sbsba-add", "sbsba-add", this.buttonActionsDiv, 
							{}, 
							{
							MouseDown:function(){var abc=SocialCalc.WorkBookControlAddSheet(true);}
							},
							"add-2.png");
	

	this.baseDiv.appendChild(this.prebuttonsDiv);
	this.baseDiv.appendChild(this.buttonsDiv);
	this.baseDiv.appendChild(this.buttonActionsDiv);
}

// define a new class for sheetbarsheetbutton

SocialCalc.SheetBarSheetButton = function(id, name, parentdiv, params, functions, img) {
	this.ele = document.createElement("div");
	this.ele.id = id;
	this.ele.name = name;
	if (!img) {
		this.ele.innerHTML = name;
		this.ele.style.cssText = "font-size:small;display:inline;padding:5px 5px 2px 5px;border:1px solid #000;";
		imgele = document.createElement("img");
		imgele.id = id+"-img";
		imgele.src = SocialCalc.Constants.defaultImagePrefix +"menu-dropdown.png";
		imgele.style.cssText = "padding:0px 2px;width:16px;height:16px;vertical-align:middle;"
		this.ele.appendChild(imgele);
		SocialCalc.ButtonRegister(this.ele, params, functions);
		SocialCalc.ButtonRegister(imgele, params, functions);
	} else {
	var imgele = document.createElement("img");
	imgele.src = SocialCalc.Constants.defaultImagePrefix +img;
	imgele.style.cssText = "width:16px;height:16px;vertical-align:middle;"
	this.ele.appendChild(imgele);
	this.ele.style.cssText = "display:inline;padding:5px 5px 2px 5px;";
	SocialCalc.ButtonRegister(imgele, params, functions);
	}
	parentdiv.appendChild(this.ele);
}

SocialCalc.SheetBarButtonActivate = function(id, active) {
	var sbbutton = document.getElementById("sbsb-"+id);
	sbbutton.isactive = active;
	if (active) {
	sbbutton.style.backgroundColor = "#FFF";
	var imgele = document.getElementById("sbsb-"+id+"-img");
	if (!imgele) {
		imgele = document.createElement("img");
		imgele.id = "sbsb-"+id+"-img";
		imgele.src = SocialCalc.Constants.defaultImagePrefix +"menu-dropdown.png";
		imgele.style.cssText = "padding:0px 2px;width:16px;height:16px;vertical-align:middle;"
		}
		sbbutton.appendChild(imgele);
		SocialCalc.ButtonRegister(imgele, {}, {
													MouseDown:function() {SocialCalc.SheetBarSheetButtonPress(id);},
													Repeat:function(){},
													Disabled: function() {}
													}	);
	} 
	else {
	sbbutton.style.backgroundColor = "#CCC";
	var imgele = document.getElementById("sbsb-"+id+"-img");
	if (imgele) {
		sbbutton.removeChild(imgele);
		}
	}
	var menu = document.getElementById("sbsb-menu");
	if (menu && menu.style.display != "none") {
	menu.style.display = "none";
	}
}

SocialCalc.SheetBarButtonSetName = function(id, name) {
	var sbbutton = document.getElementById("sbsb-"+id);
	sbbutton.name = name;
	sbbutton.innerHTML = name;
	if (sbbutton.isactive) {
	SocialCalc.SheetBarButtonActivate(id, true);
	}
}


SocialCalc.SheetBarSheetButtonPress = function(id) {
	//console.log("button press")
	var sbbutton = document.getElementById("sbsb-"+id);    
	if (sbbutton && sbbutton.isactive) {
	var menu = document.getElementById("sbsb-menu");
	if (!menu) {
		var sbsbm = new SocialCalc.SheetBarSheetButtonMenu("sbsb-menu", id);	    
	} else {
		menu.clickedsheetid = id;
		if (menu.style.display == "none") {
		menu.style.display = "inline";
		SocialCalc.SheetBarSheetButtonMenuPosition(menu, id);
		} else {
		menu.style.display = "none";
		}
	}

	} else if (sbbutton) {
	SocialCalc.WorkBookControlActivateSheet(id);
	}    

}


// define a new class for sheetbarsheet button menu item

SocialCalc.SheetBarSheetButtonMenuItem = function(id, t) {
	this.ele = document.createElement("div");
	this.ele.id = id;
	this.ele.innerHTML = t;
	this.ele.className = "";
	this.ele.style.cssText = "padding:3px 4px;width:100px;height:20px;background-color:#FFF;";

	var params = {
			normalstyle: "backgroundColor:#FFF;",
			downstyle: "backgroundColor:#CCC;",
			hoverstyle: "backgroundColor:#CCC;"};
	var functions = {MouseDown:function(){SocialCalc.SheetBarMenuItemPress(id);},
				Repeat:function(){},
				Disabled: function() {}};

	SocialCalc.ButtonRegister(this.ele, params, functions);

	SocialCalc.TouchRegister(this.ele, {SingleTap:functions.MouseDown});

	return this.ele;
	
}

SocialCalc.SheetBarMenuItemPress = function(id) {

	var menu = document.getElementById("sbsb-menu");
	if (!menu) return;

	var clickedsheetid = menu.clickedsheetid;

	switch(id)    {
	case "sbsb_deletesheet":
	//console.log("delete "+clickedsheetid);
	SocialCalc.WorkBookControlDelSheet();
	break;
	case "sbsb_hidesheet":
	//console.log("hide" +clickedsheetid);
	SocialCalc.WorkBookControlHideSheet();
	break;
	case "sbsb_unhidesheet":
	//console.log("hide" +clickedsheetid);
	SocialCalc.WorkBookControlUnhideSheet();
	break;
	case "sbsb_copysheet":
	//console.log("copy "+clickedsheetid);
	SocialCalc.WorkBookControlCopySheet();
	break;
	case "sbsb_moveleft":
	//console.log("rename "+clickedsheetid);	
	SocialCalc.WorkBookControlMoveLeft();
	break;
	case "sbsb_moveright":
	//console.log("rename "+clickedsheetid);	
	SocialCalc.WorkBookControlMoveRight();
	break;

	case "sbsb_pastesheet":
	//console.log("paste "+clickedsheetid);
	SocialCalc.WorkBookControlPasteSheet();
	break;
	case "sbsb_renamesheet":
	//console.log("rename "+clickedsheetid);	
	SocialCalc.WorkBookControlRenameSheet();
	break;
	case "sbsb_closemenu":
	//console.log("rename "+clickedsheetid);	
	menu.style.display = "none";
	break;
	default:
	break;
	}
	menu.style.display = "none";

}

// define a new class for sheetbarsheet button menu 
SocialCalc.SheetBarSheetButtonMenu = function(id, clickedsheetid) {
	this.ele = document.createElement("div");
	this.ele.id = id;
	this.ele.className = "";
	this.ele.clickedsheetid = clickedsheetid;
	this.ele.style.cssText = "border:1px solid #000;position:absolute;top:200px;left:0px;width=100px;z-index:120";

	var ele1 = new SocialCalc.SheetBarSheetButtonMenuItem("sbsb_deletesheet"," Delete Sheet");
	this.ele.appendChild(ele1);
	ele1 = new SocialCalc.SheetBarSheetButtonMenuItem("sbsb_hidesheet"," Hide Sheet ");
	this.ele.appendChild(ele1);
	ele1 = new SocialCalc.SheetBarSheetButtonMenuItem("sbsb_unhidesheet"," Unhide Sheet ");
	this.ele.appendChild(ele1);
	ele1 = new SocialCalc.SheetBarSheetButtonMenuItem("sbsb_renamesheet"," Rename Sheet ");
	this.ele.appendChild(ele1);
	ele1 = new SocialCalc.SheetBarSheetButtonMenuItem("sbsb_moveleft"," Move Left ");
	this.ele.appendChild(ele1);
	ele1 = new SocialCalc.SheetBarSheetButtonMenuItem("sbsb_moveright"," Move Right ");
	this.ele.appendChild(ele1);
	ele1 = new SocialCalc.SheetBarSheetButtonMenuItem("sbsb_copysheet"," Copy Sheet ");
	this.ele.appendChild(ele1);
	ele1 = new SocialCalc.SheetBarSheetButtonMenuItem("sbsb_pastesheet"," Paste Sheet ");
	this.ele.appendChild(ele1);
	ele1 = new SocialCalc.SheetBarSheetButtonMenuItem("sbsb_closemenu"," Cancel");
	this.ele.appendChild(ele1);


	SocialCalc.SheetBarSheetButtonMenuPosition(this.ele, clickedsheetid);

	//var clickedsheet = document.getElementById(clickedsheetid);
	//var position = SocialCalc.GetElementPosition(clickedsheet);
	//console.log(clickedsheet.offsetHeight,clickedsheet.offsetWidth,clickedsheet.offsetLeft, clickedsheet.offsetTop);

	var control = SocialCalc.GetCurrentWorkBookControl();
	control.workbook.spreadsheet.editor.toplevel.appendChild(this.ele);





}

// position the sheet menu
SocialCalc.SheetBarSheetButtonMenuPosition = function(menu, clickedsheetid) {

	var hlessbutton = document.getElementById("te_lessbuttonh");
	
	//console.log(hlessbutton.style.top, hlessbutton.style.left);

	var sbbutton = document.getElementById("sbsb-"+clickedsheetid);    

	//console.log(sbbutton.offsetLeft,clickedsheetid);

	var top = hlessbutton.style.top.slice(0,-2)-220;
	var left = sbbutton.offsetLeft+7;

	menu.style.top = top+"px";
	menu.style.left = left+"px";

	//console.log(menu.style.top, menu.style.left);    
}

SocialCalc.ScriptInfo = {
	scripts : {},
	handle:null
};

SocialCalc.ScriptCheck = function(sheetid, coord, text) {
var commentstart = text.indexOf("<!--script");
var commentend = text.indexOf("script-->");
if ((commentstart != -1) && (commentend != -1)) {
	script = text.slice(commentstart+10,commentend);
	//alert(script);
	SocialCalc.ScriptInfo.scripts[coord] = script;
	if (SocialCalc.ScriptInfo.handle == null) {
	SocialCalc.ScriptInfo.handle =
	window.setTimeout(SocialCalc.EvalUserScripts,500);
	}
	//alert(coord+"-"+sheetid);
}
}

SocialCalc.EvalUserScript = function(data) {
	var head = document.getElementsByTagName("head")[0] ||
				document.documentElement;

	if (data == "") return;

	var script = document.createElement("script");

	script.type = "text/javascript";
	try {
	// doesn't work on ie...
	script.appendChild(document.createTextNode(data));      
	} catch(e) {
	// IE has funky script nodes
	script.text = data;
	}

	head.insertBefore(script, head.firstChild);
	head.removeChild(script);   
}

SocialCalc.EvalUserScripts = function() {
for (var cr in SocialCalc.ScriptInfo.scripts) {
	SocialCalc.EvalUserScript(SocialCalc.ScriptInfo.scripts[cr]);
	//console.log(cr,SocialCalc.ScriptInfo.scripts[cr])
}
SocialCalc.ScriptInfo.handle = null;
SocialCalc.ScriptInfo.scripts = {};
}

SocialCalc.CallOutOnRenderCell = function(sheetobj, value, cr) {
var cell=sheetobj.cells[cr];
if (!cell) return;
var valuetype = cell.valuetype || ""; // get type of value to determine formatting
var valuesubtype = valuetype.substring(1);
var sheetattribs=sheetobj.attribs;
valuetype = valuetype.charAt(0);
if (valuetype=="t") {
	valueformat = sheetobj.valueformats[cell.textvalueformat-0] || sheetobj.valueformats[sheetattribs.defaulttextvalueformat-0] || "";
	if (valueformat == "text-html") {SocialCalc.ScriptCheck(sheetobj.sheetid,cr,value);}
}
}

SocialCalc.GetCellDataValue = function(coord) {

	var sheetname = null;
	var sheetid = "";
	var bindex = coord.indexOf("!");
	if (bindex != -1) {
	sheetname = coord.slice(0,bindex);
	coord = coord.slice(bindex+1);
	//console.log(sheetname,coord)
	}
	var control = SocialCalc.GetCurrentWorkBookControl();
	
	
	if (sheetname == null) {
	sheetid = control.currentSheetButton.id
		} else {
	sheetid = control.workbook.SheetNameExistsInWorkBook(sheetname);
	}
	
	if ((sheetid == null) || (sheetid == "")) {
	return "0";
	}
	
	var sheetobj = control.workbook.sheetArr[sheetid].sheet
	
	var cell = sheetobj.cells[coord]
	
	if (cell) {return cell.datavalue;} else {return 0;}
}

SocialCalc.GetCellDataArray = function(coordstr,sheetname) {
	var vals = []
	var coords = coordstr.split(",");
	if (sheetname == null) { sheetname=""; }
	else {
	sheetname = sheetname+"!";
	}
	for (var c in coords) {
	
	vals.push(SocialCalc.GetCellDataValue(sheetname+coords[c]));
	}
	return vals;
}
	
SocialCalc.UserScriptData = {}
	

SocialCalc.WorkBookRecalculateInfo = {
	sheets : [],
	calcorder: [],
	current: 0,
	pass: 0
};

SocialCalc.WorkBookRecalculateAll = function() {
	// do it from the last sheet to the first sheet
	// using the recalc-done signal to trigger the next sheet

	// if already in the middle of a recalculate-all, ignore this.
	if ((SocialCalc.WorkBookRecalculateInfo.current != 0) ||
		(SocialCalc.WorkBookRecalculateInfo.calcorder.length != 0) ||
		(SocialCalc.WorkBookRecalculateInfo.sheets.length != 0)) {
	return;
	}


	var control = SocialCalc.GetCurrentWorkBookControl();

	if (control.workbook.spreadsheet.editor.state != "start") {
	// if in edit return
	return;
	}	


	SocialCalc.WorkBookRecalculateInfo.current = 0;

	for (var sheet in control.workbook.sheetArr) {
	SocialCalc.WorkBookRecalculateInfo.sheets.push(sheet);
	}
	
	var i = 0;
	for (var c=SocialCalc.WorkBookRecalculateInfo.sheets.length;
	c>0; c--) {
	SocialCalc.WorkBookRecalculateInfo.calcorder[i] = 
		SocialCalc.WorkBookRecalculateInfo.sheets[c-1];
	i++;
	}
	
    $.mobile.showPageLoadingMsg();
    window.setTimeout(SocialCalc.WorkBookRecalculateStep,500);
}

SocialCalc.WorkBookRecalculateStep = function() {
	if (SocialCalc.WorkBookRecalculateInfo.current ==  
	SocialCalc.WorkBookRecalculateInfo.calcorder.length) {
	SocialCalc.WorkBookRecalculateInfo.current = 0;
	SocialCalc.WorkBookRecalculateInfo.calcorder = [];
		SocialCalc.WorkBookRecalculateInfo.sheets = [];
	if (SocialCalc.WorkBookRecalculateInfo.pass == 
		1) {
		SocialCalc.WorkBookRecalculateInfo.pass = 0;
		//SocialCalc.SpinnerWaitHide();
		//alert("load done");
          $.mobile.hidePageLoadingMsg();
        
		return;
	} else {
		SocialCalc.WorkBookRecalculateInfo.pass++;
		SocialCalc.WorkBookRecalculateAll();
		return;
	}
	}
	var control = SocialCalc.GetCurrentWorkBookControl();
	//alert("recalculate "+
	//	  SocialCalc.WorkBookRecalculateInfo.calcorder[
	//	    SocialCalc.WorkBookRecalculateInfo.current]
	//	  );
	var sheetid = 
SocialCalc.WorkBookRecalculateInfo.calcorder[					      
						SocialCalc.WorkBookRecalculateInfo.current];
	SocialCalc.WorkBookControlActivateSheet(sheetid);
	SocialCalc.WorkBookRecalculateInfo.current++;


	window.setTimeout(SocialCalc.WorkBookRecalculateStep,1000);    
}


SocialCalc.SpinnerWaitCreate = function() {
	// if the div exists already just use it
	var ele = document.getElementById("waitloadingspinner");
	if (ele) {
	return;
	}
	var main = document.createElement("div");
	main.id = "waitloadingspinner";

	main.style.position = "absolute";

	var vp = SocialCalc.GetViewportInfo();
	main.style.top = (vp.height/2)+"px";
	main.style.left = (vp.width/2)+"px";
	main.style.zIndex = 110;

	main.style.width='50px'
	main.style.height = '50px'
	main.innerHTML = '<img src="static/images/spinner.gif" alt="Loading..." />';

	var control = SocialCalc.GetCurrentWorkBookControl();    
	control.workbook.spreadsheet.spreadsheetDiv.appendChild(main);
}

SocialCalc.SpinnerWaitHide = function() {
	// if the div exists already just use it

var ele = document.getElementById("waitloadingspinner");
if (ele) {
	ele.innerHTML = "";

	if (ele.parentNode) {
	ele.parentNode.removeChild(ele);
	}
}
}

SocialCalc.EditableCells = {};
SocialCalc.EditableCells.allow = false;
SocialCalc.EditableCells.cells = {};

SocialCalc.Callbacks.IsCoordEditable = function(sheetcoord) {
    if (!(SocialCalc.EditableCells.allow)) {
      // by default all cells are editable
      return true;
    }
    if (SocialCalc.EditableCells.cells[sheetcoord]) {
      // by default all cells are editable
      return true;
    }    

    return false;    
}

SocialCalc.Callbacks.IsCellEditable = function(editor) {
    var cellname = editor.workingvalues.currentsheet+"!"+editor.ecell.coord;
    if (!(SocialCalc.EditableCells.allow)) {
      // by default all cells are editable
      return true;
    }
    if (SocialCalc.EditableCells.cells[cellname]) {
      // by default all cells are editable
      return true;
    }    

    return false;
}

SocialCalc.IsScrollPossible = function(lastrow, lastcol,
				       curr_vpos, curr_hpos,
				       vamount, hamount
				      ) {
    //return false;
    //console.log(lastrow+","+lastcol);
    //console.log(curr_vpos+","+curr_hpos);    
    //console.log(vamount+","+hamount);    
    
    if (curr_vpos+10+vamount > lastrow ) {
	return false;
    }
    if (curr_hpos+hamount > lastcol) {
   	return false;
    }
    return true;
}


SocialCalc.Callbacks.CheckConstraints = function(editor, value)
{
    var cellname = editor.workingvalues.currentsheet+"!"+editor.ecell.coord;
    if (!SocialCalc.EditableCells.constraints) {return true;};
    var constraint = SocialCalc.EditableCells.constraints[cellname];
    //alert(JSON.stringify(constraint))
    if (constraint != null) {
        switch (constraint[0]) {
            case "numeric":
                // check that value is numeric
                var val = parseInt(value);
                var low = parseInt(constraint[1]);
                var high = parseInt(constraint[2]);
                var text = "";
                if (constraint.length > 3) {
                    text = constraint[3];
                }
                console.log(val+" "+text+","+high);
                
                if (isNaN(val)) {
                    var msg = "please input a number";
                    window.plugins.Prompt.show(
                                               msg,
                                               saveAsCancel,
                                               saveAsCancel,
                                               "nope", // ok button title - not used
                                               "OK", // cancel button title
                                               "no"
                                               );
                    return false;
                }
                
                if (val < low) {
                    var msg = text +" must be at least "+low;
                    window.plugins.Prompt.show(
                                               msg,
                                               saveAsCancel,
                                               saveAsCancel,
                                               "nope", // ok button title - not used
                                               "OK", // cancel button title
                                               "no"
                                               );
                    
                    return false;
                }
                
                if (val > high) {
                    var msg = text + " must be atmost "+high;
                    window.plugins.Prompt.show(
                                               msg,
                                               saveAsCancel,
                                               saveAsCancel,
                                               "nope", // ok button title - not used
                                               "OK", // cancel button title
                                               "no"
                                               );
                    
                    return false;
                }
                if (Aspiring.appSpecificInputValidation && !Aspiring.appSpecificInputValidation(cellname, val)) {
                    return false;
                }
                break;
            case "float":
                var val = parseFloat(value);
                var low = parseFloat(constraint[1]);
                var high = parseFloat(constraint[2]);
                var text = "";
                if (constraint.length > 3) {
                    text = constraint[3];
                }
                //alert(val)
                if (isNaN(val)) {
                    var msg = "please input a number";
                    window.plugins.Prompt.show(
                                               msg,
                                               saveAsCancel,
                                               saveAsCancel,
                                               "nope", // ok button title - not used
                                               "OK", // cancel button title
                                               "no"
                                               );    
                    return false;
                    
                }
                if (val < low) {
                    var msg = text +" must be at least "+low;
                    window.plugins.Prompt.show(
                                               msg,
                                               saveAsCancel,
                                               saveAsCancel,
                                               "nope", // ok button title - not used
                                               "OK", // cancel button title
                                               "no"
                                               );    
                    
                    return false;
                    
                }
                if (val > high) {
                    var msg = text + " must be atmost "+high;
                    window.plugins.Prompt.show(
                                               msg,
                                               saveAsCancel,
                                               saveAsCancel,
                                               "nope", // ok button title - not used
                                               "OK", // cancel button title
                                               "no"
                                               );    
                    
                    return false;
                    
                }
                if (Aspiring.appSpecificInputValidation && !Aspiring.appSpecificInputValidation(cellname, val)) {
                    return false;
                }
                break;
            case "percent":
                break;
        }
    }
    return true;
}


// this is for checkmark toggling
SocialCalc.Callbacks.ToggleCell = function(cellname){

    var control = SocialCalc.GetCurrentWorkBookControl();
    var sheetid = control.currentSheetButton.id;
    var sheetobj = control.workbook.sheetArr[sheetid].sheet;
    var cell = sheetobj.cells[cellname];
    var sheetname = sheetobj.sheetname;
    
    // check if cell is in constraints
    
    
    var constraint = SocialCalc.EditableCells.constraints[sheetname+"!"+cellname];
    if (!constraint || (constraint[0] != "tc")) {
        return;
    }

    // console.log(sheetname);
    // console.log(cellname);
    
    var cellinner = document.getElementById("cell_"+cellname)
    
    
    
    if ((cellinner.innerHTML.indexOf("&nbsp;") != -1)) {
        // set the value to the img value
        cellinner.innerHTML = '<div><img src="http://imageshack.com/a/img924/3599/c5fBZx.png" width="10" height="10"></img></div>'
        if (cell) {//cell.displaystring = '<div><img src="http://img689.imageshack.us/img689/9234/checkmark.png"></img></div>'	 ;
            //cell.datavalue = '<div><img src="http://img689.imageshack.us/img689/9234/checkmark.png"></img></div>'	 ;
            //console.log("found cell")
            cell.displaystring = '<div><img src="http://imageshack.com/a/img924/3599/c5fBZx.png" width="10" height="10"></img></div>'	 ;
            cell.datavalue = '<div><img src="http://imageshack.com/a/img924/3599/c5fBZx.png" width="10" height="10"></img></div>'	 ;
            //http://img689.imageshack.us/img689/9234/checkmark.png
        }
    } 
    else {
        // set the value to a space
        cellinner.innerHTML = "<div>&nbsp;</div>";
        if (cell) {cell.datavalue = "<div>&nbsp;</div>";cell.displaystring = "<div>&nbsp;</div>";}
    }
    
}

SocialCalc.WorkbookControlCreateSheetHTML = function(sheetlist) {
    
    var context, div, ele;
    
    var result = "";
    
    var control = SocialCalc.GetCurrentWorkBookControl();
    
    div = document.createElement("div");
    
    if (!sheetlist) {
        context = new SocialCalc.RenderContext(spreadsheet.sheet);
        ele = context.RenderSheet(null, {type: "html"});
        div.appendChild(ele);
        delete context;
    } else {
        for (var sheetid in sheetlist) {
            //console.log("getting html for "+sheetid)
            context = new SocialCalc.RenderContext(control.workbook.sheetArr[sheetid].sheet);
            ele = context.RenderSheet(null, {type: "html"});
            delete context;
            div.appendChild(ele);
        }
    }
    
    result = div.innerHTML;
    delete ele;
    delete div;
    //console.log(result);
    return result;
    
}


SocialCalc.GetSheetFromCoord = function(crd, sheetobj) {
    var bindex = crd.indexOf("!");
    var sheetname = null;
    if (bindex != -1) {
        sheetname = crd.slice(0,bindex);
        var control = SocialCalc.GetCurrentWorkBookControl();
        var sheetid = control.workbook.SheetNameExistsInWorkBook(sheetname.toLowerCase());
        if ((sheetid == null) || (sheetid == "")) {
            return sheetobj;
        }
        return control.workbook.sheetArr[sheetid].sheet;
    }
    return sheetobj;
};
SocialCalc.GetCellFromCoord = function(crd, sheetobj) {
    var bindex = crd.indexOf("!");
    var sheetname = null;
    if (bindex != -1) {
        sheetname = crd.slice(0,bindex);
        crd = crd.slice(bindex+1);
        var control = SocialCalc.GetCurrentWorkBookControl();
        
        var sheetid = control.workbook.SheetNameExistsInWorkBook(sheetname.toLowerCase());
        
        if ((sheetid == null) || (sheetid == "")) {
            return null;
        }
        sheetobj = control.workbook.sheetArr[sheetid].sheet;	
    }
    return sheetobj.cells[crd];
};











