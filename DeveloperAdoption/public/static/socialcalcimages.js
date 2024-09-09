var SocialCalc;
var SocialCalc;
if (!SocialCalc) {
	alert("Main SocialCalc code module needed");
	SocialCalc = {};
}
if (!SocialCalc.TableEditor) {
	alert("SocialCalc TableEditor code module needed");
}

SocialCalc.getCellDetails = function (str) {
	var col="";
	var i =-1;
	var char;
	var code = 0;
	while(true) {
		char = str.charCodeAt(++i);
		if(char >=65 && char <=90) {
			code = 26 * code + (char - 64);
			col = col + str.charAt(i);
			}
		else {
			break;
		}
	}
	var row = str.substring(i);
	var arr = [];
	arr.push(code);
	arr.push(parseInt(row));
	arr.push(col);
	arr.push(row);
	return arr;
}

SocialCalc.getRange = function (str) {
	var strarr = str.split(":");
	var arr = [];
	arr.push(SocialCalc.getCellDetails(strarr[0]));
	arr.push(SocialCalc.getCellDetails(strarr[1]));
	var range = [];
	range.push(arr[1][0] - arr[0][0] + 1);
	range.push(arr[1][1] - arr[0][1] + 1);
	return range;
}



SocialCalc.Images = function() {
	this.hieght = 0;
	this.width = 0;
	}

SocialCalc.Images.Insert = function() {
	document.getElementById("EmbedImage").style.display = "inline";
	SocialCalc.CmdGotFocus(document.getElementById('image-embed-range'));
	}

SocialCalc.Images.showImgForm = function(value) {
	var x = value + "ImgForm";
	document.getElementById("localImgForm").style.display = "none";
	document.getElementById("urlImgForm").style.display = "none";
	document.getElementById(x).style.display = "inline";
	if(value = 'url') {
		var txtBox = document.getElementById("imgurl");
		SocialCalc.CmdGotFocus(txtBox);
		}
	document.getElementById("image-embed-submit-button").style.display = "inline";
	document.getElementById("image-embed-cancel-button").style.display = "inline";
	}

SocialCalc.Images.handleFileSelect = function(evt) {
		var files = evt.target.files;
		for (var i = 0, f; f = files[i]; i++) {
			console.log(f);
			if (!f.type.match('image.*')) {
				continue;
				}
			var reader = new FileReader();
			// Need a closure to capture the file information.
			reader.onload = (function(theFile) {
				return function(e) {
					document.getElementById("file-image-holder").src = e.target.result;
					document.getElementById("file-image-holder").style.display = "inline";
					document.getElementById("file-text-holder").style.display = "none";
					var img = document.getElementById('file-image-holder');
					img.setAttribute("class","thumb");
					img.setAttribute("src",e.target.result);
					img.setAttribute("title",theFile.title);
				};
			})(f);
			reader.readAsDataURL(f);	
		}
	}
	
SocialCalc.Images.getUrlImage = function () {
		var str = document.getElementById("imgurl").value;
		document.getElementById("url-image-holder").src = str;
		document.getElementById("url-image-holder").style.display = "inline";
		document.getElementById("url-text-holder").style.display = "none";	
	}

SocialCalc.Images.Embed = function () {
	var ifi = document.getElementById("img-file-inp");
	var fih = document.getElementById("file-image-holder");
	var uih = document.getElementById("url-image-holder");
	var ier = document.getElementById("image-embed-range");
	var imgsource = uih.width!=0?uih:fih; 
	var width = imgsource.width;
	var height = imgsource.width;
	
	var colrange = width/SocialCalc.Constants.defaultColWidth;
	var rowrange = height/20;
	
	var arr = SocialCalc.getRange(ier.value);
	var height = 20 * arr[1];
	var str = '<img src="'+imgsource.src+'" style="height:'+height+'px;"/>';
	
	var spl = ier.value.split(":")[0];
	
	var cmdk="merge "+ier.value+"\n"+"set "+spl+" textvalueformat text-html"+"\n"+"set "+spl+" text t "+str;
	console.log(cmdk);
	
	SocialCalc.ScheduleSheetCommands(workbook.sheetArr[""+SocialCalc.GetCurrentWorkBookControl().currentSheetButton.id+""].sheet,cmdk,true,true) ;
	
	//cleanup
	ifi.value = "";
	fih.src = "";
	fih.style.display = "none";
	uih.src = "";
	ier.value = "";
	uih.style.display = "none";
	document.getElementById("imgurl").value = "";
	document.getElementById("localImgForm").style.display = "none";
	document.getElementById("urlImgForm").style.display = "none";
	document.getElementById("embed-button").style.display = "none";
	document.getElementById("EmbedImage").style.display = "none";
	}

SocialCalc.Images.hideImgForm = function(value) {
	document.getElementById("EmbedImage").style.display = "none";
	}