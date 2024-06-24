serverHandler = {};


$('#filePage').live( 'pagebeforeshow',function(event){
    if(window.sessionStorage.getItem('s3Login'))
    {
        $("#serverLoginButton").hide();
        $("#serverLogoutButton").show();
    }
    else
    {
        $("#serverLoginButton").show();
        $("#serverLogoutButton").hide();
    }

    if(window.localStorage.getItem(Aspiring.getPathFromFilename(settingsName))){
        var settings = JSON.parse(window.localStorage.getItem(Aspiring.getPathFromFilename(settingsName)));
        console.log(settings.auto);
        if(settings.auto){
            $("#flip-a").val("On");
        }
        else{
            $("#flip-a").val("Off");
        }
        
    }
    else{
        $("#flip-a").val("Off");
    }


    $("#image-div-paypal").removeClass("ui-btn-hidden");

    
});

//Get the authorization URL from Dropbox, and redirect the user to that URL, a boolean variable 'dbLogin' will be stored in
//session storage to indicate whether the user is logged in or not, in the onBodyLoad function in the runappios43.html file
serverHandler.startLogin = function() {

    var message = {};
    message.email = document.getElementById('emailID').value;
    message.pwd = document.getElementById('pwd').value;
    // alert(JSON.stringify(message));
    message.action = "login";
    $.mobile.pageLoading();
    $.ajax({
            type: 'POST',
            url: "/auth",
            data: message,
            dataType: 'json',
            success: function(response) {
                // alert("success: "+JSON.stringify(response));
                 $.mobile.pageLoading('hide');
                var result = response['result'];
                var data = response['data'];
                if(result == "fail"){
                    if(data == "usererror"){
                        alert("No account created for this email address. Click on register to create a new account");
                    }
                    else if(data == "authfail"){
                        alert("Password is incorrect")
                    }
                }
                else{
                    alert("Login successful");
                    window.sessionStorage.setItem('s3Login', 1);
                    changePage('#indexPage');

                }
            },
            error: function(e) {
                $.mobile.pageLoading('hide');
                alert("Unable to log in to server");
            }
     });
};

serverHandler.startRegister = function() {

    var message = {};
    message.email = document.getElementById('email').value;
    message.pwd = document.getElementById('passwd').value;
    // alert(JSON.stringify(message));
    message.action = "register";
    $.mobile.pageLoading();
    $.ajax({
            type: 'POST',
            url: "/auth",
            data: message,
            dataType: 'json',
            success: function(response) {
                // alert("success: "+JSON.stringify(response));
                $.mobile.pageLoading('hide');
                var result = response['result'];
                var data = response['data'];
                if(result == "fail"){
                    alert("User already exists. Login to continue");
                }
                else{
                    alert("Registration successful!");
                    window.sessionStorage.setItem('s3Login', 1);
                    changePage('#indexPage');
                }

            },
            error: function(e) {
                $.mobile.pageLoading('hide');
                alert("Unable to register to server");
            }
     });
};

serverHandler.startLogout = function() {

    var message = {}
    message.action = "logout";

    $.ajax({
            type: 'POST',
            url: "/auth",
            data: message,
            dataType: 'json',
            success: function(response) {
                // alert("success: "+JSON.stringify(response));
                window.sessionStorage.removeItem('s3Login');
                alert("You have been logged out from server");
                $("#serverLoginButton").show();
                $("#serverLogoutButton").hide();

            },
            error: function(e) {
                alert("Unable to logout from server");
            }
     });
};


serverHandler.saveToServer = function(){

    if(window.localStorage.length < 1) {
        alert("No local named files");
    }
    else if (!window.sessionStorage.getItem('s3Login')) {
        alert("Please login to server first");
    }
    else
    {
        $('#localSaveListServer').live( 'pagebeforeshow',"#localSaveListServer",function() {

            $("#localfileCheckListServer").empty();
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
            $("#localfileCheckListServer").append(divElement).trigger('create');

        });
        $.mobile.changePage("saveLocalToServer.html");
        // window.location.href = "saveLocalToDropbox.html";
    }

};

serverHandler.saveToServerMultiple = function(str){
    var data = {};

    $("#localfileCheckListServer :checked").each(
        function(index){
        var fileName = $(this).attr("id").slice(9);
        var fileData = window.localStorage.getItem(Aspiring.getPathFromFilename(fileName));
        data[fileName] = fileData;

    });
    //'action': 'save-multiple', 'appname': Global.app, "user": user, "content": $scope.filesData};
    // alert(JSON.stringify(fileNames));
    var message = {action: 'save-multiple', content: JSON.stringify(data) , appname: Aspiring.appname };
    // console.log(JSON.stringify(message));
    $.mobile.pageLoading();
    $.postJSON("/webapp", message , function(response) {
        $.mobile.pageLoading('hide');
        alert("Files Saved successfully")
    });

}



//Get the list of files in the user's dropbox folder, add them to the list with ID dropboxList, and then redirect to the
//dropboxList.html page
serverHandler.populateList = function(){
    $.mobile.pageLoading();

    serverHandler.list = Array();
    success = function(data) {
        var data = data.data;
        if(data.length == 0) {
            $.mobile.pageLoading(true);
            alert("No file in server");
            //$.mobile.changePage('file.html');
        }
        else {
            for (item in data) {
                var str = data[item];
                // str = str.slice(1,-8);
                serverHandler.list.push(str);
            }
            // alert(JSON.stringify(serverHandler));
            $.mobile.pageLoading(true);

            $('#serverFileList').live( 'pagebeforeshow',function(event){
                $("#serverList").empty();
                for (item in serverHandler.list){
                    var str = serverHandler.list[item];
                    console.log(str);
                    var name = str;
                    $("#serverList").append(
                           '<li class="fieldcontain">'+
                           '<div class="ui-grid-b">'+
                           '<div class="ui-block-a">'+
                           '<span style="padding-left:1.2em;"><h2>'+name+'</h2></span>'+
                           '</div>'+
                           '<div class="ui-block-c">'+
                           '<fieldset data-role="controlgroup" data-type="horizontal">'+
                           // '<button onclick=dropboxHandler.View("'+ encodeURI(str) +'");>Edit</button>'+
                           // '<button onclick=dropboxHandler.saveLocal("'+encodeURI(str)+'");>Save</button>'+
                           '<button onclick=serverHandler.Delete("'+ encodeURI(str) +'");>Delete</button>'+
                           '</fieldset>'+
                           '</div></div></li>');
                }
                $("#serverFileList *" ).page();
                $("#serverList").listview("refresh");
                //This was missing earlier
                $("#serverList").show();
            });
            $.mobile.changePage("serverList.html");
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

    if(window.sessionStorage.getItem('s3Login')) {
        $.mobile.pageLoading();
        var message = {}
        message.action = "listdir";
        message.appname = Aspiring.appname;
        $.postJSON("/webapp", message , success);
    }
    else{
        alert("Please login to server first.");
        $.mobile.pageLoading('hide');
    }
}


serverHandler.saveLocalPage = function(){
    $('#serverSaveList').live( 'pagebeforeshow',function(event) {
        $("#serverCheckList").empty();
        var fieldElement = $('<fieldset data-role="controlgroup"></fieldset>');
        for (item in serverHandler.list) {
            var str = serverHandler.list[item];
            var checkboxElement = $('<input type="checkbox" name="checkbox-'+str+'" id="checkbox-'+str+'" />'+
                '<label for="checkbox-'+str+'">'+str+'</label>');
            fieldElement.append(checkboxElement);
        }
        var divElement = $('<div data-role="controlgroup"></div>');
        divElement.append(fieldElement);
        divElement.page();
        $("#serverCheckList").append(divElement).trigger('create');
    });
    $.mobile.changePage("serverSaveLocal.html");

};

serverHandler.saveLocalMultiple = function(str){
    $.mobile.pageLoading();
	var fileNames = [];

	$("#serverCheckList :checked").each(
	    function(index){
    	    var fileName = encodeURI($(this).attr("id").slice(9));
    	    // fileName = fileName + ".msc";
	        fileNames.push(fileName);
	});

	// alert(JSON.stringify(fileNames));
	var message = {action: "get-data", appname:Aspiring.appname, content: JSON.stringify(fileNames) };
	// alert(JSON.stringify(message));

	$.ajax({
            url: "/webapp",
            type: 'POST',
            data: message,
            dataType: 'json',
            success: function(response){
                $.mobile.pageLoading('hide');
                if(response.result == "ok"){
                     var data = response.data;
                     for(var i in  data){
                        /// console.log(i);
                         console.log("Saving as: "+i);
                         localStorage.setItem(Aspiring.getPathFromFilename(i), data[i]);
                     }
                }

                alert("Files Saved successfully");

            },
            error: function(e){
                $.mobile.pageLoading('hide');
                alert("Files could not be saved");
                // console.log(data);
            }
    });

};




//function to handle delete in fileList
serverHandler.Delete = function (str) {

    var deleteConfirm = function() {
        $.mobile.pageLoading(true);


        success = function(data) {
            $.mobile.pageLoading('hide');
            var filterfunc = function(index) {
				if($(this).find('h2').text() == str)
					return true;
				else
					return false;
			};
            $("#serverList li").filter(filterfunc).remove();
		        // console.log($("#serverList li").html)
			    if($("#serverList li").length ==0) {
			        $("#serverList").append('<li class="fieldcontain">No files in Dropbox</li>');
			    }

            $("#serverFileList *" ).page();
            $("#serverList").listview("refresh");
            $("#serverList").show();
	       console.log(data);
        };

    	failure = function(data) {
    		$.mobile.pageLoading('hide');
            alert("File could not be deleted");
    		console.log(data);
    	};

        var message = {}
        message.action = "delete-file"
        message.appname = Aspiring.appname;
        message.filename = str;

        $.ajax({
            url: "/webapp",
            type: 'POST',
            data: message,
            dataType: 'json',
            success: success,
            error: failure
        });
    }

    var confirm = window.confirm("Are you sure you want to delete the file '"+str+"' from server?");
    if (confirm)
    {
        deleteConfirm();
    }
};