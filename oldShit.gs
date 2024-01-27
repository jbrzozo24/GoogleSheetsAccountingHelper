function setupAccounts(info,transSht) {
  //Get the active spreadsheet
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Accounts_Test");
  sheet.getRange("A:R").setFontSize(9);
  sheet.getRange("A:R").setFontFamily("Google Sans Mono");

  // Put list of accounts here
  const accountArray = [];

  accountArray[0]= new cAccount("Checking","checking");
  accountArray[1]= new cAccount("Venmo","default");
  accountArray[2]= new cAccount("BofA Savings","default");
  accountArray[3]= new cAccount("BofA","credit");
  accountArray[4]= new cAccount("United", "credit");
  accountArray[5]= new cAccount("Amex","credit");
  accountArray[6]= new cAccount("Bilt","credit");
  accountArray[7]= new cAccount("Schwab","brokerage");
  accountArray[8]= new cAccount("Vanguard","brokerage");
  accountArray[9]= new cAccount("E-trade RSU","brokerage");
  accountArray[10]= new cAccount("E-trade ESPP","brokerage");
  accountArray[11]= new cAccount("401k","retirement");
  accountArray[12]= new cAccount("Roth IRA","retirement");
  accountArray[13]= new cAccount("HSA", "health");
  accountArray[14]= new cAccount("Marcus High Yield CD","cd");
  accountArray[15]= new cAccount("Marcus High Yield Savings","savings");
  accountArray[16]= new cAccount("Cash","default");

  makeAccountsHeader(info,trans);

  //Process the accounts
  var j=5;
  for(var i=0; i < accountArray.length ; i++){


    //Common to all accounts
    //Write Acct name
    sheet.getRange("A"+j).setValue(accountArray[i].name);
    //Set initial balance cell to yellow
    sheet.getRange("G"+j).setBackgroundRGB(255,255,0);
    sheet.getRange("B"+j).setBackgroundRGB(255,255,0);
    sheet.getRange("F"+j).setValue("=INDEX(H"+j+":R"+j+",COUNTA(H"+j+":R"+j+"))");

    if (accountArray[i].acctType == "checking" || accountArray[i].acctType == "credit" || accountArray[i].acctType == "default"){
      sheet.getRange("D"+j).setValue("=ROUND(F"+j+",2)");

    }
    else if(accountArray[i].acctType == "retirement" || accountArray[i].acctType == "brokerage" || accountArray[i].acctType == "health" || accountArray[i].acctType == "cd" || accountArray[i].acctType == "savings"){
      sheet.getRange("D"+j).setValue("=ROUND(F"+j+"+F"+(j+1)+",2)");
      sheet.getRange("F"+(j+1)).setValue("=INDEX(H"+(j+1)+":R"+(j+1)+",COUNTA(H"+(j+1)+":R"+(j+1)+"))");
      sheet.getRange("A"+j+":D"+(j+1)).mergeVertically();
      j++;
    }
    if(i+1 == accountArray.length){
      //Autofill all of the appropriate cells
      sheet.getRange("H5").setValue("=IF(NOT(ISBLANK(H$1)), G5+Accounts_Helper!C5, )");
      var fullacctRange= sheet.getRange("H5:H"+j);
      sheet.getRange("H5").autoFill(fullacctRange,SpreadsheetApp.AutoFillSeries.DEFAULT_SERIES);
      var fullacctRange2D = sheet.getRange("H5:R"+j);
      sheet.getRange("H5:H"+j).autoFill(fullacctRange2D,SpreadsheetApp.AutoFillSeries.DEFAULT_SERIES);

      //Sum
      sheet.getRange("H3").setValue("=SUM(H5:H"+j+")");
      sheet.getRange("H3").autoFill(sheet.getRange("H3:R3"),SpreadsheetApp.AutoFillSeries.DEFAULT_SERIES);
      sheet.getRange("H3").autoFill(sheet.getRange("B3:H3"),SpreadsheetApp.AutoFillSeries.DEFAULT_SERIES);
      sheet.getRange("E3").setValue("");

    }
    j++;
  }
}