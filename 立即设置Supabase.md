# ⚡ 立即设置 Supabase（3 步）

## 🚀 步骤 1：获取 Supabase Anon Key

1. **访问 Supabase Dashboard：**
   ```
   https://supabase.com/dashboard
   ```

2. **选择你的项目**（URL 包含 `ivsokmmynbxguukzukvv`）

3. **点击左侧菜单 "Settings"（设置）**

4. **点击 "API"**

5. **在 "Project API keys" 部分，找到 "anon public" key**

6. **点击 "Reveal"（显示）或直接复制 key**

7. **复制完整的 key**（以 `eyJ` 开头的长字符串，类似这样：`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`）

## 📝 步骤 2：创建 .env 文件

在项目根目录（`/Users/chrischan/thelittlenestcalendar/`）创建 `.env` 文件：

### 方法 1：使用命令行

```bash
cd /Users/chrischan/thelittlenestcalendar
cat > .env << 'EOF'
VITE_SUPABASE_URL=https://ivsokmmynbxguukzukvv.supabase.co
VITE_SUPABASE_ANON_KEY=你的anon_key_在这里
EOF
```

然后将 `你的anon_key_在这里` 替换为步骤 1 中复制的 key。

### 方法 2：手动创建

1. **在项目根目录创建新文件，命名为 `.env`**
2. **添加以下内容：**

   ```
   VITE_SUPABASE_URL=https://ivsokmmynbxguukzukvv.supabase.co
   VITE_SUPABASE_ANON_KEY=你的anon_key_在这里
   ```

3. **将 `你的anon_key_在这里` 替换为步骤 1 中复制的 anon key**

## ✅ 步骤 3：验证设置

1. **确认 `.env` 文件已创建并包含正确的 key**

2. **重新启动开发服务器：**
   ```bash
   # 停止当前服务器（Ctrl+C）
   npm run dev
   ```

3. **刷新浏览器页面**

4. **查看控制台，应该不再显示 "请设置 Supabase Anon Key" 错误**

## 🔍 如何确认 .env 文件正确

运行以下命令检查：

```bash
cd /Users/chrischan/thelittlenestcalendar
cat .env
```

应该看到：
```
VITE_SUPABASE_URL=https://ivsokmmynbxguukzukvv.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

（key 应该是一个很长的字符串，以 `eyJ` 开头）

## 🆘 如果还是显示错误

1. **确认 `.env` 文件在项目根目录**（不是 `src/` 或其他子目录）

2. **确认 key 格式正确**（没有多余的空格或引号）

3. **重新启动开发服务器**（环境变量只在启动时加载）

4. **检查文件名**（必须是 `.env`，不是 `.env.txt` 或其他）

## 📖 下一步

设置好 `.env` 文件后，还需要：
1. 在 Supabase 中创建 `bookings` 表（查看 `创建bookings表的SQL.sql`）
2. 设置表权限（查看 `快速设置Supabase.md`）

