## 1. Implementation
- [x] 1.1 在 `popup.js` 中新增 `clickConfirmButton` 函數，用於在新開的 tab 中點擊確認按鈕
- [x] 1.2 在訂票流程中，於完成票種數量操作後呼叫 `clickConfirmButton` 函數
- [x] 1.3 實作確認按鈕定位邏輯（使用 id="detail_imgcursor" 或 name="ctl00$detail$imgcursor"）
- [x] 1.4 新增錯誤處理，當找不到確認按鈕時顯示錯誤訊息
- [x] 1.5 更新 API 狀態顯示，顯示確認按鈕點擊的狀態

## 2. Validation
- [ ] 2.1 測試確認按鈕點擊功能（驗證按鈕能被正確定位並點擊）
- [ ] 2.2 測試錯誤處理（驗證當找不到確認按鈕時能正確顯示錯誤訊息）
- [ ] 2.3 測試完整訂票流程（從選擇電影到點擊確認按鈕的完整流程）
