

Aspiring = {};


//# normalized bs list -- each stmt must contain these rows 
Aspiring.bslist = [
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
Aspiring.islist = [
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
Aspiring.cflist = [
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

Aspiring.getNormalizedList = function(type) {   
    if (type == "Balance") {
        return Aspiring.bslist;
    }
    if (type == "Income") {
        return Aspiring.islist;
    }
    if (type == "CashFlow") {
        return Aspiring.cflist;
    }

}