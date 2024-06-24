
if (!AspiringStock) {
    var AspiringStock = {};
}


AspiringStock.tickerInfo = {
state: 1,
error: false,
errorReason: "",
loading: false,
ticker: "",
Income: "",
Balance: "",
CashFlow: "",
tickData: "",
datasources: [ AspiringStock.smartmoney],//, // AspiringStock.smartmoney],
currentDataSource: 0,
isFinancialsSupported: 1
};

AspiringStock.getDataSource = function() {
    //console.log("getDataSource: "+AspiringStock.tickerInfo.datasources[AspiringStock.tickerInfo.currentDataSource]);
    return AspiringStock.tickerInfo.datasources[AspiringStock.tickerInfo.currentDataSource];
};

AspiringStock.clearTickerInfo = function() {
    AspiringStock.tickerInfo.error = false;
    AspiringStock.tickerInfo.errorReason = "";
    AspiringStock.tickerInfo.loading = false;
    AspiringStock.tickerInfo.state = 1;
    AspiringStock.tickerInfo.ticker = "";
    AspiringStock.tickerInfo.Income = "";
    AspiringStock.tickerInfo.Balance = "";
    AspiringStock.tickerInfo.CashFlow = "";
    AspiringStock.tickerInfo.tickData = "";
    AspiringStock.tickerInfo.currentDataSource = 0;
}

AspiringStock.buildSheetSave = function() {
    // build sheet data from the tickerInfo as a json object
    // which can be embedded into the spreadsheet
    
    var sheetsave = {};
    sheetsave.numsheets = 4;
    sheetsave.currentid = "sheet1";
    sheetsave.currentname = "data";
    sheetsave.sheetArr = {};
    
    sheetsave.sheetArr.sheet1 = {};
    sheetsave.sheetArr.sheet1.sheetstr = {};
    sheetsave.sheetArr.sheet1.sheetstr.savestr = AspiringStock.tickerInfo.tickData;
    sheetsave.sheetArr.sheet1.name = "data";
    
    sheetsave.sheetArr.sheet2 = {};
    sheetsave.sheetArr.sheet2.sheetstr = {};
    sheetsave.sheetArr.sheet2.sheetstr.savestr = AspiringStock.tickerInfo.Balance;
    sheetsave.sheetArr.sheet2.name = "balance";
    
    sheetsave.sheetArr.sheet3 = {};
    sheetsave.sheetArr.sheet3.sheetstr = {};
    sheetsave.sheetArr.sheet3.sheetstr.savestr = AspiringStock.tickerInfo.Income;
    sheetsave.sheetArr.sheet3.name = "income";
    
    sheetsave.sheetArr.sheet4 = {};
    sheetsave.sheetArr.sheet4.sheetstr = {};
    sheetsave.sheetArr.sheet4.sheetstr.savestr = AspiringStock.tickerInfo.CashFlow;
    sheetsave.sheetArr.sheet4.name = "cashflow";

    //console.log(JSON.stringify(sheetsave));
    
    
    return sheetsave;
    
}

AspiringStock.stripScripts = function(html) {
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


AspiringStock.dumpTable = function(table) {
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

AspiringStock.isNbspRow = function(row) {
    
    for (var i=0; i<row.length; i++) {
        if (row[i] != "&nbsp;") {
            //console.log("nbsp returning false\n "+row[i]);
            return false;
        }
    }
    return true;
}


AspiringStock.convertQuoteDataToSheet = function(obj) {
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


AspiringStock.getQuoteData = function(ticker) {
    // the quote data from YQL (yahoo finance)
    ticker = ticker.replace(".","-");
    var url = "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.quotes%20where%20symbol%20in%20(%22"+ticker.toUpperCase()+"%22)&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys";
    console.log("url is "+url);
    var xhr = $.get(url, {}, function(obj) {
                    //console.log(JSON.stringify(obj));
                    var sheet = AspiringStock.convertQuoteDataToSheet(obj);
                    AspiringStock.tickerInfo.tickData = sheet;
                    console.log(sheet);
                    AspiringStock.updateState(true);
                    }
                    )
    .fail(function(){
          AspiringStock.tickerInfo.errorReason = "Network Error";
          AspiringStock.updateState(false);
          }
          );
    
    
};


AspiringStock.convertTableToSheet = function(table, startrow, numtextrows) {
    // take tabular data, and return sheet data
    var retstr = "version:1.5"+"\n";
    var colnames =  ["A","B","C","D","E","F"];
    var coltype = "t";
    for (var i=0; i<table.length; i++) {
        var row = table[i];
        for (var j=0; j<row.length; j++) {
            var colname = colnames[j];
            if (!colname){
                continue;
            }
            
            
            if (!colname) {
                continue;
            }
            
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

AspiringStock.cleanString = function(s) {
    // clean the white space in the string and also the \ns
    var val= ( s || '' ).replace( /^\s+|\s+$/g, '' );
    //console.log(val);
    val = val.replace(/&amp;/g,'&');
    if(s.indexOf("/ Total Assets") != -1){
        console.log("old: "+s);
        val = val.replace("/ Total","/");
        console.log(s+" is changed to "+val);
    }


    return val;
}



AspiringStock.loadStatement = function(ticker, typ, period) {
    // make the url
    console.log("ticker" + ticker);
    console.log("typ" + typ);
    console.log("period" + period);
    
    url = AspiringStock.getDataSource().getUrl(ticker, typ, period);
    // do an ajax get
    console.log("loadStatement: "+url);
    var xhr = $.get(url, {}, function(text) {
                    //alert(text);
                    var tab = AspiringStock.getDataSource().analyzeStatement(text);
                    
                    console.log("!!!!!!!!!!"+ tab+"!!!!!!!!!"+'\n\n');
                    
                 
                    if (tab == null) {
                    AspiringStock.tickerInfo.errorReason = "Ticker not available. Please re-check the ticker symbol, and write to us at marketing@tickervalue.com.";
                    AspiringStock.updateState(false);
                    return;
                    }
                    // check for financials
                    if (AspiringStock.getDataSource().isFinancials(tab, typ))// &&
                    //		 !(AspiringStock.tickerInfo.isFinancialsSupported)) {
                    {
                    
                    
                    AspiringStock.tickerInfo.errorReason = "Valuation models for financial companies are not supported in this app. To submit a request, please write to us at marketing@tickervalue.com.";
                    AspiringStock.updateState(false);
                    return;
                    }
                    // normalize depending on the source
                    tab = AspiringStock.getDataSource().normalizeTable(tab, typ);
                    if (!tab) {
                    AspiringStock.tickerInfo.errorReason = "Failed to fetch the ticker data. Please try again, or write to us at marketing@tickervalue.com.";
                    AspiringStock.updateState(false);
                    return;
                    }
                    console.log("done analyze ");
                    var sheet = AspiringStock.convertTableToSheet(tab, 2,
                                                             AspiringStock.getDataSource().numtextrows);
                    console.log("got "+typ);
                    AspiringStock.tickerInfo[typ] = sheet;
                    console.log("Done "+typ);
                    AspiringStock.updateState(true);
                    }
                    )
    .fail(function(){
          AspiringStock.tickerInfo.errorReason = "Network error. Please check your internet connection.";
          AspiringStock.updateState(false);
          }
          );
}

AspiringStock.updateState = function(result, timeout) {
    if (!timeout) {
        timeout = 2000;
    }
    console.log("current state"+AspiringStock.tickerInfo.state);
    console.log("fsm updating state "+result)
    if (result) {
        AspiringStock.tickerInfo.loading = false;
        AspiringStock.tickerInfo.state++;
        
        if ($.mobile) {
            $.mobile.loadingMessage = "loading "+AspiringStock.tickerInfo.state*10+"%";
            $.mobile.hidePageLoadingMsg();
            $.mobile.showPageLoadingMsg();
        }
        
    } else {
        // if one data source had a problem, try another
        if ((AspiringStock.tickerInfo.currentDataSource+1) <
            AspiringStock.tickerInfo.datasources.length) {
            console.log("data source  failed");
            AspiringStock.tickerInfo.currentDataSource++;
            console.log("try next data source ");
            // reset the state back to loading the first statement
            AspiringStock.tickerInfo.state = 1;
            
        } else {
            // we have tried all data sources, give up
            console.log("all data sources exhausted");
            AspiringStock.tickerInfo.error = true;
        }
        
    }
    window.setTimeout(AspiringStock.loadStateMachine, timeout);
}

AspiringStock.showAd = function(show) {
//    if (window.plugins) {
//        window.plugins.iAdPlugin.showAd(show);
//    }
}

AspiringStock.loadStateMachine = function(ticker) {
    
    /*
     if (AspiringStock.tickerInfo.error) {
     console.log("ERROR !!");
     // throw a message to the user
     
     */
    
    /*
     if ($.mobile) {
	    $.mobile.hidePageLoadingMsg();
	    $.mobile.loadingMessage = "loading";
     } else {
	    SocialCalc.SpinnerWaitHide();
     }
     */
    
    console.log("loading ticker "+ticker);
    
    /*
     
     if (window.plugins) {
	    window.plugins.Prompt.show(
     "Load failed - " + AspiringStock.tickerInfo.errorReason,
     function(){},
     function(){},
     "nope", // ok button title - not used
     "OK", // cancel button title
     "no"
	    );
     } else {
	    alert("load failed "+ AspiringStock.tickerInfo.errorReason);
     };
     AspiringStock.showAd(false);
     return;
     }
     */
    
    AspiringStock.tickerInfo.loading = true;
    var ticker = AspiringStock.tickerInfo.ticker;
    /*AspiringStock.showAd(true); */
    switch (AspiringStock.tickerInfo.state) {
        case 1:
            console.log("loadStatement: Income");
            AspiringStock.loadStatement(ticker, "Income", "Ann");
            break;
            
        case 2:
            AspiringStock.loadStatement(ticker, "Balance", "Ann");
            break;
            
        case 3:
            AspiringStock.loadStatement(ticker, "CashFlow", "Ann");
            break;
            
        case 4:
            AspiringStock.getQuoteData(ticker);
            break;
            
        case 5:
            AspiringStock.buildAndInsert();
            break;
            
        case 6:
            AspiringStock.recalculateAll("statements");
            break;
            
        case 7:
            AspiringStock.recalculateAll("residual");
            break;
            
        case 8:
            AspiringStock.recalculateAll("fcf");
            break;
            
        case 9:
            AspiringStock.recalculateAll("dashboard");
            break;
            
        case 10:
            AspiringStock.resetActiveButton();
            return;
            
            
    }
}

AspiringStock.buildAndInsert = function() {
    console.log(AspiringStock.tickerInfo.tickData.length);
    console.log(AspiringStock.tickerInfo.Balance.length);
    console.log(AspiringStock.tickerInfo.Income.length);
    console.log(AspiringStock.tickerInfo.CashFlow.length);
    
    var sheetsave = AspiringStock.buildSheetSave();
    //console.log(JSON.stringify(sheetsave));
    SocialCalc.WorkBookControlInsertWorkbook(null, sheetsave);
    
    AspiringStock.updateState(true, 2000);
    
    
};

AspiringStock.loadFinancialStatements = function(ticker) {
    console.log("loading ticker "+ticker);
    AspiringStock.clearTickerInfo();
    console.log("loading ticker "+ticker);
    AspiringStock.tickerInfo.ticker = ticker;
    console.log("loading ticker "+ticker);
    
    /*
     if ($.mobile) {
     $.mobile.showPageLoadingMsg();
     } else {
     SocialCalc.SpinnerWaitCreate();
     }
     */
    
    window.setTimeout(function(){
                      AspiringStock.loadStateMachine(ticker);
                      }, 200);
    
};


AspiringStock.openSecFilings = function() {
    //console.log("hello");
    var tick = SocialCalc.GetCellDataValue("dashboard!B2");
    var path = "http://www.sec.gov/cgi-bin/browse-edgar?type=10-K&count=40&action=getcompany&CIK="+tick;
    //PhoneGap.exec('ChildBrowserCommand.showWebPage',encodeURI(path));
    console.log(path);
};

AspiringStock.recalculateAll = function(sheetname) {
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
        sheetid = "sheet4";
    }
    console.log("statements sheetid is "+sheetid);
    cmd = {cmdtype:"scmd", id:sheetid, cmdstr: cmdstr, saveundo: false};
    control.ExecuteWorkBookControlCommand(cmd, false);
    
    if ((sheetname == "dashboard") || (sheetname=="statements"))
        SocialCalc.WorkBookControlActivateSheet(sheetid);	
    AspiringStock.updateState(true, 1000);
}

AspiringStock.resetActiveButton = function() {
    if ($.mobile) {
        $.mobile.hidePageLoadingMsg();
        AspiringStock.showAd(false);    
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

AspiringStock.switchToDashboard = function() {
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