// ============================================
// 完整的 Google Apps Script 代码（最终版本）
// ============================================
// 复制整个文件的内容到 Google Apps Script 编辑器
// 重要：必须完全替换现有代码！

// 统一的表名
const SHEET_NAME = "thelittlenestbookings";

// ============================================
// 重要：处理 CORS 预检请求（必须在文件最顶部！）
// ============================================
// 注意：Google Apps Script 的 ContentService 不支持 setHeaders
// CORS 主要依赖于 Web App 的部署设置（"具有访问权限的用户" = "所有人"）
function doOptions() {
  return ContentService.createTextOutput('')
    .setMimeType(ContentService.MimeType.JSON);
}

// ============================================
// 获取所有预订
// ============================================
function doGet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    return ContentService.createTextOutput(
      JSON.stringify({ error: "Sheet not found" })
    ).setMimeType(ContentService.MimeType.JSON);
  }
  
  const values = sheet.getDataRange().getValues();
  
  if (values.length === 0) {
    return ContentService.createTextOutput(
      JSON.stringify([])
    ).setMimeType(ContentService.MimeType.JSON);
  }
  
  const headers = values[0];
  const result = values.slice(1).map((row, index) => {
    let obj = { id: `row-${index + 2}` }; // 使用行号作为 ID
    headers.forEach((h, i) => {
      if (row[i] !== undefined && row[i] !== null && row[i] !== '') {
        obj[h] = row[i];
      }
    });
    return obj;
  });
  
  return ContentService.createTextOutput(
    JSON.stringify(result)
  ).setMimeType(ContentService.MimeType.JSON);
}

// ============================================
// 处理所有操作（添加、更新、删除、清空）
// ============================================
function doPost(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  
  // 如果表不存在，创建它
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    // 添加表头
    sheet.appendRow(["ID", "StartDate", "EndDate", "GuestsNo", "Note", "Color"]);
  }
  
  const data = JSON.parse(e.postData.contents);
  const action = data.action;
  
  if (action === "add") {
    // 添加新记录
    const id = data.ID || data.id || Date.now().toString();
    sheet.appendRow([
      id,
      data.StartDate || "",
      data.EndDate || "",
      data.GuestsNo || data.Guests || "",
      data.Note || "",
      data.Color || ""
    ]);
    
    return ContentService.createTextOutput(
      JSON.stringify({ status: "success", id: id })
    ).setMimeType(ContentService.MimeType.JSON);
    
  } else if (action === "update") {
    // 更新记录
    const id = data.ID || data.id;
    if (!id) {
      return ContentService.createTextOutput(
        JSON.stringify({ status: "error", message: "ID is required" })
      ).setMimeType(ContentService.MimeType.JSON);
    }
    
    const values = sheet.getDataRange().getValues();
    
    for (let i = 1; i < values.length; i++) {
      if (values[i][0] === id) {
        sheet.getRange(i + 1, 1, 1, 6).setValues([[
          id,
          data.StartDate || "",
          data.EndDate || "",
          data.GuestsNo || data.Guests || "",
          data.Note || "",
          data.Color || ""
        ]]);
        break;
      }
    }
    
    return ContentService.createTextOutput(
      JSON.stringify({ status: "success" })
    ).setMimeType(ContentService.MimeType.JSON);
    
  } else if (action === "delete") {
    // 删除记录
    const id = data.ID || data.id;
    if (!id) {
      return ContentService.createTextOutput(
        JSON.stringify({ status: "error", message: "ID is required" })
      ).setMimeType(ContentService.MimeType.JSON);
    }
    
    const values = sheet.getDataRange().getValues();
    
    for (let i = 1; i < values.length; i++) {
      if (values[i][0] === id) {
        sheet.deleteRow(i + 1);
        break;
      }
    }
    
    return ContentService.createTextOutput(
      JSON.stringify({ status: "success" })
    ).setMimeType(ContentService.MimeType.JSON);
    
  } else if (action === "clearAll") {
    // 清空所有数据（保留表头）
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      sheet.deleteRows(2, lastRow - 1);
    }
    
    return ContentService.createTextOutput(
      JSON.stringify({ status: "success" })
    ).setMimeType(ContentService.MimeType.JSON);
    
  } else {
    // 默认行为：添加（兼容旧代码）
    const id = data.ID || data.id || Date.now().toString();
    sheet.appendRow([
      id,
      data.StartDate || "",
      data.EndDate || "",
      data.GuestsNo || data.Guests || "",
      data.Note || "",
      data.Color || ""
    ]);
    
    return ContentService.createTextOutput(
      JSON.stringify({ status: "success", id: id })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

