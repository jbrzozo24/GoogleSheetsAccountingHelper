// This file contains utilities which contribute to reconfiguring the accounting sheet
// with new options, accounts, etc. 
// This is not to be confused with refreshing, which only involves updating raw data 
// after adding new transactions.


// Setup gAccounts and gCategories after updating user_input
function regenerate(){
  //Setup and Get Account manager
  var actMngr= main();

  // Use Account Manager to set up Accounts and Categories Sheets

  generate_gAccounts(actMngr);

  generate_gCategories(actMngr);

  refreshTransactionsAcctAndCategories(actMngr);
}

// This should be called whenever the user adds or removes an account
function regenerate_accounts(){

  //Setup and Get Account manager
  var actMngr= main();

  // Use Account Manager to set up Accounts and Categories Sheets
  generate_gAccounts(actMngr);

  refreshTxnAcctDropdown(actMngr);

}

function regenerate_categories(){

  //Setup and Get Account manager
  var actMngr= main();

  generate_gCategories(actMngr);

  refreshTxnCategoryDropdown(actMngr);

}


function refreshTxnAcctDropdown(actMngr){
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('gTransactions');

  // Build account array
  var acctNameArray = [];

  for (var i = 0; i < actMngr.accountArray.length; i++){
    acctNameArray.push(actMngr.accountArray[i].dropdownName);
  }

  var accountRange = sheet.getRange(3,3,sheet.getMaxRows(),1);
  accountRange.setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(acctNameArray).setAllowInvalid(false).build());

  var accountToRange = sheet.getRange(3,6,sheet.getMaxRows(),1);
  accountToRange.setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(['N/A','Enter Acct'].concat(acctNameArray)).setAllowInvalid(false).build());

}


function refreshTxnCategoryDropdown(actMngr){
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('gTransactions');

  var categoryRange = sheet.getRange(3,5,sheet.getMaxRows(),1);
  categoryRange.setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(['Transfer'].concat(actMngr.categoryNames)).setAllowInvalid(false).build());

}


function createCfgAcctTypesDropdown(){
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('gCfg');

  // Make a list of acctTypes from eAccountColorCode keys
  var mapIter = eAccountColorCode.keys();

  var acctTypeList = []

  for (var i = 0; i < eAccountColorCode.size; i++){
    acctTypeList.push(mapIter.next().value);
  }

  var acctTypeRange = getNamedRange('cfgAcctTypes');
  acctTypeRange.setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(acctTypeList).setAllowInvalid(false).build())
}

function createCfgCatTypesDropdown(){
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('gCfg');

  // Make a list of acctTypes from eAccountColorCode keys
  var mapIter = eAccountColorCode.keys();

  var catTypeList = ['expense','revenue','both','net'];

  var acctTypeRange = getNamedRange('cfgCatTypes');
  acctTypeRange.setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(catTypeList).setAllowInvalid(false).build())

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
  accountRange.setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(acctNameArray).setAllowInvalid(false).build());

  var categoryRange = sheet.getRange(3,5,sheet.getMaxRows(),1);
  categoryRange.setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(['Transfer'].concat(actMngr.categoryNames)).setAllowInvalid(false).build());

  var accountToRange = sheet.getRange(3,6,sheet.getMaxRows(),1);
  accountToRange.setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(['N/A','Enter Acct'].concat(acctNameArray)).setAllowInvalid(false).build());

}

