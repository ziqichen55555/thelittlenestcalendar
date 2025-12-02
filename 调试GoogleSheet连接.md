# 🔍 调试 Google Sheet 连接问题

## 🎯 目标

确认 Google Apps Script 是否正确连接到 Google Sheet，以及工作表名称是否正确。

## 📋 步骤 1：确认 Google Apps Script 关联的表格

### 方法 1：在 Google Apps Script 中查看

1. **打开 Google Apps Script**：https://script.google.com/
2. **选择你的项目**
3. **点击菜单栏的 "资源" → "Google 表格"**
4. **查看关联的表格**：
   - 应该显示：`thelittlenestbookings` 或你的表格名称
   - 如果没有关联，点击 "选择表格" 并选择正确的表格

### 方法 2：在代码中查看

1. **打开 Google Apps Script 编辑器**
2. **查看代码中的 `SHEET_NAME` 常量**：
   ```javascript
   const SHEET_NAME = "thelittlenestbookings";
   ```
3. **确认这个名称与你的 Google Sheet 中的工作表名称一致**

## 📋 步骤 2：确认 Google Sheet 中的工作表名称

1. **打开你的 Google Sheet**：
   - https://docs.google.com/spreadsheets/d/1jEm1ll9ikN_dtWy21gXpCi8Uuc21VyRmuSFzWMGWg3c/edit

2. **查看底部的工作表标签**：
   - 应该有一个名为 `thelittlenestbookings` 的工作表
   - 如果没有，需要创建一个

3. **如果工作表名称不同**：
   - 要么重命名工作表为 `thelittlenestbookings`
   - 要么修改 Google Apps Script 代码中的 `SHEET_NAME` 常量

## 📋 步骤 3：测试 API 是否工作

### 测试 1：直接访问 doGet URL

在浏览器中打开：
```
https://script.google.com/macros/s/AKfycbxsJMmHKtlQwn7wqFX3T6xRP96gDM8UdJp5MoZ2Q31_RSlOZTHLTlqoEAkfB8oZecY-Jw/exec
```

**期望结果**：
- 如果工作表存在且有数据：返回 JSON 数组
- 如果工作表存在但无数据：返回 `[]`
- 如果工作表不存在：返回 `{"error": "Sheet not found"}`

### 测试 2：在浏览器控制台测试

打开你的网站，在浏览器控制台（F12）中运行：

```javascript
// 测试 GET 请求
fetch('https://script.google.com/macros/s/AKfycbxsJMmHKtlQwn7wqFX3T6xRP96gDM8UdJp5MoZ2Q31_RSlOZTHLTlqoEAkfB8oZecY-Jw/exec')
  .then(r => r.json())
  .then(data => {
    console.log('📊 获取到的数据:', data);
    console.log('📊 数据类型:', Array.isArray(data) ? '数组' : typeof data);
    if (data.error) {
      console.error('❌ 错误:', data.error);
    } else {
      console.log('✓ 成功获取', data.length, '条记录');
    }
  })
  .catch(err => {
    console.error('❌ 请求失败:', err);
  });
```

### 测试 3：测试 POST 请求（添加数据）

在浏览器控制台中运行：

```javascript
// 测试添加数据
fetch('https://script.google.com/macros/s/AKfycbxsJMmHKtlQwn7wqFX3T6xRP96gDM8UdJp5MoZ2Q31_RSlOZTHLTlqoEAkfB8oZecY-Jw/exec', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    action: 'add',
    ID: 'test-' + Date.now(),
    StartDate: '2025-12-03',
    EndDate: '2025-12-05',
    GuestsNo: 2,
    Note: '测试数据',
    Color: ''
  })
})
  .then(r => r.json())
  .then(data => {
    console.log('📊 添加结果:', data);
    if (data.status === 'success') {
      console.log('✓ 添加成功！');
    } else {
      console.error('❌ 添加失败:', data);
    }
  })
  .catch(err => {
    console.error('❌ 请求失败:', err);
  });
```

## 📋 步骤 4：检查 Google Apps Script 代码

### 确认代码结构

你的 Google Apps Script 代码应该包含：

1. **`SHEET_NAME` 常量**：
   ```javascript
   const SHEET_NAME = "thelittlenestbookings";
   ```

2. **`doOptions` 函数**（处理 CORS）：
   ```javascript
   function doOptions() {
     return ContentService.createTextOutput('')
       .setMimeType(ContentService.MimeType.JSON);
   }
   ```

3. **`doGet` 函数**（获取数据）：
   ```javascript
   function doGet() {
     const ss = SpreadsheetApp.getActiveSpreadsheet();
     const sheet = ss.getSheetByName(SHEET_NAME);
     // ...
   }
   ```

4. **`doPost` 函数**（添加/更新/删除数据）：
   ```javascript
   function doPost(e) {
     const ss = SpreadsheetApp.getActiveSpreadsheet();
     let sheet = ss.getSheetByName(SHEET_NAME);
     // ...
   }
   ```

### 确认工作表名称一致

**重要**：确保 `doGet` 和 `doPost` 都使用相同的 `SHEET_NAME` 常量！

## 📋 步骤 5：常见问题排查

### 问题 1："Sheet not found"

**可能原因**：
- Google Sheet 中没有名为 `thelittlenestbookings` 的工作表
- 工作表名称拼写错误（大小写敏感）
- Google Apps Script 没有关联到正确的 Google Sheet

**解决方法**：
1. 在 Google Sheet 中创建名为 `thelittlenestbookings` 的工作表
2. 或者修改 Google Apps Script 代码中的 `SHEET_NAME` 常量
3. 确认 Google Apps Script 关联的表格是正确的

### 问题 2：CORS 错误

**可能原因**：
- 缺少 `doOptions` 函数
- Web App 权限设置不正确

**解决方法**：
1. 确认代码中有 `doOptions` 函数
2. 确认 Web App 的 "具有访问权限的用户" = "所有人"
3. 重新部署 Web App

### 问题 3：重定向到登录页面

**可能原因**：
- Web App 权限设置不正确
- 需要重新授权

**解决方法**：
1. 确认 Web App 的 "具有访问权限的用户" = "所有人"
2. 删除旧部署，创建新部署
3. 首次访问时可能需要授权

## 📋 步骤 6：验证数据

### 在 Google Sheet 中查看

1. **打开 Google Sheet**
2. **切换到 `thelittlenestbookings` 工作表**
3. **查看数据**：
   - 第一行应该是表头：`ID | StartDate | EndDate | GuestsNo | Note | Color`
   - 第二行开始是数据

### 在网站中查看

1. **打开你的网站**
2. **打开浏览器控制台（F12）**
3. **查看日志**：
   - 应该看到 `📊 获取到的原始数据（来自 Google Sheets）`
   - 如果看到 `{error: "Sheet not found"}`，说明工作表名称不对

## 🎯 快速检查清单

- [ ] Google Sheet 中有 `thelittlenestbookings` 工作表
- [ ] 工作表第一行是表头：`ID | StartDate | EndDate | GuestsNo | Note | Color`
- [ ] Google Apps Script 代码中的 `SHEET_NAME = "thelittlenestbookings"`
- [ ] Google Apps Script 关联的表格是正确的
- [ ] Web App 的 "具有访问权限的用户" = "所有人"
- [ ] 代码中有 `doOptions` 函数
- [ ] 直接访问 doGet URL 能返回数据（或空数组）

## 📞 如果还是不行

请提供以下信息：

1. **直接访问 doGet URL 的结果**（截图或复制返回的内容）
2. **Google Sheet 中的工作表名称**（截图底部的工作表标签）
3. **Google Apps Script 代码中的 `SHEET_NAME` 值**
4. **浏览器控制台的完整错误信息**（截图）

