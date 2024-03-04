// Main class to hold all the information
class cAccountingManager {
  constructor(info){
    this.info = info;
    this.acctRows = 0;
    this.accountArray = [];
    this.expenseArray = [];
    this.revenueArray = [];
    this.categoryNames = [];

    this.monthlyBudget = 0;

    // Read the gCfg sheet to AddAccounts and Categories
    this.Configure(info);
  }

  //===================================================================
  // Functions to build the account manager from user input
  //===================================================================

  Configure(info){
    var sheet = getSheet("gCfg");

    var acctsListRange = getNamedRange('cfgAccts');
    var categoryListRange = getNamedRange('cfgCats');
    var cfgRange = getNamedRange('cfgYearAndMonthlyBudget');

    // Add Accounts
    var acctVals = acctsListRange.getValues();
    for (var i = 0; i< acctsListRange.getNumRows(); i++){
      if (acctVals[i][0] != ''){
        if (acctVals[i][2] == 'credit'){
          this.AddAccount(new cAccount(acctVals[i][0],acctVals[i][1],acctVals[i][2],acctVals[i][3],acctVals[i][4]));
        }
        else {
          this.AddAccount(new cAccount(acctVals[i][0],acctVals[i][1],acctVals[i][2]));
        }
      }
    }

    // Add Categories
    var categoryVals = categoryListRange.getValues();
    for (var i = 0; i< acctsListRange.getNumRows(); i++){
      if (categoryVals[i][0] != ''){
        if (categoryVals[i][1] == 'expense'){
          this.AddCategory(new cCategory(categoryVals[i][0],true,false));
        }
        else if (categoryVals[i][1] == 'revenue'){
          this.AddCategory(new cCategory(categoryVals[i][0],false,true));
        }
        else if (categoryVals[i][1] == 'both'){
          this.AddCategory(new cCategory(categoryVals[i][0],true,true));
        }
        else if (categoryVals[i][1] == 'net'){
          this.AddCategory(new cCategory(categoryVals[i][0],true,true,true));
        }
      }
    }

    // Set Year
    info.year = (cfgRange.getValues())[0][0];

    // Set Monthly Budget
    this.SetMonthlyBudgetAmount((cfgRange.getValues())[0][1]);
  }

  AddAccount(accountInstance){
    this.accountArray.push(accountInstance);
    if (accountInstance.interestAcct){
      this.acctRows += 2;
    }
    else {
      this.acctRows += 1;
    }
  }

  AddCategory(categoryInstance){
    this.categoryNames.push(categoryInstance.name);
    if (categoryInstance.expense && !categoryInstance.net){ // Track net in revenue category as net gain/loss
      this.AddExpenseCategory(categoryInstance);
    }
    if (categoryInstance.revenue){
      this.AddRevenueCategory(categoryInstance);
    }
  }

  SetMonthlyBudgetAmount(amt){
    this.monthlyBudget = amt;
  }

  AddExpenseCategory(categoryInstance){
    this.expenseArray.push(categoryInstance);
  }

  AddRevenueCategory(categoryInstance){
    this.revenueArray.push(categoryInstance);
  }

  //=== End Functions to build the account manager from user input ============================

  
  // Assigns the initialValue
  SetInitialAcctValues(){
    var initRange = getNamedRange('accountInit');
    var initValues = initRange.getValues();
    var idx = 0;
    for (var i = 0; i < this.accountArray.length; i++){
      if( this.accountArray[i].interestAcct ){
        this.accountArray[i].SetInitValue(initValues[idx],initValues[idx+1]);
        idx += 2;
      }
      else {
        this.accountArray[i].SetInitValue(initValues[idx]); // Interest is 0
        idx += 1;
      }
    }
  }

  // Looks at the accountRefreshable range and refreshes the account balances with the current account data.
  WriteOutAccountBalances(){
    //Get the active spreadsheet, then get the generated accounts sheet
    var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("gAccounts");

    // Get the Refreshable range to update the Current Balance and Account Balance History
    var dataRange = getNamedRange('accountRefreshable'); //sh.getRange(6,2,this.acctRows,this.info.acctinfolength+12);
    var dataValues = dataRange.getValues();

    // Write YTD Balance Column Formula based on latest monthly
    for ( var i = 0; i < this.acctRows; i++){
      dataValues[i][this.info.acctinfolength-2] = "=IFNA(INDEX(F"+(i+6)+":Q"+(i+6)+",COUNTA(F"+(i+6)+":Q"+(i+6)+")),0)"
    }


    // Get today's date so we only print out Account Balance History up to the Current Month
    var date = new Date();
    var month = date.getMonth();
    var day = date.getDate();

    // Row counter since interest accts take up 2 rows and others take up only 1
    var idx = 0;

    // For each account, 
    // Write Current Balance, and Write Monthly Balance History, 
    // For Monthly Balances, if the account is an interest account, we split up the cost
    // basis and interest. We only write out up to the current month.
    for (var i = 0; i < this.accountArray.length; i++){
    
      if (this.accountArray[i].interestAcct){
        for (var j = 0; j <= month; j++){
          dataValues[idx][this.info.acctinfolength + j] = this.accountArray[i].monthlyValues[j];
          dataValues[idx+1][this.info.acctinfolength + j] = this.accountArray[i].interestMonthlyValues[j];
          // Current Balance Column
          dataValues[idx][1] = safeAdd(this.accountArray[i].currentValue,this.accountArray[i].interestCurrentValue); //this.accountArray[i].totalCurrentValue;
        } 
        idx += 2;
      }
      else if ( this.accountArray[i].acctType == "credit" ){
        // For credit accounts, we need to write out an extra month if the next statement has already opened.
        // We check this by checking the day of the month and seeing if its greater than the statement close day
        // for this credit account. If so, we print an extra month out
        var creditMonthToPrint = month;

        if (day > +this.accountArray[i].statementCloseDate){
          creditMonthToPrint = safeAdd(creditMonthToPrint, 1);
        }
        for (var j = 0; j <= creditMonthToPrint; j++){
          dataValues[idx][this.info.acctinfolength + j] = this.accountArray[i].monthlyValues[j]; 
          dataValues[idx][1] = this.accountArray[i].currentValue;
        } 
        // Report YTD Balance correctly based on monthly balances (depends if latest bill has been paid yet).
        // We just hack this by checking if the values match
        if ( dataValues[idx][this.info.acctinfolength + creditMonthToPrint] == this.accountArray[i].currentValue){
          // Do nothing, the existing INDEX formula works!
        } 
        else if ( safeAdd(+dataValues[idx][this.info.acctinfolength + creditMonthToPrint], +dataValues[idx][this.info.acctinfolength + creditMonthToPrint-1]) == this.accountArray[i].currentValue ){
          dataValues[idx][this.info.acctinfolength-2] = +dataValues[idx][this.info.acctinfolength + creditMonthToPrint]+ +dataValues[idx][this.info.acctinfolength + creditMonthToPrint-1];
        } 
        else {
          dataValues[idx][this.info.acctinfolength-2] = "Something went wrong";
          console.error("Current Balance: " + this.accountArray[i].currentValue + ". Last two months Balances: " + safeAdd(+dataValues[idx][this.info.acctinfolength + creditMonthToPrint], +dataValues[idx][this.info.acctinfolength + creditMonthToPrint-1]));
        }
        
        idx += 1;
      } else {
        for (var j = 0; j <= month; j++){
          dataValues[idx][this.info.acctinfolength + j] = safeAdd(+this.accountArray[i].monthlyValues[j],+this.accountArray[i].interestMonthlyValues[j]);
          // Current Balance Column - we combine cost basis and interest.
          dataValues[idx][1] = safeAdd(this.accountArray[i].currentValue,this.accountArray[i].interestCurrentValue); //this.accountArray[i].totalCurrentValue;
        }
        idx ++;
      }
    }

    dataRange.setValues(dataValues);
  } // End WriteOutAccountBalances

  // For expense only categories, simply write out the expense amounts from the cCategory instance.
  // For revenue only, same thing. For net-based Categories, write their net values from the revenue
  // section
  WriteOutCategoryBalances(){
    //Get the active spreadsheet, then get the generated Categories sheet
    var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("gCategories");

    // The range includes total expenses
    var expenseTotalRange = sh.getRange(3,2,this.expenseArray.length + 2,1);
    var expenseTotalValues = expenseTotalRange.getValues();

    // This range includes monthly expense budget rows
    var expenseRange = sh.getRange(3,4,this.expenseArray.length ,12);
    var expenseValues = expenseRange.getValues();

    // Get today's date
    var date = new Date();
    var month = date.getMonth();

    // // Reset Expense totals because we accumulate them as we write out monthly values
    // expenseTotalValues[this.expenseArray.length][0] = 0;
    // for (var j = 0; j <= month; j++) {
    //   expenseValues[this.expenseArray.length][j] = 0;
    // }

    // Write yearly total and monthly values for each category
    // Accumulate monthly values in the totals.
    // i is the category
    // j is the month
    for ( var i = 0; i < this.expenseArray.length; i++){
      // Yearly totals by category
      // expenseTotalValues[i][0] = this.expenseArray[i].expYearlyTotal;
      // expenseTotalValues[this.expenseArray.length][0] = Math.round(((+this.expenseArray[i].expYearlyTotal + +expenseTotalValues[this.expenseArray.length][0]) + Number.EPSILON) * 100) / 100;

      // Write monthly values up to the current date
      for (var j = 0; j <= month; j++) {
        expenseValues[i][j] = this.expenseArray[i].expMonthlyValues[j]; 
        // expenseValues[this.expenseArray.length][j] = Math.round(((+this.expenseArray[i].expMonthlyValues[j] + +expenseValues[this.expenseArray.length][j]) + Number.EPSILON) * 100) / 100;
      }
    }

    //Write out budget row after accumulating monthly totals
    // for (var j = 0; j <= month; j++) {
    //   expenseValues[this.expenseArray.length+1][j] = Math.round(((+this.monthlyBudget - +expenseValues[this.expenseArray.length][j]) + Number.EPSILON) * 100) / 100;
    // }

    var budgHeight = this.expenseArray.length+4;

    // expenseTotalValues[this.expenseArray.length+1][0] = "=SUM(C"+budgHeight+":N" +budgHeight +")";

    // expenseTotalRange.setValues(expenseTotalValues);
    expenseRange.setValues(expenseValues);

    // Now Revenue

    // var revenueTotalRange = sh.getRange( 7+ this.expenseArray.length,2,this.revenueArray.length,1);
    // var revenueTotalValues = revenueTotalRange.getValues();

    var revenueRange = sh.getRange( 7+ this.expenseArray.length,4,this.revenueArray.length,12);
    var revenueValues = revenueRange.getValues();


    for ( var i = 0; i < this.revenueArray.length; i++){

      if (!this.revenueArray[i].net){
        // Write yearly total and monthly values for each category
        // revenueTotalValues[i][0] = this.revenueArray[i].revYearlyTotal;

        for (var j = 0; j <= month; j++) {
          revenueValues[i][j] = this.revenueArray[i].revMonthlyValues[j];
        }
      } else { // Handle Net Case
        // Write yearly total and monthly values for each category
        // revenueTotalValues[i][0] = this.revenueArray[i].revYearlyTotal - this.revenueArray[i].expYearlyTotal;

        for (var j = 0; j <= month; j++) {
          revenueValues[i][j] = this.revenueArray[i].revMonthlyValues[j] - this.revenueArray[i].expMonthlyValues[j];
        }
      }
    }

    // revenueTotalRange.setValues(revenueTotalValues);
    revenueRange.setValues(revenueValues);

    // hide the redundant column used for the chart
    // sh.hideColumns(3,1);
  }


  //Processes all txns to fill in corresponding data. 
  //Currently a transaction has 11 columns
  ProcessTxns(transactionLength=11){

    //Get the active spreadsheet, then get the main Transactions sheet
    var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("gTransactions");

    SpreadsheetApp.setActiveSheet(sh);

    // Craft the range in a readable way:
    var startingRow = 3;
    var startingCol = 1;
    var numCols = transactionLength;


    var range=sh.getRange(startingRow,startingCol,sh.getLastRow()-3,numCols);

    var rawTxnSheetArray = range.getValues();

    // Read all of the transactions and do all the necessary updates:
    for (var i=0; i < rawTxnSheetArray.length; i++){
      
      //Process transaction if a date is present
      if(rawTxnSheetArray[i][0] != ''){

        //Return the transaction object for this row
        var txn = this.GetTxn(rawTxnSheetArray[i]);

        //Update Accounts
        this.UpdateAccountBalances(txn);

        //Update Categories
        this.UpdateCategoryBalances(txn);

      }
    }
    // this.PrintAcctBalances();
    // this.PrintAcctInterestBalances();
  }

  GetTxn(transaction_data_range){
    var Txn = new cTxn(transaction_data_range);
    
    return Txn;
  }

  FindAcct(name){
    var acctIdx = -1;

    for (var i = 0; i < this.accountArray.length; i++){
      if ( this.accountArray[i].dropdownName == name ){
        acctIdx = i;
      }
    }

    if (acctIdx == -1) {
      console.warn("FindAcct returning -1 for " + name);
    }

    return acctIdx;
  }

  FindCategory(name, expense){
    var catIdx = -1;

    if (expense) {
      for (var i = 0; i < this.expenseArray.length; i++){
        if ( this.expenseArray[i].name == name ){
          catIdx = i;
        }
      }
    } else {
      for (var i = 0; i < this.revenueArray.length; i++){
        if ( this.revenueArray[i].name == name ){
          catIdx = i;
        }
      }
    }

    if (catIdx == -1) {
      console.warn("FindCategory returning -1 for " + name + ". Expense: " + expense + ". this is ok if this is a net category");
    }

    return catIdx;

  }

  PrintAcctBalances(){
    for (var i = 0; i < this.accountArray.length; i++){
      console.log("PrintAcctBalances: " + this.accountArray[i].dropdownName + ": " + this.accountArray[i].currentValue );
    }
  }

  PrintAcctInterestBalances(){
    for (var i = 0; i < this.accountArray.length; i++){
      console.log("PrintAcctInterestBalances: " + this.accountArray[i].dropdownName + ": " + this.accountArray[i].interestCurrentValue );
    }
  }

  // Takes a transaction object txn
  UpdateAccountBalances(txn){

    //Get the acct
    var acctIdx = this.FindAcct(txn.account);

    // Check for credit account first, since we handle this case differently
    // For credit accounts, we track the monthly balances independent from 
    // the current balance. We look for the statment date range and line up 
    // transactions with that instead, so its easier to associate w your
    // statements. If the income type is Y, this is a credit card payment,
    // we don't update the monthly values at all.
    if (this.accountArray[acctIdx].acctType == "credit") {
      if (txn.incomeType == 'Y'){
        this.accountArray[acctIdx].PayCreditCardStatement(txn.amount);
      } else if (txn.incomeType == 'N'){
        //Txn can either be in the statement ending in this month, or in the next month
        var txnmonth = txn.date.getMonth();
        // Try statement ending this month
        if (txn.date <= new Date((txnmonth+1)+"/"+this.accountArray[acctIdx].statementCloseDate + "/" + this.info.year)){
          
          this.accountArray[acctIdx].AddCreditCardExpense(txn.amount,txnmonth);
        } else { // The date is late enough that its in the next month's statement
          
          this.accountArray[acctIdx].AddCreditCardExpense(txn.amount,txnmonth+1);
        }
        // this.accountArray[acctIdx].statementCloseDate
      } else {
        console.error("Invalid income type for credit account");
      }
    } else {
      // Update the main account's balance:
      if (txn.incomeType == 'Y'){
        this.accountArray[acctIdx].Deposit(txn.amount, txn.date);
      } else if (txn.incomeType == 'N'){
        this.accountArray[acctIdx].Withdraw(txn.amount, txn.date);
      } else if (txn.incomeType == 'IY'){
        this.accountArray[acctIdx].AccrueInterest(txn.amount, txn.date);
      } else if (txn.incomeType == 'IN') {
        this.accountArray[acctIdx].AccrueLosses(txn.amount, txn.date);
      } else {
        console.error("Invalid Income Type");
      }
    }

    // If a transfer, Update the second balance
    if ( txn.category == 'Transfer' ){
      //Find the AccountTo
      acctIdx = this.FindAcct(txn.accountTo);

      // Update the account transferred to's balance:
      if (txn.incomeType == 'Y'){
        this.accountArray[acctIdx].Withdraw(txn.amount, txn.date);
      } 
      else if (txn.incomeType == 'N' && this.accountArray[acctIdx].acctType == 'credit'){
        // If the accountTo type is credit and we are doing a transfer, we want to PayCreditCardStatement, not deposit
        this.accountArray[acctIdx].PayCreditCardStatement(txn.amount);
      }
      else if (txn.incomeType == 'N'){
        this.accountArray[acctIdx].Deposit(txn.amount, txn.date);
      } // 'IY' AND 'IN' CASES don't make sense here
      else {
        console.error("Transfer reported with income type IN or IY. This is invalid.");
      }
    }

    // If shared and paid back, account for that reimbursement
    if(txn.isSharedValid() && txn.isReimbursementPaidBack()){
      if ( txn.reimburseMethod == 'Venmo'){
        var acctIdx = this.FindAcct("Venmo");
        if (acctIdx == -1) {
          console.error("jbrzozow: Venmo acct not found with Venmo as reimburse method! Please add an Account called 'Venmo' or change reimbursement method");
        }
        else { 
          this.accountArray[acctIdx].Deposit(txn.reimburseAmount,txn.date);
        }
      }
      else if ( txn.reimburseMethod == 'Zelle' ){
        var acctIdx = this.FindAcct("Checking"); // Zelle goes to checking. (maybe we don't want to hardcode this?)
        if (acctIdx == -1) {
          console.error("jbrzozow: Checking acct not found with Zelle as reimburse method! Please add or rename an Account called 'Checking' or change reimbursement method");
        }
        else { 
          this.accountArray[acctIdx].Deposit(txn.reimburseAmount,txn.date);
        }
      }
    } else if (txn.isSharedValid()){
      console.log("Expecting a reimbursement via " + txn.reimburseMethod + " for $" + txn.reimburseAmount + ", Description: " + txn.description);
    }



  } // End UpdateAccountBalances()

  // Takes a transaction object txn
  // For Categories, we consider the reimbursement amount and substract it from the txn amount
  // if the shared column is valid. We do not consider whether the payment has been received yet
  // from others since this is not an accounting, it is simply tracking categorical spending, so 
  // tracking it as some elevated amount does not make sense. 
  // We also ignore the transfer category completely after checking that there is a from and to acct
  UpdateCategoryBalances(txn){

    if (txn.category == "Transfer"){
      if (txn.accountTo == "Enter Acct"){
        console.error("Please add accountTo to transfer transaction with description: " + txn.description);
      }
      // Do nothing for special category transfer
      return;
    }
    var idx;

    // Track revenue
    if (txn.incomeType == 'Y' || txn.incomeType == "IY")
    {
      idx = this.FindCategory(txn.category,false);

      if (idx == -1){
      console.error("Category " + txn.category + " was used in a configuration that is not being tracked. Please change the income type, category, or start tracking revenue for this category.");
      }

      if (txn.isSharedValid()){ // This condition doesnt really make sense. So warn
        console.warn( "Shared valid on txn with income type I or IY, are you sure you meant to do this? Description: " + txn.description);
        this.revenueArray[idx].AddRevenue(txn.amount - txn.reimburseAmount,txn.date);
      } else {
        this.revenueArray[idx].AddRevenue(txn.amount,txn.date);
      }
    } 
    // Track Expenses
    else if (txn.incomeType == 'N' || txn.incomeType == "IN") 
    {
      idx = this.FindCategory(txn.category,true);

      var isNet=0;
      if (idx == -1){
        // Try checking for a net category in the revenue array
        idx = this.FindCategory(txn.category,false);
        if (idx != -1){
          if (this.revenueArray[idx].net){
            // This is a net category, tracking expenses is ok
            isNet = 1;
          }
        }
        if (!isNet){
          console.error("Category " + txn.category + " was used in a configuration that is not being tracked. Please change the income type, category, or start tracking expenses for this category.");
          idx = -1;
        }
      }
      if ( isNet ){
        if (txn.isSharedValid){
          this.revenueArray[idx].AddExpense(txn.amount - txn.reimburseAmount,txn.date);
        } else {
          this.revenueArray[idx].AddExpense(txn.amount, txn.date);
        }
      } else {
        if (txn.isSharedValid){
          this.expenseArray[idx].AddExpense(txn.amount - txn.reimburseAmount,txn.date);
        } else {
          this.expenseArray[idx].AddExpense(txn.amount,txn.date);
        }
      }

    }

  } // End UpdateCategoryBalances()


} // End class cAcccountingManager





function TestProcessTxns(){
  const info = new globalInfo(2024);
  var actMngr = new cAccountingManager(info);

  actMngr.AddAccount(new cAccount("Bank of America Checking","Checking","checking"));
  actMngr.AddAccount(new cAccount("Bank of America Savings", "Savings", "default"));
  actMngr.AddAccount(new cAccount("BofA Credit Card", "BofA", "credit"));
  actMngr.AddAccount(new cAccount("United Credit Card", "United", "credit"));
  actMngr.AddAccount(new cAccount("Venmo", "Venmo", "default")); 
  actMngr.AddAccount(new cAccount("CIT High Yield Savings", "High Yield Savings", "savings"));


  actMngr.ProcessTxns();

  actMngr.PrintAcctBalances();
  actMngr.PrintAcctInterestBalances();
}