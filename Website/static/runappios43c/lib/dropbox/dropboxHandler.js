dropboxHandler = {};

//Not used
// dropboxHandler.getAutheticated = function(success,failure){
//     $.mobile.changePage("dropbox.html");
//     console.log(success);
//     console.log(failure);
//     $('#dropboxLogin').live('pageshow',function(event){
//         $("#dropboxLoginButton").unbind();
//         $("#password").val("");                    
//         $("#dropboxLoginButton").click(function(){
//         var userEmail = $("#email").val();
//         var userPass = $("#password").val();
//         console.log(userEmail);
//         console.log(userPass);
//         $.mobile.pageLoading();
//         dropbox.setupoauth(userEmail,userPass,success,failure);
       
//         });
//     });
// };

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

//Get the authorization URL from Dropbox, and redirect the user to that URL, a boolean variable 'dbLogin' will be stored in
//session storage to indicate whether the user is logged in or not, in the onBodyLoad function in the runappios43.html file
dropboxHandler.login = function() {
    $.ajax({
        type: 'GET',
        url: "/dropbox",
        data: {action: 'dropbox-auth-start'},
        dataType: 'json',
        success: function(data) {
            window.location.replace(data.url);
        },
        error: function(e) {
            alert("Unable to get auth URL");
        }
    });
};

//Delete the dropbox authentication token from cache/cookies and remove the dbLogin boolean variable from sessionStorage
dropboxHandler.logout = function(){
    $.ajax({
            type: 'GET',
            url: "/dropbox",
        data: {action: 'logout' },
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

        if (fileObj.name != 'null' && fileObj.name.length < 30){

            var fileData = SocialCalc.WorkBookControlSaveSheet();

            //fileObj.name += ".msc.txt";
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
                $.postJSON('/dropbox', fileObj, success, failure);
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
            $.mobile.changePage('file.html');
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
		    name = str.slice(1,-8)
                    $("#dropboxList").append(
                           '<li class="fieldcontain">'+
                           '<div class="ui-grid-b">'+
                           '<div class="ui-block-a">'+
                           '<span style="padding-left:1.2em;"><h2>'+name+'</h2></span>'+
                           '</div>'+
                           '<div class="ui-block-c">'+
                           '<fieldset data-role="controlgroup" data-type="horizontal">'+
                           '<button onclick=dropboxHandler.View("'+ encodeURI(str) +'");>Edit</button>'+
                           '<button onclick=dropboxHandler.saveLocal("'+encodeURI(str)+'");>Save</button>'+
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
            //this did not work
            // $.mobile.changePage("dropboxList.html",{ transition: "pop"});

            //So I had to do this. This code will replace the runappios43c/file.html?v=xs84c code with runappios43c/dropboxLogin.html
            var url = window.location.href;
            url = url.slice(0, url.indexOf('runappios43c'));
            url += "runappios43c/dropboxList.html";
            // console.log("Final url: "+url);

            // $.mobile.changePage(url,{ transition: "pop"});
            window.location.replace(url);
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
            $.postJSON('/dropbox', message, success);
        }
        else{
            alert("Please login to Dropbox first.");
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
    $.postJSON('/dropbox', message, success);
}

//function to handle delete in fileList
dropboxHandler.Delete = function (str) {
	str = decodeURI(str);

    var deleteConfirm = function() {
        $.mobile.pageLoading();
        // var fileNameStr = str + ".msc";
        var fileNameStr = str;
        success = function(data) {
            $.mobile.pageLoading(true);
	        var filterfunc = function(index) {
				if($(this).find('h2').text() == str)
					return true;
				else
					return false;
			};
            $("#dropboxList li").filter(filterfunc).remove();
			if($("#dropboxList li").length ==0) {
			   $("#dropboxList").append('<li class="fieldcontain">No files in Dropbox</li>');
			}
            alert("File deleted!");
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

        $.ajax({
            url: '/dropbox',
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
        if (strFname.indexOf('.msc'))
        {
            strFname = strFname.slice(0, strFname.indexOf('.msc'));
        }
        console.log("Saving as: "+strFname);
        var message = {}
        message.action = "savefile"
        message.appname = Aspiring.appname
        message.fname = strFname
        message.data = fileContent
        
        $.postJSON("/webapp", message, function(response) {
            result = response["result"]
            if (result == "ok") {
                // set the top right file to selected file
                updateFileName(strFname);      
                alert("Saved "+strFname)
            } else {
                alert("Save failed "+strFname)     
            }
        });
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
    $.postJSON('/dropbox', message, success);
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
	 //    dropbox.getFile(fileName,function(data){
		// var fileContent = data.text;
		// var str = fileName.slice(0,-4);
  //               window.localStorage.setItem(str,fileContent);
		// dropboxHandler.recursiveSave(fileNames);
		// },function(data){
		// $.mobile.pageLoading(true);
		// // navigator.notification.alert("Error occured while saving file",null,applicationName);
  //       alert("Error occured while saving file");
		// console.log(data);
	 //    });
        
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
            if (strFname.indexOf('.msc'))
            {
                strFname = strFname.slice(0, strFname.indexOf('.msc'));
            }
            console.log("Saving as: "+strFname);
            var message = {}
            message.action = "savefile"
            message.appname = Aspiring.appname
            message.fname = strFname
            message.data = fileContent
            console.log("Saving file "+strFname+" in cloud");
            
            $.ajax({
                url: '/webapp',
                type: 'POST',
                data: message,
                dataType: 'json',
                success: function (response) {
                    if (response)
                    {
                        result = response["result"]
                        if (result == "ok") {
                            // set the top right file to selected file
                            updateFileName(strFname);      
                            alert("Saved "+strFname);
                            dropboxHandler.recursiveSave(fileNames);
                        } else {
                            alert("Save failed "+strFname);
                            dropboxHandler.recursiveSave(fileNames);
                        }
                    }
                    else
                    {
                        alert("Unable to save file: "+strFname);
                    }
                },
                error: function (e) {
                    alert("Save failed "+strFname);
                    dropboxHandler.recursiveSave(fileNames);
                }
            });
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
        console.log("Getting file "+strFname+" from dropbox");
        console.log(message);

        $.ajax({
            url: '/dropbox',
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