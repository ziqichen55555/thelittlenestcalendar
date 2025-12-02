# 📝 创建 thelittlenestbookings 工作表 - 详细步骤

## ⚠️ 问题

API 返回 `{"error":"Sheet not found"}`，说明 Google Sheet 中没有名为 `thelittlenestbookings` 的工作表。

## ✅ 解决方案：创建工作表

### 步骤 1：打开 Google Sheet

打开你的 Google Sheet：
https://docs.google.com/spreadsheets/d/1jEm1ll9ikN_dtWy21gXpCi8Uuc21VyRmuSFzWMGWg3c/edit

### 步骤 2：创建新工作表

1. **查看底部的工作表标签**（通常在左下角）
2. **点击工作表标签旁边的 "+" 按钮**（或点击 "插入" → "工作表"）
3. **新工作表会自动创建**

### 步骤 3：重命名工作表

1. **右键点击新工作表的标签**（或双击标签）
2. **选择 "重命名"**（或直接输入新名称）
3. **输入**：`thelittlenestbookings`
   - ⚠️ **注意**：必须完全一致，包括大小写
   - ✅ 正确：`thelittlenestbookings`
   - ❌ 错误：`TheLittleNestBookings`、`thelittlenestbooking`、`TheLittleNestBookings`

### 步骤 4：添加表头（第一行）

在 `thelittlenestbookings` 工作表中，在第一行（A1-F1）输入以下表头：

| A1 | B1 | C1 | D1 | E1 | F1 |
|---|---|---|---|---|---|
| ID | StartDate | EndDate | GuestsNo | Note | Color |

**具体操作**：
1. 点击 A1 单元格，输入：`ID`
2. 点击 B1 单元格，输入：`StartDate`
3. 点击 C1 单元格，输入：`EndDate`
4. 点击 D1 单元格，输入：`GuestsNo`
5. 点击 E1 单元格，输入：`Note`
6. 点击 F1 单元格，输入：`Color`

### 步骤 5：验证

1. **确认工作表名称**：
   - 底部标签应该显示：`thelittlenestbookings`

2. **确认表头**：
   - 第一行应该是：`ID | StartDate | EndDate | GuestsNo | Note | Color`

3. **测试 API**：
   - 在浏览器中打开：
     ```
     https://script.google.com/macros/s/AKfycbxsJMmHKtlQwn7wqFX3T6xRP96gDM8UdJp5MoZ2Q31_RSlOZTHLTlqoEAkfB8oZecY-Jw/exec
     ```
   - 应该返回：`[]`（空数组，因为还没有数据）

## 📸 截图参考

### 工作表标签位置
```
[Sheet1] [Sheet2] [+]  ← 点击 "+" 创建新工作表
```

### 重命名工作表
```
右键点击工作表标签 → 选择 "重命名" → 输入 "thelittlenestbookings"
```

### 表头示例
```
| A  | B         | C       | D        | E    | F     |
|----|-----------|---------|----------|------|-------|
| ID | StartDate | EndDate | GuestsNo | Note | Color |
```

## 🎯 完成后的验证

### 1. 在浏览器中测试 API

打开：
```
https://script.google.com/macros/s/AKfycbxsJMmHKtlQwn7wqFX3T6xRP96gDM8UdJp5MoZ2Q31_RSlOZTHLTlqoEAkfB8oZecY-Jw/exec
```

**期望结果**：
- ✅ 返回 `[]`（空数组）- 说明工作表存在，只是还没有数据
- ❌ 如果还是返回 `{"error":"Sheet not found"}`，说明工作表名称不对

### 2. 在网站中测试

1. **刷新你的网站**
2. **尝试添加一个预订**
3. **在 Google Sheet 中查看**，应该能看到新添加的数据

## ⚠️ 常见错误

### 错误 1：工作表名称拼写错误

- ❌ `TheLittleNestBookings`（大小写错误）
- ❌ `thelittlenestbooking`（少了一个 s）
- ❌ `thelittlenestbookings `（末尾有空格）
- ✅ `thelittlenestbookings`（正确）

### 错误 2：表头位置不对

- ❌ 表头在第二行或更下面
- ✅ 表头必须在第一行（A1-F1）

### 错误 3：表头名称不对

- ❌ `Guests`（应该是 `GuestsNo`）
- ❌ `startDate`（应该是 `StartDate`）
- ✅ 必须完全匹配：`ID | StartDate | EndDate | GuestsNo | Note | Color`

## 📞 如果还是不行

如果创建了工作表后，API 还是返回 `{"error":"Sheet not found"}`：

1. **确认工作表名称**：
   - 在 Google Sheet 中，查看底部标签，确认名称是 `thelittlenestbookings`（完全一致）

2. **确认 Google Apps Script 关联的表格**：
   - 打开 Google Apps Script：https://script.google.com/
   - 点击 "资源" → "Google 表格"
   - 确认关联的表格是正确的

3. **重新部署 Web App**（如果修改了工作表）：
   - 在 Google Apps Script 中
   - 点击 "部署" → "管理部署"
   - 点击 "编辑"（铅笔图标）
   - 选择 "新版本"
   - 点击 "部署"

