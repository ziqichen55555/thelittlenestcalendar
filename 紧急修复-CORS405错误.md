# 🚨 紧急修复：CORS 405 错误

## 📊 当前状态

根据诊断工具的结果：
- ✅ **GET 请求成功** - 工作表存在，有 1 条记录
- ❌ **POST 请求失败** - CORS 405 错误

这说明：
- Google Sheet 连接正常
- `doGet` 函数工作正常
- `doPost` 或 `doOptions` 函数有问题

## 🔍 问题原因

CORS 405 错误通常是因为：
1. **`doOptions` 函数不存在或未正确部署**
2. **Web App 访问权限未设置为"所有人"**
3. **使用了 `/dev` 版本而不是 `/exec` 版本**
4. **部署版本未更新**（即使代码中有 `doOptions`，但部署的版本可能还是旧的）

## ✅ 完整修复步骤

### 步骤 1：确认 Google Apps Script 代码

1. 打开 Google Apps Script：https://script.google.com/
2. 选择你的项目
3. **检查代码中是否有 `doOptions` 函数**

如果没有，复制以下代码并**放在文件的最顶部**：

```javascript
// 统一的表名
const SHEET_NAME = "thelittlenestbookings";

// 处理 CORS 预检请求（重要！必须放在最顶部）
function doOptions() {
  return ContentService.createTextOutput('')
    .setMimeType(ContentService.MimeType.JSON);
}
```

**重要：** `doOptions` 函数必须存在，并且应该放在文件的最顶部（在 `doGet` 和 `doPost` 之前）。

### 步骤 2：确认完整的代码

确保你的 Google Apps Script 包含以下所有函数：
- `doOptions()` - 处理 CORS 预检请求
- `doGet()` - 获取数据
- `doPost()` - 添加/更新/删除数据

如果缺少任何函数，请查看 `更新后的GoogleScript代码.js` 文件获取完整代码。

### 步骤 3：保存代码

1. 点击 **"保存"** 按钮（或按 `Ctrl+S` / `Cmd+S`）
2. 确认没有语法错误

### 步骤 4：重新部署 Web App（关键步骤！）

这是最关键的步骤！即使代码中有 `doOptions`，如果部署版本未更新，仍然会出现 CORS 错误。

1. 点击 **"部署"** → **"管理部署"**
2. 找到你的 Web App 部署
3. 点击 **"编辑"**（铅笔图标）
4. **重要：** 在 "版本" 下拉菜单中，选择 **"新版本"**（不要选择 "Head"）
5. 确认 **"具有访问权限的用户"** 设置为 **"所有人"**
6. 点击 **"部署"**
7. 等待部署完成

### 步骤 5：获取新的 Web App URL

部署完成后：
1. 在部署详情页面，找到 **"Web app"** 部分
2. 复制 **"URL"**（应该以 `/exec` 结尾，不是 `/dev`）
3. 确认 URL 格式：`https://script.google.com/macros/s/.../exec`

**重要：** 必须使用 `/exec` 版本，不要使用 `/dev` 版本。

### 步骤 6：更新应用中的 URL

如果 URL 有变化，需要更新应用代码：

1. 打开项目根目录的 `.env` 文件（如果不存在，创建一个）
2. 添加或更新：
   ```
   VITE_GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/你的新URL/exec
   ```
3. 保存文件
4. 重新构建和部署应用

### 步骤 7：测试

1. 打开应用：https://ziqichen55555.github.io/thelittlenestcalendar/
2. 打开浏览器控制台（F12）
3. 尝试添加一个新预订
4. 查看控制台是否有错误

如果仍然有 CORS 错误：
- 检查控制台中的错误信息
- 确认使用的是最新的 Web App URL（`/exec` 版本）
- 确认 Web App 访问权限设置为"所有人"

## 🔍 验证清单

在修复后，请确认：

- [ ] `doOptions` 函数存在于 Google Apps Script 代码中
- [ ] `doOptions` 函数位于文件顶部（在 `doGet` 和 `doPost` 之前）
- [ ] 代码已保存（没有语法错误）
- [ ] Web App 已重新部署（选择了"新版本"）
- [ ] Web App 访问权限设置为"所有人"
- [ ] 使用的 URL 是 `/exec` 版本（不是 `/dev`）
- [ ] 应用代码中的 URL 已更新（如果部署后 URL 有变化）

## 📖 相关文档

- `更新后的GoogleScript代码.js` - 完整的 Google Apps Script 代码
- `重要-CORS设置说明.md` - 关于 CORS 设置的详细说明
- `检查GoogleSheet.html` - 诊断工具（可在浏览器中打开测试）

## 💡 常见问题

### Q: 我已经添加了 `doOptions`，为什么还是 405 错误？

**A:** 最可能的原因是部署版本未更新。即使代码中有 `doOptions`，如果部署时选择了"Head"而不是"新版本"，部署的版本可能还是旧的。**必须选择"新版本"重新部署。**

### Q: 如何确认部署版本已更新？

**A:** 在 Google Apps Script 中：
1. 点击 "部署" → "管理部署"
2. 查看部署的版本号和时间
3. 如果版本号没有变化，说明没有创建新版本

### Q: `/dev` 和 `/exec` 有什么区别？

**A:** 
- `/dev` 是开发版本，每次保存代码后自动更新，但可能有 CORS 限制
- `/exec` 是生产版本，需要手动部署，但 CORS 支持更好

**必须使用 `/exec` 版本。**

### Q: 访问权限设置为"所有人"安全吗？

**A:** 对于这个应用（日历预订系统），设置为"所有人"是必要的，因为：
- 需要从任何设备访问
- 数据访问受 Google Apps Script 代码控制
- 只有授权的 Google Sheet 才能被访问

## 🆘 如果还是不行

如果按照上述步骤操作后仍然有 CORS 错误：

1. **清除浏览器缓存**：
   - Chrome/Edge: `Ctrl+Shift+Delete`（Windows）或 `Cmd+Shift+Delete`（Mac）
   - 选择"缓存的图片和文件"
   - 点击"清除数据"

2. **使用诊断工具**：
   - 打开 `检查GoogleSheet.html`
   - 运行完整检查
   - 查看详细的错误信息

3. **检查 Google Apps Script 执行日志**：
   - 在 Google Apps Script 编辑器中
   - 点击 "执行" → 查看执行日志
   - 查看是否有错误信息

4. **联系支持**：
   - 提供诊断工具的完整输出
   - 提供 Google Apps Script 代码（隐藏敏感信息）
   - 提供浏览器控制台的完整错误信息

