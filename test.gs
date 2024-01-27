// cAccount
// Methods for Testing
function TestGetMonthFromDate(){
  var acct = new cAccount("Bank of America Checking","Checking","checking");

  console.log(acct.GetMonthFromDate("1/7/2024"));
  console.log(acct.GetMonthFromDate("11/17/2023"));
}

function TestDepositandWithdraw(){
  var acct = new cAccount("Bank of America Checking","Checking","checking");

  acct.SetInitValue(1000);

  console.log(acct.initialValue);
  console.log(acct.monthlyValues);
  console.log(acct.currentValue);
  
  acct.Deposit(500,"1/1/2024");

  console.log(acct.initialValue);
  console.log(acct.monthlyValues);
  console.log(acct.currentValue);

  acct.Withdraw(500,"1/1/2024");

  console.log(acct.initialValue);
  console.log(acct.monthlyValues);
  console.log(acct.currentValue);
}

//safeAdd
function testSafeAdd(){
  console.log(safeAdd('20.561','10.01')); // 30.57
  console.log(safeAdd('20.566','10.01')); // 30.58
}


// cTxn
function TestcTxn() {

  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Accounting");
  SpreadsheetApp.setActiveSheet(sh);

  var range=sh.getRange(3,1,1,14);

  var transaction_data_range = range.getValues();

  console.log(transaction_data_range[0]);

  var Txn = new cTxn(transaction_data_range[0]);

  console.log(Txn.isSharedValid())
}
