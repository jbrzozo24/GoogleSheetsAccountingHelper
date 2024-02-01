/** @OnlyCurrentDoc */

// Create User Utilities to refresh the Account Balances and create charts
function onOpen() {
  SpreadsheetApp.getUi().createMenu("Accting Utilities")
  .addItem("Refresh Data", "refresh")
  .addItem("Regenerate gCategories only", "regenerate_categories")
  .addItem("Regenerate gAccounts only", "regenerate_accounts")
  .addItem("Regenerate gAccounts and gCategories", "regenerate")
  .addItem("Step 2: Create Charts from scratch", "createCharts")
  .addItem("Step 1: Generate gAccounts and gCategories from user_input", "regenerate")
  // This is done by Jack before the user ever sees it. I will go and color code certain columns too
  .addItem("Step 0: Create gTransactions from Scratch","createTxnsSheet") 
  .addToUi();
}


// function onEdit() {
//   refresh();
// }

class globalInfo {
  constructor(year){
    this.year=year;
    this.acctinfolength=4;
    this.acctheaderlength=6;
  }
}