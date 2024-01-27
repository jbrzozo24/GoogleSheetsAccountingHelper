// Creates the gTransactions sheet from scratch


function createTxnsSheet(){
  //Setup and Get Account manager
  var actMngr= main();

  generate_gTxns(actMngr);

}

function generate_gTxns(actMngr){

  // Delete the existing sheet if it exists and insert a new one 
  var sheet = insertSheet('gTransactions');

  // Set up font family and style
  setupFontAndStyle(sheet, 'Arial', 10);

  //Create Named Ranges
  createNamedRange('txnAccount',         sheet.getRange(3,3,sheet.getMaxRows(),1));
  createNamedRange('txnIncome',          sheet.getRange(3,4,sheet.getMaxRows(),1));
  createNamedRange('txnCategory',        sheet.getRange(3,5,sheet.getMaxRows(),1));
  createNamedRange('txnAccountTo',       sheet.getRange(3,6,sheet.getMaxRows(),1));
  createNamedRange('txnAmount',          sheet.getRange(3,7,sheet.getMaxRows(),1));
  createNamedRange('txnShared',          sheet.getRange(3,8,sheet.getMaxRows(),1));
  createNamedRange('txnReimburseMethod', sheet.getRange(3,9,sheet.getMaxRows(),1));
  createNamedRange('txnReimburseAmt',    sheet.getRange(3,10,sheet.getMaxRows(),1));
  createNamedRange('txnPaymentReceived', sheet.getRange(3,11,sheet.getMaxRows(),1));
  createNamedRange('txnHeader',          sheet.getRange(1,1,2,11));

  cfg_gTxns(actMngr);
 
}


function cfg_gTxns(actMngr){
  //Get the active spreadsheet
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("gTransactions");

  // Setup the header
  var headerRange = getNamedRange('txnHeader'); //sheet.getRange(1,1,2,11);
  headerRange.setValues([[,,,,,,,"Shared Transactions",,,,],["Date","Description","Account","Income?","Category","Account To","Amount","Shared?","Reimburse Method","Reimburse Amount","Payment Received?"]]);
  
  // Do some formatting
  sheet.getRange("H1:K1").setHorizontalAlignment("center");
  sheet.getRange("H1:K1").mergeAcross();
  var colWidths = [93,210,80,60,100,96,70,60,130,130,130];

  for ( var i = 0; i < 11; i++){
    sheet.setColumnWidths(i+1,1,+colWidths[i]);
  }

  //Freeze the top two rows
  sheet.setFrozenRows(2);

  //Set border style
  var sharedRange = sheet.getRange(1,8,sheet.getMaxRows(),4);
  sharedRange.setBorder(null,true,null,true,null,null,'black',SpreadsheetApp.BorderStyle.SOLID);

  // Build account array for account and accountTo dropdowns
  var acctNameArray = [];

  for (var i = 0; i < actMngr.accountArray.length; i++){
    acctNameArray.push(actMngr.accountArray[i].dropdownName);
  }

  var accountRange = getNamedRange('txnAccount'); //sheet.getRange(3,3,sheet.getMaxRows(),1);
  accountRange.setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(acctNameArray).setAllowInvalid(false).build());

  var incomeRange = getNamedRange('txnIncome'); //sheet.getRange(3,4,sheet.getMaxRows(),1);
  incomeRange.setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(['Y','N','IY','IN'], true).setAllowInvalid(false).build());

  var categoryRange = getNamedRange('txnCategory'); //sheet.getRange(3,5,sheet.getMaxRows(),1);
  categoryRange.setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(['Transfer'].concat(actMngr.categoryNames)).setAllowInvalid(false).build());

  var accountToRange = getNamedRange('txnAccountTo'); //sheet.getRange(3,6,sheet.getMaxRows(),1);
  sheet.getRange(3,6).setValue('=IFNA(IF(E3="Transfer","Enter Acct","N/A"),0)');
  sheet.getRange(3,6).autoFill(accountToRange,SpreadsheetApp.AutoFillSeries.DEFAULT_SERIES);
  accountToRange.setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(['N/A','Enter Acct'].concat(acctNameArray)).setAllowInvalid(false).build());

  var amountRange = getNamedRange('txnAmount'); //sheet.getRange(3,7,sheet.getMaxRows(),1);
  amountRange.setNumberFormat("[$$]#,##0.00");

  var shareRange = getNamedRange('txnShared'); //sheet.getRange(3,8,sheet.getMaxRows(),1);
  shareRange.setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(['y','n','Apt']).setAllowInvalid(false));

  var reimburseMethodRange = getNamedRange('txnReimburseMethod'); //sheet.getRange(3,9,sheet.getMaxRows(),1);
  reimburseMethodRange.setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(['Venmo','Zelle']).setAllowInvalid(false));

  var reimburseAmountRange = getNamedRange('txnReimburseAmt'); //sheet.getRange(3,10,sheet.getMaxRows(),1);
  sheet.getRange(3,10).setValue('=IFNA(IF(H3="Apt",ROUND(2*(G3/3),2),IF(H3="y","Enter amt",0)),0)');
  sheet.getRange(3,10).autoFill(reimburseAmountRange,SpreadsheetApp.AutoFillSeries.DEFAULT_SERIES);
  reimburseAmountRange.setNumberFormat("[$$]#,##0.00");

  var paymentReceivedRange = getNamedRange('txnPaymentReceived'); // sheet.getRange(3,11,sheet.getMaxRows(),1);
  paymentReceivedRange.setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(['y','n']).setAllowInvalid(false));


}