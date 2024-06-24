
AspiringStock.tickerserver = "http://ec2-184-72-21-60.us-west-1.compute.amazonaws.com/ticker";

AspiringStock.insertTickerIntoWorkbook = function(msg) {
    // load the 3 sheets into the workbook
    var control = SocialCalc.GetCurrentWorkBookControl();
    SocialCalc.WorkBookControlInsertWorkbook(msg);
}

AspiringStock.insertTickDataIntoWorkbook = function(data) {
    // this is osv specific
    var control = SocialCalc.GetCurrentWorkBookControl();
    var cmdstr="set B3 text t ticker"+"\n"+"set C3 text t "+data["ticker"]+"\n"+
    "set B5 text t price"+"\n"+"set C5 value n "+data["price"]+"\n"+
    "set B6 text t 52 Week High"+"\n"+"set C6 value n "+data["52_week_high"]+"\n"+
    "set B7 text t 52 Week Low"+"\n"+"set C7 value n "+data["52_week_low"]+"\n"+
    "set B8 text t 50 day moving avg"+"\n"+"set C8 value n "+data["50day_moving_avg"]+"\n"+
    "set B9 text t 200 day moving avg"+"\n"+"set C9 value n "+data["200day_moving_avg"]+"\n"+
    "set B10 text t Volume"+"\n"+"set C10 value n "+data["volume"]+"\n"+
    "set B11 text t Avg. Daily Volume"+"\n"+"set C11 value n "+data["avg_daily_volume"]+"\n"+
    "set B12 text t Short Ratio"+"\n"+"set C12 value n "+data["short_ratio"]+"\n";
    
    cmd = {cmdtype:"scmd", id:"sheet6", cmdstr: cmdstr, saveundo: false};
    control.ExecuteWorkBookControlCommand(cmd, false);
    
    console.log("start recalculate all");
    SocialCalc.WorkBookRecalculateAll();
    
}



AspiringStock.loadTickerOk = function(ticker) {
    
    ticker = ticker.replace("-",".");
    console.log("ticker is: "+ticker);
    AspiringStock.loadFinancialStatements(ticker);
    return;
    //alert(ticker);
    //return;
    
    if (ticker == '') { alert('empty ticker'); return false;}
    
    var message = {}
    message.ticker = ticker.toUpperCase()
    
    //alert(message.ticker)
    
    //$.mobile.showPageLoadingMsg();
    $.postJSON(AspiringStock.tickerserver, message, function(response) {
               if (response["result"] == "fail") {
               alert("ticker data not found");
               return;
               }
               //SocialCalc.SpinnerWaitCreate();
               msg = response["data"]
               tickdata = response["tick"]
               //alert(msg)
               AspiringStock.insertTickerIntoWorkbook(msg)
               AspiringStock.insertTickDataIntoWorkbook(tickdata)
               //alert(player.idInSession)
               if (player.idInSession == "1") {
               SocialCalc.Callbacks.broadcast('snapshot', {
                                              to: "all",
                                              snapshot: SocialCalc.WorkBookControlSaveSheet()
                                              });
               }
               
               });
    return false;
};



AspiringStock.loadTicker = function() {
    
    
    /*
     window.plugins.Prompt.show(
     "Enter Ticker",
     AspiringStock.loadTickerOk,
     saveAsCancel,
     "Submit", // ok button title (optional)
     "Cancel", // cancel button title (optional)
     "yes"
     );
     
     */
    
    
    window.plugins.messageBox.prompt({title: 'Load Ticker', message: 'Enter Ticker'}, function(button, value) {
                                     var args = Array.prototype.slice.call(arguments, 0);
                                     if(button == 'ok'){
                                     console.log("save as success");
                                     AspiringStock.loadTickerOk(value);
                                     }
                                     else{
                                     //                                     alert("Cancelled");
                                     saveAsCancel();
                                     }
                                     //                                 console.log("button : "+button);
                                     //                                     console.log("1- "+JSON.stringify(args)[0]+"2- "+JSON.stringify(args)[1]);
                                     //                                   console.log("messageBox.prompt:" + JSON.stringify(args));
                                     });
    
    
    
};

YAHOO = {
Finance: {
SymbolSuggest: {}
}
};


$(document).on("pagebeforehide", '#tickersearchPage', function(){ $("input#tickerSearch").autocomplete("close")});

$(document).on("pagecreate", '#tickersearchPage', function(){ $("input#tickerSearch").autocomplete({
                         source: function( request, response ) {
                         var dataUrl = "http://d.yimg.com/autoc.finance.yahoo.com/autoc?query=";
                         dataUrl = dataUrl + request.term;
                         dataUrl = dataUrl + "&callback=YAHOO.Finance.SymbolSuggest.ssCallback";
                         console.log(dataUrl);
                         YAHOO.Finance.SymbolSuggest.ssCallback = function(data){
                         console.log(data);
                         var resultArr = data.ResultSet.Result;
                         response( $.map( resultArr, function( item ) {
                                         return {
                                         label: item.name+':'+item.symbol,
                                         value: item.symbol
                                         }
                                         }));
                         };
                         $.ajax({url:dataUrl,
                                dataType:"jsonp",
                                jsonp:"callback",
                                jsonpCallback: "YAHOO.Finance.SymbolSuggest.ssCallback",
                                });                    
                         },
                         minLength: 2,
                         });      
});



AspiringStock.twitterShare = function() {
    //console.log("hello");
    var tick = SocialCalc.GetCellDataValue("dashboard!B2");
    var path = "http://twitter.com/share?text=I am doing the valuation of $"+tick+" &via=AspiringStockInvestments&related=AspiringStockInvestment";
    cordova.exec('ChildBrowserCommand.showWebPage',encodeURI(path));
    console.log(path);
};

AspiringStock.buySellThesis = function() {
    //console.log("hello");
    //var tick = SocialCalc.GetCellDataValue("dashboard!B2");
    //var path = "http://www.sec.gov/cgi-bin/browse-edgar?type=10-K&count=40&action=getcompany&CIK="+tick;
    
    var strPath = String(window.location); 
    var path = strPath.substr(0,strPath.lastIndexOf("/")); 
    cordova.exec('ChildBrowserCommand.showWebPage',encodeURI(path + '/buysell.html'));
};
