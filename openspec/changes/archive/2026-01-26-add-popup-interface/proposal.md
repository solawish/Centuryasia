# Change: 建立 popup.html 使用者介面

## Why
為了提供使用者一個簡潔易用的介面來選擇電影、場次時間、票種與數量，需要建立 popup.html 作為 Chrome Extension 的主要使用者介面。此介面將簡化訂票流程，提升使用者體驗。

## What Changes
- 建立 `popup.html` 檔案，包含電影選擇、時間選擇、票種選擇與數量選擇功能
- 實作選擇邏輯：需先選擇電影後，才能選擇時間
- 實作 Cookie 管理：從瀏覽器 cookie 中取得 `ASP.NET_SessionId` 並在 API 請求時帶入
- 實作時間資料獲取：透過 GET 請求 `https://ticket.centuryasia.com.tw/ximen/movie_timetable.aspx?ProgramID={電影value}` 獲取場次時間（需帶入 cookie）
- 實作時間資料解析：從回應中解析 id="Panel1" 的元素，提取時間選項（text 為 `<a>` 標籤文字，value 為 `<a>` 標籤的 href）
- 時間選擇區域提供重新刷新按鈕，允許使用者重新載入場次時間
- 票種與數量選擇不受限制，允許使用者自由選擇
- 在 popup.html 最下面新增訂票按鈕
- 新增 textarea 元素用於顯示 API 呼叫的成功與否狀態

## Impact
- Affected specs: `popup-interface` (新增能力)
- Affected code: 
  - `popup.html` (新增)
  - `popup.js` 或 `popup.ts` (新增，用於處理選擇邏輯、cookie 管理、資料獲取與解析)
  - `manifest.json` (可能需要更新，設定 popup 路徑，並可能需要 host_permissions 和 cookies 權限以允許請求喜樂影城網站和存取 cookie)
