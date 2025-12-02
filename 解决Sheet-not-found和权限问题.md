# 🔧 解决 "Sheet not found" 和权限问题

## ⚠️ 发现的问题

从日志看到两个问题：

### 问题 1："Sheet not found"

**错误信息**：`{error: "Sheet not found"}`

**原因**：
- Google Sheet 中可能没有名为 `thelittlenestbookings` 的工作表
- 或者工作表名称不匹配

### 问题 2：权限问题（新发现）

**错误信息**：`Cross-origin redirection to https://accounts.google.com/ServiceLogin`

**原因**：
- Web App 的 "具有访问权限的用户" 可能没有设置为 "所有人"
- 或者需要重新授权

## ✅ 解决方案

### 步骤 1：确认工作表名称

1. **打开你的 Google Sheet**：
   - https://docs.google.com/spreadsheets/d/1jEm1ll9ikN_dtWy21gXpCi8Uuc21VyRmuSFzWMGWg3c/edit

2. **查看底部的工作表标签**：
   - 确认是否有名为 `thelittlenestbookings` 的工作表
   - 如果没有，需要创建一个

3. **如果工作表名称不同**：
   - 要么重命名工作表为 `thelittlenestbookings`
   - 要么修改 Google Apps Script 代码中的 `SHEET_NAME` 常量

### 步骤 2：创建工作表（如果需要）

如果 Google Sheet 中没有 `thelittlenestbookings` 工作表：

1. **在 Google Sheet 中**：
   - 点击底部的工作表标签旁边的 "+" 按钮
   - 创建新工作表
   - 重命名为 `thelittlenestbookings`

2. **添加表头**（第一行）：
   - A1: `ID`
   - B1: `StartDate`
   - C1: `EndDate`
   - D1: `GuestsNo`
   - E1: `Note`
   - F1: `Color`

### 步骤 3：确认 Google Apps Script 关联的表格

1. **打开 Google Apps Script**：https://script.google.com/
2. **选择你的项目**
3. **点击菜单栏的 "资源" → "Google 表格"**
4. **确认关联的表格是正确的**（应该是你刚才打开的表格）
5. **如果没有关联，点击 "选择表格" 并选择正确的表格**

### 步骤 4：修复 Web App 权限（重要！）

新的错误显示重定向到登录页面，这说明权限设置有问题：

1. **打开 Google Apps Script**
2. **点击 "部署" → "管理部署"**
3. **找到你的部署，点击 "编辑"**（铅笔图标）
4. **确认 "具有访问权限的用户" 设置为 "所有人"** ✅
5. **如果不是，改为 "所有人"**
6. **点击 "部署"**

### 步骤 5：如果还是重定向到登录

如果设置为 "所有人" 后还是重定向到登录：

1. **删除现有部署**
2. **创建新部署**：
   - 点击 "部署" → "新建部署"
   - 选择 "网页应用"
   - **"具有访问权限的用户" = "所有人"** ✅
   - 点击 "部署"
3. **首次访问时可能需要授权**：
   - 点击 "继续" 或 "授权"
   - 选择你的 Google 账号
   - 点击 "允许"

## 📋 工作表结构

确保 `thelittlenestbookings` 工作表的第一行（表头）是：

| A | B | C | D | E | F |
|---|---|---|---|---|---|
| ID | StartDate | EndDate | GuestsNo | Note | Color |

## 🔍 验证步骤

### 验证 1：工作表存在

1. **打开 Google Sheet**
2. **查看底部的工作表标签**
3. **确认有 `thelittlenestbookings` 工作表**

### 验证 2：表头正确

1. **打开 `thelittlenestbookings` 工作表**
2. **确认第一行是表头**：`ID | StartDate | EndDate | GuestsNo | Note | Color`

### 验证 3：Google Apps Script 关联正确

1. **打开 Google Apps Script**
2. **点击 "资源" → "Google 表格"**
3. **确认关联的表格是正确的**

### 验证 4：权限设置正确

1. **打开 Google Apps Script**
2. **点击 "部署" → "管理部署"**
3. **确认 "具有访问权限的用户" = "所有人"**

## 🎯 快速修复清单

- [ ] Google Sheet 中有 `thelittlenestbookings` 工作表
- [ ] 工作表第一行是表头：`ID | StartDate | EndDate | GuestsNo | Note | Color`
- [ ] Google Apps Script 关联的表格是正确的
- [ ] Web App 的 "具有访问权限的用户" = "所有人"
- [ ] 已重新部署（如果修改了权限设置）

## 📝 如果工作表名称不同

如果你在 Google Sheet 中使用的工作表名称不是 `thelittlenestbookings`：

### 选项 1：重命名工作表（推荐）

1. **在 Google Sheet 中**
2. **右键点击工作表标签**
3. **选择 "重命名"**
4. **改为 `thelittlenestbookings`**

### 选项 2：修改代码中的工作表名称

如果你不想重命名工作表，可以修改 Google Apps Script 代码：

1. **打开 Google Apps Script**
2. **找到代码开头的**：
   ```javascript
   const SHEET_NAME = "thelittlenestbookings";
   ```
3. **改为你实际使用的工作表名称**，例如：
   ```javascript
   const SHEET_NAME = "Sheet1"; // 或你实际的工作表名称
   ```
4. **保存并重新部署**

## 📞 如果还是不行

如果按照上述步骤操作后仍然有问题：

1. **确认工作表名称**：告诉我你实际使用的工作表名称
2. **确认权限设置**：截图部署设置页面
3. **确认关联的表格**：截图 Google Apps Script 的 "资源" → "Google 表格" 页面

