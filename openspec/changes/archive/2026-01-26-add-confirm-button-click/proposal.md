# Change: 新增確認按鈕點擊功能

## Why
目前的訂票流程在完成票種數量操作後即停止，使用者仍需手動點擊頁面上的確認按鈕才能完成訂票。為了實現完整的自動化訂票流程，系統需要在完成票種數量操作後自動點擊確認按鈕。

## What Changes
- 在訂票流程中新增確認按鈕點擊功能
- 系統在完成票種數量 DOM 操作後，自動定位並點擊確認按鈕（id="detail_imgcursor"）
- 新增錯誤處理機制，當找不到確認按鈕時顯示錯誤訊息

## Impact
- Affected specs: `booking-flow`
- Affected code: `popup.js`（訂票按鈕事件處理函數）
