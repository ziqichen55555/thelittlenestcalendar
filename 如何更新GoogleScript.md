# 📝 如何更新 Google Apps Script 代码

## 🎯 目标

修复 CORS 错误，让删除功能正常工作。

## 📋 更新步骤

### 第 1 步：打开 Google Apps Script

1. 访问：https://script.google.com/
2. 选择你的项目（The Little Nest Calendar 或类似名称）

### 第 2 步：替换代码

1. **删除所有现有代码**
2. **复制 `更新后的GoogleScript代码.js` 文件中的完整代码**
3. **粘贴到编辑器中**

### 第 3 步：保存

1. 点击 **"保存"** 按钮（💾 图标）或按 `Ctrl+S` (Windows) / `Cmd+S` (Mac)

### 第 4 步：重新部署

1. 点击 **"部署"** → **"管理部署"**
2. 找到现有的部署，点击 **"编辑"**（铅笔图标）
3. 在 "版本" 下拉菜单中选择 **"新版本"**
4. 点击 **"部署"** 按钮
5. **重要**：确认 "具有访问权限的用户" 设置为 **"所有人"**

### 第 5 步：测试

1. 等待几秒钟让部署生效
2. 刷新你的日历应用页面
3. 尝试删除一个预订
4. 如果还有问题，查看浏览器控制台的错误信息

## ✅ 主要修改

### 1. 添加了 `doOptions` 函数

这个函数处理 CORS 预检请求（OPTIONS 请求），这是修复 CORS 错误的关键：

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

### 2. 在所有返回语句中添加了 CORS 头

所有 `doGet` 和 `doPost` 的返回语句现在都包含：

```javascript
.setHeaders({
  'Access-Control-Allow-Origin': '*'
})
```

### 3. 改进了 ID 处理

现在支持 `data.ID` 和 `data.id`（兼容不同格式）：

```javascript
const id = data.ID || data.id || Date.now().toString();
```

### 4. 添加了错误处理

在 `update` 和 `delete` action 中添加了 ID 验证。

## 🔍 验证更新是否成功

更新后，你应该能够：
- ✅ 添加预订
- ✅ 更新预订
- ✅ 删除预订（不再出现 CORS 错误）
- ✅ 获取所有预订

## ❓ 如果还有问题

1. **检查部署版本**：确保使用的是最新版本
2. **检查访问权限**：确保 Web App 设置为 "所有人" 可以访问
3. **清除浏览器缓存**：硬刷新页面（`Ctrl+Shift+R` 或 `Cmd+Shift+R`）
4. **查看控制台**：打开浏览器控制台（F12），查看是否有其他错误

## 📞 需要帮助？

如果更新后还有问题，请提供：
1. 浏览器控制台的错误信息
2. 你执行的步骤
3. 错误发生的具体操作（添加/更新/删除）

