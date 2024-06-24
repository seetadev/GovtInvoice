



//----------- graph stuff

SocialCalc.GraphTypesInfo = {

    displayorder: ["verticalbar","horizontalbar","piechart","linechart","scatterchart"],

    verticalbar: {display: "Vertical Bar", func: GraphVerticalBar},
    horizontalbar: {display: "Horizontal Bar", func: GraphHorizontalBar},
    piechart: {display: "Pie Chart", func: MakePieChart},
    linechart: {display: "Line Chart", func: MakeLineChart},
    scatterchart: {display: "Plot Points", func: MakeScatterChart}
};

function GraphOnClick(s, t) {
    
    var name, i;
    var namelist = [];
    var nl = document.getElementById(s.idPrefix+"graphlist");
    s.editor.RangeChangeCallback.graph = UpdateGraphRangeProposal;
    
    for (name in s.sheet.names) {
	namelist.push(name);
    }
    namelist.sort();
    nl.length = 0;
    nl.options[0] = new Option("[select range]");
    for (i=0; i<namelist.length; i++) {
	name = namelist[i];
	nl.options[i+1] = new Option(name, name);
	if (name == s.graphrange) {
            nl.options[i+1].selected = true;
        }
    }
    if (s.graphrange == "") {
	nl.options[0].selected = true;
    }
    
    UpdateGraphRangeProposal(s.editor);
    
    nl = document.getElementById(s.idPrefix+"graphtype");
    nl.length = 0;
    for (i=0; i<SocialCalc.GraphTypesInfo.displayorder.length; i++) {
	name = SocialCalc.GraphTypesInfo.displayorder[i];
	nl.options[i] = new Option(SocialCalc.GraphTypesInfo[name].display, name);
	if (name == s.graphtype) {
            nl.options[i].selected = true;
        }
    }
    if (!s.graphtype) {
	nl.options[0].selected = true;
	s.graphtype = nl.options[0].value;
    }
    
    //SocialCalc.KeyboardFocus();
    
    DoGraph(false,true);
    
    return;
    
}

function UpdateGraphRangeProposal(editor) {
    
    var ele = document.getElementById(SocialCalc.GetSpreadsheetControlObject().idPrefix+"graphlist");
    if (editor.range.hasrange) {
	ele.options[0].text = SocialCalc.crToCoord(editor.range.left, editor.range.top) + ":" +
            SocialCalc.crToCoord(editor.range.right, editor.range.bottom);
    }
    else {
	ele.options[0].text = "[select range]";
    }
    
}

function GraphSetCells() {
    
    var lele, ele;
    var spreadsheet = SocialCalc.GetSpreadsheetControlObject();
    var editor = spreadsheet.editor;
    
    lele = document.getElementById(spreadsheet.idPrefix+"graphlist");
    if (lele.selectedIndex==0) {
	if (editor.range.hasrange) {
            spreadsheet.graphrange = SocialCalc.crToCoord(editor.range.left, editor.range.top) + ":" +
                SocialCalc.crToCoord(editor.range.right, editor.range.bottom);
        }
	else {
            spreadsheet.graphrange = editor.ecell.coord+":"+editor.ecell.coord;
        }
    }
    else {
	spreadsheet.graphrange = lele.options[lele.selectedIndex].value;
    }
    ele = document.getElementById(spreadsheet.idPrefix+"graphrange");
    ele.innerHTML = spreadsheet.graphrange;
    //SocialCalc.KeyboardFocus();
    
    DoGraph(false,false);
    
    return;
    
}

function DoGraph(helpflag,isResize) {
    
    var spreadsheet = SocialCalc.GetSpreadsheetControlObject();
    var editor = spreadsheet.editor;
    
    var gview = spreadsheet.views.graph.element;
    
    var ginfo = SocialCalc.GraphTypesInfo[spreadsheet.graphtype];
    
    var gfunc = ginfo.func;
    
    if (!spreadsheet.graphrange) {
	if (gfunc && helpflag) {
            gfunc(spreadsheet, null, gview, spreadsheet.graphtype, helpflag, isResize);
        }
	else {
            gview.innerHTML = '<div style="padding:30px;font-weight:bold;">Select a range of cells with numeric values to graph '+
		'and use the OK button above to set the range as the graph range.</div>';
        }
	return;
    }
    
    var grange = spreadsheet.graphrange;
    var nrange, rparts;
    
    if (grange && grange.indexOf(":")==-1) { // graphing range is a named range
	nrange = SocialCalc.Formula.LookupName(spreadsheet.sheet, grange || "");
	if (nrange.type != "range") {
            gview.innerHTML = "Unknown range name: "+grange;
            return;
        }
	rparts = nrange.value.match(/^(.*)\|(.*)\|$/);
	grange = rparts[1] + ":" + rparts[2];
    }
    
    var prange = SocialCalc.ParseRange(grange);
    var range = {};
    if (prange.cr1.col <= prange.cr2.col) {
	range.left = prange.cr1.col;
	range.right = prange.cr2.col;
    }
    else {
	range.left = prange.cr2.col;
	range.right = prange.cr1.col;
    }
    if (prange.cr1.row <= prange.cr2.row) {
	range.top = prange.cr1.row;
	range.bottom = prange.cr2.row;
    }
    else {
	range.top = prange.cr2.row;
	range.bottom = prange.cr1.row;
    }
    
    if (gfunc) {
	gfunc(spreadsheet, range, gview, spreadsheet.graphtype, helpflag, isResize);
    }
    
    return;
    
}

function GraphChanged(gtobj) {
    
    var spreadsheet = SocialCalc.GetSpreadsheetControlObject();
    
    spreadsheet.graphtype = gtobj.options[gtobj.selectedIndex].value;
    
    DoGraph(false,false);
    
}

function MinMaxChanged(minmaxobj,index){
    var spreadsheet = SocialCalc.GetSpreadsheetControlObject();
    switch(index){
    case 0:
	spreadsheet.graphMinX = minmaxobj.value;
	break;
    case 1:
	spreadsheet.graphMaxX = minmaxobj.value;
	break;
    case 2:
	spreadsheet.graphMinY = minmaxobj.value;
	break;
    case 3:
	spreadsheet.graphMaxY = minmaxobj.value;
	break;
    }
    
    DoGraph(false,true);
}

function GraphSave(editor, setting) {
    // Format is:
    //    graph:range:[graphrange]:type:[graphtype]:minmax:[minX,maxX,minY,maxY]
    
    var spreadsheet = SocialCalc.GetSpreadsheetControlObject();
    var gtype = spreadsheet.graphtype || "";
    
    var str = "graph:range:"+SocialCalc.encodeForSave(spreadsheet.graphrange)+":type:"+SocialCalc.encodeForSave(gtype);
    str += ":minmax:" + SocialCalc.encodeForSave(spreadsheet.graphMinX + "," + spreadsheet.graphMaxX + "," + spreadsheet.graphMinY + "," + spreadsheet.graphMaxY) + "\n";
    
    return str;
    
}


function GraphLoad(editor, setting, line, flags) {
    
    var spreadsheet = SocialCalc.GetSpreadsheetControlObject();
    var parts, i;
    
    parts = line.split(":");
    
    for (i=1; i<parts.length; i+=2) {
	switch (parts[i]) {
        case "range":
            spreadsheet.graphrange = SocialCalc.decodeFromSave(parts[i+1]);
            break;
        case "type":
            spreadsheet.graphtype = SocialCalc.decodeFromSave(parts[i+1]);
            break;
	case "minmax":
	    var splitMinMax = SocialCalc.decodeFromSave(parts[i+1]).split(",");
	    spreadsheet.graphMinX = splitMinMax[0];
	    document.getElementById("SocialCalc-graphMinX").value = spreadsheet.graphMinX;
	    spreadsheet.graphMaxX = splitMinMax[1];
	    document.getElementById("SocialCalc-graphMaxX").value = spreadsheet.graphMaxX;
	    spreadsheet.graphMinY = splitMinMax[2];
	    document.getElementById("SocialCalc-graphMinY").value = spreadsheet.graphMinY;
	    spreadsheet.graphMaxY = splitMinMax[3];
	    document.getElementById("SocialCalc-graphMaxY").value = spreadsheet.graphMaxY;
	    break;
	}
    }
    
    return true;
    
}


//
// Graphing Functions are called with (spreadsheet, range, gview, gtype, helpflag)
//

function GraphVerticalBar(spreadsheet, range, gview, gtype, helpflag) {
    
    var maxheight, totalwidth, nitems, byrow, maxval, minval, i, cr, cr1, cell, val, extra, eachwidth, str, thisbar;
    var values = [];
    var labels = [];
    
    if (helpflag || !range) {
	str = '<input type="button" value="Hide Help" onclick="DoGraph(false,false);"><br><br>'+
            'This is the help text for graph type: '+SocialCalc.GraphTypesInfo[gtype].display+'.<br><br>'+
            'The <b>Graph</b> tab displays a bar graph of the cells which have been selected '+
            '(either in a single row across or column down). '+
            'If the row above (or column to the left) of the selection has values, those values are used as labels. '+
            'Otherwise the cells value is used as a label. '+
            '<br><br><input type="button" value="Hide Help" onclick="DoGraph(false,false);">';
	
	gview.innerHTML = str;
	
	return;
    }
    
    if (range.left==range.right) { // down
	nitems = range.bottom - range.top + 1;
	byrow = true;
    }
    else {
	nitems = range.right - range.left + 1;
	byrow = false;
    }
    
    str = "";
    
    maxheight = (spreadsheet.height-spreadsheet.nonviewheight)-50;
    totalwidth = spreadsheet.width-30;
    
    minval = null;
    maxval = null;
    
    for (i=0; i<nitems; i++) {
	cr = byrow ? SocialCalc.rcColname(range.left)+(i+range.top) : SocialCalc.rcColname(i+range.left)+range.top;
	cr1 = byrow ? SocialCalc.rcColname(range.left-1 || 1)+(i+range.top) : SocialCalc.rcColname(i+range.left)+(range.top-1 || 1);
	cell = spreadsheet.sheet.GetAssuredCell(cr);
	if (cell.valuetype.charAt(0) == "n") {
            val = cell.datavalue - 0;
            if (maxval==null || maxval<val) maxval = val;
            if (minval==null || minval>val) minval = val;
            values.push(val);
            cell = spreadsheet.sheet.GetAssuredCell(cr1);
            if ((range.right==range.left || range.top==range.bottom) && (cell.valuetype.charAt(0) == "t" || cell.valuetype.charAt(0) == "n")) {
		labels.push(cell.datavalue+"");
	    }
            else {
		labels.push(val+"");
            }
        }
    }
    if(maxval < 0){ maxval = 0; }
    if(minval > 0){ minval = 0; }
    str = '<table><tr><td><canvas id="myBarCanvas" width="500px" height="400px" style="border:1px solid black;"></canvas></td><td><span id="googleBarChart"></span></td></tr></table>';
    gview.innerHTML = str;
    var profChartVals = new Array();
    var profChartLabels = new Array();
    
    var canv = document.getElementById("myBarCanvas");
    var ctx = canv.getContext('2d');
    //deprecated mozTextStyle is used by the laptop's rendering engine
    ctx.mozTextStyle = "10pt bold Arial";
    var maxheight = canv.height - 60;
    totalwidth = canv.width;
    var colors = ["0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f"];
    var barColor= colors[Math.round(Math.random()*14)] + '' + colors[Math.round(Math.random()*14)] + ''+ colors[Math.round(Math.random()*14)]+ '' + colors[Math.round(Math.random()*14)]+ '' + colors[Math.round(Math.random()*14)]+ '' + colors[Math.round(Math.random()*14)];
    ctx.fillStyle = "#" + barColor;
    var colorList = [barColor];
    eachwidth = Math.floor(totalwidth / (values.length || 1))-4 || 1;
    var zeroLine = maxheight * (maxval / (maxval-minval)) + 30;
    ctx.lineWidth = 5;
    ctx.moveTo(0,zeroLine);
    ctx.lineTo(canv.width,zeroLine);
    ctx.stroke();
    var yScale = maxheight / (maxval-minval);
    for (i=0; i<values.length; i++) {
	ctx.fillRect(i*eachwidth,zeroLine-yScale*values[i],eachwidth,yScale*values[i]);
	profChartVals.push(Math.floor((values[i]-minval) * yScale / 3.4));
	profChartLabels.push(labels[i]);
	
	var barColor= colors[Math.round(Math.random()*14)] + '' + colors[Math.round(Math.random()*14)] + ''+ colors[Math.round(Math.random()*14)]+ '' + colors[Math.round(Math.random()*14)]+ '' + colors[Math.round(Math.random()*14)]+ '' + colors[Math.round(Math.random()*14)];
	ctx.fillStyle = "#" + barColor;
	colorList.push(barColor);
    }
    ctx.strokeStyle = "#000000";
    ctx.fillStyle = "#000000";
    if(values[0] > 0){
	ctx.translate(5,zeroLine+22);
    }
    else{
	ctx.translate(5,zeroLine-15);
    }
    ctx.mozDrawText(labels[0]);
    for (i=1; i<values.length; i++){
	if((values[i] > 0)&&(values[i-1] < 0)){
	    ctx.translate(eachwidth,37);
	}
	else{
	    if((values[i] < 0)&&(values[i-1] > 0)){
		ctx.translate(eachwidth,-37);
	    }
	    else{
		ctx.translate(eachwidth,0);
	    }
	}
	ctx.mozDrawText(labels[i]);
    }
    
    //order a Google Charts API image
    var gChart = document.getElementById("googleBarChart");
    var zeroLine = (-1 * minval) * yScale / 340;
    profChartUrl = 'chs=300x250&cht=bvg&chd=t:' + profChartVals.join(",") + "&chxt=x,y&chxl=0:|" + profChartLabels.join("|") + "|&chxr=1," + minval + "," + maxval + "&chp=" + zeroLine + "&chbh=a&chm=r,000000,0," + zeroLine + "," + (zeroLine + 0.005) + "&chco=" + colorList.join("|");
    gChart.innerHTML = '<iframe src="{{ static_url("urlJump.html") }}?img=' + escape(profChartUrl) + '" style="width:315px;height:270px;"></iframe>';
}
function GraphHorizontalBar(spreadsheet, range, gview, gtype, helpflag) {
    
    var maxheight, totalwidth, color, nitems, byrow, maxval, minval, i, cr, cr1, cell, val, extra, eachwidth, str, thisbar;
    var values = [];
    var labels = [];
    
    if (helpflag || !range) {
	str = '<input type="button" value="Hide Help" onclick="DoGraph(false,false);"><br><br>'+
            'This is the help text for graph type: '+SocialCalc.GraphTypesInfo[gtype].display+'.<br><br>'+
            'The <b>Graph</b> tab displays a very simple bar graph representation of the cells currently selected as a range to graph '+
            '(either in a single row across or column down). '+
            'If the range is a single row or column, and if the row above (or column to the left) has values, those values are used as labels. '+
            'Otherwise the cell coordinates are used (e.g., B5). '+
            'This is a very early, minimal implementation for demonstration purposes. '+
            '<br><br><input type="button" value="Hide Help" onclick="DoGraph(false,false);">';
	
	gview.innerHTML = str;
	
	return;
    }
    
    if (range.left==range.right) { // down
	nitems = range.bottom - range.top + 1;
	byrow = true;
    }
    else {
	nitems = range.right - range.left + 1;
	byrow = false;
    }
    
    str = "";
    
    maxheight = (spreadsheet.height-spreadsheet.nonviewheight)-50;
    totalwidth = spreadsheet.width-30;
    minval = null;
    maxval = null;
    
    for (i=0; i<nitems; i++) {
	cr = byrow ? SocialCalc.rcColname(range.left)+(i+range.top) : SocialCalc.rcColname(i+range.left)+range.top;
	cr1 = byrow ? SocialCalc.rcColname(range.left-1 || 1)+(i+range.top) : SocialCalc.rcColname(i+range.left)+(range.top-1 || 1);
	cell = spreadsheet.sheet.GetAssuredCell(cr);
	if (cell.valuetype.charAt(0) == "n") {
            val = cell.datavalue - 0;
            if (maxval==null || maxval<val) maxval = val;
            if (minval==null || minval>val) minval = val;
            values.push(val);
            cell = spreadsheet.sheet.GetAssuredCell(cr1);
            if ((range.right==range.left || range.top==range.bottom) && (cell.valuetype.charAt(0) == "t" || cell.valuetype.charAt(0) == "n")) {
		labels.push(cell.datavalue+"");
            }
            else {
		labels.push(val+"");
            }
        }
    }
    if(maxval < 0){ maxval = 0; }
    if(minval > 0){ minval = 0; }
    str = '<table><tr><td><canvas id="myBarCanvas" width="500px" height="400px" style="border:1px solid black;"></canvas></td><td><span id="googleBarChart"></span></td></tr></table>';
    gview.innerHTML = str;
    var profChartVals = new Array();
    var profChartLabels = new Array();
    
    var canv = document.getElementById("myBarCanvas");
    var ctx = canv.getContext('2d');
    //deprecated mozTextStyle is used by the laptop's rendering engine
    ctx.mozTextStyle = "10pt bold Arial";
    var maxheight = canv.height - 60;
    totalwidth = canv.width;
    var colors = ["0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f"];
    var barColor= colors[Math.round(Math.random()*14)] + '' + colors[Math.round(Math.random()*14)] + ''+ colors[Math.round(Math.random()*14)]+ '' + colors[Math.round(Math.random()*14)]+ '' + colors[Math.round(Math.random()*14)]+ '' + colors[Math.round(Math.random()*14)];
    ctx.fillStyle = "#" + barColor;
    var colorList = [barColor];
    eachwidth = Math.floor(maxheight / (values.length || 1))-4 || 1;
    var zeroLine = totalwidth * (maxval / (maxval-minval)) - 5;
    zeroLine = canv.width - zeroLine + 40;
    ctx.lineWidth = 5;
    ctx.moveTo(zeroLine,0);
    ctx.lineTo(zeroLine,canv.height);
    ctx.stroke();
    var yScale = totalwidth / (maxval-minval) * 4.4/5;
    for (i=0; i<values.length; i++) {
	ctx.fillRect(zeroLine+yScale*values[i],i*eachwidth+30,-1*yScale*values[i],eachwidth);
	profChartVals.push(Math.floor((values[i]-minval) * yScale / 4.4));
	profChartLabels.push(labels[i]);
	var barColor = colors[Math.round(Math.random()*14)] + '' + colors[Math.round(Math.random()*14)] + ''+ colors[Math.round(Math.random()*14)]+ '' + colors[Math.round(Math.random()*14)]+ '' + colors[Math.round(Math.random()*14)]+ '' + colors[Math.round(Math.random()*14)];
	ctx.fillStyle = "#" + barColor;
	colorList.push(barColor);
    }
    ctx.strokeStyle = "#000000";
    ctx.fillStyle = "#000000";
    if(values[0] > 0){
	ctx.translate(zeroLine-22,45);
    }
    else{
	ctx.translate(zeroLine+15,45);
    }
    ctx.mozDrawText(labels[0]);
    for (i=1; i<values.length; i++){
	if((values[i] > 0)&&(values[i-1] < 0)){
	    ctx.translate(-37,eachwidth);
	}
	else{
	    if((values[i] < 0)&&(values[i-1] > 0)){
		ctx.translate(37,eachwidth);
	    }
	    else{
		ctx.translate(0,eachwidth);
	    }
	}
	ctx.mozDrawText(labels[i]);
    }
    
    //order a Google Charts API image
    var gChart = document.getElementById("googleBarChart");
    var zeroLine = (-1*minval) * yScale / (canv.width);
    profChartUrl = 'chs=300x250&cht=bhs&chd=t:' + profChartVals.join(",") + "&chxt=x,y&chxl=1:|" + profChartLabels.reverse().join("|") + "|&chxr=0," + minval + "," + maxval + "&chp=" + zeroLine + "&chbh=a&chm=r,000000,0," + zeroLine + "," + (zeroLine + 0.005) + "&chco=" + colorList.join("|");
    gChart.innerHTML = '<iframe src="urlJump.html?img=' + escape(profChartUrl) + '" style="width:315px;height:270px;"></iframe>';
}

function MakePieChart(spreadsheet, range, gview, gtype, helpflag){
    var maxheight, totalwidth, color, nitems, byrow, maxval, minval, i, cr, cr1, cell, val, extra, eachwidth, str, thisbar;
    var values = [];
    var labels = [];
    var total = 0;
    
    // collect the selected values and labels
    if (range.left==range.right) { // down
	nitems = range.bottom - range.top + 1;
	byrow = true;
    }
    else {
	nitems = range.right - range.left + 1;
	byrow = false;
    }
    
    // find total to be distributed over 2 Pi radians
    for (i=0; i<nitems; i++) {
	cr = byrow ? SocialCalc.rcColname(range.left)+(i+range.top) : SocialCalc.rcColname(i+range.left)+range.top;
	cr1 = byrow ? SocialCalc.rcColname(range.left-1 || 1)+(i+range.top) : SocialCalc.rcColname(i+range.left)+(range.top-1 || 1);
	cell = spreadsheet.sheet.GetAssuredCell(cr);
	if (cell.valuetype.charAt(0) == "n") {
            val = cell.datavalue - 0;
	    total += val;
            values.push(val);
            cell = spreadsheet.sheet.GetAssuredCell(cr1);
            if ((range.right==range.left || range.top==range.bottom) && (cell.valuetype.charAt(0) == "t" || cell.valuetype.charAt(0) == "n")) {
		labels.push(cell.datavalue+"");
            }
            else {
		labels.push(val+"");
            }
        }
    }   
    str = '<table><tr><td><img id="canvImg" style="border:1px solid black;" src=""/><canvas id="myCanvas" style="display:none;" width="500px" height="400px"></canvas></td><td><span id="googleChart"></span></td></tr></table>';
    gview.innerHTML = str;
    var profChartUrl = "";
    var profChartLabels = "";
    
    var canv = document.getElementById("myCanvas");
    var ctx = canv.getContext('2d');
    //deprecated mozTextStyle is used by the laptop's rendering engine
    ctx.mozTextStyle = "10pt Arial";
    var centerX = canv.width/2;
    var centerY = canv.height/2;
    var rad = centerY - 50;
    var textRad = rad * 1.1;
    var lastStart = 0;
    //colors are #000 - #fff
    colors = ["0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f"];
    
    for (i=0; i<values.length; i++) {
	//prepare to draw a piece
	ctx.beginPath();
	ctx.moveTo(centerX,centerY);
	
	// choose a random color (fix so it doesn't change every time the graph is viewed)
	var arcColor= "#" + colors[Math.round(Math.random()*14)] + '' + colors[Math.round(Math.random()*14)] + ''+ colors[Math.round(Math.random()*14)];
	ctx.fillStyle = arcColor;
	
	//set the size of this arc piece in radians
	var arcRads = 2 * Math.PI * (values[i] / total);
	profChartUrl += "," + values[i];
	
	//draw arc
	ctx.arc(centerX,centerY,rad,lastStart,lastStart+arcRads,false);
	ctx.closePath();
	ctx.fill();
	
	//draw label: leftBias gives text more room if it's on the left part of the circle
	ctx.fillStyle = "black";
	var centralRad = lastStart + 0.5 * arcRads;
	var leftBias = 0;
	if((centralRad > 1.5)&&(centralRad < 4.6)){ leftBias = 55; }
	
	ctx.translate(centerX + Math.cos(centralRad) * textRad - leftBias, centerY + Math.sin(centralRad) * textRad);
	//deprecated mozDrawText is needed for the laptop's rendering engine
	ctx.mozDrawText(labels[i] + " (" + Math.round(values[i]/total*100) + "%)");
	//this operation allows canvas to continue drawing
	ctx.translate(-1*centerX - Math.cos(centralRad)*textRad + leftBias,-1*centerY - Math.sin(centralRad) * textRad);
	ctx.fillRect(1,1,1,1);
	ctx.closePath();
	profChartLabels += "|" + labels[i];
	
	//prepare for next arc
	lastStart += arcRads;
    }
    //replace HTML canvas with its PNG image
    var realCanv = document.getElementById("canvImg");
    realCanv.src = canv.toDataURL();
    
    //request a Google Charts API image
    var gChart = document.getElementById("googleChart");
    profChartUrl = 'chs=300x145&cht=p&chd=t:' + profChartUrl.substring(1) + '&chl=' + profChartLabels.substring(1);
    gChart.innerHTML = '<iframe src="urlJump.html?img=' + escape(profChartUrl) + '" style="width:315px;height:270px;"></iframe>';
}

function MakeLineChart(spreadsheet, range, gview, gtype, helpflag, isResize){
    var nitems, byrow, maxval, minval, i, cr, cr1, cell, val, extra, str, maxX, minX;
    var values = [];
    var labels = [];
    var total = 0;
    var colors = ["0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f"];
    var shapes = ["s","o","c"];
    
    // collect the selected values and labels
    if (range.left==range.right) { // down
	nitems = range.bottom - range.top + 1;
	byrow = true;
    }
    else {
	nitems = range.right - range.left + 1;
	byrow = false;
    }
    
    //if the user has set the min/max values, use them
    if(isResize){
	try{ minX = 1 * document.getElementById("SocialCalc-graphMinX").value; }
	catch(e){ minX = null; }
	try{ maxX = 1 * document.getElementById("SocialCalc-graphMaxX").value; }
	catch(e){ maxX = null; }
	try{ minval = 1 * document.getElementById("SocialCalc-graphMinY").value; }
	catch(e){ minval = null; }
	try{ maxval = 1 * document.getElementById("SocialCalc-graphMaxY").value; }
	catch(e){ maxval = null; }
    }
    
    var evenlySpaced = false;
    for (i=0; i<nitems; i++) {
	cr = byrow ? SocialCalc.rcColname(range.left)+(i+range.top) : SocialCalc.rcColname(i+range.left)+range.top;
	cr1 = byrow ? SocialCalc.rcColname(range.left-1 || 1)+(i+range.top) : SocialCalc.rcColname(i+range.left)+(range.top-1 || 1);
	cell = spreadsheet.sheet.GetAssuredCell(cr);
	if (cell.valuetype.charAt(0) == "n") {
            val = cell.datavalue - 0;
            if ((maxval==null || maxval<val) && !isResize){ maxval = val; }
            if ((minval==null || minval>val) && !isResize){ minval = val; }
            values.push(val);
            cell = spreadsheet.sheet.GetAssuredCell(cr1);
            if ((range.right==range.left || range.top==range.bottom) && (cell.valuetype.charAt(0) == "t" || cell.valuetype.charAt(0) == "n")) {
		labels.push(cell.datavalue+"");
		if ((maxX==null || maxX<cell.datavalue) && !isResize){ maxX = cell.datavalue; }
		if ((minX==null || minX>cell.datavalue) && !isResize){ minX = cell.datavalue; }
            }
            else {
		labels.push(cr);
		evenlySpaced = true;
            }
        }
    }
    // create evenly-spaced X values if none were given
    if(evenlySpaced){
	for(var i=0; i<values.length; i++){
	    labels[i] = i;
	}
	if(!isResize){
	    minX = 0;
	    maxX = values.length - 1;
	}
    }
    
    str = '<canvas id="myLineCanvas" style="border:1px solid black;" width="500px" height="400px"></canvas><span id="googleLineChart"></span>';
    gview.innerHTML = str;
    
    // let the user set the min and max for X and Y axes
    if(!isResize){
	document.getElementById("SocialCalc-graphMinX").value = minX;
	spreadsheet.graphMinX = minX;
	document.getElementById("SocialCalc-graphMaxX").value = maxX;
	spreadsheet.graphMaxX = maxX;
	document.getElementById("SocialCalc-graphMinY").value = minval;
	spreadsheet.graphMinY = minval;
	document.getElementById("SocialCalc-graphMaxY").value = maxval;
	spreadsheet.graphMaxY = maxval;
    }
    
    var canv = document.getElementById("myLineCanvas");
    var ctx = canv.getContext('2d');
    //support for 5 distinctly colored lines
    var scaleFactorX = (canv.width - 40) / (maxX - minX);
    var scaleFactorY = (canv.height - 40) / (maxval - minval);
    var lastX = scaleFactorX * (labels[0] - minX) + 20;
    var lastY = scaleFactorY * (values[0] - minval) + 20;
    var profChart = [Math.floor(lastX/canv.width*100),Math.floor(lastY/canv.height*100)];
    var topY = canv.height;
    var drawColor= "#" + colors[Math.round(Math.random()*14)] + '' + colors[Math.round(Math.random()*14)] + '' + colors[Math.round(Math.random()*14)] + '' + colors[Math.round(Math.random()*14)] + '' + colors[Math.round(Math.random()*14)] + '' + colors[Math.round(Math.random()*14)];
    var colorArray = [drawColor.replace("#","")];
    ctx.strokeStyle = drawColor;
    ctx.fillStyle = drawColor;
    ctx.fillRect(lastX-3,topY-lastY-3,6,6);
    ctx.beginPath();
    for (i=1; i<values.length; i++) {
	
	//determine if next X is part of the same line (greater than the last X value)
	if((labels[i] * 1) > (labels[i-1] * 1)){
	    //draw line to the next point
	    ctx.moveTo(lastX,topY-lastY);
	    ctx.lineTo((scaleFactorX * (labels[i] - minX)) + 20, topY-(scaleFactorY * (values[i] - minval) + 20));
	    ctx.stroke();
	}
	else{
	    //start a new line
	    drawColor = "#" + colors[Math.round(Math.random()*14)] + '' + colors[Math.round(Math.random()*14)] + '' + colors[Math.round(Math.random()*14)] + '' + colors[Math.round(Math.random()*14)] + '' + colors[Math.round(Math.random()*14)] + '' + colors[Math.round(Math.random()*14)];
	    ctx.strokeStyle = drawColor;
	    ctx.fillStyle = drawColor;
	    colorArray.push(drawColor.replace("#",""));
	    ctx.beginPath();
	}
	
	//calculate canvas coordinates for next point
	lastX = scaleFactorX * (labels[i] - minX) + 20;
	lastY = scaleFactorY * (values[i] - minval) + 20;
	// draw different shapes
	if((colorArray.length-1)%3 == 0){
	    //square
	    ctx.fillRect(lastX-3,topY-lastY-3,6,6);
	}
	else if((colorArray.length-1)%3 == 1){
	    //circle
	    ctx.beginPath();
	    ctx.arc(lastX,topY-lastY,3,0,Math.PI * 2,false);
	    ctx.fill();
	}
	else{
	    // + sign
	    ctx.fillRect(lastX,topY-lastY-3,2,8);
	    ctx.fillRect(lastX-3,topY-lastY,8,2);
	}
	// update Google chart
	if((labels[i] * 1) > (labels[i-1] * 1)){
	    //add a point to the current line
	    profChart[profChart.length-2] += "," + Math.floor(lastX/canv.width*100);
	    profChart[profChart.length-1] += "," + Math.floor(lastY/canv.height*100);
	}
	else{
	    //add a new line
	    var newIndex = profChart.length;
	    profChart[newIndex] = Math.floor(lastX/canv.width*100);
	    profChart[newIndex+1] = Math.floor(lastY/canv.height*100);
	}
    }
    ctx.stroke();
    //colorMarkings stores the colors of the lines and orders input points to be marked
    var colorMarkings = "&chco=" + colorArray.join(",") + "&chm=";
    for(var i=0;i<colorArray.length;i++){
	if(i%3 == 0){
	    //square
	    colorArray[i] = "s," + colorArray[i] + "," + i + ",-1,6";
	}
	else if(i%3 == 1){
	    //circle
	    colorArray[i] = "o," + colorArray[i] + "," + i + ",-1,6";
	}
	else{
	    // + sign
	    colorArray[i] = "c," + colorArray[i] + "," + i + ",-1,10";
	}	
    }
    colorMarkings += colorArray.join("|");
    if(minval <= 0 && maxval >= 0){
	//draw X=0 axis on both canvas and Google chart
	ctx.beginPath();
	ctx.strokeStyle = "#000000";
	ctx.moveTo(0,canv.height-(scaleFactorY * -1 * minval + 20));
	ctx.lineTo(canv.width,canv.height-(scaleFactorY * -1 * minval + 20));
	ctx.stroke();
	var graphPlace = 1-((canv.height-(scaleFactorY * -1 * minval + 20)) / canv.height);
	colorMarkings += "|r,000000,0," + graphPlace + "," + (graphPlace + 0.005)
    }
    if(minX <= 0 && maxX >= 0){
	//draw Y=0 axis on both canvas and Google chart
	ctx.beginPath();
	ctx.strokeStyle = "#000000";
	ctx.moveTo(scaleFactorX * -1 * minX + 20, 0);
	ctx.lineTo(scaleFactorX * -1 * minX + 20, canv.height);
	ctx.stroke();
	var graphPlace = (scaleFactorX * -1 * minX + 20) / canv.width;
	colorMarkings += "|R,000000,0," + graphPlace + "," + (graphPlace + 0.005)
    }
    var gChart = document.getElementById("googleLineChart");
    //add margin to sides of Google chart
    minX -= (maxX-minX)/23;
    maxX += (maxX-minX)/23;
    minval -= (maxval-minval)/18;
    maxval += (maxval-minval)/18;
    profChartUrl = 'chs=300x250' + colorMarkings + '&cht=lxy&chxt=x,y&chxr=0,' + minX + ',' + maxX + '|1,' + minval + ',' + maxval + '&chd=t:' + profChart.join("|");
    gChart.innerHTML = '<iframe src="urlJump.html?img=' + escape(profChartUrl) + '" style="width:315px;height:270px;"></iframe>';
}

function MakeScatterChart(spreadsheet, range, gview, gtype, helpflag, isResize){
    var nitems, byrow, maxval, minval, i, cr, cr1, cell, val, extra, str, maxX, minX, dotSizes;
    var values = [];
    var labels = [];
    var total = 0;
    var colors = ["0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f"];
    
    // collect the selected values and labels
    if (range.left==range.right) { // down
	nitems = range.bottom - range.top + 1;
	byrow = true;
    }
    else {
	nitems = range.right - range.left + 1;
	byrow = false;
    }
    
    //if the user has set the min/max values, use them
    if(isResize){
	try{ minX = 1 * document.getElementById("SocialCalc-graphMinX").value; }
	catch(e){ minX = null; }
	try{ maxX = 1 * document.getElementById("SocialCalc-graphMaxX").value; }
	catch(e){ maxX = null; }
	try{ minval = 1 * document.getElementById("SocialCalc-graphMinY").value; }
	catch(e){ minval = null; }
	try{ maxval = 1 * document.getElementById("SocialCalc-graphMaxY").value; }
	catch(e){ maxval = null; }
    }
    
    var evenlySpaced = false;
    dotSizes = new Array();
    for (i=0; i<nitems; i++) {
	cr = byrow ? SocialCalc.rcColname(range.left)+(i+range.top) : SocialCalc.rcColname(i+range.left)+range.top;
	cr1 = byrow ? SocialCalc.rcColname(range.left-1 || 1)+(i+range.top) : SocialCalc.rcColname(i+range.left)+(range.top-1 || 1);
	cr2 = byrow ? SocialCalc.rcColname(range.left+1 || 2)+(i+range.top) : SocialCalc.rcColname(i+range.left)+(range.top+1 || 2);
	cell = spreadsheet.sheet.GetAssuredCell(cr);
	if (cell.valuetype.charAt(0) == "n") {
            val = cell.datavalue - 0;
            if ((maxval==null || maxval<val) && !isResize){ maxval = val; }
            if ((minval==null || minval>val) && !isResize){ minval = val; }
            values.push(val);
            cell = spreadsheet.sheet.GetAssuredCell(cr1);
            if ((range.right==range.left || range.top==range.bottom) && (cell.valuetype.charAt(0) == "t" || cell.valuetype.charAt(0) == "n")) {
		labels.push(cell.datavalue+"");
		if ((maxX==null || maxX<cell.datavalue) && !isResize){ maxX = cell.datavalue; }
		if ((minX==null || minX>cell.datavalue) && !isResize){ minX = cell.datavalue; }
            }
            else {
		labels.push(cr);
		evenlySpaced = true;
            }
	    cell = spreadsheet.sheet.GetAssuredCell(cr2);
            if ((range.right==range.left || range.top==range.bottom) && (cell.valuetype.charAt(0) == "t" || cell.valuetype.charAt(0) == "n")) {
		dotSizes.push(cell.datavalue+"");
            }
            else {
		dotSizes.push("5");
            }
        }
    }
    // create evenly-spaced X values if none were given
    if(evenlySpaced){
	for(var i=0; i<values.length; i++){
	    labels[i] = i;
	}
	if(!isResize){
	    minX = 0;
	    maxX = values.length - 1;
	}
    }
    
    str = '<canvas id="myScatterCanvas" style="border:1px solid black;" width="500px" height="400px"></canvas><span id="googleScatterChart"></span>';
    str += '<div id="scatterChartScales"><input type="button" id="autoScaleButton" value="Reset" onclick=""/>X-min:<input id="minPlotX" onchange="" size=5/>X-max:<input id="maxPlotX" onchange="" size=5/>Y-min:<input id="minPlotY" onchange="" size=5/>Y-max:<input id="maxPlotY" onchange="" size=5/></div>';
    gview.innerHTML = str;
    
    // let the user set the min and max for X and Y axes
    if(!isResize){
	document.getElementById("SocialCalc-graphMinX").value = minX;
	spreadsheet.graphMinX = minX;
	document.getElementById("SocialCalc-graphMaxX").value = maxX;
	spreadsheet.graphMaxX = maxX;
	document.getElementById("SocialCalc-graphMinY").value = minval;
	spreadsheet.graphMinY = minval;
	document.getElementById("SocialCalc-graphMaxY").value = maxval;
	spreadsheet.graphMaxY = maxval;
    }
    
    var canv = document.getElementById("myScatterCanvas");
    var ctx = canv.getContext('2d');
    //support for 5 distinctly colored data sets
    var scaleFactorX = (canv.width - 40) / (maxX - minX);
    var scaleFactorY = (canv.height - 40) / (maxval - minval);
    var lastX = scaleFactorX * (labels[0] - minX) + 20;
    var lastY = scaleFactorY * (values[0] - minval) + 20;
    var profChart = [Math.floor(lastX/canv.width*100),Math.floor(lastY/canv.height*100), dotSizes[0] * 10];
    var topY = canv.height;
    var drawColor= "#" + colors[Math.round(Math.random()*14)] + '' + colors[Math.round(Math.random()*14)] + '' + colors[Math.round(Math.random()*14)] + '' + colors[Math.round(Math.random()*14)] + '' + colors[Math.round(Math.random()*14)] + '' + colors[Math.round(Math.random()*14)];
    ctx.fillStyle = drawColor;
    ctx.beginPath();
    ctx.arc(lastX,topY-lastY,dotSizes[0],0,2*Math.PI,false);
    ctx.fill();
    for (i=1; i<values.length; i++) {
	// draw next point
	ctx.moveTo(lastX,topY-lastY);
	lastX = scaleFactorX * (labels[i] - minX) + 20;
	lastY = scaleFactorY * (values[i] - minval) + 20;
	ctx.beginPath();
	ctx.arc(lastX,topY-lastY,dotSizes[i],0,2*Math.PI,false);
	ctx.fill();
	
	// update Google chart
	profChart[profChart.length-3] += "," + Math.floor(lastX/canv.width*100);
	profChart[profChart.length-2] += "," + Math.floor(lastY/canv.height*100);
	profChart[profChart.length-1] += "," + (dotSizes[i] * 10)
    }
    //colorMarkings sets the colors of the data sets
    var colorMarkings = '&chm=o,' + drawColor.replace("#","") + ',0,-1,10';
    if(minval <= 0 && maxval >= 0){
	//draw X=0 axis on both canvas and Google chart
	ctx.beginPath();
	ctx.strokeStyle = "#000000";
	ctx.moveTo(0,canv.height-(scaleFactorY * -1 * minval + 20));
	ctx.lineTo(canv.width,canv.height-(scaleFactorY * -1 * minval + 20));
	ctx.stroke();
	var graphPlace = 1-((canv.height-(scaleFactorY * -1 * minval + 20)) / canv.height);
	colorMarkings += "|r,000000,0," + graphPlace + "," + (graphPlace + 0.005)
    }
    if(minX <= 0 && maxX >= 0){
	//draw Y=0 axis on both canvas and Google chart
	ctx.beginPath();
	ctx.strokeStyle = "#000000";
	ctx.moveTo(scaleFactorX * -1 * minX + 20, 0);
	ctx.lineTo(scaleFactorX * -1 * minX + 20, canv.height);
	ctx.stroke();
	var graphPlace = (scaleFactorX * -1 * minX + 20) / canv.width;
	colorMarkings += "|R,000000,0," + graphPlace + "," + (graphPlace + 0.005)
    }
    var gChart = document.getElementById("googleScatterChart");
    //add margin to sides of Google chart
    minX -= (maxX-minX)/23;
    maxX += (maxX-minX)/23;
    minval -= (maxval-minval)/18;
    maxval += (maxval-minval)/18;
    profChartUrl = 'chs=300x250' + colorMarkings + '&cht=s&chxt=x,y&chxr=0,' + minX + ',' + maxX + '|1,' + minval + ',' + maxval + '&chd=t:' + profChart.join("|");
    gChart.innerHTML = '<iframe src="urlJump.html?img=' + escape(profChartUrl) + '" style="width:315px;height:270px;"></iframe>';
}