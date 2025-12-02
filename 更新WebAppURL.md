# 🔄 更新 Web App URL

## ✅ 部署成功！

你的 Google Apps Script 已成功部署为 **Version 4**。

## 📝 新的 Web App URL

```
https://script.google.com/macros/s/AKfycbxMZB7n-n6RGxlyBCCrXHM26fHNoHlf9d_M57Iw7tVZU1GQWm-m4BSvctHJeGZn2PAd/exec
```

## 🔧 如何更新应用

### 方法 1：使用环境变量（推荐）

1. 在项目根目录创建或编辑 `.env` 文件
2. 添加以下内容：

```
VITE_GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/AKfycbxMZB7n-n6RGxlyBCCrXHM26fHNoHlf9d_M57Iw7tVZU1GQWm-m4BSvctHJeGZn2PAd/exec
```

3. 重新构建应用：
   ```bash
   npm run build
   ```

### 方法 2：直接更新代码（临时）

如果不想使用环境变量，可以直接更新代码中的默认 URL（不推荐，因为代码会提交到 GitHub）。

## ✅ 验证步骤

1. **更新 URL**（使用方法 1 或 2）
2. **重新构建应用**：`npm run build`
3. **测试功能**：
   - 添加预订
   - 更新预订
   - **删除预订**（这是之前失败的功能）
   - 获取所有预订

## 🎯 重要提示

- 确保 Web App 的 "具有访问权限的用户" 设置为 **"所有人"**
- 如果删除功能还是不行，检查浏览器控制台的错误信息
- 清除浏览器缓存后重试

## 📞 如果还有问题

如果更新 URL 后还有 CORS 错误：
1. 确认 Web App 部署设置中 "具有访问权限的用户" = "所有人"
2. 检查浏览器控制台的详细错误信息
3. 尝试硬刷新页面（Ctrl+Shift+R 或 Cmd+Shift+R）

