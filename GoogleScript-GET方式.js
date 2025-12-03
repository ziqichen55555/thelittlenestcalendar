// ============================================
// Google Apps Script 代码（支持 GET 请求方式）
// ============================================
// 这个版本修改了 doGet 函数，可以通过 URL 参数接收数据
// 避免使用 POST 请求，从而避免 CORS 预检问题

// 统一的表名
const SHEET_NAME = "thelittlenestbookings";

// ============================================
// 获取所有预订（也处理操作请求）
// ============================================
function doGet(e) {
  Logger.log('=== doGet 被调用 ===');
  Logger.log('时间: ' + new Date().toISOString());
  Logger.log('参数: ' + JSON.stringify(e.parameter));
  
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  
  // 如果表不存在，创建它
  if (!sheet) {
    Logger.log('⚠️ 工作表不存在，正在创建: ' + SHEET_NAME);
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(["ID", "StartDate", "EndDate", "GuestsNo", "Note", "Color"]);
    Logger.log('✅ 工作表已创建');
  }
  
  // 检查是否有 action 参数（表示这是一个操作请求）
  const action = e.parameter.action;
  
  if (action) {
    Logger.log('📝 操作类型: ' + action);
    return handleAction(sheet, action, e.parameter);
  }
  
  // 否则，返回所有预订数据
  Logger.log('📊 获取所有预订数据');
  const values = sheet.getDataRange().getValues();
  Logger.log('📊 工作表数据行数: ' + values.length);
  
  if (values.length === 0) {
    Logger.log('ℹ️ 工作表为空，返回空数组');
    return ContentService.createTextOutput(
      JSON.stringify([])
    ).setMimeType(ContentService.MimeType.JSON);
  }
  
  const headers = values[0];
  const result = values.slice(1).map((row, index) => {
    let obj = { id: `row-${index + 2}` };
    headers.forEach((h, i) => {
      if (row[i] !== undefined && row[i] !== null && row[i] !== '') {
        obj[h] = row[i];
      }
    });
    return obj;
  });
  
  Logger.log('✅ doGet 成功，返回 ' + result.length + ' 条记录');
  return ContentService.createTextOutput(
    JSON.stringify(result)
  ).setMimeType(ContentService.MimeType.JSON);
}

// ============================================
// 处理操作（添加、更新、删除、清空）
// ============================================
function handleAction(sheet, action, params) {
  Logger.log('🔧 处理操作: ' + action);
  Logger.log('📝 参数: ' + JSON.stringify(params));
  
  if (action === "add") {
    const id = params.ID || params.id || Date.now().toString();
    Logger.log('➕ 添加记录，ID: ' + id);
    
    sheet.appendRow([
      id,
      params.StartDate || "",
      params.EndDate || "",
      params.GuestsNo || params.Guests || "",
      params.Note || "",
      params.Color || ""
    ]);
    
    Logger.log('✅ 记录已添加');
    return ContentService.createTextOutput(
      JSON.stringify({ status: "success", id: id })
    ).setMimeType(ContentService.MimeType.JSON);
    
  } else if (action === "update") {
    const id = params.ID || params.id;
    Logger.log('✏️ 更新记录，ID: ' + id);
    
    if (!id) {
      Logger.log('❌ 更新失败：缺少 ID');
      return ContentService.createTextOutput(
        JSON.stringify({ status: "error", message: "ID is required" })
      ).setMimeType(ContentService.MimeType.JSON);
    }
    
    const values = sheet.getDataRange().getValues();
    let found = false;
    
    for (let i = 1; i < values.length; i++) {
      if (values[i][0] === id) {
        sheet.getRange(i + 1, 1, 1, 6).setValues([[
          id,
          params.StartDate || "",
          params.EndDate || "",
          params.GuestsNo || params.Guests || "",
          params.Note || "",
          params.Color || ""
        ]]);
        found = true;
        Logger.log('✅ 记录已更新，行号: ' + (i + 1));
        break;
      }
    }
    
    if (!found) {
      Logger.log('⚠️ 未找到要更新的记录，ID: ' + id);
    }
    
    return ContentService.createTextOutput(
      JSON.stringify({ status: "success" })
    ).setMimeType(ContentService.MimeType.JSON);
    
  } else if (action === "delete") {
    const id = params.ID || params.id;
    Logger.log('🗑️ 删除记录，ID: ' + id);
    
    if (!id) {
      Logger.log('❌ 删除失败：缺少 ID');
      return ContentService.createTextOutput(
        JSON.stringify({ status: "error", message: "ID is required" })
      ).setMimeType(ContentService.MimeType.JSON);
    }
    
    const values = sheet.getDataRange().getValues();
    let found = false;
    
    for (let i = 1; i < values.length; i++) {
      if (values[i][0] === id) {
        sheet.deleteRow(i + 1);
        found = true;
        Logger.log('✅ 记录已删除，行号: ' + (i + 1));
        break;
      }
    }
    
    if (!found) {
      Logger.log('⚠️ 未找到要删除的记录，ID: ' + id);
    }
    
    return ContentService.createTextOutput(
      JSON.stringify({ status: "success" })
    ).setMimeType(ContentService.MimeType.JSON);
    
  } else if (action === "clearAll") {
    Logger.log('🧹 清空所有数据');
    const lastRow = sheet.getLastRow();
    Logger.log('📊 当前行数: ' + lastRow);
    
    if (lastRow > 1) {
      sheet.deleteRows(2, lastRow - 1);
      Logger.log('✅ 已清空 ' + (lastRow - 1) + ' 行数据');
    } else {
      Logger.log('ℹ️ 工作表已为空，无需清空');
    }
    
    return ContentService.createTextOutput(
      JSON.stringify({ status: "success" })
    ).setMimeType(ContentService.MimeType.JSON);
    
  } else {
    Logger.log('⚠️ 未知操作类型: ' + action);
    return ContentService.createTextOutput(
      JSON.stringify({ status: "error", message: "Unknown action: " + action })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

