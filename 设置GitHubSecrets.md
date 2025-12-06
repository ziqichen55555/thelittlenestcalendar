# 🔐 设置 GitHub Secrets（用于部署）

## 📋 为什么需要设置？

`.env` 文件不会被部署到 GitHub Pages，所以需要在 GitHub Secrets 中设置环境变量，让 GitHub Actions 在构建时注入。

## ✅ 设置步骤

### 步骤 1：打开 GitHub 仓库设置

1. **访问你的 GitHub 仓库：**
   ```
   https://github.com/ziqichen55555/thelittlenestcalendar
   ```

2. **点击 "Settings"（设置）**

3. **在左侧菜单中找到 "Secrets and variables" → "Actions"**

### 步骤 2：添加 Secrets

点击 "New repository secret"（新建仓库密钥），添加以下两个 secrets：

#### Secret 1: VITE_SUPABASE_URL

1. **Name（名称）：** `VITE_SUPABASE_URL`
2. **Secret（值）：** `https://ivsokmmynbxguukzukvv.supabase.co`
3. **点击 "Add secret"**

#### Secret 2: VITE_SUPABASE_ANON_KEY

1. **Name（名称）：** `VITE_SUPABASE_ANON_KEY`
2. **Secret（值）：** `sb_publishable_I5EyEfT_eTSSfsdC6mMVbA_b6SiV6ox`
3. **点击 "Add secret"**

### 步骤 3：触发重新部署

设置好 Secrets 后，需要触发重新部署：

1. **在 GitHub 仓库页面，点击 "Actions" 标签**
2. **点击左侧的 "Deploy to GitHub Pages" workflow**
3. **点击 "Run workflow" 按钮**
4. **选择 "main" 分支**
5. **点击 "Run workflow"**

或者，直接推送一个小的更改来触发自动部署：

```bash
git commit --allow-empty -m "触发重新部署以使用新的环境变量"
git push
```

## ✅ 验证

部署完成后：

1. **访问部署的应用：** https://ziqichen55555.github.io/thelittlenestcalendar/
2. **尝试添加一个预订**
3. **查看是否还有 401 错误**

## 🔍 如果还是失败

如果设置 Secrets 后仍然失败：

1. **检查 Secrets 名称是否正确：**
   - 必须是 `VITE_SUPABASE_URL`（不是 `SUPABASE_URL`）
   - 必须是 `VITE_SUPABASE_ANON_KEY`（不是 `SUPABASE_ANON_KEY`）

2. **检查 Secrets 值是否正确：**
   - URL 应该以 `https://` 开头
   - Key 应该是完整的字符串（没有多余的空格）

3. **确认已触发重新部署：**
   - 在 GitHub Actions 中查看最新的部署是否使用了新的 Secrets

## 💡 提示

- Secrets 是加密存储的，只有仓库管理员可以看到
- 修改 Secrets 后，需要重新部署才能生效
- 本地开发仍然使用 `.env` 文件

