# 🔧 修复 CORS 错误

## 问题

删除操作失败，错误信息：
```
Preflight response is not successful. Status code: 405
Fetch API cannot load due to access control checks.
```

这是因为浏览器在发送 POST 请求前会先发送 OPTIONS 预检请求，但 Google Apps Script 不支持 OPTIONS 方法。

## ✅ 解决方案

### 方案 1：在 Google Apps Script 中添加 doOptions 函数（推荐）

在你的 Google Apps Script 中添加以下函数来处理 CORS 预检请求：

```javascript
function doOptions() {
  return ContentService.createTextOutput('')
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '3600'
    });
}
```

**完整步骤：**

1. 打开 Google Apps Script：https://script.google.com/
2. 选择你的项目
3. 在代码中添加上面的 `doOptions` 函数
4. 点击 **"保存"**
5. 点击 **"部署"** → **"管理部署"**
6. 点击 **"编辑"**（铅笔图标）
7. 选择 **"新版本"**
8. 点击 **"部署"**

### 方案 2：使用 URL 参数而不是 JSON body（临时方案）

如果无法立即更新脚本，可以修改代码使用 URL 参数。但这需要修改 Google Apps Script 的 `doPost` 函数。

## 📝 更新后的完整 Google Apps Script 代码

```javascript
// 统一的表名
const SHEET_NAME = "thelittlenestbookings";

// 处理 CORS 预检请求
function doOptions() {
  return ContentService.createTextOutput('')
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '3600'
    });
}

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
    let obj = { id: `row-${index + 2}` };
    headers.forEach((h, i) => {
      if (row[i] !== undefined && row[i] !== null && row[i] !== '') {
        obj[h] = row[i];
      }
    });
    return obj;
  });
  
  return ContentService.createTextOutput(
    JSON.stringify(result)
  ).setMimeType(ContentService.MimeType.JSON)
    .setHeaders({
      'Access-Control-Allow-Origin': '*'
    });
}

function doPost(e) {
  // 设置 CORS 头
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
  
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  
  // 如果表不存在，创建它
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(["ID", "StartDate", "EndDate", "GuestsNo", "Note", "Color"]);
  }
  
  const data = JSON.parse(e.postData.contents);
  const action = data.action;
  
  if (action === "add") {
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
    ).setMimeType(ContentService.MimeType.JSON)
      .setHeaders(headers);
    
  } else if (action === "update") {
    const id = data.ID || data.id;
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
    ).setMimeType(ContentService.MimeType.JSON)
      .setHeaders(headers);
    
  } else if (action === "delete") {
    const id = data.ID || data.id;
    const values = sheet.getDataRange().getValues();
    
    for (let i = 1; i < values.length; i++) {
      if (values[i][0] === id) {
        sheet.deleteRow(i + 1);
        break;
      }
    }
    
    return ContentService.createTextOutput(
      JSON.stringify({ status: "success" })
    ).setMimeType(ContentService.MimeType.JSON)
      .setHeaders(headers);
    
  } else if (action === "clearAll") {
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      sheet.deleteRows(2, lastRow - 1);
    }
    
    return ContentService.createTextOutput(
      JSON.stringify({ status: "success" })
    ).setMimeType(ContentService.MimeType.JSON)
      .setHeaders(headers);
    
  } else {
    // 默认行为：添加
    const id = Date.now().toString();
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
    ).setMimeType(ContentService.MimeType.JSON)
      .setHeaders(headers);
  }
}
```

## ✅ 完成

更新后，CORS 错误应该会消失，删除功能应该可以正常工作。

