class cCategory {
  constructor(name,expense,revenue, net=false){
    this.name = name;
    this.expense = expense;  //True or False
    this.revenue = revenue;  //True or False
    this.net = net;

    this.expYearlyTotal = 0;
    this.revYearlyTotal = 0;
    this.expMonthlyValues = [];
    this.revMonthlyValues = [];
    
    for (var i = 0; i < 12; i++) {
      this.expMonthlyValues[i] = 0;
      this.revMonthlyValues[i] = 0;
    }
  }

  //Set 

  // Helpers
  CheckExpense(){
    if (!this.expense){
      console.error("Expense method called for category: " + this.name + " with expense tracking DISABLED. Did you mean to have expense = true?");
      return false
    }
    return true
  }

  CheckRevenue(){
    if (!this.revenue){
      console.error("Revenue method called for category: " + this.name + " with revenue tracking DISABLED. Did you mean to have revenue = true?");
      return false;
    }
    return true;
  }

  GetNetValue(){
    if ( CheckRevenue() && CheckExpense() ){
      return this.revYearlyTotal - this.expYearlyTotal;
    }
    console.error("Tried to call GetNetValue on a category with either Revenue or Expense tracking disabled, this is invalid. Enable both or do not call this method for this account.")
    return null;
  }

  // Returns the month coded as an integer (Jan = 0, Dec = 11)
  GetMonthFromDate(date){
    return date.getMonth();
  }

  AddExpense(amount,date) {
    if (this.CheckExpense()){
      this.expYearlyTotal = Math.round(((+this.expYearlyTotal + +amount) + Number.EPSILON) * 100) / 100;

      var month= this.GetMonthFromDate(date);
      
      this.expMonthlyValues[month]= Math.round(((+this.expMonthlyValues[month] + +amount) + Number.EPSILON) * 100) / 100;
      
    }
  }

  AddRevenue(amount,date) {
    if (this.CheckRevenue()){
      this.revYearlyTotal = Math.round(((+this.revYearlyTotal + +amount) + Number.EPSILON) * 100) / 100;

      var month= this.GetMonthFromDate(date);
      
      this.revMonthlyValues[month]= Math.round(((+this.revMonthlyValues[month] + +amount) + Number.EPSILON) * 100) / 100;
      
    }
  }
}