/**
 * ==============================================================================
 * BUDGIE - GOOGLE APPS SCRIPT WEBHOOK BACKEND
 * Two-way sync for transactions, delete/clear actions, and budget preferences
 * ==============================================================================
 * 
 * SETUP / UPDATE INSTRUCTIONS:
 * 1. Open your Google Spreadsheet ("Budgie Expenses").
 * 2. In the top menu, click Extensions > Apps Script.
 * 3. Replace all code in the editor with this script and click the Save icon (Ctrl+S).
 * 
 * 4. IMPORTANT - CREATE OR UPDATE DEPLOYMENT:
 *    - If FIRST TIME: Click "Deploy" > "New deployment" > Select type "Web app" >
 *      Execute as: "Me" > Who has access: "Anyone" > Click "Deploy".
 *    - If UPDATING: Click "Deploy" > "Manage deployments" > Click the Pencil icon (Edit) >
 *      Under "Version", select "New version" > Click "Deploy".
 *    (Note: In Google Apps Script, editing code without selecting "New version"
 *     will continue running the old version!)
 * 
 * 5. Copy the Web App URL (ends in /exec) and paste it into Budgie Settings.
 * ==============================================================================
 */

function getTransactionsSheet(ss) {
  var sheet = ss.getSheetByName("Transactions") || ss.getSheetByName("Expenses") || ss.getSheetByName("Budgie Expenses") || ss.getSheetByName("Sheet1");
  if (!sheet) {
    var sheets = ss.getSheets();
    for (var i = 0; i < sheets.length; i++) {
      if (sheets[i].getName() !== "Settings") {
        sheet = sheets[i];
        break;
      }
    }
    if (!sheet) {
      sheet = ss.insertSheet("Transactions");
    } else {
      try {
        sheet.setName("Transactions");
      } catch (e) {}
    }
  }
  return sheet;
}

/**
 * Removes any connection test pings, "Budgie Setup", or $0 dummy rows
 * that were logged in the Transactions sheet.
 */
function cleanupGarbageRows(sheet) {
  try {
    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) return;
    var values = sheet.getRange(2, 1, lastRow - 1, 9).getValues();
    for (var r = values.length - 1; r >= 0; r--) {
      var type = String(values[r][0] || "").toLowerCase();
      var amount = parseFloat(values[r][3] || 0);
      var category = String(values[r][4] || "");
      var note = String(values[r][5] || "");
      var txId = String(values[r][7] || "");

      var isTest = (txId === "test_ping" || category === "Budgie Setup" || note === "Connection Test Ping" || type === "system");
      var isSettingsGarbage = (amount === 0 && (category === "General" || category === "") && (note === "" || note === "undefined"));

      if (isTest || isSettingsGarbage) {
        sheet.deleteRow(r + 2);
      }
    }
  } catch (err) {
    Logger.log("cleanupGarbageRows error: " + err);
  }
}

function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = getTransactionsSheet(ss);
    
    // Auto-create headers if Transactions sheet is empty
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

    // ACTION: Connection Test Ping (never logs an expense)
    if (data.action === "ping" || data.action === "test") {
      cleanupGarbageRows(sheet);
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        action: "ping",
        message: "Budgie connected successfully! No expense rows created.",
        timestamp: new Date().toISOString()
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // ACTION: Save Settings & Budget Preferences to dedicated "Settings" sheet
    if (data.action === "saveSettings") {
      cleanupGarbageRows(sheet);
      PropertiesService.getScriptProperties().setProperty('budgie_settings', JSON.stringify(data));

      var settingsSheet = ss.getSheetByName("Settings");
      if (!settingsSheet) {
        settingsSheet = ss.insertSheet("Settings");
      }
      settingsSheet.clear();

      var incomeVal = (data.settings && data.settings.expectedIncome !== undefined && data.settings.expectedIncome !== null && data.settings.expectedIncome !== "") ? parseFloat(data.settings.expectedIncome) : 3500;
      var budgetVal = (data.settings && data.settings.monthlyBudget !== undefined && data.settings.monthlyBudget !== null && data.settings.monthlyBudget !== "") ? parseFloat(data.settings.monthlyBudget) : 2000;

      var setRows = [
        ["Setting", "Value", "Notes", ""],
        ["Expected Monthly Income", incomeVal, "Monthly baseline income", ""],
        ["Overall Monthly Budget", budgetVal, "Monthly spending limit", ""],
        ["Currency Symbol", String(data.settings && data.settings.currency || "$"), "Display currency", ""],
        ["Haptic Feedback", String(data.settings && data.settings.haptics !== false), "Vibration preference", ""],
        ["Last Updated", Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss"), "Auto-synced from Budgie", ""],
        ["", "", "", ""],
        ["Category", "Monthly Budget Limit ($)", "Status", ""]
      ];

      var cats = data.categories || [];
      for (var c = 0; c < cats.length; c++) {
        setRows.push([cats[c].name || "", parseFloat(cats[c].budgetLimit || 0), "Active", ""]);
      }

      if (data.recurringRules && data.recurringRules.length > 0) {
        setRows.push(["", "", "", ""]);
        setRows.push(["Recurring Bill", "Amount ($)", "Frequency", "Next Due"]);
        for (var r = 0; r < data.recurringRules.length; r++) {
          var rec = data.recurringRules[r];
          setRows.push([rec.title || "", parseFloat(rec.amount || 0), rec.frequency || "monthly", rec.nextDueDate || ""]);
        }
      }

      var maxCols = 4;
      settingsSheet.getRange(1, 1, setRows.length, maxCols).setValues(setRows);

      // Format header
      var setHeaderRange = settingsSheet.getRange(1, 1, 1, maxCols);
      setHeaderRange.setFontWeight("bold");
      setHeaderRange.setBackground("#0F172A");
      setHeaderRange.setFontColor("#F8FAFC");
      settingsSheet.setColumnWidth(1, 220);
      settingsSheet.setColumnWidth(2, 160);
      settingsSheet.setColumnWidth(3, 160);
      settingsSheet.setColumnWidth(4, 200);

      // Format currency amounts in Column B
      for (var rowIdx = 2; rowIdx <= setRows.length; rowIdx++) {
        var cellVal = setRows[rowIdx - 1][1];
        if (typeof cellVal === "number" && cellVal > 0) {
          settingsSheet.getRange(rowIdx, 2).setNumberFormat("$#,##0.00");
        }
      }

      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        action: "saveSettings",
        tab: "Settings",
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

    // STRICT GUARD: Unrecognized actions must NEVER fall through to become transactions
    if (data.action && data.action !== "add") {
      return ContentService.createTextOutput(JSON.stringify({
        status: "ignored",
        action: data.action,
        message: "Unrecognized action ignored without adding rows"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // ACTION: Add transactions (single or batch array)
    var items = Array.isArray(data) ? data : (data.items ? data.items : [data]);
    var rowsToAdd = [];

    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      if (!item) continue;
      // Skip commands or test pings
      if (item.action && item.action !== "add") continue;
      if (item.id === "test_ping" || item.category === "Budgie Setup" || item.note === "Connection Test Ping") continue;
      if (parseFloat(item.amount || 0) === 0 && (!item.note || item.note === "undefined") && (item.category === "General" || !item.category)) continue;

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
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var stored = PropertiesService.getScriptProperties().getProperty('budgie_settings');
  var settingsData = stored ? JSON.parse(stored) : null;
  return ContentService.createTextOutput(JSON.stringify({
    status: "online",
    service: "Budgie Google Sheets Sync Webhook",
    version: "v6",
    hasSettingsTab: Boolean(ss.getSheetByName("Settings")),
    settings: settingsData,
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * MANUAL HELPER: Run this function directly inside Apps Script toolbar
 * by selecting "setupBudgieSheets" and clicking Run.
 * It immediately sets up the "Transactions" and "Settings" tabs and cleans up test rows!
 */
function setupBudgieSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = getTransactionsSheet(ss);
  cleanupGarbageRows(sheet);

  var settingsSheet = ss.getSheetByName("Settings");
  if (!settingsSheet) {
    settingsSheet = ss.insertSheet("Settings");
    var defaultRows = [
      ["Setting", "Value", "Notes", ""],
      ["Expected Monthly Income", 3500, "Monthly baseline income", ""],
      ["Overall Monthly Budget", 2000, "Monthly spending limit", ""],
      ["Currency Symbol", "$", "Display currency", ""],
      ["Haptic Feedback", "true", "Vibration preference", ""],
      ["Last Updated", Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss"), "Initial Setup", ""]
    ];
    settingsSheet.getRange(1, 1, defaultRows.length, 4).setValues(defaultRows);
    var hdr = settingsSheet.getRange(1, 1, 1, 4);
    hdr.setFontWeight("bold");
    hdr.setBackground("#0F172A");
    hdr.setFontColor("#F8FAFC");
    settingsSheet.setColumnWidth(1, 220);
    settingsSheet.setColumnWidth(2, 160);
    settingsSheet.setColumnWidth(3, 160);
    settingsSheet.setColumnWidth(4, 200);
  }

  Logger.log("Transactions Sheet: " + sheet.getName());
  Logger.log("Settings Sheet: " + settingsSheet.getName());
  Logger.log("Setup completed successfully!");
}
