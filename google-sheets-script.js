/**
 * ==============================================================================
 * BUDGIE - GOOGLE APPS SCRIPT WEBHOOK BACKEND
 * Two-way sync for transactions, delete/clear actions, and budget preferences
 * ==============================================================================
 * 
 * SETUP INSTRUCTIONS (Takes ~2 minutes):
 * 1. Open Google Sheets (create a new blank spreadsheet called "Budgie Expenses").
 * 2. In the top menu, click Extensions > Apps Script.
 * 3. Delete any code in the editor, paste this entire script, and click the Save icon.
 * 4. In the top right, click "Deploy" > "Manage deployments" (or "New deployment").
 * 5. Under "Select type" (gear icon), select "Web app".
 * 6. Set Description: "Budgie Sync".
 * 7. Set "Execute as": "Me (your email)".
 * 8. Set "Who has access": "Anyone" (this lets your phone send data without complex OAuth).
 * 9. Click "Deploy". Grant permissions if prompted (click "Advanced" > "Go to Budgie Sync (unsafe)").
 * 10. Copy the Web App URL (ends in /exec).
 * 11. Open Budgie > Settings > Paste your URL into the Google Sheets Sync URL box!
 * ==============================================================================
 */

function getTransactionsSheet(ss) {
  var sheet = ss.getSheetByName("Transactions") || ss.getSheetByName("Expenses") || ss.getSheetByName("Budgie Expenses");
  if (!sheet) {
    sheet = ss.getSheets()[0];
    try {
      sheet.setName("Transactions");
    } catch (e) {}
  }
  return sheet;
}

function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = getTransactionsSheet(ss);
    
    // Auto-create beautiful headers if sheet is empty
    if (sheet.getLastRow() === 0) {
      var headers = [
        "Type",
        "Date", 
        "Time", 
        "Amount ($)", 
        "Category", 
        "Note / Merchant", 
        "Payment Method", 
        "Transaction ID", 
        "Created At"
      ];
      sheet.appendRow(headers);
      
      // Style headers: bold, dark slate background, white text
      var headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setFontWeight("bold");
      headerRange.setBackground("#0F172A");
      headerRange.setFontColor("#F8FAFC");
      sheet.setFrozenRows(1);
    }
    
    // Parse incoming payload
    var data = {};
    if (e && e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else {
      return ContentService.createTextOutput(JSON.stringify({
        status: "error",
        message: "No POST data received"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // ACTION: Save Settings & Budget Preferences
    if (data.action === "saveSettings") {
      PropertiesService.getScriptProperties().setProperty('budgie_settings', JSON.stringify(data));

      var settingsSheet = ss.getSheetByName("Settings");
      if (!settingsSheet) {
        settingsSheet = ss.insertSheet("Settings");
      }
      settingsSheet.clear();

      var setRows = [
        ["Setting", "Value", "Notes"],
        ["Expected Monthly Income", parseFloat(data.settings && data.settings.expectedIncome || 3500), "Monthly baseline income"],
        ["Overall Monthly Budget", parseFloat(data.settings && data.settings.monthlyBudget || 2000), "Monthly spending limit"],
        ["Currency Symbol", String(data.settings && data.settings.currency || "$"), "Display currency"],
        ["Haptic Feedback", String(data.settings && data.settings.haptics !== false), "Vibration preference"],
        ["Last Updated", Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss"), "Auto-synced from Budgie"],
        ["", "", ""],
        ["Category", "Monthly Budget Limit ($)", ""]
      ];

      var cats = data.categories || [];
      for (var c = 0; c < cats.length; c++) {
        setRows.push([cats[c].name || "", parseFloat(cats[c].budgetLimit || 0), ""]);
      }

      if (data.recurringRules && data.recurringRules.length > 0) {
        setRows.push(["", "", ""]);
        setRows.push(["Recurring Bill", "Amount ($)", "Frequency", "Next Due"]);
        for (var r = 0; r < data.recurringRules.length; r++) {
          var rec = data.recurringRules[r];
          setRows.push([rec.title || "", parseFloat(rec.amount || 0), rec.frequency || "monthly", rec.nextDueDate || ""]);
        }
      }

      var maxCols = 3;
      for (var m = 0; m < setRows.length; m++) {
        if (setRows[m].length > maxCols) maxCols = setRows[m].length;
      }
      for (var n = 0; n < setRows.length; n++) {
        while (setRows[n].length < maxCols) setRows[n].push("");
      }

      settingsSheet.getRange(1, 1, setRows.length, maxCols).setValues(setRows);

      // Style header
      var setHeaderRange = settingsSheet.getRange(1, 1, 1, maxCols);
      setHeaderRange.setFontWeight("bold");
      setHeaderRange.setBackground("#0F172A");
      setHeaderRange.setFontColor("#F8FAFC");
      settingsSheet.setColumnWidth(1, 220);
      settingsSheet.setColumnWidth(2, 160);
      settingsSheet.setColumnWidth(3, 220);

      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        action: "saveSettings",
        timestamp: new Date().toISOString()
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // ACTION: Get Settings & Budget Preferences
    if (data.action === "getSettings") {
      var stored = PropertiesService.getScriptProperties().getProperty('budgie_settings');
      var settingsData = stored ? JSON.parse(stored) : null;
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        action: "getSettings",
        settings: settingsData,
        timestamp: new Date().toISOString()
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // ACTION: Delete a specific transaction by ID
    if (data.action === "delete" && data.id) {
      var lastRow = sheet.getLastRow();
      var deleted = false;
      if (lastRow > 1) {
        var idRange = sheet.getRange(2, 8, lastRow - 1, 1).getValues();
        for (var r = idRange.length - 1; r >= 0; r--) {
          if (String(idRange[r][0]) === String(data.id)) {
            sheet.deleteRow(r + 2);
            deleted = true;
            break;
          }
        }
      }
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        action: "delete",
        deleted: deleted,
        id: data.id,
        timestamp: new Date().toISOString()
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // ACTION: Clear all data rows (preserves header row 1)
    if (data.action === "clearAll") {
      var lastRow = sheet.getLastRow();
      if (lastRow > 1) {
        sheet.deleteRows(2, lastRow - 1);
      }
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        action: "clearAll",
        timestamp: new Date().toISOString()
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // ACTION: Add transactions (single or batch array)
    var items = Array.isArray(data) ? data : (data.items ? data.items : [data]);
    var rowsToAdd = [];

    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      // Skip if this is a command object without amount
      if (item.action && !item.amount) continue;

      var dateObj = item.date ? new Date(item.date) : new Date();
      var formattedDate = item.dateStr || Utilities.formatDate(dateObj, Session.getScriptTimeZone(), "yyyy-MM-dd");
      var formattedTime = item.timeStr || Utilities.formatDate(dateObj, Session.getScriptTimeZone(), "HH:mm:ss");
      var typeStr = (item.type === "income" || item.type === "Income") ? "Income" : "Expense";

      rowsToAdd.push([
        typeStr,
        formattedDate,
        formattedTime,
        parseFloat(item.amount || 0),
        item.category || "General",
        item.note || "",
        item.method || "Card",
        item.id || Utilities.getUuid(),
        item.createdAt || new Date().toISOString()
      ]);
    }

    if (rowsToAdd.length > 0) {
      var startRow = sheet.getLastRow() + 1;
      var range = sheet.getRange(startRow, 1, rowsToAdd.length, 9);
      range.setValues(rowsToAdd);
      
      // Format Amount column (Column D) as currency
      sheet.getRange(startRow, 4, rowsToAdd.length, 1).setNumberFormat("$#,##0.00");
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      addedCount: rowsToAdd.length,
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  var stored = PropertiesService.getScriptProperties().getProperty('budgie_settings');
  var settingsData = stored ? JSON.parse(stored) : null;
  return ContentService.createTextOutput(JSON.stringify({
    status: "online",
    service: "Budgie Google Sheets Sync Webhook",
    settings: settingsData,
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}
