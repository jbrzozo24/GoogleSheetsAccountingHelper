
function generate_gCategories(actMngr){

  // Delete the existing sheet if it exists and insert a new one
  var sheet = insertSheet('gCategories');

  // Set up font family and style
  setupFontAndStyle(sheet,"Google Sans Mono", 9);

  var expLen = actMngr.expenseArray.length;
  var revLen = actMngr.revenueArray.length;

  // Create Named Ranges
  createNamedRange('catExpHeader', sheet.getRange("A1:O2"));
  createNamedRange('catRevHeader', sheet.getRange(expLen + 5,1,2,15));
  createNamedRange('catSideBar',   sheet.getRange(1,1,expLen + 8 + actMngr.revenueArray.length,2)); // Includes vertical total column
  createNamedRange('catExpData',   sheet.getRange(3,4,expLen, 12));
  createNamedRange('catRevData',   sheet.getRange(7+expLen,4,actMngr.revenueArray.length, 12));
  createNamedRange('catExpSpecial',sheet.getRange(3+expLen,4,2,12));
  createNamedRange('catRevSpecial',sheet.getRange(7+expLen+revLen,4,2,12));
  // createNamedRange('catExpVertTotals',);
  // createNamedRange('catRevVertTotals',);

  // Make the header and style the border
  makeCategoriesHeader(actMngr.info);
  makeCategoriesPaycheckHeader(actMngr.info,actMngr.expenseArray.length + 5);

  // Make the side bar
  makeCategoriesSideBar(actMngr);
  makeCategoriesData(actMngr);

  // Hide columns
  sheet.hideColumns(3,1);
}

function getCategoryHeaderTemplate(name, info){
  return [[name,"Total "+info.year,name,"January","February","March","April","May","June","July","August","September","October","November","December"], [0,0,0,info.year.toString(), info.year.toString(), info.year.toString(), info.year.toString(), info.year.toString(), info.year.toString(), info.year.toString(), info.year.toString(), info.year.toString(), info.year.toString(), info.year.toString(), info.year.toString()]]
}


function makeCategoriesHeader(info){
  //Get the active spreadsheet
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("gCategories");

  getNamedRange('catExpHeader').setValues(getCategoryHeaderTemplate('Expenses',info))
                               .setBorder(null,null,true,true,null,null,'black',SpreadsheetApp.BorderStyle.SOLID)
                               .setVerticalAlignment("middle")
                               .setHorizontalAlignment("center");

  sheet.getRange("A1:C2").mergeVertically();
  sheet.setColumnWidths(1,1,180);

  sheet.getRange("A1:B2").setBorder(null,null,null,true,true,null,'black',SpreadsheetApp.BorderStyle.SOLID);
  sheet.getRange("A1").setBackground('#e06666');

}

function makeCategoriesPaycheckHeader(info, row){
  //Get the active spreadsheet
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("gCategories");

  getNamedRange('catRevHeader').setValues(getCategoryHeaderTemplate('Revenue',info))
                               .setBorder(true,null,true,true,null,null,'black',SpreadsheetApp.BorderStyle.SOLID)
                               .setVerticalAlignment("middle")
                               .setHorizontalAlignment("center");

  sheet.getRange(row,1,2,3).mergeVertically();

  sheet.getRange(row,1,2,2).setBorder(true,null,null,true,true,null,'black',SpreadsheetApp.BorderStyle.SOLID);
  sheet.getRange(row,1).setBackground('#b6d7a8');

}

function makeCategoriesSideBar(actMngr){
  //Get the active spreadsheet
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("gCategories");

  var sideBarRange = getNamedRange('catSideBar');
  var sideBarValues = sideBarRange.getValues();

  // First write in expenses and totals formula
  for ( var i = 0; i < actMngr.expenseArray.length; i++){
    var row = i+2;
    sideBarValues[row][0]=actMngr.expenseArray[i].name + " Expense";
    sideBarValues[row][1]="=SUM(D"+(row+1)+":O"+(row+1)+")";
  }

  // Special Rows related to Expenses (Total and Savings)
  var row =actMngr.expenseArray.length+2;
  sideBarValues[row][0] =   "Total Expenses";
  sideBarValues[row+1][0] = "Savings Above Budget";
  sideBarValues[row][1] =   "=SUM(D"+(row+1)+":O"+(row+1)+")";
  sideBarValues[row+1][1] = "=SUM(D"+(row+2)+":O"+(row+2)+")";

  // Now do revenue and totals
  for ( var i = 0; i < actMngr.revenueArray.length; i++){
    var row = i+6+ actMngr.expenseArray.length;
    if (actMngr.revenueArray[i].net){
      sideBarValues[row][0]=actMngr.revenueArray[i].name + " Net Gain/Loss";
    } else {
      sideBarValues[row][0]=actMngr.revenueArray[i].name + " Revenue";
    }
    sideBarValues[row][1]="=SUM(D"+(row+1)+":O"+(row+1)+")";
  }

  // Special Rows related to Revenue 
  row = actMngr.expenseArray.length + 6 + actMngr.revenueArray.length;
  sideBarValues[row][0] =   "Total Revenue";
  sideBarValues[row+1][0] = "Net Income";
  sideBarValues[row][1] =   "=SUM(D"+(row+1)+":O"+(row+1)+")";
  sideBarValues[row+1][1] = "=SUM(D"+(row+2)+":O"+(row+2)+")";

  // Set up Bordering and format and values all at once
  sideBarRange.setBorder(null,null,true,true,true,null,'black',SpreadsheetApp.BorderStyle.SOLID)
              .setNumberFormat("[$$]#,##0.00")
              .setValues(sideBarValues);

  var expRange= sheet.getRange(3,1,actMngr.expenseArray.length + 2,15);




  // expRange= sheet.getRange(3+ actMngr.expenseArray.length,1,2,15);

  // expRange.setBorder(true,null,true,true,null,true,'black',SpreadsheetApp.BorderStyle.SOLID_MEDIUM);




  // Write HiddenRange
  var hiddenRange = sheet.getRange(3,3,6+actMngr.expenseArray.length+actMngr.revenueArray.length,1);
  sheet.getRange("C3").setValue('=A3');
  sheet.getRange("C3").autoFill(hiddenRange,SpreadsheetApp.AutoFillSeries.DEFAULT_SERIES);

  // sheet.hideColumns(3,1);
}


function makeCategoriesData(actMngr){

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("gCategories");

  var expLen = actMngr.expenseArray.length;
  var revLen = actMngr.revenueArray.length;

  // Format Special Rows and add their functions:
  var expSpRg = getNamedRange('catExpSpecial');
  var expSpVals = expSpRg.getValues();

  for (var month = 0; month < 12; month++){
    var col = columnToLetter(month+4)
    // Total Row
    expSpVals[0][month] = '=SUM('+col+''+(3)+':'+col+''+(2+expLen)+')';
    // Savings Above Budget
    expSpVals[1][month] = '='+actMngr.monthlyBudget+'-'+col+''+(3+expLen);
  }

  expSpRg.setValues(expSpVals)
         .setBorder(true,null,true,null,null,true,'black',SpreadsheetApp.BorderStyle.SOLID_MEDIUM)
         .setNumberFormat("[$$]#,##0.00");


  // Format Special Rows and add their functions:
  var revSpRg = getNamedRange('catRevSpecial');
  var revSpVals = revSpRg.getValues();

  for (var month = 0; month < 12; month++){
    var col = columnToLetter(month+4)
    // Total Row
    revSpVals[0][month] = '=SUM('+col+''+(7+expLen)+':'+col+''+(6+expLen+revLen)+')';
    // Net Row
    revSpVals[1][month] = '='+col+''+(7+expLen+revLen)+'-'+col+''+(3+expLen);
  }

  revSpRg.setValues(revSpVals)
         .setBorder(true,null,true,null,null,true,'black',SpreadsheetApp.BorderStyle.SOLID_MEDIUM)
         .setNumberFormat("[$$]#,##0.00");


  // Format the updatable data range
  var expDataRange = getNamedRange('catExpData');

  expDataRange.setHorizontalAlignment("right")
              .setNumberFormat("[$$]#,##0.00");

  var revDataRange = getNamedRange('catRevData');

  revDataRange.setHorizontalAlignment("right")
              .setNumberFormat("[$$]#,##0.00");


  var fullRange = sheet.getRange(3,1,6+actMngr.expenseArray.length+actMngr.revenueArray.length,15);

  fullRange.setBorder(null,null,true,true,null,null,'black',SpreadsheetApp.BorderStyle.SOLID);

  // Reset to smaller range
  fullRange = sheet.getRange(3,1,4+actMngr.expenseArray.length+actMngr.revenueArray.length,2);

  fullRange.setBorder(null,null,true,true,true,null,'black',SpreadsheetApp.BorderStyle.SOLID);
}

