function createCharts() {
  var actMngr = main();

  // Delete the existing sheet if it exists and insert a new one but get the initial values first.
  var sheet = insertSheet('gCharts');

  AddBudgetPerMonth(actMngr);
  AddDollarsSpentPerMonth(actMngr);
  AddIncomePerMonth(actMngr);
  CurrentAccountBalances(actMngr);
}

function AddBudgetPerMonth(actMngr){
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('gCategories');

  var headerRange = sheet.getRange(1,3,1,13);
  var seriesRange = sheet.getRange(actMngr.expenseArray.length+3,3,2,13);

  var chartBuilder = sheet.newChart().asColumnChart();
  chartBuilder.addRange(headerRange)
      .addRange(seriesRange)
      .setStacked()
      .setOption('title', 'Monthly Budget')
      .setNumHeaders(1)
      .setOption("Series", [{color: 'grey'}, {color: 'red'}])
      .setTransposeRowsAndColumns(true)
      .setMergeStrategy(Charts.ChartMergeStrategy.MERGE_ROWS)
      .setPosition(1,1,0,0);
  var chartSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('gCharts');
  chartSheet.insertChart(chartBuilder.build());
}

function AddDollarsSpentPerMonth(actMngr){
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('gCategories');

  var headerRange = sheet.getRange(1,3,1,13);
  var seriesRange = sheet.getRange(3,3,actMngr.expenseArray.length,13);

  var chartSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('gCharts');
  var chartBuilder = chartSheet.newChart().asColumnChart();
  chartBuilder.addRange(headerRange)
      .addRange(seriesRange)
      .setStacked()
      .setOption('title', 'Dollars Spent Per Month')
      .setTransposeRowsAndColumns(true)
      .setNumHeaders(1)
      .setMergeStrategy(Charts.ChartMergeStrategy.MERGE_ROWS)
      .setPosition(19,1,0,0);

  chartSheet.insertChart(chartBuilder.build());
}

function AddIncomePerMonth(actMngr){
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('gCategories');

  var headerRange = sheet.getRange(1,3,1,13);
  var seriesRange = sheet.getRange(actMngr.expenseArray.length+7,3,actMngr.revenueArray.length,13);

  var chartBuilder = sheet.newChart().asColumnChart();
  chartBuilder.addRange(headerRange)
      .addRange(seriesRange)
      .setStacked()
      .setOption('title', 'Income Per Month')
      .setTransposeRowsAndColumns(true)
      .setNumHeaders(1)
      .setMergeStrategy(Charts.ChartMergeStrategy.MERGE_ROWS)
      .setPosition(1,7,0,0);
  var chartSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('gCharts');
  chartSheet.insertChart(chartBuilder.build());
}

function CurrentAccountBalances (actMngr) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('gAccounts');

  var range = sheet.getRange(6,1,actMngr.acctRows,3);

  var chartBuilder = sheet.newChart().asColumnChart();
  chartBuilder.addRange(range)
      .setTransposeRowsAndColumns(false)
      .setNumHeaders(1)
      // .setMergeStrategy(Charts.ChartMergeStrategy.MERGE_ROWS)      
      .setOption('title', 'Account Balances')
      .setPosition(19,7,0,0);
  var chartSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('gCharts');
  chartSheet.insertChart(chartBuilder.build());
}