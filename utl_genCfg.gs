// This function generates the gCfg sheet. 
// The only information we need to know are the account types to put in the dropdown. 
// This should never be called by the user, it should only be used at setup time.
function pregenerate_gCfg(){

  // Delete the existing sheet if it exists and insert a new one 
  var sheet = insertSheet('gCfg');
  
  // Set up font family and style
  setupFontAndStyle(sheet,"Google Sans Mono",9);

  // var rows = actMngr.acctRows;

  // Create Named Ranges
  createNamedRange('cfgAcctTypes',sheet.getRange(2,3,1000,1)); // If someone has over 1000 accounts they can go elsewhere for their accounting lol.
  createNamedRange('cfgCatTypes',sheet.getRange(2,8,1000,1));
  createNamedRange('cfgHeader',sheet.getRange(1,1,1,11));
  createNamedRange('cfgYearAndMonthlyBudget',sheet.getRange(2,10,1,2))
  createNamedRange('cfgAccts', sheet.getRange(2,1,1000,5));
  createNamedRange('cfgCats', sheet.getRange(2,7,1000,2));

  // Make the header and style the border
  makeCfgHeader();

  createCfgCatTypesDropdown();

  createCfgAcctTypesDropdown();

}


function makeCfgHeader(){
  //Get the active spreadsheet
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("gCfg");

  var headerRange = getNamedRange('cfgHeader');
  headerRange.setValues([["AccountName","DropdownName","Type","Statement Close Date","Credit Statement Balance", ,"Category Name", "Type",,"Year","Monthly Budget Amount"]]);

  sheet.setColumnWidths(1,1,200);
  sheet.setColumnWidths(2,1,140);
  sheet.setColumnWidths(4,2,200);
  sheet.setColumnWidths(11,1,200);

  // Set notes
  var cell = sheet.getRange(1,4);
  cell.setComment("The day of the month this credit account statement closes on. the 23rd would be '23'");
  cell = sheet.getRange(1,5);
  cell.setComment("This is the statement balance at the end of the previous year, from the statement open date to 12/31. This allows us to maintain an accurate balance for your january statement since we do not want to include txns from the previous year in this sheet.")

}