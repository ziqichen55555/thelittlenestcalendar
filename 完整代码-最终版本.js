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
  // 记录日志：确认 doOptions 被调用
  Logger.log('=== doOptions 被调用 ===');
  Logger.log('时间: ' + new Date().toISOString());
  Logger.log('请求方法: OPTIONS');
  
  try {
    // 对于 OPTIONS 预检请求，返回空响应
    // 注意：Google Apps Script 会自动处理 CORS 头（如果部署设置为"所有人"）
    // 尝试返回不同的响应格式
    const result = ContentService.createTextOutput('OK');
    
    Logger.log('✅ doOptions 执行成功，返回 "OK"');
    Logger.log('💡 注意：CORS 头由 Google Apps Script 自动处理');
    Logger.log('📝 响应内容: "OK"');
    
    return result;
  } catch (error) {
    Logger.log('❌ doOptions 执行失败: ' + error.toString());
    Logger.log('❌ 错误堆栈: ' + error.stack);
    throw error;
  }
}

// ============================================
// 获取所有预订
// ============================================
function doGet() {
  // 记录日志
  Logger.log('=== doGet 被调用 ===');
  Logger.log('时间: ' + new Date().toISOString());
  
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    Logger.log('❌ 工作表未找到: ' + SHEET_NAME);
    return ContentService.createTextOutput(
      JSON.stringify({ error: "Sheet not found" })
    ).setMimeType(ContentService.MimeType.JSON);
  }
  
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
    let obj = { id: `row-${index + 2}` }; // 使用行号作为 ID
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
// 处理所有操作（添加、更新、删除、清空）
// ============================================
function doPost(e) {
  // 记录日志
  Logger.log('=== doPost 被调用 ===');
  Logger.log('时间: ' + new Date().toISOString());
  
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  
  // 如果表不存在，创建它
  if (!sheet) {
    Logger.log('⚠️ 工作表不存在，正在创建: ' + SHEET_NAME);
    sheet = ss.insertSheet(SHEET_NAME);
    // 添加表头
    sheet.appendRow(["ID", "StartDate", "EndDate", "GuestsNo", "Note", "Color"]);
    Logger.log('✅ 工作表已创建');
  }
  
  const data = JSON.parse(e.postData.contents);
  const action = data.action;
  Logger.log('📝 操作类型: ' + action);
  Logger.log('📝 请求数据: ' + JSON.stringify(data));
  
  if (action === "add") {
    // 添加新记录
    const id = data.ID || data.id || Date.now().toString();
    Logger.log('➕ 添加记录，ID: ' + id);
    sheet.appendRow([
      id,
      data.StartDate || "",
      data.EndDate || "",
      data.GuestsNo || data.Guests || "",
      data.Note || "",
      data.Color || ""
    ]);
    Logger.log('✅ 记录已添加');
    
    return ContentService.createTextOutput(
      JSON.stringify({ status: "success", id: id })
    ).setMimeType(ContentService.MimeType.JSON);
    
  } else if (action === "update") {
    // 更新记录
    const id = data.ID || data.id;
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
          data.StartDate || "",
          data.EndDate || "",
          data.GuestsNo || data.Guests || "",
          data.Note || "",
          data.Color || ""
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
    // 删除记录
    const id = data.ID || data.id;
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
    // 清空所有数据（保留表头）
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
    // 默认行为：添加（兼容旧代码）
    Logger.log('⚠️ 未知操作类型，使用默认添加行为，action: ' + action);
    const id = data.ID || data.id || Date.now().toString();
    sheet.appendRow([
      id,
      data.StartDate || "",
      data.EndDate || "",
      data.GuestsNo || data.Guests || "",
      data.Note || "",
      data.Color || ""
    ]);
    Logger.log('✅ 默认添加完成，ID: ' + id);
    
    return ContentService.createTextOutput(
      JSON.stringify({ status: "success", id: id })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

