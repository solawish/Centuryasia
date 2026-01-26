# Project Context

## Purpose
這是一個 Chrome 擴充功能（Chrome Extension），主要目的是協助使用者訂閱喜樂影城的電影票。

核心功能：
- 透過 popup.html 提供使用者介面
- 提供下拉式選單協助使用者快速選擇：
  - 影片選擇
  - 場次時間
  - 票種（一般票、學生票、優待票等）
  - 票數數量
- 簡化訂票流程，提升使用者體驗

## Tech Stack
- **前端技術**：
  - HTML5（popup.html）
  - CSS3（樣式設計）
  - JavaScript / TypeScript（功能實作）
- **Chrome Extension API**：
  - Manifest V3（最新版本）
  - Chrome Extension APIs（tabs, storage, scripting 等）
- **開發工具**：
  - 版本控制：Git
  - 程式碼格式化：Prettier（建議）
  - 程式碼檢查：ESLint（建議）

## Project Conventions

### Code Style
- **命名慣例**：
  - 變數和函數：camelCase（例如：`selectMovie`, `getTicketCount`）
  - 常數：UPPER_SNAKE_CASE（例如：`MAX_TICKET_COUNT`）
  - 類別：PascalCase（例如：`TicketSelector`）
  - HTML/CSS：kebab-case（例如：`movie-selector`, `ticket-count`）
- **格式化工具**：Prettier（建議使用）
- **程式碼檢查**：ESLint（建議使用）
- **行長限制**：100 字元
- **縮排**：2 空格

### Architecture Patterns
- **設計模式**：
  - 模組化設計：將功能拆分為獨立模組
  - 事件驅動：使用事件監聽器處理使用者互動
  - 單一職責原則：每個模組負責單一功能
- **檔案結構**：
  - `popup.html` - 主要使用者介面
  - `popup.js` / `popup.ts` - popup 邏輯
  - `content.js` / `content.ts` - 內容腳本（如需要與網頁互動）
  - `background.js` / `background.ts` - 背景腳本（如需要）
  - `manifest.json` - 擴充功能設定檔
- **狀態管理**：使用 Chrome Storage API 或簡單的 JavaScript 物件管理狀態

### Testing Strategy
- **測試類型**：
  - 單元測試：測試個別函數和模組
  - 整合測試：測試 popup 與 Chrome API 的互動
  - 手動測試：在 Chrome 瀏覽器中實際測試擴充功能
- **測試框架**：Jest 或 Mocha（建議）
- **覆蓋率目標**：核心功能 70% 以上
- **測試驅動開發（TDD）**：視專案需求決定

### Git Workflow
- **分支策略**：GitHub Flow
  - `main` - 主要分支，保持穩定可發布狀態
  - `feature/*` - 功能開發分支
  - `fix/*` - 錯誤修復分支
- **提交訊息格式**：Conventional Commits
  - `feat:` - 新功能
  - `fix:` - 錯誤修復
  - `docs:` - 文件更新
  - `style:` - 程式碼格式調整
  - `refactor:` - 重構
  - `test:` - 測試相關
- **程式碼審查**：建議進行 Pull Request 審查
- **合併策略**：Squash merge 或 Rebase merge

## Domain Context
- **喜樂影城訂票流程**：
  - 使用者需要選擇想看的電影
  - 選擇場次時間
  - 選擇票種（一般票、學生票、優待票、VIP 等）
  - 選擇票數
  - 完成訂票
- **專業術語**：
  - 場次：電影播放的時間段
  - 票種：不同類型的票（價格和優惠不同）
  - 訂票：預訂電影票的動作
- **業務流程**：
  1. 使用者點擊擴充功能圖示
  2. 開啟 popup 介面
  3. 透過下拉式選單選擇影片、時間、票種、數量
  4. 擴充功能協助完成訂票流程（可能透過自動填入表單或 API 呼叫）

## Important Constraints
- **技術限制**：
  - 僅支援 Chrome 瀏覽器（或基於 Chromium 的瀏覽器）
  - 必須遵循 Chrome Extension Manifest V3 規範
  - 需要處理喜樂影城網站的結構變更（可能影響自動填入功能）
- **安全性要求**：
  - 不得儲存使用者的敏感資訊（如密碼、信用卡號）
  - 遵循 Chrome Extension 的安全最佳實踐
  - 使用 HTTPS 連線（如需要與外部 API 通訊）
- **效能要求**：
  - popup 開啟速度應在 500ms 內
  - 下拉式選單操作應流暢無延遲
- **使用者體驗**：
  - 介面應簡潔易用
  - 支援繁體中文
  - 錯誤訊息應清楚明確

## External Dependencies
- **Chrome Extension APIs**：
  - `chrome.tabs` - 與瀏覽器分頁互動
  - `chrome.storage` - 儲存擴充功能資料
  - `chrome.scripting` - 注入腳本到網頁（如需要）
  - `chrome.action` - 處理擴充功能圖示點擊
- **喜樂影城網站**：
  - 需要與喜樂影城官方網站互動
  - 可能需要解析網頁 DOM 結構
  - 需要處理網站可能的結構變更
- **第三方函式庫**（如需要）：
  - DOM 操作：原生 JavaScript 或輕量級函式庫
  - HTTP 請求：使用 `fetch` API
