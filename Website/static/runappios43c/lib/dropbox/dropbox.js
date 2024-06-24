/*                                                                            *
 *  Dropbox Javascript API v1.0                                               *
 *  Copyright Ayush Goyal 2012                                                *
 *	                                                                      *
 *  Uses the Javascript OAuth library by Rob Griffiths aka bytespider         *
 *  https://github.com/bytespider/jsOAuth                                     *
 *	                                                                      *
 *  Licensed under the Apache License, Version 2.0 (the "License");           *
 *  you may not use this file except in compliance with the License.          *
 *  You may obtain a copy of the License at                                   *
 *	                                                                      *
 *     http://www.apache.org/licenses/LICENSE-2.0                             *
 *	                                                                      *
 *  Unless required by applicable law or agreed to in writing, software       *
 *  distributed under the License is distributed on an "AS IS" BASIS,         *
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.  *
 *  See the License for the specific language governing permissions and       *
 *  limitations under the License.                                            */

var dropbox = {};
	
//Change to your own Dropbox API keys
dropbox.consumerKey = "v6idq5t8xavq1cz";
dropbox.consumerSecret = "62mo4p5i2skxzb2";

//access Token Epire Limit in milliseconds
accessTokenExpireLimit = 2505600000;

//Set to "dropbox" if your application has been given full Dropbox folder access
dropbox.accessType = "sandbox";

dropbox.htmlAccessStorageKey = "accessTokenKeyIsLooooooooooooooooooongEnough";
/*-------------------No editing required beneath this line-------------------*/

// function to setup dropbox.oauth object
dropbox.setupoauth = function(userEmail,userPass,success,failure){
	
        failure = (typeof(failure) == 'function')? failure:dropbox.log;
    console.log(userEmail);
    console.log(userPass);
        var requestURL = "https://api.dropbox.com/1/oauth/request_token";
	var authorizeURL = "https://www.dropbox.com/1/oauth/authorize";
	var accessURL = "https://api.dropbox.com/1/oauth/access_token";
	var loginURL = "https://www.dropbox.com/login";
	
	var config = {
		requestTokenUrl: requestURL,
		authorizationUrl:authorizeURL,
		accessTokenUrl: accessURL,
		consumerKey : dropbox.consumerKey,
		consumerSecret: dropbox.consumerSecret,
	};
	
	var loginData = {
		login_email:userEmail,
		login_password: userPass,
		login_submit:"Sign in",
	};
    console.log(loginData);
	
	oauth = OAuth(config);
	oauth.fetchRequestToken(function(url){
	
        //Split OAuth requestToken for later use
        try{
        
        var requestTokenTemp = url.split('?');
        requestTokenTemp = requestTokenTemp[1].split('&');
        var requestTokenSecret = requestTokenTemp[0].split('=');
        requestTokenSecret = requestTokenSecret[1];
        var requestToken = requestTokenTemp[1].split('=');
        requestToken = requestToken[1];
        }
        catch(error){
         var errorObj = {};
         errorObj.text = '{"error":"Connection could not be established."}';
         failure(errorObj);
         return;                   
        }
        var accessData={
                        oauth_token:requestToken,
                        oauth_token_secret:requestTokenSecret					
        };
        
        // for testing
        console.log(requestToken + " " + requestTokenSecret);
        
        //Login in dropbox
        oauth.post(loginURL,loginData,function(data){
            oauth.get(url,function(data){
                      console.log(data);
                      textString = data.text;
                      pos = textString.search("TOKEN");
                      relevent = textString.slice(pos,pos+40);
                      pos2 = relevent.search(",");
                      relevent = relevent.slice(0,pos2);
                      releventArray = relevent.split("'");
                      authorizeToken = releventArray[1]
                      allowData = {allow_access : "Continue",
                                   oauth_token:requestToken,
                                   t : authorizeToken
                      }
            oauth.post(url,allowData,function(data){	
                                 
                                 //Get Access Token
                     oauth.post(accessURL,accessData,function(data){
                                
                        //Split OAuth AcessToken for later use
                        var accessTokenTemp=data["text"].split("&");
                        var accessTokenSecret = accessTokenTemp[0].split('=');
                        accessTokenSecret = accessTokenSecret[1];
                        var accessToken = accessTokenTemp[1].split('=');
                        accessToken = accessToken[1];
                        
                        oauth.setAccessToken(accessToken, accessTokenSecret);
                        var dateValue = new Date();
                        dateValue = dateValue.getTime();
                        var accessTokenString = accessToken + '&' + accessTokenSecret + '&' +dateValue;
                        window.localStorage.setItem(dropbox.htmlAccessStorageKey,accessTokenString);
                        
                        //setup OAuth object
                        dropbox.oauth = oauth;
                        
                        //run the success function
                        if(typeof(success)=="function")
                        success();
                        },failure);
                 
               },failure);
            },failure);
        },failure);
    },failure);
}

dropbox.setupHtml5Oauth = function(){
    var accessDetails = window.localStorage.getItem(dropbox.htmlAccessStorageKey);	
    if(accessDetails){
        accessDetails = accessDetails.split('&');
        var config = {
        consumerKey : dropbox.consumerKey,
        consumerSecret: dropbox.consumerSecret,
        };
        
        var dateValue = new Date();
        dateValue = dateValue.getTime();
        accessDetails[2] = parseInt(accessDetails[2]);
        if(dateValue - accessDetails[2] < accessTokenExpireLimit ){
            var oauth = OAuth(config);
            oauth.setAccessToken(accessDetails[0], accessDetails[1]);
            dropbox.oauth = oauth;
            return true;
        }
        else{
            window.localStorage.removeItem(dropbox.htmlAccessStorageKey);
            return false;
        }
    }
    else
        return false;
}


//function to get metadata about folder/file from dropbox
dropbox.getMetadata = function(location,success,failure){
	location = (typeof(location) == 'undefined')? null:location;
	success = (typeof(success) == 'function')? success:dropbox.log;
	failure = (typeof(failure) == 'function')? failure:dropbox.log;
	
	var metaURL = "https://api.dropbox.com/1/metadata/"+ dropbox.accessType + "/";
	if(location){
		metaURL = metaURL+location;
	}
	
	dropbox.oauth.getJSON(metaURL,success,failure);
}

//function to get dropbox AccountInfo
dropbox.getAccountInfo = function(){
	var accountInfoURL = "https://api.dropbox.com/1/account/info";

	dropbox.oauth.getJSON(accountInfoURL,function(data){dropbox.getAccountInfo.Info = data;},
					dropbox.log);

}

//function to get contents of a file from dropbox(not download)
dropbox.getFile = function(path,success,failure){
	
	success = (typeof(success) == 'function')? success:dropbox.log;
	failure = (typeof(failure) == 'function')? failure:dropbox.log;
		
	
	var getURL = "https://api-content.dropbox.com/1/files/"+ dropbox.accessType + "/";
	if(path){
		getURL = getURL+path;
	}
	dropbox.oauth.get(encodeURI(getURL),success,failure);

}

//function to generate download Url of a file from dropbox
dropbox.downloadFile = function(path){
	var getURL = "https://api-content.dropbox.com/1/files/"+ dropbox.accessType + "/";
	if(path){
		getURL = getURL+path;
	}
	var downloadURL = dropbox.signedUrl(getURL,"");
	console.log(downloadURL);
	return downloadURL;
}


// funtion to upload File
dropbox.uploadFile = function(path,fileObj,overwrite,success,failure){
	
        
    path = (typeof(path) == 'undefined')? null:path; //path of folder to upload file
    
    //upload URL
    var uploadURL="https://api-content.dropbox.com/1/files_put/"+ dropbox.accessType + "/";
    if (path!= null && path!=""){
            uploadURL = uploadURL +	path + '/' + fileObj.name;
    }
    else{
        uploadURL = uploadURL + fileObj.name;
    }
    
    success = (typeof(success)=="function")?success:dropbox.log;
    failure = (typeof(success)=="function")?failure:dropbox.log;


    var options = {
           method: 'PUT',
           url: encodeURI(uploadURL),
           success: success,
           failure: failure,
           headers: {
                   "Content-Type": fileObj.mimeType,
                   "Content-length": fileObj.length,
                   "overwrite":overwrite
           },
           data: fileObj.string
    };
    dropbox.oauth.request(options);
	
	
}

//delete URL
dropbox.deletePath = function(path,success,failure){
	
        
    path = (typeof(path) == 'undefined')? null:path; //path of folder to upload file
    success = (typeof(success) == 'function')? success:dropbox.log;
    failure = (typeof(failure) == 'function')? failure:dropbox.log;
	
    //delete URL
    var deleteURL="https://api.dropbox.com/1/fileops/delete";
    
    if (path!= null && path!=""){
        
        var options = {
               method: 'POST',
               url: encodeURI(deleteURL),
               success: success,
               failure: dropbox.log,           
               data: {
                "path":path,
                "root": dropbox.accessType            
               }
            };
        dropbox.oauth.request(options);
    }   
}

// general failure log
dropbox.log = function(data){
	console.log(data);
};


// Get signed oauth url using OAuthSimple Library
dropbox.signedUrl = function(url,argumentsAsString){
	var accessTokenKey = dropbox.oauth.getAccessTokenKey();
	var accessTokenSecret = dropbox.oauth.getAccessTokenSecret();
	var resultUrl =(new OAuthSimple()).sign({path:url,
                                       parameters:argumentsAsString,
                                       signatures:{
                                       'consumer_key':dropbox.consumerKey, 'shared_secret':dropbox.consumerSecret,
					'access_token':accessTokenKey,'access_secret':accessTokenSecret}});
	return resultUrl;
}


dropbox.file = function (id){
    var fileElement = document.getElementById(id);
    
    var fileObj = new Object();    
    fileObj.name = fileElement.files[0].name;
    fileObj.file = fileElement.files[0];
    fileObj.length = fileElement.files[0].size;    
    fileObj.mimeType = fileElement.files[0].type;
    //fileObj.reader = new FileReader();
    //fileObj.reader.readAsBinaryString(fileElement.files[0]);
    return fileObj;
}