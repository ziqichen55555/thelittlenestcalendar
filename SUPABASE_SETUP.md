# 🚀 Supabase 设置指南

## 📋 概述

这个应用现在使用 Supabase 作为后端数据库，替代了 Google Sheets。

## ✅ 设置步骤

### 步骤 1：创建 Supabase 项目

1. **访问 Supabase：** https://supabase.com/
2. **登录或注册账号**
3. **创建新项目：**
   - 点击 "New Project"
   - 输入项目名称（例如：thelittlenestcalendar）
   - 选择数据库密码
   - 选择区域（选择离你最近的）
   - 点击 "Create new project"
4. **等待项目创建完成**（通常需要 1-2 分钟）

### 步骤 2：获取 API 密钥

1. **在 Supabase 项目中，点击左侧菜单的 "Settings"（设置）**
2. **点击 "API"**
3. **复制以下信息：**
   - **Project URL**（项目 URL）：例如 `https://ivsokmmynbxguukzukvv.supabase.co`
   - **anon public key**（匿名公钥）：这是一个以 `eyJ...` 开头的长字符串

### 步骤 3：创建数据库表

1. **在 Supabase 项目中，点击左侧菜单的 "Table Editor"（表编辑器）**
2. **点击 "Create a new table"（创建新表）**
3. **设置表信息：**
   - **Name（表名）：** `bookings`
   - **Description（描述）：** `房间预订表`（可选）
4. **添加列（Columns）：**

   | 列名 | 类型 | 默认值 | 是否必需 | 说明 |
   |------|------|--------|----------|------|
   | id | text | - | ✅ 是 | 主键，预订 ID |
   | startDate | text | - | ✅ 是 | 开始日期（格式：YYYY-MM-DD） |
   | endDate | text | - | ✅ 是 | 结束日期（格式：YYYY-MM-DD） |
   | guests | integer | 1 | ✅ 是 | 人数 |
   | note | text | '' | ❌ 否 | 备注 |
   | color | text | null | ❌ 否 | 颜色（用于特殊标记） |
   | created_at | timestamp | now() | ❌ 否 | 创建时间（自动） |
   | updated_at | timestamp | now() | ❌ 否 | 更新时间（自动） |

5. **设置主键：**
   - 勾选 `id` 列的 "Is Primary Key"（是主键）
6. **点击 "Save"（保存）**

### 步骤 4：设置表权限

1. **在 Supabase 项目中，点击左侧菜单的 "Authentication"（认证）**
2. **点击 "Policies"（策略）**
3. **选择 "bookings" 表**
4. **创建以下策略：**

   **策略 1：允许所有人读取**
   - 点击 "New Policy"（新建策略）
   - 选择 "For full customization"（完全自定义）
   - Policy name: `Allow public read`
   - Allowed operation: `SELECT`
   - Policy definition: `true`
   - 点击 "Save"

   **策略 2：允许所有人插入**
   - 点击 "New Policy"（新建策略）
   - 选择 "For full customization"（完全自定义）
   - Policy name: `Allow public insert`
   - Allowed operation: `INSERT`
   - Policy definition: `true`
   - 点击 "Save"

   **策略 3：允许所有人更新**
   - 点击 "New Policy"（新建策略）
   - 选择 "For full customization"（完全自定义）
   - Policy name: `Allow public update`
   - Allowed operation: `UPDATE`
   - Policy definition: `true`
   - 点击 "Save"

   **策略 4：允许所有人删除**
   - 点击 "New Policy"（新建策略）
   - 选择 "For full customization"（完全自定义）
   - Policy name: `Allow public delete`
   - Allowed operation: `DELETE`
   - Policy definition: `true`
   - 点击 "Save"

### 步骤 5：配置应用

1. **在项目根目录创建 `.env` 文件**（如果不存在）
2. **添加以下内容：**

   ```env
   VITE_SUPABASE_URL=https://ivsokmmynbxguukzukvv.supabase.co
   VITE_SUPABASE_ANON_KEY=你的anon_key_在这里
   ```

3. **将 `你的anon_key_在这里` 替换为步骤 2 中复制的 anon public key**

4. **保存文件**

### 步骤 6：重新构建应用

1. **停止当前开发服务器**（如果正在运行）
2. **重新启动：**

   ```bash
   npm run dev
   ```

   或构建生产版本：

   ```bash
   npm run build
   ```

## ✅ 验证设置

1. **打开应用：** http://localhost:5173（开发环境）或部署后的 URL
2. **尝试添加一个预订**
3. **在 Supabase 的 Table Editor 中查看数据**
4. **确认数据已保存**

## 🔍 故障排除

### 问题 1：401 Unauthorized

**原因：** Supabase Anon Key 不正确或未设置

**解决：**
1. 检查 `.env` 文件中的 `VITE_SUPABASE_ANON_KEY` 是否正确
2. 确认复制了完整的 key（包括开头的 `eyJ`）
3. 重新启动开发服务器

### 问题 2：404 Not Found

**原因：** `bookings` 表不存在

**解决：**
1. 在 Supabase 中创建 `bookings` 表
2. 确认表名完全匹配（区分大小写）

### 问题 3：403 Forbidden

**原因：** 表权限未正确设置

**解决：**
1. 检查表的 RLS（Row Level Security）策略
2. 确认已创建允许 public 访问的策略

### 问题 4：CORS 错误

**原因：** Supabase 通常自动处理 CORS，但如果出现错误，可能需要检查配置

**解决：**
1. 确认 Supabase URL 正确
2. 检查浏览器控制台的详细错误信息

## 📊 表结构参考

完整的 SQL 创建语句：

```sql
CREATE TABLE bookings (
  id TEXT PRIMARY KEY,
  startDate TEXT NOT NULL,
  endDate TEXT NOT NULL,
  guests INTEGER NOT NULL DEFAULT 1,
  note TEXT DEFAULT '',
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 启用 RLS
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- 创建策略（允许所有人访问）
CREATE POLICY "Allow public read" ON bookings FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON bookings FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON bookings FOR DELETE USING (true);
```

## 💡 提示

1. **安全性：** 使用 anon key 意味着数据对所有人可见。如果这是问题，可以考虑：
   - 使用 Supabase Auth 添加用户认证
   - 创建更细粒度的 RLS 策略

2. **性能：** Supabase 提供实时订阅功能，但当前实现使用轮询（每 5 秒）。如果需要实时更新，可以改用 Supabase 的实时功能。

3. **备份：** 定期在 Supabase 中导出数据作为备份。

## 🆘 需要帮助？

如果遇到问题，请提供：
1. 浏览器控制台的错误信息
2. Supabase 项目设置截图
3. `.env` 文件内容（隐藏敏感信息）

