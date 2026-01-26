# Change: 從 HTML 解析電影資料

## Why
目前電影選擇下拉選單的資料是寫死在 `popup.html` 中的固定值，只有三個選項。這導致系統無法自動取得最新的電影列表，需要手動更新程式碼。為了提升系統的靈活性和維護性，需要改為從喜樂影城官方網站動態解析電影資料。

## What Changes
- **MODIFIED**: 電影選擇功能的資料來源改為從 HTML 解析，而非寫死的固定值
- **ADDED**: 系統需在初始化時呼叫 GET 請求至 `https://ticket.centuryasia.com.tw/ximen/index.aspx` 取得電影列表 HTML
- **ADDED**: 系統需解析 HTML 中的兩個 `ul` 元素（`detail_pagedetail_ulinser2` 和 `detail_pagedetail_ulinser1`）
- **ADDED**: 系統需從 `li` 元素中提取電影名稱（從 `trn_mn` div 中的 `span` 元素）和 ProgramID（從 `href` 屬性中解析）
- **MODIFIED**: 電影下拉選單的選項改為動態生成，使用解析得到的電影資料

## Impact
- **Affected specs**: `popup-interface` (電影選擇功能相關需求)
- **Affected code**: 
  - `popup.html` 中的電影下拉選單（第 111-116 行）
  - `popup.js` 中需要新增 HTML 解析和電影資料載入功能
- **Breaking changes**: 無（僅改變資料來源，不影響外部介面）
- **Dependencies**: 系統依賴喜樂影城網站的 HTML 結構，若網站結構變更可能影響解析功能
