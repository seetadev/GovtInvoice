

AspiringStock = {};


//# normalized bs list -- each stmt must contain these rows 
AspiringStock.bslist = [
"PeriodEndDate",
"CashAndEquivalents",
"AccountsReceivableNet",
"InventoryNet",
"TotalCurrentAssets",
"PropertyPlantAndEquipmentNet",
"IntangibleAssets",
"Assets",
"AccountsPayable",
"ShortTermDebtAmount",
"OtherSundryLiabilitiesCurrent",
"LiabilitiesCurrent",
"LongTermDebt",
"TotalLiabilities",
"RetainedEarnings",
"TotalEquity",
"LiabilitiesStockholdersEquity"
];

//#normalized income stmt list
AspiringStock.islist = [
"PeriodEndDate",
"OperatingRevenue",
"CostOfRevenue",
"GrossProfit",
"SellingGeneralAndAdministrativeExpense",
"ResearchAndDevelopmentExpense",
"DepreciationAndAmortization",
"TotalInterestExpense",
"OperatingProfit",
"ProvisionIncomeTaxes",
"NetIncome",
"BasicSharesOutstanding",
"DilutedSharesOutstanding"
];

//#normalized income stmt list
AspiringStock.cflist = [
"PeriodEndDate",
"NetIncomeStartingLine",
"Depreciation",
"ChangesinWorkingCapital",
"NetCashFlowsProvidedUsedOperatingActivities",
"CapitalExpenditures",
"AcquisitionOfBusiness",
"TotalCashInvesting",
"PaymentDividends",
"IssueStock",
"RepurchaseStock",
"IssueDebt",
"RepayDebt",
"NetCashFlowsProvidedUsedFinancingActivities",
"NetIncreaseDecreaseCashCashEquivalents"


];

AspiringStock.getNormalizedList = function(type) {   
    if (type == "Balance") {
        return AspiringStock.bslist;
    }
    if (type == "Income") {
        return AspiringStock.islist;
    }
    if (type == "CashFlow") {
        return AspiringStock.cflist;
    }

}