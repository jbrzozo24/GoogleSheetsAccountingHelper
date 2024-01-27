function main(){
  //This will configure the entire Accounting Spreadsheets
  const info = new globalInfo(2024); // TODO USER: make sure the year is correct!

  var actMngr = new cAccountingManager(info);

  // TODO USER: Add All of your Accounts here: Display Name, Dropdown Name, Acct Type
  // Viable Acct Types:
  // 'default'
  // 'checking'
  // 'savings' - for interest bearing savings accounts. Otherwise use default
  // 'credit'
  // 'brokerage'
  // 'retirement'
  // 'health'
  // 'cd'
  // Example: 
  // actMngr.AddAccount(new cAccount("Bank of America Checking","Checking","checking"));
  // actMngr.AddAccount(new cAccount("BofA Credit Card", "BofA", "credit",23)); - statement closes on the 23rd
  actMngr.AddAccount(new cAccount("My Checking Acct","Checking","checking")); // CHANGE My Checking Acct to whatever name you'd like.


  // TODO USER: Add all of the categories you'd like to track here: Name, Track Expenses? Track Revenue?
  // I've added a few defaults you'd likely also have. Feel free to delete or rearrange as you see fit.
  actMngr.AddCategory(new cCategory("Paycheck",false,true));
  actMngr.AddCategory(new cCategory("Interest",false,true));
  actMngr.AddCategory(new cCategory("Dividend",false,true));
  actMngr.AddCategory(new cCategory("Cash Back",false,true));
  actMngr.AddCategory(new cCategory("Market",true,true,true));

  actMngr.AddCategory(new cCategory("Activities",true,false));
  actMngr.AddCategory(new cCategory("Alcohol",true,false));
  actMngr.AddCategory(new cCategory("Essentials",true,false));
  actMngr.AddCategory(new cCategory("Food",true,false));
  actMngr.AddCategory(new cCategory("Gambling",true,true));
  actMngr.AddCategory(new cCategory("Gas",true,false));
  actMngr.AddCategory(new cCategory("Gifts",true,true));
  actMngr.AddCategory(new cCategory("Groceries",true,false));
  actMngr.AddCategory(new cCategory("Insurance",true,false));
  actMngr.AddCategory(new cCategory("Items",true,false));
  actMngr.AddCategory(new cCategory("Medical",true,false));
  actMngr.AddCategory(new cCategory("Music",true,false));
  actMngr.AddCategory(new cCategory("Online Shopping",true,false));
  actMngr.AddCategory(new cCategory("Rent/Utilities",true,false));
  actMngr.AddCategory(new cCategory("Service",true,false));
  actMngr.AddCategory(new cCategory("Shopping",true,false));
  actMngr.AddCategory(new cCategory("Subscription",true,false));
  actMngr.AddCategory(new cCategory("Transit",true,false));
  actMngr.AddCategory(new cCategory("Travel (Air)",true,false));


  // TODO USER: Add desired monthly budget amount, replace 0 with the amount
  // you'd like to spend each month. We'll use this in some of the spreadsheets
  // to let you know how you're tracking on that goal.
  actMngr.SetMonthlyBudgetAmount(1000);  // CHANGE FROM 1000 to your desired budget
  

  return actMngr;
}