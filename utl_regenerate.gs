// Setup gAccounts and gCategories after updating user_input
function regenerate(){
  //Setup and Get Account manager
  var actMngr= main();

  // Use Account Manager to set up Accounts and Categories Sheets

  generate_gAccounts(actMngr);

  generate_gCategories(actMngr);

  refreshTransactionsAcctAndCategories(actMngr);
}


// This is used when you only updated your account or category list
function refreshTransactionsAcctAndCategories(actMngr){

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('gTransactions');

  // Build account array
  var acctNameArray = [];

  for (var i = 0; i < actMngr.accountArray.length; i++){
    acctNameArray.push(actMngr.accountArray[i].dropdownName);
  }

  var accountRange = sheet.getRange(3,3,sheet.getMaxRows(),1);
  accountRange.setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(acctNameArray).build());

  var categoryRange = sheet.getRange(3,5,sheet.getMaxRows(),1);
  categoryRange.setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(['Transfer'].concat(actMngr.categoryNames)).build());

  var accountToRange = sheet.getRange(3,6,sheet.getMaxRows(),1);
  accountToRange.setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(['N/A','Enter Acct'].concat(acctNameArray)).build());

}

