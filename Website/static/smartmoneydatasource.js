


if (!Aspiring) {
  Aspiring = {};
}

Aspiring.smartmoney = {
};

Aspiring.smartmoney.numtextrows = 1;

Aspiring.smartmoney.xbrlmap = {
};



Aspiring.smartmoney.xbrlmap["Income"] = {
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
"Other After Tax Income"   :     "OtherIncomeLossNet",
"Net Income"   :     "NetIncome",
"Basic Shares Outstanding"   :    "BasicSharesOutstanding",
"Diluted Shares Outstanding"   :    "DilutedSharesOutstanding"
};
Aspiring.smartmoney.xbrlmap["Balance"] = {    
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

Aspiring.smartmoney.xbrlmap["CashFlow"] = {
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

Aspiring.smartmoney.urlbase = "http://www.smartmoney.com/quote/";


Aspiring.smartmoney.getUrl = function(ticker, type, period) {
    var maptype = { "Income":"?story=financials&opt=YI",
 		    "Balance":"?story=financials&opt=YB",
		    "CashFlow":"?story=financials&opt=YC"
    };
    url = Aspiring.smartmoney.urlbase+ticker.toUpperCase()+"/"+maptype[type];
    console.log("loading ticker "+ticker);
    console.log("url is:"+url);
    return url;
};

Aspiring.smartmoney.getTable = function(table) {
    //console.log(table);
    var tab = new Array();
    var rows = table.getElementsByTagName('tr');
    //alert(rows.length);
    if (rows.length < 8) {
	return null;
    }
    for (var i=0; i<rows.length; i++) {
	// if row itself has a table, then skip it ?
	var row = rows[i];
	var innertables = row.getElementsByTagName('table');
	if (innertables.length > 0) {
	    continue;
	} else {
	    // get all the columns
	    var r = new Array();
	    var header = row.getElementsByTagName('th');
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
			//continue;
		    }
		}
	    }
	    col0 = Aspiring.cleanString(col0);
	    if ((col0 == "&nbsp;") && (tab.length == 0)) {
		col0 = "Period End Date";
	    }
	    var cols = row.getElementsByTagName('td');
	    if (cols.length <= 1) {
		// skip it
		continue;
	    } else {
		if (col0 != "") {
		    r.push(col0);
		} else {
		    continue;
		}
	    }
	    for (var j=0; j<cols.length; j++) {
		var col = cols[j];
		var val = "";
		// if there is a span, then decode it
		var spans = col.getElementsByTagName('strong');
		if (spans.length > 0) {
	            val = spans[0].innerHTML;
		} else {
		    val = col.innerHTML;
		}
		val = Aspiring.cleanString(val);
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
	    if (Aspiring.isNbspRow(r) != true) {
		tab.push(r);
	    }
	}
    }

    return tab;
};

Aspiring.smartmoney.analyzeStatement = function(text) {

    var tab = null;
    // strip out scripts
    text = Aspiring.stripScripts(text);
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

    // console.log("in 1");
    // walk it to get the table
    tables = tempdiv.getElementsByClassName('smData');
    //alert(tables.length);
    if (tables.length >=1 ) {
	//alert(tables[0].innerHTML);
	tab = Aspiring.smartmoney.getTable(tables[0]);
	//console.log("in 2");
    } else {
	// there is a problem
	// will return null in this case
    }

    // print the table in tabular form
    

   // Aspiring.dumpTable(tab);    

    return tab;
};

Aspiring.smartmoney.isFinancials = function(tab, type) {
    console.log("in Financials "+type+","+tab[1][0])
    if (type == "Income" && tab[2][0].indexOf("Interest Income") != -1) {
	return true;
    }
    //if (type == "Balance" && tab[1][0].indexOf("Interest Income") != -1) {
    //	return true;
    //}

    return false;
}

Aspiring.smartmoney.normalizeTable = function(tab, type) {
// convert the table data into a normalized form
//  

    //return tab;


    var map = {};

    //for (var i=0; i<tab.length; i++) {
    //	console.log(tab[i][0]);
    //}
    var missedcount = 0;
    var typedtable = Aspiring.smartmoney.xbrlmap[type];
    
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
    var canonlist = Aspiring.getNormalizedList(type);

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

