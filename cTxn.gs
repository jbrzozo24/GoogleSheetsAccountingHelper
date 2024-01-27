class cTxn {
  constructor(transaction_data_range){
    
    this.date = transaction_data_range[0]; // The Date Object (This is more useful than the string tbh)
    this.description = transaction_data_range[1]; 
    this.account = transaction_data_range[2];
    this.incomeType = transaction_data_range[3];
    this.category = transaction_data_range[4];
    this.accountTo = transaction_data_range[5];
    this.amount = parseFloat(transaction_data_range[6]); //Make sure the txn amount is not a string
    this.shared = transaction_data_range[7];
    this.reimburseMethod = transaction_data_range[8];
    this.reimburseAmount = transaction_data_range[9];
    this.paymentReceived = transaction_data_range[10];

  }

  isSharedValid(){
    return this.shared == 'y' || this.shared == 'Apt';
  }

  isReimbursementPaidBack(){
    return this.paymentReceived == 'y';
  }
}

