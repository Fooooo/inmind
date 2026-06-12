# 部署指南

## 重要：CF Pages Functions 不支持「拖放上傳」

如果你之前是直接把文件夾拖進 Cloudflare Dashboard 上傳的，**Functions 不會生效**，會報 405 錯誤。

必須用以下兩種方式之一部署：

---

## 方式一：Wrangler CLI（推薦，最簡單）

### 1. 安裝 Node.js
訪問 https://nodejs.org 下載 LTS 版本並安裝。

### 2. 安裝 Wrangler
打開終端，執行：
```bash
npm install -g wrangler
```

### 3. 登入 Cloudflare
```bash
npx wrangler login
```
會彈出瀏覽器讓你授權，點擊允許即可。

### 4. 進入項目目錄並部署
```bash
cd inmind-yijing
npx wrangler pages deploy .
```

### 5. 設置環境變量
部署完成後，訪問 Cloudflare Dashboard → 你的項目 → Settings → Functions → Environment variables，添加：
- `COZE_PAT` = 你的扣子個人訪問令牌
- `BOT_ID` = 你的智能體ID

---

## 方式二：GitHub 集成（適合有Git基礎的用戶）

### 1. 創建 GitHub 倉庫
把 `inmind-yijing` 文件夾推送到 GitHub。

### 2. 在 CF Dashboard 創建 Pages 項目
- 選擇「Connect to Git」
- 選擇你的 GitHub 倉庫
- 構建命令留空（純靜態項目）
- 輸出目錄留空（根目錄）

### 3. 設置環境變量
同上。

---

## 驗證 Functions 是否生效

部署完成後，在瀏覽器訪問：
```
https://你的域名/api/chat
```

如果看到「Method Not Allowed」或類似提示，說明 Function 已生效（因為它只接受 POST）。

如果看到 404，說明 Functions 沒有正確部署。

---

## 常見問題

### Q: 為什麼拖放上傳不行？
A: CF Pages 的「拖放上傳」只支持純靜態文件，不支持 Serverless Functions。Functions 必須通過 Wrangler CLI 或 Git 集成部署。

### Q: 環境變量設置後需要重新部署嗎？
A: 不需要，環境變量修改後立即生效。
