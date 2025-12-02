# 🔧 更新 Google Apps Script 代码

## ⚠️ 当前问题

你的 Google Apps Script 代码有几个问题需要修复：

1. **表名不一致**：`doPost` 使用 "thelittlenestbookings"，`doGet` 使用 "Bookings"
2. **缺少功能**：不支持更新和删除操作
3. **字段名**：使用 `GuestsNo` 而不是 `Guests`

## ✅ 推荐的完整代码

将以下代码替换到你的 Google Apps Script：

```javascript
// 统一的表名
const SHEET_NAME = "thelittlenestbookings";

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
    const id = data.id || Date.now().toString();
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
    const id = data.id;
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
    const id = data.id;
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
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
```

## 📋 Google Sheet 表头

确保你的 Google Sheet 第一行有以下表头：

| A | B | C | D | E | F |
|---|---|---|---|---|---|
| ID | StartDate | EndDate | GuestsNo | Note | Color |

## 🔄 更新步骤

1. 打开 Google Apps Script：https://script.google.com/
2. 选择你的项目
3. 将上面的代码复制粘贴进去
4. 点击 **"保存"**
5. 点击 **"部署"** → **"管理部署"**
6. 点击 **"编辑"**（铅笔图标）
7. 选择 **"新版本"**
8. 点击 **"部署"**

## ✅ 完成

更新后，应用将支持：
- ✅ 添加预订
- ✅ 更新预订
- ✅ 删除预订
- ✅ 获取所有预订
- ✅ 清空所有预订（用于初始化）

