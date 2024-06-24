


if (!AspiringStock) {
    AspiringStock = {};
}

AspiringStock.smartmoney = {
};

AspiringStock.smartmoney.numtextrows = 1;

AspiringStock.smartmoney.xbrlmap = {
};



AspiringStock.smartmoney.xbrlmap["Income"] = {
    //income
    "Period End Date"                     : "PeriodEndDate",
    "Sales/Revenue"   :     "OperatingRevenue",
    "Cost of Goods Sold"   :    "CostOfRevenue",
    "Gross Income"   :    "GrossProfit",
    "SG&A Expense"   :   "SellingGeneralAndAdministrativeExpense",
    "Research & Development"   :    "ResearchAndDevelopmentExpense",
    "Depreciation & Amortization"   :    "DepreciationAndAmortization",
    "Pretax Income"   :    "OperatingProfit",
    "Gross Interest Expense"   :    "TotalInterestExpense",
    "Income Tax"   :    "ProvisionIncomeTaxes",
    "Other After Tax Income (Expense)"   :     "OtherIncomeLossNet",
    "Net Income"   :     "NetIncome",
    "Basic Shares Outstanding"   :    "BasicSharesOutstanding",
    "Diluted Shares Outstanding"   :    "DilutedSharesOutstanding"
};
AspiringStock.smartmoney.xbrlmap["Balance"] = {
    //balance
    "Period End Date"                     : "PeriodEndDate",
    "Cash & Short Term"   :    "CashAndEquivalents",
    "Accounts Receivables, Net"   :    "AccountsReceivableNet",
    "Inventories"   :    "InventoryNet",
    "Total Current Assets"   :    "TotalCurrentAssets",
    "Net Property, Plant & Equipment"   :    "PropertyPlantAndEquipmentNet",
    "Intangible Assets"   :    "IntangibleAssets",
    "Total Assets"   :   "Assets",
    "Accounts Payable"   :    "AccountsPayable",
    "ST Debt"   :     "ShortTermDebtAmount",
    "Other Current Liabilities"   :   "OtherSundryLiabilitiesCurrent",
    "Total Current Liabilities"   :  "LiabilitiesCurrent",
    "Long-Term Debt"   :    "LongTermDebt",
    "Total Liabilities"   :    "TotalLiabilities",
    "Retained Earnings"   :    "RetainedEarnings",
    "Total Equity"   :    "TotalEquity",
    "Liabilities & Shareholder"   :     "LiabilitiesStockholdersEquity"
};

AspiringStock.smartmoney.xbrlmap["CashFlow"] = {
    //cashflow
    "Period End Date"                     : "PeriodEndDate",
    "Net Income"   :   "NetIncomeStartingLine",
    "Depreciation and Depletion"   :    "Depreciation",
    "Changes in Working Capital" : "ChangesinWorkingCapital",
    "Net Operating Cash Flow"   :  "NetCashFlowsProvidedUsedOperatingActivities",
    "Capital Expenditures (Fixed"   :   "CapitalExpenditures",
    "Acquisitions"   :    "AcquisitionOfBusiness",
    "Net Investing Cash Flow"   :  "TotalCashInvesting",
    "Cash Dividends Paid"   :   "PaymentDividends",
    "Sale of Common"   :    "IssueStock",
    "Repurchase of Common"   :    "RepurchaseStock",
    "Issuance of Long-Term Debt"   :   "IssueDebt",
    "Reduction in Long-Term Debt"   :  "RepayDebt",
    "Net Financing Cash Flow"   :  "NetCashFlowsProvidedUsedFinancingActivities",
    "Net Change in Cash"   :   "NetIncreaseDecreaseCashCashEquivalents"
};

AspiringStock.smartmoney.urlbase = "http://www.marketwatch.com/investing/stock/";

AspiringStock.smartmoney.getUrl = function(ticker, type, period) {
    var maptype = { "Income":"financials/index.html",
        "Balance":"financials/balance-sheet/",
        "CashFlow":"financials/cash-flow/"
    };
    url = AspiringStock.smartmoney.urlbase+ticker.toLowerCase()+"/"+maptype[type];
    console.log("loading ticker "+ticker);
    console.log("url is:"+url);
    return url;
};

AspiringStock.smartmoney.getTable = function(table) {
    /*for(var i=0; i<table.rows.length; i++){
     console.log(table.rows.item(i).innerHTML);
     
     }*/
    
    
    //    console.log(table);
    var tab = new Array();
    var rows = table.rows;
    console.log(rows.length);
    //alert(rows.length);
    if (rows.length < 8) {
        return null;
    }
    for (var i=0; i<table.rows.length; i++) {
        // if row itself has a table, then skip it ?
        var row = table.rows.item(i);
        console.log("row is : "+row);
        console.log("data is : "+row.innerHTML);
        //        console.log("cells are : "+table.rows.item(i).getElementsByTagName("td")[0].innerText);
        
        
        var innertables = row.getElementsByTagName('table');
        console.log(innertables);
        if (innertables.length > 0) {
            continue;
        } else {
            // get all the columns
            var r = new Array();
            var header = row.getElementsByTagName('th');
            console.log("header :" +header.length);
            var col0 = "";
            if (header.length == 1) {
                var divs = header[0].getElementsByTagName('div');
                if (divs.length > 0) {
                    col0 = divs[0].innerHTML;
                } else {
                    // check for strong
                    //console.log("check for strong "+header[0].innerHTML)
                    var strongs = header[0].getElementsByTagName('strong');
                    if (strongs.length > 0) {
                        col0 = strongs[0].innerHTML;
                    } else {
                        col0 = header[0].innerHTML;
                        continue;
                    }
                }
            }
            console.log("finished checking for strong and stuff - ");
            col0 = AspiringStock.cleanString(col0);
            if ((col0 == "") && (tab.length == 0)) {
                console.log("1st cell is "+ col0);
                col0 = "Period End Date";
                r.push(col0);
                for(var k =1; k < header.length; k++)
                {
                    console.log("@@@@@@@ : "+k);
                    var val0 = "";
                    col0 =header[k];
                    console.log("@@@@@@@ : "+val0);
                    
                    
                    var spans0 = col0.getElementsByTagName('strong');
                    
                    if (spans0.length > 0) {
                        console.log("span exists!!!!!!!!");
                        val0 = spans0[0].innerHTML;
                    } else {
                        if(col0.className == "rowTitle"){
                            val0 = col0.innerText;
                            
                            console.log("not stored full "+col0.innerText);
                        }
                        else if(col0.className == "miniGraphCell"){
                            val0 = "graph";
                            console.log(val0 +" was there in this cell");
                            
                        }
                        else{
                            val0 = col0.innerHTML;
                        }
                    }
                    r.push(val0);
                    
                }
                //            continue;
            }
            var cols = row.getElementsByTagName('td');
            //        console.log("no of cells in the row : "+cols.length);
            
            /*
             if (cols.length <= 1) {
             // skip it
             continue;
             } else {
             if (col0 != "") {
             //   r.push(col0);
             } else {
             //    continue;
             }
             }*/
            for (var j=0; j<cols.length; j++) {
                console.log("this is "+j+"th cell");
                var col = cols[j];
                var val = "";
                // if there is a span, then decode it
                console.log("each cell : "+col.innerHTML);
                var spans = col.getElementsByTagName('span');
                var divs = col.getElementsByTagName('div');
                
                
                if(col.className == "rowTitle"){
                    console.log("not stored full "+col.innerText);
                    val = col.innerText;
                }
                else if(col.className == "miniGraphCell"){
                    val = "graph";
                    console.log(val +" was there in this cell");
                    
                }
                else if(col.className == "valueCell"){
                    val = col.innerText;
                    var t = val.charAt(val.length-1);
                    
                    val = val.substring(0, (val.length-1));
                    if(t==')'){
                        t = val.charAt(val.length-1);
                        
                        val = "-"+val.substring(1, (val.length-1));
                    }
                    
                    if(t == 'B'){
                        var value = parseFloat(val);
                        value = value*1000000000;
                        val = ""+value;
                    }
                    else if(t == 'M'){
                        var value = parseFloat(val);
                        value = value*1000000;
                        val = ""+value;
                    }
                    
                    /*
                     if(val.charAt(val.length-1)=='B'){
                     val = val.substring(0, (val.length-1));
                     val = parseFloat(val);
                     val = val*10000000;
                     
                     }
                     */
                    //console.log(val +" was there in this cell");
                    
                }
                else if (spans.length > 0) {
                    console.log("span exists!!!!!!!!");
                    val = spans[0].innerText;
                    // console.log();
                }
                else if (divs.length > 0) {
                    console.log("div exists!!!!!!!!");
                    val = divs[0].innerText;
                    // console.log();
                }
                else {
                    val = col.innerHTML;
                    
                }
                val = AspiringStock.cleanString(val);
                console.log(val);
                if (tab.length == 0) {
                    // this is for the first row
                    var index = val.indexOf("Ending");
                    if (index != -1) {
                        val = val.substr(index+7);
                    }
                    if (val.indexOf("NA") != -1) {
                        val = "";
                    }
                }
                // this is if there is no value
                if (val.indexOf("NA") != -1) {
                    val = "0";
                }
                r.push(val);
            }
            // if all cols are nbsp, then skip this row entirely
            if (AspiringStock.isNbspRow(r) != true) {
                tab.push(r);
                console.log("tab stuff : "+tab);
            }
        }
    }
    console.log("this is the tab array : "+tab);
    
    return tab;
};

AspiringStock.smartmoney.analyzeStatement = function(text) {
    console.log("text "+text);
    var tab = null;
    // strip out scripts
    text = AspiringStock.stripScripts(text);
    
    //alert(text);
    //console.log(text);
    
    // load into a div in dom
    
    var tempdiv = document.getElementById("tickAnalyzerDiv");
    if (tempdiv == null) {
        console.log("creating div")
        tempdiv = document.createElement("div");
        tempdiv.id = "tickAnalyzerDiv";
        tempdiv.style.display = "none";
    }
    
    tempdiv.innerHTML = text;
    //console.log("tempdiv: "+tempdiv.innerHTML);
    // console.log("in 1");
    // walk it to get the table
    tables = tempdiv.getElementsByClassName('crDataTable');
    console.log("need lots of text here...."+tables[0]);
    
    //alert(tables.length);
    if (tables.length >=1 ) {
        //alert(tables[0].innerHTML);
        tab = AspiringStock.smartmoney.getTable(tables[0]);
        for(var l=1; l<tables.length; l++){
            tab = tab.concat(AspiringStock.smartmoney.getTable(tables[l]));
        }
        
        //console.log("in 2");
    } else {
        // there is a problem
        // will return null in this case
    }
    
    // print the table in tabular form
    
    
    // AspiringStock.dumpTable(tab);
    console.log("returning ..");
    
    return tab;
};

AspiringStock.smartmoney.isFinancials = function(tab, type) {
    console.log("in Financials "+type+","+tab[1][0]);
    if (type == "Income" && tab[1][0].indexOf("Interest Income") != -1) {
        console.log("if statement returns true");
        return true;
    }
    //if (type == "Balance" && tab[1][0].indexOf("Interest Income") != -1) {
    //	return true;
    //}
    
    //  return false;
    return false;
}

AspiringStock.smartmoney.normalizeTable = function(tab, type) {
    // convert the table data into a normalized form
    //  
    
    //return tab;
    
    
    var map = {};
    
    //for (var i=0; i<tab.length; i++) {
    //	console.log(tab[i][0]);
    //}
    var missedcount = 0;
    var typedtable = AspiringStock.smartmoney.xbrlmap[type];
    
    for (var j in typedtable) {	
        for (var i=0; i<tab.length; i++) {
            if (tab[i][0].indexOf(j) != -1) {
                //console.log("found "+j);
                tab[i][0] = typedtable[j];
                map[typedtable[j]] = tab[i];
                break;
            }
        }
        if (i == tab.length) {
            //alert("did not find "+j);
            //return null;
            missedcount = missedcount + 1;
        }
    }
    
    if (missedcount > 3) return null;
    //console.log(JSON.stringify(map));
    console.log("missed count is:"+missedcount);
    var canonlist = AspiringStock.getNormalizedList(type);
    
    var retrows = new Array();
    
    for (var j=0; j<canonlist.length; j++) {
        if (map[canonlist[j]] != null) {
            retrows.push(map[canonlist[j]]);
        } else {
            //alert(canonlist[j]+" not found");
            //return null;
            // since this is needed, just fill up with dummy
            var newrow = new Array();
            newrow.push(canonlist[j]);
            for (var k=0;k<tab[0].length-1;k++) {
                newrow.push("0");
            }
            retrows.push(newrow);
        }
    }
    //console.log(JSON.stringify(retrows));
    return retrows;
};

