function main(){
  //This will configure the entire Accounting Spreadsheets
  const info = new globalInfo(2024);

  var actMngr = new cAccountingManager(info);

  return actMngr;
}