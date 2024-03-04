// This utility is for "refreshing" data tables 
// When you add new txns, you need to refresh to
// see the acct values update.


// This function refreshes all refreshable data.
// In the accounts sheet:
//     This includes the account info columns, 
//     and the monthlyBalance columns
// In the categories sheet:
//     This includes the 
function refresh() {
  
  //Maintain the active sheet
  var activeSheet = SpreadsheetApp.getActiveSheet();

  var actMngr= main();

  actMngr.SetInitialAcctValues(); // Does accounts

  actMngr.ProcessTxns();
  actMngr.WriteOutAccountBalances();
  actMngr.WriteOutCategoryBalances();

  SpreadsheetApp.setActiveSheet(activeSheet);
  
}

// The idea would be to pull the actMngr from somewhere and only refresh the new txn data
function quick_refresh(){

}