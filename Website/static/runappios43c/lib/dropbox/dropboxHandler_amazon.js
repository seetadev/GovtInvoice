dropboxHandler = {};


$('#dropboxlogin').live( 'pagebeforeshow',function(event){

   var ele = document.getElementById("dropboxiframe")
   ele.innerHTML = '<iframe style="width:100%;height:100%;" frameborder="0" src="' + dropboxHandler.redirecturl + '" />';
   
});
$('#filePage').live( 'pagebeforeshow',function(event){
    if(window.sessionStorage.getItem('dbLogin'))
    {
        $("#dropboxLoginButton").hide();
        $("#dropboxLogoutButton").show();
    }
    else
    {
        $("#dropboxLoginButton").show();
        $("#dropboxLogoutButton").hide();
    }
});

dropboxHandler.querylogin = function() {
    $.ajax({
        type: 'GET',
        url: "/webapps/"+Aspiring.appname+"/dropbox",
        data: {action: 'getLogin', sessionid: webapp_sessionid},
        dataType: 'json',
        success: function(data) {
	    window.sessionStorage.setItem('dbLogin', 1);
            //alert("Logged in to dropbox");
	    //$("#dropboxLoginButton").hide();
	    //$("#dropboxLogoutButton").show();
        },
        error: function(e) {
		//alert("Unable to login");
        }
    });
}
//Get the authorization URL from Dropbox, and redirect the user to that URL, a boolean variable 'dbLogin' will be stored in
//session storage to indicate whether the user is logged in or not, in the onBodyLoad function in the runappios43.html file
dropboxHandler.login = function() {
    //alert("sessionid "+webapp_sessionid)
    $.ajax({
        type: 'GET',
        url: "/webapps/"+Aspiring.appname+"/dropbox",
        data: {action: 'dropbox-auth-start', sessionid: webapp_sessionid},
        dataType: 'json',
        success: function(data) {
	    //alert("Dropbox login redirect " + data.url);
	    window.location.replace(data.url);
	    //$.mobile.changePage("dropbox.html");
	    //dropboxHandler.redirecturl = data.url

	    //var new_window = window.open(data.url)
	    //window.setTimeout(dropboxHandler.querylogin, 2000)
        },
        error: function(e) {
            alert("Unable to get auth URL");
        }
    });
};

//Delete the dropbox authentication token from cache/cookies and remove the dbLogin boolean variable from sessionStorage
dropboxHandler.logout = function(){
    //alert("sessionid "+webapp_sessionid)
    $.ajax({
            type: 'GET',
	    url: "/webapps/"+Aspiring.appname+"/dropbox",
	    data: {action: 'logout', sessionid: webapp_sessionid },
            dataType: 'json',
            success: function(data) {
                window.sessionStorage.removeItem('dbLogin');
                alert("You have been logged out from dropbox");
                $("#dropboxLoginButton").show();
                $("#dropboxLogoutButton").hide();
            },
            error: function(e) {
                alert("Unable to log out from Dropbox");
            }
        });
};

//Save the current sheet in dropbox
dropboxHandler.save = function() {
    promptConfirm =  function(fileStr) {
        var fileObj = {};
        fileObj.mimeType = "text/plain";
        fileObj.name = fileStr;
	fileObj.sessionid = webapp_sessionid;

        if (fileObj.name != 'null' && fileObj.name.length < 30){

            var fileData = SocialCalc.WorkBookControlSaveSheet();

            fileObj.string = encodeURIComponent(fileData);
            // fileObj.length = fileObj.string.length;

            var success = function(){
                $.mobile.pageLoading(true);
                alert("File saved in Dropbox");
            };

            var failure = function(){
                $.mobile.pageLoading(true);
                alert("File could not be saved in Dropbox");
            };

            if(window.sessionStorage.getItem('dbLogin')) {
                $.mobile.pageLoading();
                fileObj.action = 'upload';
                $.postJSON("/webapps/"+Aspiring.appname+'/dropbox', fileObj, success, failure);
            }
            else
            {
                alert("Please login to dropbox");
            }
        }
        else if(fileObj.name.length >=30){
            alert("File name should be less than 30 characters");
        }

        else
        {
            alert("Invalid file name");
        }
    };
    var fileName = window.prompt("Enter File Name");
    if (fileName)
    {
        promptConfirm(fileName);
    }
}

//Get the list of files in the user's dropbox folder, add them to the list with ID dropboxList, and then redirect to the
//dropboxList.html page
dropboxHandler.populateList = function(){
$.mobile.pageLoading();

dropboxHandler.list = Array();
    success = function(data) {
        if(data.contents.length == 0) {
            $.mobile.pageLoading(true);
            alert("No file in Dropbox");
            //$.mobile.changePage('file.html');
        }
        else {
            for (item in data.contents) {
                var str = data.contents[item].path;
                // str = str.slice(1,-8);
                dropboxHandler.list.push(str);
            }

            $.mobile.pageLoading(true);

            $('#dropboxFileList').live( 'pagebeforeshow',function(event){
                $("#dropboxList").empty();
                for (item in dropboxHandler.list){
                    var str = dropboxHandler.list[item];
                    // console.log(str);
		    name = str.slice(1,str.length)
                    $("#dropboxList").append(
                           '<li class="fieldcontain">'+
                           '<div class="ui-grid-b">'+
                           '<div class="ui-block-a">'+
                           '<span style="padding-left:1.2em;"><h2>'+name+'</h2></span>'+
                           '</div>'+
                           '<div class="ui-block-c">'+
                           '<fieldset data-role="controlgroup" data-type="horizontal">'+
                           // '<button onclick=dropboxHandler.View("'+ encodeURI(str) +'");>Edit</button>'+
                           // '<button onclick=dropboxHandler.saveLocal("'+encodeURI(str)+'");>Save</button>'+
                           '<button onclick=dropboxHandler.Delete("'+ encodeURI(str) +'");>Delete</button>'+
                           '</fieldset>'+
                           '</div></div></li>');
                }
                $("#dropboxFileList *" ).page();
                $("#dropboxList").listview("refresh");
                //This was missing earlier
                $("#dropboxList").show();
            });
            // console.log(dropboxHandler.list);
            //this did not work earlier, now this works!
            // $.mobile.changePage("dropboxList.html",{ transition: "pop"});
            $.mobile.changePage("dropboxList.html");

            //So I had to do this. This code will replace the runappios43c/file.html?v=xs84c code with runappios43c/dropboxLogin.html
            // var url = window.location.href;
            // url = url.slice(0, url.indexOf('runappios43c'));
            // url += "runappios43c/dropboxList.html";
            // // console.log("Final url: "+url);

            // // $.mobile.changePage(url,{ transition: "pop"});
            // window.location.replace(url);
        }

	}

	failure = function (data){
		$.mobile.pageLoading(true);
        console.log(data);
        errorObj= JSON.parse(data.text);
        console.log(errorObj);
        errorStr = dropboxHandler.errorString(errorObj.error);
        console.log(errorStr);
        navigator.notification.alert("Connection was unsuccessful\n" + errorStr,null,applicationName);
        alert("Connection was unsuccessful");
	}

        if(window.sessionStorage.getItem('dbLogin')) {
            $.mobile.pageLoading();
            var message = {}
            message.action = "listdir"
	    message.sessionid = webapp_sessionid;
            $.postJSON("/webapps/"+Aspiring.appname+'/dropbox', message, success);
        }
        else{
            alert("Please login to Dropbox first.");
            $.mobile.pageLoading('hide');
        }
}


//This function will load the sheetdata from dropbox, and display it in the web app
dropboxHandler.View= function(str){
	$.mobile.pageLoading();
	success =	function(data){

		var fileContent = data.text;
		$.mobile.pageLoading(true);
                SocialCalc.WorkBookControlInsertWorkbook(decodeURIComponent(fileContent));
                SocialCalc.GetCurrentWorkBookControl().workbook.spreadsheet.editor.state = "start";
                SocialCalc.GetCurrentWorkBookControl().workbook.spreadsheet.ExecuteCommand('redisplay', '');
		$.mobile.changePage("#indexPage",{ transition: "pop"});
	}
    str = decodeURI(str);
	// var strFname = str +".msc";
    // var strFname = str +".msc.txt";
    var strFname = str;
    console.log(strFname);

    var message = {}
    message.action = "view"
    message.fname = strFname;
    message.sessionid = webapp_sessionid;
    $.postJSON("/webapps/"+Aspiring.appname+'/dropbox', message, success);
}

//function to handle delete in fileList
dropboxHandler.Delete = function (str) {
	str = decodeURI(str);

    var deleteConfirm = function() {
        $.mobile.pageLoading(true);
        // var fileNameStr = str + ".msc";
        var fileNameStr = str;
        success = function(data) {
	    // $.mobile.pageLoading(true);
	        var filterfunc = function(index) {
				if($(this).find('h2').text() == str)
					return true;
				else
					return false;
			};
            $("#dropboxList li").filter(filterfunc).remove();
		console.log($("#dropboxList li").html)
			if($("#dropboxList li").length ==0) {
			   $("#dropboxList").append('<li class="fieldcontain">No files in Dropbox</li>');
			}

                $("#dropboxFileList *" ).page();
                $("#dropboxList").listview("refresh");
                //This was missing earlier
                $("#dropboxList").show();
	       console.log(data);
        };

    	failure = function(data) {
    		$.mobile.pageLoading(true);
            alert("File could not be deleted");
    		console.log(data);
    	};

        var message = {}
        message.action = "delete"
        message.fname = fileNameStr;
	message.sessionid = webapp_sessionid;
        $.ajax({
            url: "/webapps/"+Aspiring.appname+'/dropbox',
            type: 'POST',
            data: message,
            dataType: 'json',
            success: success,
            error: failure
        });
    }

    var confirm = window.confirm("Are you sure you want to delete the file '"+str+"' from Dropbox?");
    if (confirm)
    {
        deleteConfirm();
    }
};

dropboxHandler.saveLocal = function(str){
    $.mobile.pageLoading();
	var success = function(data) {

		var fileContent = data.text;
		$.mobile.pageLoading(true);
        // window.localStorage.setItem(str ,fileContent);
        // cloud save the file !!
        if (strFname[0] == '/')
        {
            strFname = strFname.slice(1, strFname.length);
        }
        console.log("Saving as: "+strFname);
	localStorage.setItem(Aspiring.getPathFromFilename(strFname), fileContent);
        updateFileName(strFname);      
        alert("Saved "+strFname);
        // var message = {}
        // message.action = "savefile"
        // message.appname = Aspiring.appname
        // message.fname = strFname
        // message.data = fileContent
        
        // $.postJSON("/webapp", message, function(response) {
        //     result = response["result"]
        //     if (result == "ok") {
        //         // set the top right file to selected file
        //         updateFileName(strFname);      
        //         alert("Saved "+strFname)
        //     } else {
        //         alert("Save failed "+strFname)     
        //     }
        // });
        // alert("File moved to local storage successfully");
	}
	
    var failure = function(data) {
		$.mobile.pageLoading(true);
        alert("File could not be saved");
		console.log(data);
	};
    
	// dropbox.getFile(strFname,success);
    str = decodeURI(str);
    // var strFname = str +".msc";
    // var strFname = str +".msc.txt";
    var strFname = str;
    // console.log(strFname);

    var message = {}
    message.action = "view"
    message.fname = strFname;
    message.sessionid = webapp_sessionid;
    $.postJSON("/webapps/"+Aspiring.appname+'/dropbox', message, success);
}

dropboxHandler.saveLocalPage = function() {
    
    $('#dropboxSaveList').live( 'pagebeforeshow',function(event) {
        $("#dropboxCheckList").empty();
        var fieldElement = $('<fieldset data-role="controlgroup"></fieldset>');
        for (item in dropboxHandler.list) {
            var str = dropboxHandler.list[item];
            var checkboxElement = $('<input type="checkbox" name="checkbox-'+str+'" id="checkbox-'+str+'" />'+
                '<label for="checkbox-'+str+'">'+str+'</label>');
            fieldElement.append(checkboxElement);
        }
        var divElement = $('<div data-role="controlgroup"></div>');
        divElement.append(fieldElement);
        divElement.page();
        $("#dropboxCheckList").append(divElement).trigger('create');
    });
    $.mobile.changePage("dropboxSaveLocal.html");
    //var url = window.location.href;
    //url = url.slice(0, url.indexOf('runappios43c'));
    //url += "runappios43c/dropboxSaveLocal.html";

    //window.location.replace(url);

};

dropboxHandler.saveLocalMultiple = function(str){
    $.mobile.pageLoading();
	var fileNames = [];
	
	$("#dropboxCheckList :checked").each(
	    function(index){
    	    var fileName = encodeURI($(this).attr("id").slice(9));
    	    // fileName = fileName + ".msc";
	        fileNames.push(fileName);
	});
	
	dropboxHandler.recursiveSave(fileNames);
    
}

dropboxHandler.recursiveSave= function(fileNames){

	if(fileNames.length!=0) {
	    var strFname = fileNames.pop();
        
        $.mobile.pageLoading();
        var success = function(data) {
            console.log(data);
            var fileContent = data.text;
            $.mobile.pageLoading(true);
            // window.localStorage.setItem(str ,fileContent);
            // cloud save the file !!
            if (strFname[0] == '/')
            {
                strFname = strFname.slice(1, strFname.length);
            }
            console.log("Saving as: "+strFname);
            localStorage.setItem(Aspiring.getPathFromFilename(strFname), fileContent);
            updateFileName(strFname);      
            alert("Saved "+strFname);
            dropboxHandler.recursiveSave(fileNames);
            
        }
        
        var failure = function(data) {
            $.mobile.pageLoading(true);
            alert("File could not be saved");
            console.log(data);
        };

        strFname = decodeURI(strFname);
        // var strFname = fileName +".msc";
        // var strFname = fileName +".msc.txt";
        // var strFname = fileName;

        var message = {}
        message.action = "view"
        message.fname = strFname;
	message.sessionid = webapp_sessionid;
        console.log("Getting file "+strFname+" from dropbox");
        console.log(message);

        $.ajax({
            url: "/webapps/"+Aspiring.appname+'/dropbox',
            type: 'POST',
            data: message,
            dataType: 'json',
            success: success,
            error: failure
        });

	}
	else{
	    $.mobile.pageLoading(true);
	    // navigator.notification.alert("Files saved successfully",null,applicationName);
        alert("Files saved successfully");
	}
}

dropboxHandler.errorString = function(str){
    if(str == "Token is not an authorized request token."){
        return "Login Error";
    }
    if(str == "Connection could not be established."){
        return "Connection could not be established. Check your Internet Connectivity.";
    }
    
    return "Undefined Error";
}

//The following are to save local files to dropbox 
// These are similar to the functions to save from dropbox to local

dropboxHandler.saveToDropboxPage = function(){

    if(window.localStorage.length < 1) {
        alert("No local named files");
    }
    else if (!window.sessionStorage.getItem('dbLogin')) {
        alert("Please login to Dropbox first");
    } 
    else 
    {
        $('#localSaveList').live( 'pagebeforeshow',"#localSaveList",function() {    
            
            $("#localfileCheckList").empty();
            var fieldElement = $('<fieldset data-role="controlgroup"></fieldset>');
            for (i=0; i<window.localStorage.length; i++){
                if (window.localStorage.key(i) == "default") continue;
                if (window.localStorage.key(i).length >= 30) continue;
		if (!(Aspiring.isFileForApp(window.localStorage.key(i)))) {
		    continue;
		}


                var str = Aspiring.getFilenameFromPath(window.localStorage.key(i));
                var checkboxElement = $('<input type="checkbox" name="checkbox-'+str+'" id="checkbox-'+str+'" />'+
                    '<label for="checkbox-'+str+'">'+str+'</label>');
                fieldElement.append(checkboxElement);
            }
            var divElement = $('<div data-role="controlgroup"></div>');
            divElement.append(fieldElement);
            divElement.page();
            // console.log("Appending divElement");
            $("#localfileCheckList").append(divElement).trigger('create');

        });
        $.mobile.changePage("saveLocalToDropbox.html");
        // window.location.href = "saveLocalToDropbox.html";
    }
};

dropboxHandler.saveToDropboxMultiple = function(str){
    var fileNames = [];
    
    $("#localfileCheckList :checked").each(
        function(index){
        var fileName = $(this).attr("id").slice(9);
        fileNames.push(fileName);
    });
    
    dropboxHandler.recursiveSaveToDropbox(fileNames);
    
}

dropboxHandler.recursiveSaveToDropbox = function(fileNames) {

    if(fileNames.length!=0) {
        var fileName = encodeURI(fileNames.pop());
        var fileData = window.localStorage.getItem(Aspiring.getPathFromFilename(fileName));

        var fileObj = {};
        fileObj.name = fileName;
        fileObj.mimeType = "text/plain";
        fileObj.string = fileData;

        var success = function(){
            $.mobile.pageLoading(true);
            alert(fileName+ " saved in Dropbox");
            dropboxHandler.recursiveSaveToDropbox(fileNames);
        };

        var failure = function(){
            $.mobile.pageLoading(true);
            alert(fileName + " could not be saved in Dropbox");
            dropboxHandler.recursiveSaveToDropbox(fileNames);
        };

        if(window.sessionStorage.getItem('dbLogin')) {
            $.mobile.pageLoading();
            fileObj.action = 'upload';
	    fileObj.sessionid = webapp_sessionid;	    
            $.postJSON("/webapps/"+Aspiring.appname+'/dropbox', fileObj, success);
        }
        else
        {
            alert("Please login to dropbox");
        }
    }
    else
    {
        alert("Done saving files to dropbox");
    }
}