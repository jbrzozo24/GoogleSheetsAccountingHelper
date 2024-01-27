// This function tries to delete and reinsert a sheet, 
// or inserts a sheet if it doesn't exist.
function insertSheet(sheetname) {
  try {
    var sh= SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetname);
    SpreadsheetApp.getActiveSpreadsheet().deleteSheet(sh);
  } catch {
    console.log("insertSheet: Tried to delete " + sheetname + " but it didn't exist")
  }

  var sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(sheetname);
  return sheet;
}

// Sets up Font and Style for a New Sheet
function setupFontAndStyle(sheet, font, size){
  var range = sheet.getRange(1, 1, sheet.getMaxRows(), sheet.getMaxColumns());
  range.setFontFamily(font)
       .setFontSize(+size)
       .setFontColor("#000000")
       .setBackground("#ffffff");
}

// Create a named range
function createNamedRange(name,range){
  SpreadsheetApp.getActiveSpreadsheet().setNamedRange(name, range);
}

// Get a named range
function getNamedRange(name){
  return SpreadsheetApp.getActiveSpreadsheet().getRangeByName(name);
}

// Do an add rounded to 2 decimal places safely
function safeAdd(num1,num2){
  return Math.round(((+num1 + +num2) + Number.EPSILON) * 100) / 100;
}

// Do a  sub rounded to 2 decimal places safely
function safeSub(num1,num2){
  return Math.round(((+num1 - +num2) + Number.EPSILON) * 100) / 100;
}


function columnToLetter(column)
{
  var temp, letter = '';
  while (column > 0)
  {
    temp = (column - 1) % 26;
    letter = String.fromCharCode(temp + 65) + letter;
    column = (column - temp - 1) / 26;
  }
  return letter;
}


//================================================
// Custom Functions
//================================================


// Custom function used to display the monthly category spend amount in a cell
// Only displays if the current date is beyond this month, otherwise returns ""
// We filter transactions based on category
function _CATEGORY_MONTHLY_EXPENSE(name,month){

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("gTransactions");

  var amtRg = getNamedRange('txnAmount').getValues();
  var reAmtRg = getNamedRange('txnReimburseAmt').getValues();
  var categoryRg = getNamedRange('txnCategory').getValues();
  var isSharedRg = getNamedRange('txnShared').getValues();
  var incomeRg   = getNamedRange('txnIncome').getValues();

  var value = 0;

  // We stop checking if we hit an amount thats "", so don't have any blank rows!
  var i=0;
  while (amtRg[i] != ""){
  
    if ((categoryRg[i] == name) && (incomeRg[i] == "N" || incomeRg[i] == "IN")){

      if (isSharedRg[i] == "y" || isSharedRg[i] == "Apt"){
        value = safeAdd(value, safeSub(amtRg[i],reAmtRg[i]));
      } else {
        value = safeAdd(value, amtRg[i]);
      }

    }
    i++;
  }

  return value

  // =IFNA(SUM(FILTER((Accounting!$J:$J)-(Accounting!$M:$M),Accounting!$D:$D=year,Accounting!$C:$C=month_name,Accounting!$I:$I=name,Accounting!$H:$H="N")),0)+IFNA(SUM(FILTER((Accounting!$J:$J)-(Accounting!$M:$M),Accounting!$D:$D=year,Accounting!$C:$C=month_name,Accounting!$I:$I=name,Accounting!$H:$H="IN")),0)
}

