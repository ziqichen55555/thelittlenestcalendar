# 🔄 切换到 GET 方式 - 详细步骤

## 📋 概述

由于 Google Apps Script 的 OPTIONS 请求返回 405，我们改用 GET 请求方式，通过 URL 参数传递数据，避免 CORS 预检问题。

## ✅ 步骤 1：更新 Google Apps Script 代码

1. **打开 Google Apps Script：** https://script.google.com/
2. **选择你的项目**
3. **复制 `GoogleScript-GET方式.js` 文件中的完整代码**
4. **在 Google Apps Script 编辑器中，完全替换现有代码**
5. **保存代码**
6. **重新部署：**
   - 点击 "部署" → "管理部署"
   - 点击 "编辑"（铅笔图标）
   - 选择 "新版本"
   - 确认 "具有访问权限的用户" = "所有人"
   - 点击 "部署"

## ✅ 步骤 2：更新应用代码

1. **备份当前的 `googleSheetsStorage.ts`：**
   ```bash
   cp src/utils/googleSheetsStorage.ts src/utils/googleSheetsStorage.ts.backup
   ```

2. **替换为 GET 方式版本：**
   ```bash
   cp googleSheetsStorage-GET方式.ts src/utils/googleSheetsStorage.ts
   ```

   或者手动复制 `googleSheetsStorage-GET方式.ts` 的内容到 `src/utils/googleSheetsStorage.ts`

3. **重新构建和部署应用**

## ✅ 步骤 3：测试

1. **等待 30-60 秒让部署生效**
2. **打开应用：** https://ziqichen55555.github.io/thelittlenestcalendar/
3. **硬刷新页面：** `Ctrl+Shift+R` (Windows) 或 `Cmd+Shift+R` (Mac)
4. **测试功能：**
   - 尝试添加一个新预订
   - 尝试更新一个预订
   - 尝试删除一个预订
   - 查看是否还有错误

## 📊 预期结果

- ✅ GET 请求成功（不需要 CORS 预检）
- ✅ 添加/更新/删除功能正常工作
- ✅ 不再出现 CORS 错误

## ⚠️ 注意事项

1. **URL 长度限制：**
   - GET 请求的 URL 长度有限制（通常 2048 字符）
   - 对于很长的备注（Note），可能需要截断

2. **数据暴露：**
   - 数据会出现在 URL 中
   - 虽然不会直接显示在浏览器地址栏，但会在网络请求中可见

3. **性能：**
   - GET 请求通常比 POST 稍快
   - 但 URL 参数编码可能增加请求大小

## 🔄 如果遇到问题

如果切换到 GET 方式后遇到问题：

1. **检查 Google Apps Script 执行日志：**
   - 确认 `doGet` 被调用
   - 查看是否有错误信息

2. **检查浏览器控制台：**
   - 查看网络请求
   - 确认请求是否成功

3. **回滚到 POST 方式：**
   - 恢复备份的 `googleSheetsStorage.ts`
   - 恢复原来的 Google Apps Script 代码

## 💡 优势

- ✅ 完全避免 CORS 预检问题
- ✅ 实现简单
- ✅ 不需要额外的服务
- ✅ 可以立即使用

