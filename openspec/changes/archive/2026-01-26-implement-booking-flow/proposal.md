# Change: 實作訂票流程

## Why
目前訂票按鈕僅顯示訂票資訊，尚未實作完整的訂票流程。使用者需要能夠自動選擇座位並完成訂票，以提升訂票效率和使用者體驗。

## What Changes
- 實作訂票按鈕的完整邏輯：當使用者點擊訂票按鈕後，系統需執行完整的訂票流程
- 呼叫時間選單的 value（href）以載入座位選擇頁面
- 解析座位選擇頁面中 id 為 "sitemaptable" 的元素，提取所有可用座位
- 實作智慧座位選擇邏輯：
  - 根據數量下拉選單的票數選取對應數量的座位
  - 第一個座位可以隨機選擇
  - 後續座位必須在前一張座位的前後左右附近，不可單獨選擇
- 新開 tab 並導入訂票頁面：使用選取的座位資訊和時間選單的參數，構建 `buyticket_process-2.aspx` URL，並使用 Chrome Extension API 新開 tab 導入該網址
- 解析票種資料：在新開的 tab 中，從頁面 DOM 中解析 id 為 "TicketInfo" 的元素，提取所有 class 為 "bps_content_tickettypes_numberofsheets" 的票種資料
- 實作票種選擇邏輯（透過 DOM 操作）：
  - 優先尋找 price value 為 "999" 的票種
  - 若沒有就選擇「全票」
  - 再沒有就選擇全部資料中的第一個票種
  - 找到對應票種後，點擊該票種後方 class 為 "bctn_i" 的元素中，包含 `quantityadd({索引})` 的連結（索引從 0 開始遞增）

## Impact
- Affected specs: `popup-interface` (新增訂票流程能力)
- Affected code:
  - `popup.js` (修改訂票按鈕事件處理邏輯，新增座位選擇、新開 tab 和 DOM 操作功能)
  - `manifest.json` (可能需要新增 tabs 權限以支援新開 tab 功能)
