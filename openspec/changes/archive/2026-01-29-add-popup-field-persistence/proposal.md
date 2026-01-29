# Change: Popup 欄位儲存與還原

## Why
使用者關閉 popup 後再開啟時，目前所有選擇（影城、電影、時間、票種、數量）都會重置，需重新選擇。為提升體驗，應在關閉後再開啟時還原上次的選擇。

## What Changes
- 為 popup 表單欄位加入持久化：影城、電影、時間、票種、數量。
- 儲存時機：使用者變更任一上述欄位時寫入 Chrome Storage（local）。
- 還原時機：使用者開啟 popup 時，先從 Storage 讀取上次儲存的值，在載入電影列表與時間選項完成後，將可對應的選項還原；若儲存的電影或時間已不存在（例如下架或場次過期），則不強制還原該欄位。
- API 狀態（textarea）為顯示用日誌，不納入儲存與還原。
- manifest.json 需宣告 `storage` 權限以使用 `chrome.storage.local`。

## Impact
- Affected specs: popup-interface
- Affected code: popup.js, manifest.json
