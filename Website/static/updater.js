//
//
// 
//
//
//

$(document).ready(function() {
    if (!window.console) window.console = {};
    if (!window.console.log) window.console.log = function() {};
    player.initialize();
    updater.poll();
});


function isMultipleSheet() {
    if (SocialCalc.CurrentWorkbookControlObject) {
	return true;
    }
    return false;
}

function getCookie(name) {
    var r = document.cookie.match("\\b" + name + "=([^;]*)\\b");
    return r ? r[1] : undefined;
}

jQuery.postJSON = function(url, args, callback) {
    //args._xsrf = getCookie("_xsrf");
    //console.log(args)
    var test = $.param(args)
    //console.log(test)
    
    $.ajax({url: url, data: $.param(args), dataType: "text", type: "POST",
            success: function(response) {
        if (callback) callback(eval("(" + response + ")"));
    }, error: function(response) {
        console.log("ERROR:", response)
    }});
};

SocialCalc.Callbacks.broadcast = function(type, data) {
    if (type == 'ask.ecell') {
	//console.log("skipping askecell")
	return
    }
    if (type == 'ecell') {
	//console.log("skipping askecell")
	return
    }
    var message = {}
    message.from = player.idInSession
    message.type = type
    message.data = encodeURIComponent(JSON.stringify(data))
    $.postJSON("/broadcast", message, function(response) {
	    updater.showMessage(response);
        });
}


var updater = {
    errorSleepTime: 500,
    cursor: null,

    poll: function() {
        var args = {"_xsrf": getCookie("_xsrf")};
        if (updater.cursor) args.cursor = updater.cursor;
        $.ajax({url: "/updates", type: "POST", dataType: "text",
                data: $.param(args), success: updater.onSuccess,
                error: updater.onError});
    },

    onSuccess: function(response) {
        try {
	    //console.log("response",response)
            updater.newMessages(eval("(" + response + ")"));
        } catch (e) {
            updater.onError();
            return;
        }
        updater.errorSleepTime = 500;
        window.setTimeout(updater.poll, 0);
    },

    onError: function(response) {
        updater.errorSleepTime *= 2;
        //console.log("Poll error; sleeping for", updater.errorSleepTime, "ms");
        window.setTimeout(updater.poll, updater.errorSleepTime);
    },

    newMessages: function(response) {
	//console.log("new msg",response)
        //if (!response.type) return;
	//player.onNewEvent(response);
        if (!response.messages) return;
	//console.log("----didnt get here------")
        //updater.cursor = response.cursor;
        var messages = response.messages;
	//console.log("messages=",messages)
        updater.cursor = messages[messages.length - 1].id;
	//console.log("cursor is",updater.cursor)
        //console.log(messages.length, "new messages, cursor:", updater.cursor);
        for (var i = 0; i < messages.length; i++) {
            player.onNewEvent(messages[i]);
        }

    },

    showMessage: function(message) {
    }
};

var player = {
    
    initialize : function() {
	player.isConnected = true;
	player.idInSession = getCookie("idinsession")
	//console.log("idinsession",player.idInSession)
	if (player.idInSession != "1") {
	    SocialCalc.Callbacks.broadcast('ask.snapshot',{arbit:"arbit"})
	    //console.log("sent asking for snapshot")
	} else {
	    //console.log("NOT asking for snapshot")
	}
    },
    
    onNewEvent : function(data) {
	//console.log("in on new evt",data.idinsession,player.idInSession,data.type)
	if (!player.isConnected) return;
	if (data.from == player.idInSession) return;
	if (typeof SocialCalc == 'undefined') return;
	decodeddata = decodeURIComponent(data["data"]);
	msgdata = JSON.parse(decodeddata)

	//console.log(msgdata);

	var editor = SocialCalc.CurrentSpreadsheetControlObject.editor;
	
	switch (data.type) {
	case 'ecell': {
	    //var peerClass = ' ' + data.idinsession + ' defaultPeer';
	    break;
	    var peerClass = ' defaultPeer';
	    var find = new RegExp(peerClass, 'g');
	    
	    if (msgdata.original) {
		var origCR = SocialCalc.coordToCr(msgdata.original);
		var origCell = SocialCalc.GetEditorCellElement(editor, origCR.row, origCR.col);
		origCell.element.className = origCell.element.className.replace(find, '');
		//console.log("----")
		//console.log(origCell.element.className)
	    }
	    
	    var cr = SocialCalc.coordToCr(msgdata.ecell);
	    var cell = SocialCalc.GetEditorCellElement(editor, cr.row, cr.col);
	    if (cell.element.className.search(find) == -1) {
		cell.element.className += peerClass;
		//console.log("----",peerClass)
		//console.log(origCell.element.className)
	    }
	    break;
	}
	case 'ask.snapshot': {
	    if (player.idInSession == "1") {
		if (isMultipleSheet()) {
		    //console.log("multi sheet ask snapshot");
		    SocialCalc.Callbacks.broadcast('snapshot', {
						       to: data.idinsession,
						       snapshot: SocialCalc.WorkBookControlSaveSheet()
						   });
		    

		} else {
		    SocialCalc.Callbacks.broadcast('snapshot', {
						       to: data.idinsession,
						       snapshot: SocialCalc.CurrentSpreadsheetControlObject.CreateSpreadsheetSave()
						   });
		}
	    }
	    break;
	}
	case 'ask.ecell': {
	    break;
	    SocialCalc.Callbacks.broadcast('ecell', {
		    to: data.idinsession,
                        ecell: editor.ecell.coord
			});
	    break;
	}
	case 'snapshot': {
	    //console.log("------------");
	    //if (player._hadSnapshot) break;
	    player._hadSnapshot = true;
	    if (isMultipleSheet()) {
		SocialCalc.WorkBookControlLoad(msgdata.snapshot)
	    } else {
		
	    
		var spreadsheet = SocialCalc.CurrentSpreadsheetControlObject;
		var parts = spreadsheet.DecodeSpreadsheetSave(msgdata.snapshot);
		if (parts) {
		    if (parts.sheet) {
			spreadsheet.sheet.ResetSheet();
			spreadsheet.ParseSheetSave(msgdata.snapshot.substring(parts.sheet.start, parts.sheet.end));
		    }
		    //if (parts.edit) {
		    //    spreadsheet.editor.LoadEditorSettings(msgdata.snapshot.substring(parts.edit.start, parts.edit.end));
		    //}
		}
		if (spreadsheet.editor.context.sheetobj.attribs.recalc=="off") {
		    spreadsheet.ExecuteCommand('redisplay', '');
		    //spreadsheet.ExecuteCommand('set sheet defaulttextvalueformat text-wiki');
		}
		else {
		    spreadsheet.ExecuteCommand('recalc', '');
		    //spreadsheet.ExecuteCommand('set sheet defaulttextvalueformat text-wiki');
		}

	    }
	    
	    break;
	}
	case 'execute': {
	    if (isMultipleSheet()) {
		//console.log("in execute");
		var control = SocialCalc.GetCurrentWorkBookControl();
		control.ExecuteWorkBookControlCommand(msgdata, true); // remote cmd
	    } else {
		SocialCalc.CurrentSpreadsheetControlObject.context.sheetobj.ScheduleSheetCommands(
		    msgdata.cmdstr,
		    msgdata.saveundo,
		    true // isRemote = true
		);
	    }
	    break;
	}
	}
    }
    
};