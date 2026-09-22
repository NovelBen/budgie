/**
 * ==============================================================================
 * BUDGIE - GOOGLE APPS SCRIPT WEBHOOK BACKEND
 * ==============================================================================
 * 
 * SETUP INSTRUCTIONS (Takes ~2 minutes):
 * 1. Open Google Sheets (create a new blank spreadsheet called "Budgie Expenses").
 * 2. In the top menu, click Extensions > Apps Script.
 * 3. Delete any code in the editor, paste this entire script, and click the Save icon.
 * 4. In the top right, click "Deploy" > "New deployment".
 * 5. Under "Select type" (gear icon), select "Web app".
 * 6. Set Description: "Budgie Sync".
 * 7. Set "Execute as": "Me (your email)".
 * 8. Set "Who has access": "Anyone" (this lets your phone send data without complex OAuth).
 * 9. Click "Deploy". Grant permissions if prompted (click "Advanced" > "Go to Budgie Sync (unsafe)").
 * 10. Copy the Web App URL (ends in /exec).
 * 11. Open Budgie > Settings > Paste your URL into the Google Sheets Sync URL box!
 * ==============================================================================
 */

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Auto-create beautiful headers if sheet is empty
    if (sheet.getLastRow() === 0) {
      var headers = [
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

    // Support single expense or batch sync array
    var items = Array.isArray(data) ? data : [data];
    var rowsToAdd = [];

    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      var dateObj = item.date ? new Date(item.date) : new Date();
      var formattedDate = item.dateStr || Utilities.formatDate(dateObj, Session.getScriptTimeZone(), "yyyy-MM-dd");
      var formattedTime = item.timeStr || Utilities.formatDate(dateObj, Session.getScriptTimeZone(), "HH:mm:ss");
      
      rowsToAdd.push([
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
      var range = sheet.getRange(startRow, 1, rowsToAdd.length, 8);
      range.setValues(rowsToAdd);
      
      // Format Amount column (Column C) as currency
      sheet.getRange(startRow, 3, rowsToAdd.length, 1).setNumberFormat("$#,##0.00");
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
  // Health check endpoint
  return ContentService.createTextOutput(JSON.stringify({
    status: "online",
    service: "Budgie Google Sheets Sync Webhook",
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}
