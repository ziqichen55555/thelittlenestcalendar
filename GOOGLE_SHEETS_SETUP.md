# 🚀 Google Sheets 云端存储设置（最简单！）

## 为什么使用 Google Sheets？

- ✅ **完全免费** - Google Sheets 完全免费
- ✅ **超级简单** - 只需要一个 URL
- ✅ **可视化界面** - 可以在 Google Sheets 直接查看和编辑数据
- ✅ **自动同步** - 所有设备都能看到数据
- ✅ **无需 API Key** - 使用 Google Apps Script，更安全

## 📝 设置步骤

### 第 1 步：创建 Google Apps Script（如果还没有）

如果你已经创建了 Google Apps Script Web App，可以跳过这一步。

1. 访问：https://script.google.com/
2. 点击 **"新建项目"**
3. 复制以下代码到编辑器：

```javascript
function doGet(e) {
  const action = e.parameter.action;
  
  if (action === 'getAll') {
    return getAllBookings();
  }
  
  return ContentService.createTextOutput(JSON.stringify({ error: 'Unknown action' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const action = e.parameter.action;
  const data = JSON.parse(e.parameter.data || '{}');
  
  switch(action) {
    case 'add':
      return addBooking(data);
    case 'update':
      return updateBooking(data);
    case 'delete':
      return deleteBooking(data);
    case 'clearAll':
      return clearAllBookings();
    default:
      return ContentService.createTextOutput(JSON.stringify({ error: 'Unknown action' }))
        .setMimeType(ContentService.MimeType.JSON);
  }
}

function getAllBookings() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  const bookings = [];
  for (let i = 1; i < data.length; i++) {
    if (data[i][0]) { // 如果有 ID
      bookings.push({
        id: data[i][0],
        startDate: data[i][1],
        endDate: data[i][2],
        guests: data[i][3],
        note: data[i][4] || '',
        color: data[i][5] || undefined,
      });
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify(bookings))
    .setMimeType(ContentService.MimeType.JSON);
}

function addBooking(booking) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const id = booking.id || Date.now().toString();
  sheet.appendRow([
    id,
    booking.startDate,
    booking.endDate,
    booking.guests,
    booking.note || '',
    booking.color || '',
  ]);
  return ContentService.createTextOutput(JSON.stringify({ success: true, id }))
    .setMimeType(ContentService.MimeType.JSON);
}

function updateBooking(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const dataRange = sheet.getDataRange();
  const values = dataRange.getValues();
  
  for (let i = 1; i < values.length; i++) {
    if (values[i][0] === data.id) {
      sheet.getRange(i + 1, 1, 1, 6).setValues([[
        data.id,
        data.startDate,
        data.endDate,
        data.guests,
        data.note || '',
        data.color || '',
      ]]);
      break;
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify({ success: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function deleteBooking(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const dataRange = sheet.getDataRange();
  const values = dataRange.getValues();
  
  for (let i = 1; i < values.length; i++) {
    if (values[i][0] === data.id) {
      sheet.deleteRow(i + 1);
      break;
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify({ success: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function clearAllBookings() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.deleteRows(2, lastRow - 1);
  }
  return ContentService.createTextOutput(JSON.stringify({ success: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

4. 点击 **"保存"**（💾 图标）
5. 给项目命名：`TheLittleNestCalendar`

### 第 2 步：创建 Google Sheet

1. 访问：https://sheets.google.com/
2. 创建新的电子表格
3. 在第一行添加表头：
   - A1: `ID`
   - B1: `StartDate`
   - C1: `EndDate`
   - D1: `Guests`
   - E1: `Note`
   - F1: `Color`
4. 保存电子表格

### 第 3 步：连接 Script 和 Sheet

1. 在 Google Apps Script 编辑器中
2. 点击 **"资源"** → **"Google 表格"** → **"选择表格"**
3. 选择你刚创建的电子表格
4. 点击 **"确定"**

### 第 4 步：部署 Web App

1. 在 Google Apps Script 编辑器中
2. 点击 **"部署"** → **"新建部署"**
3. 点击 **"选择类型"** → **"网页应用"**
4. 设置：
   - **说明**：`The Little Nest Calendar API`
   - **执行身份**：选择 **"我"**
   - **具有访问权限的用户**：选择 **"所有人"**
5. 点击 **"部署"**
6. **复制 Web App URL**（格式类似：`https://script.google.com/macros/s/AKfycbw.../exec`）

### 第 5 步：设置环境变量（可选）

如果你想要自定义 URL，在项目根目录创建 `.env` 文件：

```
VITE_GOOGLE_SCRIPT_URL=你的WebAppURL
```

如果不设置，会使用默认的 URL。

### 第 6 步：测试

1. 打开应用
2. 添加一个测试预订
3. 应该看到：`✓ 预订已添加并保存到云端！`
4. 在 Google Sheets 刷新，应该能看到刚才添加的预订
5. 换浏览器打开应用，应该能看到刚才添加的预订

## ✅ 完成！

现在数据会自动保存到 Google Sheets，所有设备都能看到！

## 💡 额外功能

- 可以在 Google Sheets 直接查看、编辑、删除预订
- 数据会自动同步到应用
- 完全免费，无限制

## 🔒 安全提示

- Web App URL 是公开的，但只有知道 URL 的人才能访问
- 建议定期更换 URL（重新部署）
- 可以在 Google Apps Script 中设置访问权限

## ❓ 常见问题

**Q: Web App URL 在哪里？**
A: 在 Google Apps Script → 部署 → 管理部署 → 复制 URL

**Q: 需要付费吗？**
A: 完全免费，Google Sheets 和 Apps Script 都是免费的

**Q: 如何查看存储的数据？**
A: 直接在 Google Sheets 查看，数据会实时同步

**Q: 可以多人使用吗？**
A: 可以，只要分享 Google Sheet 的访问权限即可

