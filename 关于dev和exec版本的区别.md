# 📝 关于 /dev 和 /exec 版本的区别

## ⚠️ 重要区别

你提供的 URL 是：
```
https://script.google.com/macros/s/AKfycbzM8hLEu8u82j0VbQq4QRbbt5M56IbiJuHKlhTnNU9L/dev
```

注意最后是 `/dev`，这是**开发版本**。

## ✅ 我们需要的是生产版本

生产版本的 URL 应该是：
```
https://script.google.com/macros/s/AKfycbzM8hLEu8u82j0VbQq4QRbbt5M56IbiJuHKlhTnNU9L/exec
```

注意最后是 `/exec`，不是 `/dev`。

## 🔍 如何获取正确的 URL

### 方法 1：查看部署页面

1. **打开 Google Apps Script**
2. **点击 "部署" → "管理部署"**
3. **找到你的部署**
4. **查看 "Web app" 部分的 URL**
5. **确认 URL 以 `/exec` 结尾**（不是 `/dev`）

### 方法 2：如果只有 /dev 版本

如果你看到的 URL 确实是 `/dev`：

1. **确认部署类型**：
   - 在 "管理部署" 页面
   - 查看部署的 "版本" 设置
   - 如果是 "Head" 或 "开发版本"，需要改为具体版本号

2. **创建生产部署**：
   - 点击 "部署" → "新建部署"
   - 选择 "网页应用"
   - 在 "版本" 下拉菜单中选择 **"新版本"**（不是 "Head"）
   - 设置 "具有访问权限的用户" = "所有人"
   - 点击 "部署"
   - 会得到一个以 `/exec` 结尾的 URL

## 📋 正确的部署设置

### 部署配置

- **版本**：选择 **"新版本"** 或具体版本号（如 "1"）
- **不是** "Head" 或 "开发版本"

### Web App URL 格式

- ✅ **正确**：`https://script.google.com/macros/s/.../exec`
- ❌ **错误**：`https://script.google.com/macros/s/.../dev`

## 🎯 下一步

1. **检查部署页面**，确认是否有以 `/exec` 结尾的 URL
2. **如果没有**，创建一个新部署，选择 "新版本"（不是 "Head"）
3. **复制正确的 URL**（以 `/exec` 结尾）
4. **告诉我新的 URL**，我会更新应用代码

## ⚠️ 关于 /dev 版本

`/dev` 版本是开发版本：
- 每次保存代码后会自动更新
- 但可能不稳定
- 不适合生产环境使用

`/exec` 版本是生产版本：
- 需要明确部署才会更新
- 更稳定
- 适合生产环境使用

## ✅ 推荐

使用 `/exec` 版本（生产版本）：
- 更稳定
- 不会因为代码保存而意外改变
- 适合实际使用

