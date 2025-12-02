# 🚀 Airtable 云端存储设置（3分钟完成，完全免费）

## 为什么使用 Airtable？

- ✅ **完全免费** - 免费版有 1200 条记录/基础，完全够用
- ✅ **超级简单** - 只需要复制粘贴两个值
- ✅ **可视化界面** - 可以在 Airtable 网站直接查看和编辑数据
- ✅ **自动同步** - 所有设备都能看到数据
- ✅ **无需编程** - 设置非常简单

## 📝 设置步骤（3分钟）

### 第 1 步：创建 Airtable 账户和基础（1分钟）

1. 访问：https://airtable.com/
2. 点击 **"Sign up"**（注册）或 **"Sign in"**（登录）
3. 如果注册，使用 Google 账号登录最简单
4. 创建完成后，会自动创建一个新的基础（Base）

### 第 2 步：创建表格和字段（1分钟）

1. 在 Airtable 中，你的基础应该已经有一个表格（Table）
2. 将表格重命名为：**"Bookings"**（点击表格名称即可重命名）
3. 删除默认字段，创建以下字段：
   - **StartDate**（开始日期）
     - 类型：`Date`
     - 格式：`YYYY-MM-DD`
   - **EndDate**（结束日期）
     - 类型：`Date`
     - 格式：`YYYY-MM-DD`
   - **Guests**（人数）
     - 类型：`Number`
   - **Note**（备注）
     - 类型：`Long text`
   - **Color**（颜色）
     - 类型：`Single select`
     - 选项：`green`（可选，用于特殊标记）

**快速方法：**
- 点击字段名称可以重命名
- 点击字段类型可以更改类型
- 点击 "+" 可以添加新字段

### 第 3 步：获取 Base ID 和 API Key（1分钟）

#### 获取 Base ID：

1. 访问：https://airtable.com/api
2. 选择你的基础（Base）
3. 在页面顶部，你会看到类似这样的 URL：
   ```
   https://airtable.com/appXXXXXXXXXXXXXX/api/docs
   ```
4. **Base ID** 就是 `app` 后面的部分：`XXXXXXXXXXXXXX`

#### 获取 API Key：

1. 在同一个页面（API 文档页面）
2. 点击右上角你的头像
3. 选择 **"Account"**（账户）
4. 在左侧菜单，点击 **"Developer"**（开发者）
5. 在 "Personal access tokens" 部分，点击 **"Create new token"**
6. 输入 Token 名称：`thelittlenestcalendar`
7. 选择权限：
   - 选择你的基础（Base）
   - 勾选 **"data.records:read"** 和 **"data.records:write"**
8. 点击 **"Create token"**
9. **立即复制 Token**（只显示一次！）

### 第 4 步：设置环境变量（30秒）

1. 在项目根目录创建 `.env` 文件（如果还没有）
2. 添加以下两行：

```
VITE_AIRTABLE_BASE_ID=你的BaseID（从第3步获取）
VITE_AIRTABLE_API_KEY=你的APIKey（从第3步获取）
```

例如：
```
VITE_AIRTABLE_BASE_ID=appXXXXXXXXXXXXXX
VITE_AIRTABLE_API_KEY=patxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

3. 保存文件

### 第 5 步：重新构建（30秒）

```bash
npm run build
```

### 第 6 步：测试

1. 打开应用
2. 添加一个测试预订
3. 应该看到：`✓ 预订已添加并保存到云端！`
4. 在 Airtable 网站刷新，应该能看到刚才添加的预订
5. 换浏览器打开应用，应该能看到刚才添加的预订

## ✅ 完成！

现在数据会自动保存到 Airtable，所有设备都能看到！

## 💡 额外功能

- 可以在 Airtable 网站直接查看、编辑、删除预订
- 数据会自动同步到应用
- 免费版有 1200 条记录，完全够用

## 🔒 安全提示

- API Key 保存在 `.env` 文件中，**不要**提交到 GitHub
- `.env` 文件已经在 `.gitignore` 中，不会被上传
- 如果 API Key 泄露，可以在 Airtable 账户设置中删除并重新创建

## ❓ 常见问题

**Q: Base ID 在哪里？**
A: 在 Airtable API 文档页面的 URL 中，`app` 后面的部分

**Q: API Key 在哪里？**
A: 在 Airtable 账户设置 → Developer → Personal access tokens

**Q: 需要付费吗？**
A: 免费版有 1200 条记录，完全够用。如果需要更多，可以升级。

**Q: 如何查看存储的数据？**
A: 直接在 Airtable 网站查看，数据会实时同步

**Q: 字段名称必须完全一样吗？**
A: 是的，字段名称必须完全匹配：`StartDate`, `EndDate`, `Guests`, `Note`, `Color`

