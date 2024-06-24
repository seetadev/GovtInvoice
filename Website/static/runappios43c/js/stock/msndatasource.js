

if (!AspiringStock) {
  AspiringStock = {};
}

AspiringStock.msn = {
};

AspiringStock.msn.numtextrows = 1;


AspiringStock.msn.isFinancials = function(tab, type) {
    return false;
};


AspiringStock.msn.xbrlmap = {
    "Period End Date"                     : "PeriodEndDate",
    "Period Length"                       : "PeriodLength",
    "Stmt Source"                         : "StmtSource",
    "Stmt Source Date"                    : "StmtSourceDate",
    "Stmt Update Type"                    : "StmtUpdateType",
// balance  sheet
//    "Cash and Short Term Investments" : "CashCashEquivalentsAndShortTermInvestments",
    "Cash and Short Term Investments" : "CashAndEquivalents",
    "Cash & Equivalents" : "CashEquivalents",
    "Short Term Investments" : "ShortTermInvestments",
    "Total Receivables, Net" : "AccountsReceivableNet",
    "Accounts Receivable - Trade, Net" : "AccountsReceivableNet",
    "Accounts Receivable - Trade, Gross" : "AccountsReceivableGross",
    "Provision for Doubtful Accounts" : "ProvisionForDoubtfulAccounts",

    "Total Inventory" : "InventoryNet",
    "Prepaid Expenses" : "PrepaidExpenses",
    "Other Current Assets, Total" : "OtherCurrentAssets",
    "Total Current Assets" : "TotalCurrentAssets",
    "Property/Plant/Equipment, Total - Net" : "PropertyPlantAndEquipmentNet",
    "Goodwill, Net" : "IntangibleAssetsGoodwill",
    "Intangibles, Net" : "IntangibleAssetsExcludingGoodwillNet",
    "Long Term Investments" : "LongTermInvestments",
    "Note Receivable - Long Term" : "NoteReceivableLongTerm",
    "Other Long Term Assets, Total" : "OtherAssetsNoncurrent", 
    "Other Assets, Total" : "OtherAssets",
    " Total Assets" : "Assets",
    "Accounts Payable" : "AccountsPayable",
    "Payable/Accrued" : "AccruedPayable",
    "Accrued Expenses" : "AccruedExpenses",
    "Notes Payable/Short Term Debt" : "ShortTermDebtAmount",
    "Current Port. of LT Debt/Capital Leases" : "CurrentPortionLongTermDebt",
    "Other Current Liabilities, Total" : "OtherSundryLiabilitiesCurrent",
    "Total Current Liabilities" : "LiabilitiesCurrent",
    "Total Long Term Debt" : "LongTermDebt",
    "Long Term Debt" : "LongTermDebtSubItem",
    "Deferred Income Tax" : "DeferredIncomeTaxes",
    "Minority Interest" : "MinorityInterestBalanceSheet",
    "Other Liabilities, Total" : "OtherNoncurrentLiabilities",
    "Total Liabilities" : "TotalLiabilities",
    "Redeemable Preferred Stock" : "RedeemablePreferredStock",
    "Preferred Stock - Non Redeemable, Net" : "NonRedeemablePreferredStock",
    "Common Stock" : "StockholdersEquityClassCommonStock",
    "Additional Paid-In Capital" : "AdditionalPaidCapital",
    "Retained Earnings (Accumulated Deficit)" : "RetainedEarnings",
    "Treasury Stock - Common" : "TreasuryStock",
    "Other Equity, Total" : "OtherEquity",
    "Total Equity" : "TotalEquity",
    "Total Liabilities & Shareholders' Equity" : "LiabilitiesStockholdersEquity",  
    "Total Common Shares Outstanding" : "CommonStockSharesOutstanding",
    "Total Preferred Shares Outstanding" : "PreferredStockSharesOutstanding",
//# income
    "Total Revenue" : "OperatingRevenue",
    "Revenue" : "RevenueSubItem",
    "Other Revenue, Total" : "OtherRevenueTotal",
    "Cost of Revenue, Total" : "CostOfRevenue",
    "Gross Profit" : "GrossProfit",
   // "Selling/General/Administrative Expenses" : "SellingGeneralAndAdministrativeExpense",
    "Selling/General/Administrative Expenses, Total" : "SellingGeneralAndAdministrativeExpense",
    "Research & Development" : "ResearchAndDevelopmentExpense",
    "Depreciation/Amortization" : "DepreciationAndAmortization",
    "Interest Expense (Income), Net Operating" : "TotalInterestExpense",
    "Unusual Expense (Income)" : "OtherUnusualExpense",
    "Other Operating Expenses, Total" : "OtherOperatingExpense",
    "Operating Income" : "OperatingProfit",
    "Interest Income (Expense), Net Non-Operating" : "InterestIncomeExpenseNet",
    "Gain (Loss) on Sale of Assets" : "GainLossOnSaleOfOtherAssets",
    "Other, Net" : "OtherIncomeLossNet",
    "Income Before Tax" : "IncomeLossContinuingOperationsBeforeIncomeTaxes",
    "Income Tax - Total" : "ProvisionIncomeTaxes",
    "Income After Tax" : "IncomeAfterTax",
    "Minority Interest" : "MinorityInterest",
    "Equity In Affiliates" : "InvestmentAffiliates",
    "U.S. GAAP Adjustment" : "UsGaapAdjustment",
    "Net Income Before Extra. Items" : "NetIncomeBeforeExtraItems",
    "Total Extraordinary Items" : "ExtraordinaryItemsGross" ,
    "Net Income" : "NetIncome",
    "Total Adjustments to Net Income" : "AdjustmentsToNetIncome",
    "Preferred Dividends" : "PreferredDividends",
    "General Partners' Distributions" : "GeneralPartnersDistributions",
    "Basic Weighted Average Shares" : "BasicSharesOutstanding",
    "Basic EPS Excluding Extraordinary Items" : "EarningsPerShareBasicExclExtraItems",
    "Basic EPS Including Extraordinary Items" : "EarningsPerShareBasicInclExtraItems",
    "Diluted Weighted Average Shares" : "DilutedSharesOutstanding",
    "Diluted EPS Excluding Extrordinary Items" : "DilutedEarningsPerShareNetIncomeExclExtraItems",
    "Diluted EPS Including Extraordinary Items" : "DilutedEarningsPerShareNetIncomeInclExtraItems",
    "Dividends per Share - Common Stock Primary Issue" : "CashDividendsPaidPerShare",
    "Gross Dividends - Common Stock" : "PaymentsOfDividends",
//#    "Interest Expense, Supplemental" : "SupplementalInterestExpense"
    "Depreciation, Supplemental" : "SupplementalDepreciationAmortization",
    "Normalized EBITDA" : "NormalizedEBITDA",
    "Normalized EBIT" : "NormalizedEBIT",
    "Normalized Income Before Tax" : "NormalizedIncomeBeforeTax",
    "Normalized Income After Taxes" : "NormalizedIncomeAfterTax",
    "Normalized Income Available to Common" : "NormalizedIncomeAvailableToCommonShareholders",
    "Basic Normalized EPS" : "BasicNormalizedEarningsPerShare",
    "Diluted Normalized EPS" : "DilutedNormalizedEarningsPerShare",
    "Amortization of Intangibles" : "AmortizationOfIntangibles",
//# cashflow
    "Net Income/Starting Line" : "NetIncomeStartingLine",
    "Depreciation/Depletion" : "Depreciation",
    "Amortization" : "Amortization",
    "Deferred Taxes" : "DeferredIncomeTaxes",
    "Non-Cash Items" : "NonCashItems",
    "Unusual Items" : "NonCashItems-UnusualItems",
    "Other Non-Cash Items" : "NonCashItems-OtherNonCashItems",
    "Changes in Working Capital" : "ChangesinWorkingCapital",
    "Accounts Receivable" : "ChangesinWorkingCapital-Accounts Receivable",
    "Other Assets" : "ChangesinWorkingCapital-OtherAssets",
    "Other Liabilities" : "ChangesinWorkingCapital-OtherLiabilities",    
    "Cash from Operating Activities" : "NetCashFlowsProvidedUsedOperatingActivities",
    "Capital Expenditures" : "CapitalExpenditures",
    "Purchase of Fixed Assets" : "CapitalExpenditures-PurchaseFixedAssets",
    "Other Investing Cash Flow Items, Total" : "OtherInvestmentCashFlowItems",
    "Acquisition of Business" : "AcquisitionOfBusiness",
    "Sale/Maturity of Investment" : "SaleMaturityOfInvestment",
    "Purchase of Investments" : "PurchaseOfInvestments",
    "Other Investing Cash Flow" : "OtherInvestingCashFlow",
    "Cash from Investing Activities" : "TotalCashInvesting",
    "Financing Cash Flow Items" : "FinancingCashFlowItems",
    "Other Financing Cash Flow" : "OtherFinancingCashFlow",
    "Total Cash Dividends Paid" : "PaymentDividends",
   // "Issuance (Retirement) of Stock, Net" : "IssueRetirementOfCommonStockNet",
    "Issuance (Retirement) of Stock, Net" : "IssueStock",
//    "Issuance (Retirement) of Debt, Net" : "NetIssueRetirementOfDebt",
    "Issuance (Retirement) of Debt, Net" : "RepayDebt",
    "Cash from Financing Activities" : "NetCashFlowsProvidedUsedFinancingActivities",
    "Foreign Exchange Effects" : "ForeignExchangeEffects",
    "Net Change in Cash" : "NetIncreaseDecreaseCashCashEquivalents",
    "Net Cash - Beginning Balance" : "NetCashBeginningBalance",
    "Net Cash - Ending Balance" : "NetCashEndingBalance" 
}


AspiringStock.msn.urlbase = "http://investing.money.msn.com/investments";


AspiringStock.msn.getUrl = function(ticker, type, period) {
    var maptype = { "Income":"/stock-income-statement/",
 		    "Balance":"/stock-balance-sheet/",
		    "CashFlow":"/stock-cash-flow/"
    };
    url = AspiringStock.msn.urlbase+maptype[type]+"?symbol="+ticker+"&stmtView="+period;
    console.log("loading ticker "+ticker);
    console.log("url is:"+url);
    return url;
};

AspiringStock.msn.getTable = function(table) {
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
	    var cols = row.getElementsByTagName('td');
	    for (var j=0; j<cols.length; j++) {
		var col = cols[j];
		var val = "";
		// if there is a span, then decode it
		var spans = col.getElementsByTagName('span');
		if (spans.length > 0) {
	            val = spans[0].innerHTML;
		} else {
		    val = col.innerHTML;
		}
		val = AspiringStock.cleanString(val);
                //normalize later
		//if (j == 0) {
		//    var newval = AspiringStock.xbrlmap[val];
		//    if (newval != null) {
		//       val = newval;	
		//    }
		//}
		r.push(val);
	    }
            // if all cols are nbsp, then skip this row entirely
	    if (AspiringStock.isNbspRow(r) != true) {
		tab.push(r);
	    }
	}
    }

    return tab;
};

AspiringStock.msn.analyzeStatement = function(text) {

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

    // console.log("in 1");
    // walk it to get the table
    tables = tempdiv.getElementsByClassName('ftable');
    //alert(tables.length);
    if (tables.length >=1 ) {
	//alert(tables[1].innerHTML);
	tab = AspiringStock.msn.getTable(tables[1]);
	//console.log("in 2");
	AspiringStock.dumpTable(tab);    
    } else {
	// there is a problem
	// will return null in this case
    }

    // print the table in tabular form
    
    

    return tab;
};

AspiringStock.msn.normalizeTable = function(tab, type) {
// convert the MSN table data into a normalized form
//  
    var map = {};

    for (var i=0; i<tab.length; i++) {
	var ind = AspiringStock.msn.xbrlmap[tab[i][0]];
	if (ind == null) {
	    ind = tab[i][0];
	} else {
	    tab[i][0] = ind;
	}
	map[ind] = tab[i];
	// fix dates in the first row
	if (ind == "PeriodEndDate") {
	    for (var k=1; k<tab[i].length; k++) {
		var slashind = tab[i][k].lastIndexOf("/");
		if (slashind != -1) {
		    map[ind][k] = tab[i][k].slice(slashind+1);
		    console.log(map[ind][k]);		    
		}
	    }
	}
    }

    var canonlist = AspiringStock.getNormalizedList(type);

    var retrows = new Array();
    
    for (var j=0; j<canonlist.length; j++) {
	if (map[canonlist[j]] != null) {
	    retrows.push(map[canonlist[j]]);
	} else {
	    // since this is needed, just fill up with dummy
	    var newrow = new Array();
	    newrow.push(canonlist[j]);
	    for (var k=0;k<tab[0].length-1;k++) {
		newrow.push("0");
	    }
	    retrows.push(newrow);
	}
    }
    return retrows;
};