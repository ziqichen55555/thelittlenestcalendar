# GitHub Pages 部署說明

## ⚠️ 重要提示

**GitHub Pages 對公開倉庫是完全免費的！** 如果你看到升級提示，可能是因為：
- 倉庫設置為 **Private（私有）** - 私有倉庫的 GitHub Pages 需要付費計劃
- **解決方案**：將倉庫設置為 **Public（公開）** 即可免費使用

## 步驟 1: 在 GitHub 創建倉庫

1. 登錄 GitHub
2. 點擊右上角的 "+" 按鈕，選擇 "New repository"
3. 倉庫名稱建議使用：`thelittlenestcalendar`（如果使用其他名稱，需要修改 `vite.config.ts` 中的 `base` 路徑）
4. **重要：選擇 Public（公開）** - 這樣才能免費使用 GitHub Pages
5. **不要**勾選 "Initialize this repository with a README"
6. 點擊 "Create repository"

## 步驟 2: 推送代碼到 GitHub

在終端執行以下命令（將 `YOUR_USERNAME` 替換為你的 GitHub 用戶名）：

```bash
git remote add origin https://github.com/YOUR_USERNAME/thelittlenestcalendar.git
git branch -M main
git push -u origin main
```

## 步驟 3: 啟用 GitHub Pages

1. 進入你的 GitHub 倉庫頁面
2. 點擊 "Settings"（設置）
3. 在左側菜單中找到 "Pages"
4. 在 "Source" 部分：
   - 選擇 "GitHub Actions"
5. 保存設置

## 步驟 4: 等待自動部署

- 推送代碼後，GitHub Actions 會自動開始構建和部署
- 可以在倉庫的 "Actions" 標籤頁查看部署進度
- 部署完成後，你的網站將在以下地址可用：
  `https://YOUR_USERNAME.github.io/thelittlenestcalendar/`

## 注意事項

### 如果使用不同的倉庫名稱

如果倉庫名稱不是 `thelittlenestcalendar`，需要修改 `vite.config.ts`：

```typescript
base: process.env.NODE_ENV === 'production' ? '/YOUR_REPO_NAME/' : '/',
```

### 如果使用自定義域名

如果想使用自定義域名：
1. 在 `vite.config.ts` 中將 `base` 改為 `'/'`
2. 在 GitHub Pages 設置中添加自定義域名
3. 按照 GitHub 的說明配置 DNS

## 更新網站

每次你推送代碼到 `main` 分支時，GitHub Actions 會自動重新構建和部署網站。

