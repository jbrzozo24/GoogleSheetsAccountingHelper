// We basically have three distinct cases, if Apps Script supported it,
// we'd ideally have this base class and two classes that extend this one
// cAccount
//    .displayname
//    .dropdownName
//    .acctType - only needed bc we don't have the subclasses
//    .initialValue
//    .currentValue
//    .monthlyValues

//    SetInitValue()
//    Deposit()
//    Withdraw()

// (Fake) class extensions
// cInterestAcct
//    .interestInitialValue
//    .interestCurrentValue
//    .interestMonthlyValues

//    AccrueInterest()
//    AccrueLosses()

// cCreditAcct
//    PayCreditCardStatement()
//    AddCreditCardExpense()
class cAccount {

  constructor(displayName,dropdownName,acctType,statementCloseDate = -1) { // class constructor

    // Generic Account Info
    this.displayName = displayName;
    this.dropdownName = dropdownName;
    this.acctType = acctType; // Enum: checking, savings, brokerage, credit, retirement, health, cd, default
    
    // Account Value Tracking
    this.initialValue; // The Initial Value of the cost basis of the Account for this year
    this.currentValue; // The instantaneous current or closing cost basis value of the Account at the end of the year
    this.monthlyValues = []; // The array of monthly values. The current month should equal current value

    this.interestInitialValue; // The Initial Amount of Interest or Market Gain/Loss, only used for interest or market accounts
    this.interestCurrentValue;
    this.interestMonthlyValues = [];


    // CreditAccount Info
    if ( statementCloseDate != -1 ){
      this.statementCloseDate = statementCloseDate;
    }

    // Interest Type Accounts Information
    if(acctType == 'savings' || acctType == 'brokerage' || acctType == 'retirement' || acctType == 'health' || acctType == 'cd'){
      this.interestAcct = true;
    } else {
      this.interestAcct = false;
    }

    this.InitValues();
  }


  // Helper for the constructor. Initializes values to 0
  InitValues(){
    for (var i = 0; i < 12; i++) {
      this.monthlyValues[i] = 0;
      this.interestMonthlyValues[i] = 0;
    }
    this.currentValue = 0;
    this.interestCurrentValue = 0;
  }

  //Sets the Initial Value of the account based off the Initial Balance spreadsheet column in gAccounts
  SetInitValue(value, interest_value = 0){
    if ( value == 'ENTER INITIAL VALUE' || interest_value == 'ENTER INITIAL VALUE'){
      console.error("Please Enter an initial value for the account: " + this.dropdownName);
    }

    // Setup the initial value and the value for January 1st, no transactions have occurred yet
    this.initialValue = value;
    this.interestInitialValue = interest_value;

    this.currentValue = value;
    this.interestCurrentValue = interest_value;

    // Setup historical balance tracking
    // Credit History Values work differently since we want to display the historical statement balances. 
    // We set all months aside from Jan (which could have accumulated a balance from the statement that 
    // overlaps with the prior year) to 0.
    // For all other accounts, we update all months in the future and stop updating months that have passed by to maintain
    // the historical acct balances.
    for( var i = 0; i < 12; i++){
      if (this.acctType == 'credit'){
        if ( i == 0 ){
          this.monthlyValues[i]=value;
        } else {
          this.monthlyValues[i]=0;
        }
      } else {
        this.monthlyValues[i] = value;
      }
      this.interestMonthlyValues[i] = interest_value;
    }


  }

  //Class methods

  // Increases the basis value of the account, updates the historical balances using the date
  Deposit(amount, date){
    this.currentValue =  Math.round(((+this.currentValue + +amount) + Number.EPSILON) * 100) / 100;

    var month= this.GetMonthFromDate(date);
    for ( var i = month-1; i < 12; i++){
      this.monthlyValues[i]= Math.round(((+this.monthlyValues[i] + +amount) + Number.EPSILON) * 100) / 100;
    }
  }

  // Decreases the basis value of the account, updates the historical balances using the date
  Withdraw(amount,date){
    this.currentValue = Math.round(((+this.currentValue - +amount) + Number.EPSILON) * 100) / 100;

    var month= this.GetMonthFromDate(date);
    for ( var i = month-1; i < 12; i++){
      this.monthlyValues[i] = Math.round(((+this.monthlyValues[i] - +amount) + Number.EPSILON) * 100) / 100;
    }
  }

  // Increases the interest value of the account, updates the historical balances using the date
  AccrueInterest(amount,date){
    this.interestCurrentValue = Math.round(((+this.interestCurrentValue + +amount) + Number.EPSILON) * 100) / 100;

    var month= this.GetMonthFromDate(date);
    for (var i = month-1; i < 12; i++){
      this.interestMonthlyValues[i] = Math.round(((+this.interestMonthlyValues[i] + +amount) + Number.EPSILON) * 100) / 100;
    }
  }

  // Decreases the basis value of the account, updates the historical balances using the date
  AccrueLosses(amount, date){
    this.interestCurrentValue = Math.round(((+this.interestCurrentValue - +amount) + Number.EPSILON) * 100) / 100;

    var month= this.GetMonthFromDate(date);
    for ( var i = month-1; i < 12; i++){
      this.interestMonthlyValues[i]= Math.round(((+this.interestMonthlyValues[i] - +amount) + Number.EPSILON) * 100) / 100;
    }
  }

  // Track the current balance of the credit card. If we pay the statement off increase that value. 
  PayCreditCardStatement(amount){
    this.currentValue = Math.round(((+this.currentValue + +amount) + Number.EPSILON) * 100) / 100;
  }

  // Add the expense only for the current month.
  AddCreditCardExpense(amount,month){
    this.currentValue = Math.round(((+this.currentValue - +amount) + Number.EPSILON) * 100) / 100;

    this.monthlyValues[month] = Math.round(((+this.monthlyValues[month] - +amount) + Number.EPSILON) * 100) / 100;
  }
  // Returns the month coded as an integer (Jan = 1, Dec = 12)
  GetMonthFromDate(date){
    return date.getMonth()+1;
  }

} // End class cAccount

// Map used to color code Account Sheet
const eAccountColorCode = new Map([
  ['checking'  , "#a4c2f4"],
  ['savings'   , "#6d9eeb"],
  ['brokerage' , "#93c47d"],
  ['credit'    , "#ea9999"],
  ['retirement', "#8e7cc3"],
  ['health'    , "#ffd966"],
  ['cd'        , "#f6b26b"],
  ['default'   , "#a4c2f4"]
]);


//===============================
// Extending Accounts (nvm apps script is dogshit and doesnt support this)
//===============================

// cInterestAccount extends cAccount {
//   constructor(displayName,dropdownName,acctType){
//     super(displayName,dropdownName,acctType);
//   }
// }

// cCreditAccount extends cAccount {

// }
