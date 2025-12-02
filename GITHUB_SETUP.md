# 🚀 GitHub Gist 云端存储设置（2分钟完成，完全免费）

## 为什么使用 GitHub Gist？

- ✅ **完全免费** - 不需要信用卡
- ✅ **简单快速** - 只需要一个 Token
- ✅ **自动同步** - 所有设备都能看到数据
- ✅ **私有安全** - 数据保存在私有 Gist 中

## 📝 设置步骤（2分钟）

### 第 1 步：创建 GitHub Token（1分钟）

**方法 1：通过设置页面**
1. 访问：https://github.com/settings/tokens/new
2. 或者：访问 https://github.com/settings → 左侧菜单找到 **"Developer settings"** → **"Personal access tokens"** → **"Tokens (classic)"** → **"Generate new token"** → **"Generate new token (classic)"**

**方法 2：直接链接**
1. 直接访问：https://github.com/settings/tokens/new?type=classic
2. 这会直接打开创建 Token 的页面

**创建 Token：**
1. 输入 Token 名称：`thelittlenestcalendar`（或任何名字）
2. 选择过期时间：**"No expiration"**（永不过期）
3. 勾选权限：**`gist`**（只需要这一个权限，在 "Select scopes" 部分找到）
4. 滚动到底部，点击 **"Generate token"**
5. **重要**：复制生成的 Token（只显示一次！格式类似：`ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`）

### 第 2 步：设置 Token（1分钟）

1. 在项目根目录创建 `.env` 文件（如果还没有）
2. 添加这一行：

```
VITE_GITHUB_TOKEN=你的token（粘贴刚才复制的token）
```

例如：
```
VITE_GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

3. 保存文件

### 第 3 步：重新构建（30秒）

```bash
npm run build
```

### 第 4 步：测试

1. 打开应用
2. 添加一个测试预订
3. 应该看到：`✓ 预订已添加并保存到云端！`
4. 换浏览器打开，应该能看到刚才添加的预订

## ✅ 完成！

现在数据会自动保存到 GitHub Gist，所有设备都能看到！

## 🔒 安全提示

- Token 保存在 `.env` 文件中，**不要**提交到 GitHub
- `.env` 文件已经在 `.gitignore` 中，不会被上传
- 如果 Token 泄露，可以在 GitHub 设置中删除并重新创建

## ❓ 常见问题

**Q: Token 在哪里？**
A: 在 `.env` 文件中，格式：`VITE_GITHUB_TOKEN=你的token`

**Q: 数据存储在哪里？**
A: 存储在 GitHub Gist（私有），只有你能看到

**Q: 需要付费吗？**
A: 完全免费，GitHub Gist 对个人使用没有限制

**Q: 如何查看存储的数据？**
A: 访问 https://gist.github.com/，可以看到你的私有 Gist

