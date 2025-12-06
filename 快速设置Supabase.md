# ⚡ 快速设置 Supabase（5 分钟）

## 🚀 步骤 1：获取 Supabase Anon Key

1. **访问你的 Supabase 项目：** https://supabase.com/dashboard
2. **选择项目：** `ivsokmmynbxguukzukvv`（或你的项目）
3. **点击左侧菜单 "Settings" → "API"**
4. **复制以下信息：**
   - **Project URL**：`https://ivsokmmynbxguukzukvv.supabase.co`（已提供）
   - **anon public key**：以 `eyJ...` 开头的长字符串

## 🗄️ 步骤 2：创建 bookings 表

### 方法 1：使用 SQL Editor（推荐）

1. **在 Supabase 项目中，点击左侧菜单 "SQL Editor"**
2. **点击 "New query"**
3. **复制 `创建bookings表的SQL.sql` 文件中的全部内容**
4. **粘贴到 SQL Editor**
5. **点击 "Run"（运行）**
6. **确认表已创建**

### 方法 2：使用 Table Editor

1. **点击左侧菜单 "Table Editor"**
2. **点击 "Create a new table"**
3. **表名：** `bookings`
4. **添加列：**

   | 列名 | 类型 | 默认值 | 必需 | 主键 |
   |------|------|--------|------|------|
   | id | text | - | ✅ | ✅ |
   | startDate | text | - | ✅ | - |
   | endDate | text | - | ✅ | - |
   | guests | int4 | 1 | ✅ | - |
   | note | text | '' | - | - |
   | color | text | null | - | - |

5. **点击 "Save"**

## 🔐 步骤 3：设置表权限

1. **点击左侧菜单 "Authentication" → "Policies"**
2. **选择 "bookings" 表**
3. **创建 4 个策略：**

   **策略 1：允许所有人读取**
   - 点击 "New Policy" → "For full customization"
   - Name: `Allow public read`
   - Allowed operation: `SELECT`
   - Policy definition: `true`

   **策略 2：允许所有人插入**
   - 点击 "New Policy" → "For full customization"
   - Name: `Allow public insert`
   - Allowed operation: `INSERT`
   - Policy definition: `true`

   **策略 3：允许所有人更新**
   - 点击 "New Policy" → "For full customization"
   - Name: `Allow public update`
   - Allowed operation: `UPDATE`
   - Policy definition: `true`

   **策略 4：允许所有人删除**
   - 点击 "New Policy" → "For full customization"
   - Name: `Allow public delete`
   - Allowed operation: `DELETE`
   - Policy definition: `true`

## ⚙️ 步骤 4：配置应用

1. **在项目根目录创建或编辑 `.env` 文件：**

   ```env
   VITE_SUPABASE_URL=https://ivsokmmynbxguukzukvv.supabase.co
   VITE_SUPABASE_ANON_KEY=你的anon_key_在这里
   ```

2. **将 `你的anon_key_在这里` 替换为步骤 1 中复制的 anon public key**

3. **保存文件**

## 🧪 步骤 5：测试

1. **重新启动开发服务器：**

   ```bash
   npm run dev
   ```

2. **打开应用：** http://localhost:5173

3. **尝试添加一个预订**

4. **在 Supabase Table Editor 中查看数据**

## ✅ 完成！

如果一切正常，你应该能够：
- ✅ 添加预订
- ✅ 更新预订
- ✅ 删除预订
- ✅ 在 Supabase 中看到数据

## 🆘 如果遇到问题

### 问题 1：401 Unauthorized

**解决：** 检查 `.env` 文件中的 `VITE_SUPABASE_ANON_KEY` 是否正确

### 问题 2：404 Not Found

**解决：** 确认 `bookings` 表已创建

### 问题 3：403 Forbidden

**解决：** 确认已创建 RLS 策略并允许 public 访问

### 问题 4：字段名错误

**解决：** 确认表列名与代码中的字段名匹配（使用 camelCase：`startDate`, `endDate`）

