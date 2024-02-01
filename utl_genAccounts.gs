// This function generates the gAccounts sheet based on the actMngr configuration. 
// It is also smart enough to capture and rewrite the old initial account values if 
// they were there previously, so regenerating can be done safely.
function generate_gAccounts(actMngr){

  // Delete the existing sheet if it exists and insert a new one but get the initial balances and manual balances first.
  var initValues = -1;
  var manualValues = -1;
  try {
    var sh= SpreadsheetApp.getActiveSpreadsheet().getSheetByName('gAccounts');

    var initRange = sh.getRange(6,actMngr.info.acctinfolength+1,actMngr.acctRows,1);
    initValues = initRange.getValues();

    var manualRange = sh.getRange(6,2,actMngr.acctRows,1);
    manualValues = manualRange.getValues();

    SpreadsheetApp.getActiveSpreadsheet().deleteSheet(sh);
  } catch {
    console.log("Tried to delete gAccounts but it didn't exist")
  }
  
  var sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet('gAccounts');

  // Set up font family and style
  setupFontAndStyle(sheet,"Google Sans Mono",9);

  var rows = actMngr.acctRows;

  // Create Named Ranges
  createNamedRange('accountData',sheet.getRange(3,2,rows+3,actMngr.info.acctinfolength+12)); // Used for formatting
  createNamedRange('accountRefreshable',sheet.getRange(6,2,rows,actMngr.info.acctinfolength+12));
  createNamedRange('accountInit', sheet.getRange(6,actMngr.info.acctinfolength+1,rows,1));
  createNamedRange('accountManual',sheet.getRange(6,2,actMngr.acctRows,1));

  createNamedRange('accountTotals',sheet.getRange(3,2,3,actMngr.info.acctinfolength+12));
  createNamedRange('accountHeader',sheet.getRange(1,actMngr.info.acctinfolength+2,2,13)); // 13 because we need the carry over month for credit cards
  createNamedRange('accountNames', sheet.getRange(6,1,rows,1));
  createNamedRange('accountInfo',sheet.getRange(6,2,rows,actMngr.info.acctinfolength)); // Account Info, includes manual balance and current balance for formatting

  createNamedRange('accountMonthly',sheet.getRange(6,2+actMngr.info.acctinfolength,rows,13));



  // Make the header and style the border
  makeAccountsHeader(actMngr.info);

  // Make the side bar
  makeAccountsSideBar(actMngr,initValues,manualValues);

}

function getAccountHeaderTemplate(info){
  return [["January","February","March","April","May","June","July","August","September","October","November","December","Roll Over"], [info.year.toString(), info.year.toString(), info.year.toString(), info.year.toString(), info.year.toString(), info.year.toString(), info.year.toString(), info.year.toString(), info.year.toString(), info.year.toString(), info.year.toString(), info.year.toString(),"Credit Balance"]]
}


function makeAccountsHeader(info){
  //Get the active spreadsheet
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("gAccounts");

  // Manually do the Account Info Columns since they are pretty custom
  sheet.getRange("A1:E1").setValues([["Account","INPUT MANUAL BALANCES","Current Balance","YTD "+info.year+" Balance","Initial Balance"]]); //"Current Balance Check","Credit Card Bill Not Yet Paid Check"
  sheet.getRange("A1:E1").setWrapStrategy(SpreadsheetApp.WrapStrategy.WRAP);
  sheet.setColumnWidths(1,1,200);
  sheet.setColumnWidths(2,info.acctinfolength,140);
  sheet.getRange("A1:E2").mergeVertically();
  sheet.getRange("A1:C1").setVerticalAlignment("middle");
  sheet.getRange("A1:E1").setHorizontalAlignment("center");

  getNamedRange('accountHeader').setValues(getAccountHeaderTemplate(info));

  // Set up border styling for header
  sheet.getRange("A3:R3").setBorder(true,null,null,null,null,true,'black',SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
  sheet.getRange("A3:R5").setBorder(null,null,null,true,true,true,'black',SpreadsheetApp.BorderStyle.SOLID);
  sheet.getRange("A6:R6").setBorder(true,null,null,null,null,true,'black',SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
  sheet.getRange("A1:E2").setBorder(null,null,null,true,true,null,'black',SpreadsheetApp.BorderStyle.SOLID);
  sheet.getRange("G1:R2").setBorder(null,null,null,true,null,null,'black',SpreadsheetApp.BorderStyle.SOLID);


  sheet.getRange("A3:A5").setValues([["Total"],["Total No Retirement"],["Total Cash Reserves"]]);
  sheet.getRange("A3:A5").setBorder(null,null,null,true,null,null,'black',SpreadsheetApp.BorderStyle.SOLID_MEDIUM);

  //Set text alignment up
  sheet.getRange("A3:A40").setHorizontalAlignment('left');
  sheet.getRange("E1:R2").setHorizontalAlignment('center');
  sheet.getRange("B3:R40").setHorizontalAlignment('right');

}

function makeAccountsSideBar(actMngr, initValues, manualValues){

  //Get the active spreadsheet
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("gAccounts");

  // Do the Account Name formatting
  var leftLabelRange= getNamedRange('accountNames');
  var leftLabelValues= leftLabelRange.getValues();
  var leftLabelColors= leftLabelRange.getValues();
  
  var idx = 0;
  var rowsToMerge = [];
  var rowsCashReserves = [];
  var rowsNoRetirement = [];

  // Loop through all accounts once to set up various formulas and format the sheet
  // Assign the account name values
  // Assign the account name colors
  // Decide which rows need merging for the current balance column
  // Decide which rows should be summed in the CashReserves total row
  // Decide which rows should be summed in the NoRetirement total row
  for ( var i = 0; i < actMngr.accountArray.length; i++){
    if (actMngr.accountArray[i].interestAcct){
      leftLabelValues[idx][0]= actMngr.accountArray[i].displayName;
      leftLabelColors[idx][0]= eAccountColorCode.get(actMngr.accountArray[i].acctType);
      leftLabelColors[idx+1][0]= eAccountColorCode.get(actMngr.accountArray[i].acctType);
      rowsToMerge.push(idx);
      if (actMngr.accountArray[i].acctType != "retirement"){
        rowsNoRetirement.push(idx);
        rowsNoRetirement.push((idx+1));
      }
      if (actMngr.accountArray[i].acctType == "savings"){
        rowsCashReserves.push(idx);
        rowsCashReserves.push(idx+1);
      }
      idx += 2;
    } else{
      leftLabelValues[idx][0]= actMngr.accountArray[i].displayName;
      leftLabelColors[idx][0]= eAccountColorCode.get(actMngr.accountArray[i].acctType);
      rowsNoRetirement.push(idx);
      if (actMngr.accountArray[i].acctType == "checking" || actMngr.accountArray[i].acctType == "savings" || actMngr.accountArray[i].acctType == "default"){
        rowsCashReserves.push(idx);
      }
      idx++;
    }
  }

  console.log(rowsNoRetirement);
  console.log("Cash Reserves" + rowsCashReserves);

  leftLabelRange.setValues(leftLabelValues)
                .setBackgrounds(leftLabelColors)
                .setBorder(null,null,null,true,null,null,'black',SpreadsheetApp.BorderStyle.SOLID_MEDIUM)
                .setBorder(null,null,true,null,null,true,'black',SpreadsheetApp.BorderStyle.SOLID);


  // Merge Interest Account Rows Vertically for Acct Name, Manual Balances and Current Balance
  for ( var i = 0; i < rowsToMerge.length; i++){
    sheet.getRange(rowsToMerge[i]+6,1,2,3).mergeVertically();
  }

  // Do Account Info formatting
  var acctInfoRange = getNamedRange('accountInfo');
  var acctInfoValues = acctInfoRange.getValues();

  for ( var i = 0; i < actMngr.acctRows; i++){
    acctInfoValues[i][actMngr.info.acctinfolength-1] = "ENTER INITIAL VALUE";
    // Set YTD Balance
    acctInfoValues[i][actMngr.info.acctinfolength-2] = "=IFNA(INDEX(H"+(i+6)+":R"+(i+6)+",COUNTA(H"+(i+6)+":R"+(i+6)+")),0)"
  }

  acctInfoRange.setValues(acctInfoValues)
               .setBorder(null,null,true,true,true,true,'black',SpreadsheetApp.BorderStyle.SOLID);


  // Overwrite initValues if applicable
  if (initValues != -1) {
    var initRange= getNamedRange('accountInit'); 
    initRange.setValues(initValues);
  }
  // Overwrite the manualValues if applicable
  if (manualValues != -1) {
    var manualRange= getNamedRange('accountManual'); 
    manualRange.setValues(manualValues);
  }  

  // Set up border around monthly range
  var monthlyRange = getNamedRange('accountMonthly'); 
  monthlyRange.setBorder(null,null,true,true,null,null,'black',SpreadsheetApp.BorderStyle.SOLID);


  // Set up formatting for the data range
  getNamedRange('accountData').setNumberFormat("[$$]#,##0.00");


  // Set up formulas for total values
  var totalsRange = getNamedRange('accountTotals'); 
  var totalsValues = totalsRange.getValues();

  sheet.getRange(3,2).setValue("=SUM(B6:B"+(6+actMngr.acctRows)+")");
  sheet.getRange(3,2).autoFill(sheet.getRange(3,2,1,actMngr.info.acctinfolength+12),SpreadsheetApp.AutoFillSeries.DEFAULT_SERIES);

  // FIXME ADD FORMULA FOR TOTAL CASH RESERVES AND TOTAL NO RETIREMENT

  var noRetirementFormulas = addFormulaForAccountTotal(rowsNoRetirement,rowsToMerge);

  sheet.getRange(4,4).setValue(noRetirementFormulas[0]+")")
                     .autoFill(sheet.getRange(4,4,1,actMngr.info.acctinfolength+10),SpreadsheetApp.AutoFillSeries.DEFAULT_SERIES);
  sheet.getRange(4,2).setValue(noRetirementFormulas[1]+")")
                     .autoFill(sheet.getRange(4,2,1,actMngr.info.acctinfolength-2),SpreadsheetApp.AutoFillSeries.DEFAULT_SERIES);


  var cashReservesFormulas = addFormulaForAccountTotal(rowsCashReserves,rowsToMerge); // = "=SUM(D";


  sheet.getRange(5,4).setValue(cashReservesFormulas[0]+")")
                     .autoFill(sheet.getRange(5,4,1,actMngr.info.acctinfolength+10),SpreadsheetApp.AutoFillSeries.DEFAULT_SERIES);
  sheet.getRange(5,2).setValue(cashReservesFormulas[1]+")")
                     .autoFill(sheet.getRange(5,2,1,actMngr.info.acctinfolength-2),SpreadsheetApp.AutoFillSeries.DEFAULT_SERIES);


}

// Returns the Formula to add for a specific totals formula based on the rowsList provided
// we also return a slightly modified formula for use where the interest account rows are
// merged in that particular column
function addFormulaForAccountTotal(rowsList, rowsMerged){
  var formula = "=SUM(D";
  var mergedFormula = "=SUM(B";
  for (var i = 0; i < rowsList.length; i++){
    // Merged Formula
    // Check if the row was merged
    if (rowsMerged.includes(i-1)){
      // Do nothing
    }
    else if (rowsMerged.includes(i) && (i+2) >= rowsList.length){
      mergedFormula += (+rowsList[i]+6)+"";
    }
    else if ((i+1) < rowsList.length) {
      mergedFormula += (+rowsList[i]+6)+",B";
    }
    else {
      mergedFormula += (+rowsList[i]+6)+"";
    }

    // Normal formula
    if ((i+1) < rowsList.length) {
      formula += (+rowsList[i]+6)+",D";
    }
    else {
      formula += (+rowsList[i]+6)+"";
    }
  } 

  return [formula,mergedFormula];
}

