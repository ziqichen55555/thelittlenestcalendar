# 📊 如何查看 Google Sheets

## 方法 1：通过 Google Apps Script 访问（推荐）

### 步骤 1：打开 Google Apps Script

1. 访问：https://script.google.com/
2. 选择你的项目（The Little Nest Calendar 或类似名称）

### 步骤 2：打开关联的 Google Sheet

1. 在 Google Apps Script 编辑器中
2. 点击菜单栏的 **"资源"**（Resources）或 **"扩展"**（Extensions）
3. 选择 **"Google 表格"**（Google Sheets）
4. 点击 **"选择表格"**（Select spreadsheet）
5. 选择你的表格，或点击 **"打开"**（Open）直接打开

### 步骤 3：查看数据

1. 打开 Google Sheet 后
2. 查看底部的工作表标签
3. 找到名为 **`thelittlenestbookings`** 的工作表
4. 如果没有这个工作表，说明还没有数据被保存

## 方法 2：直接访问 Google Sheets

### 步骤 1：打开 Google Sheets

1. 访问：https://sheets.google.com/
2. 登录你的 Google 账号

### 步骤 2：查找你的表格

1. 在 Google Sheets 首页
2. 查找名为 "The Little Nest Calendar" 或类似的表格
3. 如果找不到，可能表格还没有创建

### 步骤 3：查看数据

1. 打开表格后
2. 查看底部的工作表标签
3. 找到名为 **`thelittlenestbookings`** 的工作表
4. 查看数据行（从第二行开始，第一行是表头）

## 📋 工作表结构

### 表头（第一行）

| A | B | C | D | E | F |
|---|---|---|---|---|---|
| ID | StartDate | EndDate | GuestsNo | Note | Color |

### 数据行（从第二行开始）

每一行代表一个预订：
- **A 列**：ID（预订的唯一标识）
- **B 列**：StartDate（开始日期，格式：YYYY-MM-DD）
- **C 列**：EndDate（结束日期，格式：YYYY-MM-DD）
- **D 列**：GuestsNo（人数）
- **E 列**：Note（备注）
- **F 列**：Color（颜色，如果有特殊标记）

## 🔍 如果没有找到工作表

### 可能的原因

1. **还没有数据被保存**
   - 应用还没有添加任何预订
   - 或者添加操作失败了

2. **工作表名称不同**
   - 检查代码中的 `SHEET_NAME` 常量
   - 应该是 `"thelittlenestbookings"`

3. **表格还没有创建**
   - 第一次添加预订时，Google Apps Script 会自动创建工作表
   - 如果还没有添加过预订，工作表可能不存在

### 解决方案

1. **在应用中添加一个测试预订**
2. **等待几秒钟**
3. **刷新 Google Sheet**
4. **查看是否出现了 `thelittlenestbookings` 工作表**

## ✅ 验证数据同步

### 步骤 1：在应用中添加一个预订

1. 打开你的日历应用
2. 点击 "+ 新建預訂"
3. 填写信息并保存

### 步骤 2：检查 Google Sheets

1. 打开 Google Sheet
2. 刷新页面（F5）
3. 查看 `thelittlenestbookings` 工作表
4. 应该能看到新添加的预订

### 步骤 3：对比数据

- **应用显示的预订数量** = **Google Sheets 中的行数 - 1**（减去表头）
- 如果数量一致，说明数据同步正常 ✅
- 如果数量不一致，可能是缓存问题（查看 `清理缓存和数据同步问题.md`）

## 🎯 快速访问

如果你知道 Google Sheet 的 URL，可以直接访问：

1. **通过 Google Apps Script**：
   - 打开 Google Apps Script
   - 点击 "资源" → "Google 表格" → "打开"
   - 复制浏览器地址栏的 URL

2. **通过 Google Drive**：
   - 访问：https://drive.google.com/
   - 查找你的表格文件
   - 打开后复制 URL

## 📝 提示

- Google Sheet 的 URL 格式类似：`https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`
- 工作表名称是 `thelittlenestbookings`（注意大小写）
- 第一行是表头，数据从第二行开始
- 每次添加/更新/删除预订后，Google Sheets 会自动更新

