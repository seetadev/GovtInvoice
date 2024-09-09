
if (!Aspiring) {
    var Aspiring = {};
}


Aspiring.tickerInfo = {
    state: 1,
    error: false,
    errorReason: "",
    loading: false,
    ticker: "",
    rawData: {},
    Income: "",
    Balance: "",
    CashFlow: "",
    tickData: "",
    datasources: [Aspiring.smartmoney, Aspiring.msn],//[Aspiring.smartmoney],//,Aspiring.msn],//, // Aspiring.smartmoney],
    currentDataSource: 0,
    isFinancialsSupported: 1,
    options: null
};

Aspiring.getDataSource = function() {
    return Aspiring.tickerInfo.datasources[Aspiring.tickerInfo.currentDataSource];  
};

Aspiring.clearTickerInfo = function() {
    Aspiring.tickerInfo.error = false;
    Aspiring.tickerInfo.errorReason = "";
    Aspiring.tickerInfo.loading = false;
    Aspiring.tickerInfo.state = 1;
    Aspiring.tickerInfo.ticker = "";
    Aspiring.tickerInfo.Income = "";    
    Aspiring.tickerInfo.Balance = "";
    Aspiring.tickerInfo.CashFlow = "";
    Aspiring.tickerInfo.tickData = "";    
    Aspiring.tickerInfo.currentDataSource = 0;
    Aspiring.tickerInfo.options = null;
    Aspiring.tickerInfo.rawData = {};
}

Aspiring.buildSheetSave = function() {
    // build sheet data from the tickerInfo as a json object
    // which can be embedded into the spreadsheet

    var sheetsave = {};
    sheetsave.numsheets = 4;
    sheetsave.currentid = "sheet1";
    sheetsave.currentname = "data";
    sheetsave.sheetArr = {};

    sheetsave.sheetArr.sheet1 = {};
    sheetsave.sheetArr.sheet1.sheetstr = {};
    sheetsave.sheetArr.sheet1.sheetstr.savestr = Aspiring.tickerInfo.tickData;
    sheetsave.sheetArr.sheet1.name = "data";

    sheetsave.sheetArr.sheet2 = {};
    sheetsave.sheetArr.sheet2.sheetstr = {};
    sheetsave.sheetArr.sheet2.sheetstr.savestr = Aspiring.tickerInfo.Balance;
    sheetsave.sheetArr.sheet2.name = "balance";

    sheetsave.sheetArr.sheet3 = {};
    sheetsave.sheetArr.sheet3.sheetstr = {};
    sheetsave.sheetArr.sheet3.sheetstr.savestr = Aspiring.tickerInfo.Income;
    sheetsave.sheetArr.sheet3.name = "income";

    sheetsave.sheetArr.sheet4 = {};
    sheetsave.sheetArr.sheet4.sheetstr = {};
    sheetsave.sheetArr.sheet4.sheetstr.savestr = Aspiring.tickerInfo.CashFlow;
    sheetsave.sheetArr.sheet4.name = "cashflow";


    return sheetsave;

}

Aspiring.stripScripts = function(html) {
    console.log("in strip scripts")
    var out = html;
    var ind = out.indexOf('<script');
    var ind1 = -1;
    while (ind != -1) {
        ind1 = out.indexOf('/script>');
        if (ind1 == -1) break;
        out = out.slice(0,ind)+out.slice(ind1+8);
        ind = out.indexOf('<script');
    }
    //console.log("returning "+out)
    out = out.replace(/\n/g,"");
    return out;    
}


Aspiring.dumpTable = function(table) {
    var printRow = function(row) {
	var r = "";
	for (var i=0; i<row.length; i++) {
	    r = r+row[i]+" "
	};
	//r = r+'"'+row[0]+'"' + "   :    "; // just print headers
	console.log(r);
    };
    table.forEach(printRow);
}

Aspiring.isNbspRow = function(row) {
    
    for (var i=0; i<row.length; i++) {
	if (row[i] != "&nbsp;") {
	    //console.log("nbsp returning false\n "+row[i]);
	    return false;
	}
    }
    return true;
}


Aspiring.convertQuoteDataToSheet = function(obj) {
    // put the quote data into sheet save format
    var retstr = "version:1.5"+"\n";;
    retstr = retstr+"cell:B3:t:"+"ticker"+"\n";
    retstr = retstr+"cell:C3:t:"+obj.query.results.quote.symbol+"\n";
    retstr = retstr+"cell:B4:t:"+"name"+"\n";
    retstr = retstr+"cell:C4:t:"+obj.query.results.quote.Name+"\n";
    retstr = retstr+"cell:B5:t:"+"Price"+"\n";
    retstr = retstr+"cell:C5:v:"+obj.query.results.quote.LastTradePriceOnly+"\n";
    retstr = retstr+"cell:B6:t:"+"52 Week High"+"\n";
    retstr = retstr+"cell:C6:v:"+obj.query.results.quote.LastTradePriceOnly+"\n";
    retstr = retstr+"cell:B7:t:"+"52 Week Low"+"\n";
    retstr = retstr+"cell:C7:v:"+obj.query.results.quote.LastTradePriceOnly+"\n";
    retstr = retstr+"cell:B8:t:"+"50 day moving avg"+"\n";
    retstr = retstr+"cell:C8:v:"+obj.query.results.quote.FiftydayMovingAverage+"\n";
    retstr = retstr+"cell:B9:t:"+"200 day moving avg"+"\n";
    retstr = retstr+"cell:C9:v:"+obj.query.results.quote.TwoHundreddayMovingAverage+"\n";
    retstr = retstr+"cell:B10:t:"+"Volume"+"\n";
    retstr = retstr+"cell:C10:v:"+obj.query.results.quote.Volume+"\n";
    retstr = retstr+"cell:B11:t:"+"Avg Daily Volume"+"\n";
    retstr = retstr+"cell:C11:v:"+obj.query.results.quote.AverageDailyVolume+"\n";
    //console.log(retstr);
    return retstr;
}


Aspiring.getQuoteData = function(ticker) {
    // the quote data from YQL (yahoo finance)
    ticker = ticker.replace(".","-");
    var url = "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.quotes%20where%20symbol%20in%20(%22"+ticker.toUpperCase()+"%22)&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys";
    console.log("url is "+url);
    var xhr = $.get(url, {}, function(obj) {
              //console.log(JSON.stringify(obj));
	      Aspiring.tickerInfo.rawData["quote"] = obj;
	      var sheet = Aspiring.convertQuoteDataToSheet(obj);
	      Aspiring.tickerInfo.tickData = sheet;
	      console.log(sheet);
	      Aspiring.updateState(true);	      
	  }
	 )
	.fail(function(){
	      Aspiring.tickerInfo.errorReason = "Network Error";
	      Aspiring.updateState(false);
	      }
	     );
    

};


Aspiring.convertTableToSheet = function(table, startrow, numtextrows) {
    // take tabular data, and return sheet data
    var retstr = "version:1.5"+"\n";
    var colnames =  ["A","B","C","D","E","F"];
    var coltype = "t";
    for (var i=0; i<table.length; i++) {
	var row = table[i];
	for (var j=0; j<row.length; j++) {
	    var colname = colnames[j];
	    if (i < numtextrows) {
		coltype = "t";
	    } else {
		if (j == 0) {
		    coltype = "t";
		} else {
		    coltype = "v";
		}
	    }
	    var colval = row[j].replace(/,/g,"");
	    var rowval = startrow+i;
	    retstr = retstr+"cell"+":"+colname+rowval+":"+coltype+":"+colval+"\n";
	}
    }
    //console.log(retstr);
    return retstr;
};

Aspiring.cleanString = function(s) {
    // clean the white space in the string and also the \ns
    var val= ( s || '' ).replace( /^\s+|\s+$/g, '' ); 
    //console.log(val);
    val = val.replace(/&amp;/g,'&');
    return val;
}



Aspiring.loadStatement = function(ticker, typ, period) {
    // make the url
    url = Aspiring.getDataSource().getUrl(ticker, typ, period);
    // do an ajax get
    
    var xhr = $.get(url, {}, function(text) {
              //alert(text);
              var tab = Aspiring.getDataSource().analyzeStatement(text);	  
	      if (tab == null) {
		  Aspiring.tickerInfo.errorReason = "Ticker not available. Please re-check the ticker symbol, and write to us at marketing@tickervalue.com.";
		  Aspiring.updateState(false);
	      	  return;
	      }
	      // check for financials
	      if (Aspiring.getDataSource().isFinancials(tab, typ))// && 
//		 !(Aspiring.tickerInfo.isFinancialsSupported)) {
			{
    

		  Aspiring.tickerInfo.errorReason = "Valuation models for financial companies are not supported in this app. To submit a request, please write to us at marketing@tickervalue.com.";
		  Aspiring.updateState(false);
	      	  return;		  
	      }
	      // normalize depending on the source
	      tab = Aspiring.getDataSource().normalizeTable(tab, typ);
	      if (!tab) {
		  Aspiring.tickerInfo.errorReason = "Failed to fetch the ticker data. Please try again, or write to us at marketing@tickervalue.com.";
		  Aspiring.updateState(false);
		  return;
	      }
	      // save the raw data
	      console.log(JSON.stringify(tab));
	      Aspiring.tickerInfo.rawData[typ] = tab;
	      console.log("done analyze ");
	      var sheet = Aspiring.convertTableToSheet(tab, 2, 
						       Aspiring.getDataSource().numtextrows);
	      console.log("got "+typ);
	      Aspiring.tickerInfo[typ] = sheet;
	      console.log("Done "+typ);
	      Aspiring.updateState(true);	      
	   }
	  )
    .fail(function(){
	      Aspiring.tickerInfo.errorReason = "Network error. Please check your internet connection.";
	      Aspiring.updateState(false);
	  }
	 );
}

Aspiring.updateState = function(result, timeout) {
    if (!timeout) {
	timeout = 2000;
    }
    console.log("fsm updating state "+result);
    if (result) {
	Aspiring.tickerInfo.loading = false;
	Aspiring.tickerInfo.state++;	
	if ($.mobile) {
            $.mobile.loadingMessage = "loading "+Aspiring.tickerInfo.state*10+"%";
	    $.mobile.hidePageLoadingMsg();
	    $.mobile.showPageLoadingMsg();
	}

    } else {
	// if one data source had a problem, try another
	if ((Aspiring.tickerInfo.currentDataSource+1) < 
	    Aspiring.tickerInfo.datasources.length) {
	    console.log("data source  failed");
	    Aspiring.tickerInfo.currentDataSource++;
	    console.log("try next data source ");
	    // reset the state back to loading the first statement
	    Aspiring.tickerInfo.state = 1;
	    
	} else {
	    // we have tried all data sources, give up
	    console.log("all data sources exhausted");
	    Aspiring.tickerInfo.error = true;	    
	}

    }
    window.setTimeout(Aspiring.loadStateMachine, timeout);	
}

Aspiring.showAd = function(show) {
    if (window.plugins) {
	window.plugins.iAdPlugin.showAd(show);
    }
}

Aspiring.loadStateMachine = function() {
    if (Aspiring.tickerInfo.error) {
	console.log("ERROR !!");
	// throw a message to the user
	if ($.mobile) {
	    $.mobile.hidePageLoadingMsg();
	    $.mobile.loadingMessage = "loading";
	} else {
	    SocialCalc.SpinnerWaitHide();	
	}
	if (window.plugins) {
	    window.plugins.Prompt.show(
		"Load failed - " + Aspiring.tickerInfo.errorReason,
		function(){},
		function(){},
		"nope", // ok button title - not used
		"OK", // cancel button title
		"no"
	    );    
	} else {
	    alert("load failed "+ Aspiring.tickerInfo.errorReason);
	};
	Aspiring.showAd(false);	
	return;
    }
    if (Aspiring.tickerInfo.options && 
	Aspiring.tickerInfo.options.finalState < Aspiring.tickerInfo.state) {
	if ($.mobile) {
	    $.mobile.hidePageLoadingMsg();
	    $.mobile.loadingMessage = "loading";
	}  else {
	    SocialCalc.SpinnerWaitHide();	
	}
	Aspiring.tickerInfo.options.callback(Aspiring.tickerInfo);
	return;
    }
    Aspiring.tickerInfo.loading = true;	
    var ticker = Aspiring.tickerInfo.ticker;
    Aspiring.showAd(true);    
    switch (Aspiring.tickerInfo.state) {
	case 1:
	Aspiring.loadStatement(ticker, "Income", "Ann");
	break;

	case 2:
	Aspiring.loadStatement(ticker, "Balance", "Ann");
	break;

	case 3:
	Aspiring.loadStatement(ticker, "CashFlow", "Ann");
	break;

	case 4:
	Aspiring.getQuoteData(ticker);	
	break;

	case 5:
	Aspiring.buildAndInsert();
        break;

        case 6:	
	Aspiring.recalculateAll("statements");
	break;

        case 7:	
	Aspiring.recalculateAll("residual");
	break;

        case 8:	
	Aspiring.recalculateAll("fcf");
	break;

        case 9:	
	Aspiring.recalculateAll("dashboard");
	break;

        case 10:
	Aspiring.resetActiveButton();
	return;


    }
}

Aspiring.buildAndInsert = function() {
    console.log(Aspiring.tickerInfo.tickData.length);    
    console.log(Aspiring.tickerInfo.Balance.length);    
    console.log(Aspiring.tickerInfo.Income.length);    
    console.log(Aspiring.tickerInfo.CashFlow.length);    
    
    var sheetsave = Aspiring.buildSheetSave();
    //console.log(JSON.stringify(sheetsave));
    SocialCalc.WorkBookControlInsertWorkbook(null, sheetsave);

    Aspiring.updateState(true, 2000);

    
};

Aspiring.loadFinancialStatements = function(ticker, opt) {
    console.log("loading ticker "+ticker);
    Aspiring.clearTickerInfo();
    Aspiring.tickerInfo.ticker = ticker;
    Aspiring.tickerInfo.options = opt;

    if ($.mobile) {
	$.mobile.showPageLoadingMsg();
    } else {
	SocialCalc.SpinnerWaitCreate();	
    }
    window.setTimeout(Aspiring.loadStateMachine, 200);	
    
};


Aspiring.openSecFilings = function() {
  //console.log("hello");
  var tick = SocialCalc.GetCellDataValue("dashboard!B2");
  var path = "http://www.sec.gov/cgi-bin/browse-edgar?type=10-K&count=40&action=getcompany&CIK="+tick;
  PhoneGap.exec('ChildBrowserCommand.showWebPage',encodeURI(path)); 
  console.log(path);
};

Aspiring.recalculateAll = function(sheetname) {
    // set the statements sheet to 1 on A1
    console.log("recalculating");
    var cmdstr = "set A1 constant n 1 \n";
    if (sheetname == "fcf") {
	cmdstr = cmdstr + "set E6 constant n 5 \n"
	cmdstr = cmdstr + "set E7 constant n 10.0 \n"
	cmdstr = cmdstr + "set E9 constant n 2.0 \n"
	cmdstr = cmdstr + "set E10 constant n 9.0 \n"
	cmdstr = cmdstr + "set E12 empty \n"
    }
    if (sheetname == "residual") {
	cmdstr = cmdstr + "set D6 constant n 5 \n"
	cmdstr = cmdstr + "set D7 constant n 10.0 \n"
	cmdstr = cmdstr + "set D9 constant n 2.0 \n"
	cmdstr = cmdstr + "set D10 constant n 9.0 \n"
	cmdstr = cmdstr + "set D12 empty \n"
    }

    var control = SocialCalc.GetCurrentWorkBookControl();
    var sheetid = control.workbook.SheetNameExistsInWorkBook(sheetname);
    if (!sheetid) {
	Aspiring.updateState(true, 1000);
	return;
    }
    console.log("statements sheetid is "+sheetid);
    cmd = {cmdtype:"scmd", id:sheetid, cmdstr: cmdstr, saveundo: false};
    control.ExecuteWorkBookControlCommand(cmd, false);  

    if ((sheetname == "dashboard") || (sheetname=="statements"))
	SocialCalc.WorkBookControlActivateSheet(sheetid);	
    Aspiring.updateState(true, 1000);
}

Aspiring.resetActiveButton = function() {
    if ($.mobile) {
	$.mobile.hidePageLoadingMsg();
	Aspiring.showAd(false);    
	$.mobile.loadingMessage = "loading";
        var activate1 = function() {
	    var oldbtn = "footerbtn"+ SocialCalc.oldBtnActive;
	    var newbtn = "footerbtn1";
	    if (oldbtn == newbtn) return;
	    
	    $("#"+newbtn).addClass("ui-btn-active");
	    $("#"+oldbtn).removeClass("ui-btn-active");
	    SocialCalc.oldBtnActive = 1;
	  
	};
	window.setTimeout(activate1, 200);
    } else {
	SocialCalc.SpinnerWaitHide();	
    }
}

Aspiring.switchToDashboard = function() {
    // reset sheet to Dashboard
    var cmdstr = "set A1 text t 1 \n";
    var control = SocialCalc.GetCurrentWorkBookControl();
    var sheetid = "sheet1";
    cmd = {cmdtype:"scmd", id:sheetid, cmdstr: cmdstr, saveundo: false};
    control.ExecuteWorkBookControlCommand(cmd, false);  
  
    if ($.mobile) {
	$.mobile.hidePageLoadingMsg();
        var activate1 = function() {
	    SocialCalc.WorkBookControlActivateSheet("sheet1");	
	    //window.setactivateFooterBtn(1);    
	  
	};
	var oldbtn = "footerbtn"+ SocialCalc.oldBtnActive;
	var newbtn = "footerbtn"+ index;
	
	$("#"+newbtn).addClass("ui-btn-active");
	$("#"+oldbtn).removeClass("ui-btn-active");
	SocialCalc.oldBtnActive = 1;
	window.setTimeout(activate1, 200);
    } else {
	SocialCalc.SpinnerWaitHide();	
	SocialCalc.WorkBookControlActivateSheet("sheet1");	
    }

}

// the following are for compare functionality
Aspiring.compareUpdateRow = function(row, str, rowid) {
    var retstr = str;
    var colnames =  ["A","B","C","D","E","F"];
    var coltype = "constant";
    for (var i=0; i<row.length; i++) {
	if (i==0) {
	    coltype = "text t";
	} else {
	    coltype = "constant n";
	}
	var colval = row[i].replace(/,/g,"");
	retstr = retstr + "set "+colnames[i]+rowid+" "+coltype+" "+colval+" \n";
    }
    return retstr;
}

Aspiring.compareDataPullCallback = function(rawdata) {
    // called when the compare data pull completes or there is a failure
    console.log("data pull completed");
    console.log(JSON.stringify(rawdata));    
    var rowid = 100*rawdata.options.index;
    var str = "";
    // update ticker and quote
    str = str + "set A"+rowid+" text t ticker \n";
    str = str + "set B"+rowid+" text t "+rawdata.rawData["quote"].query.results.quote.symbol+" \n";
    rowid++;
    str = str + "set A"+rowid+" text t quote \n";
    str = str + "set B"+rowid+" constant n "+rawdata.rawData["quote"].query.results.quote.LastTradePriceOnly+" \n";
    rowid++;
    for (var i=0; i<rawdata.rawData["Income"].length; i++) {
	str = Aspiring.compareUpdateRow(rawdata.rawData["Income"][i], str, rowid);
	rowid++;
    }
    for (var i=0; i<rawdata.rawData["Balance"].length; i++) {
	str = Aspiring.compareUpdateRow(rawdata.rawData["Balance"][i], str, rowid);
	rowid++;
    }
    console.log(str);
    var control = SocialCalc.GetCurrentWorkBookControl();
    var sheetid = control.workbook.SheetNameExistsInWorkBook("compare");
    if (!sheetid) {
	alert("sheet not found");
	return;
    }
    console.log("compare sheetid is "+sheetid);
    cmd = {cmdtype:"scmd", id:sheetid, cmdstr: str, saveundo: false};
    control.ExecuteWorkBookControlCommand(cmd, false);  

    alert("in datapull callback");
}

Aspiring.compareTickerPrompt = function(tick, ind) {
    //var tick = prompt("Enter Ticker");
    //alert("ticker is "+tick);
    if ((tick == null) || tick == "") {
	alert("empty ticker");
	return;
    }

    // set the callback
    var opt = {
	callback : Aspiring.compareDataPullCallback,
	finalState: 4,
	index: ind
    };
    // kick off the data-pull
     Aspiring.loadFinancialStatements(tick, opt);

    //

}