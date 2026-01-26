## 1. 更新 API 請求邏輯
- [x] 1.1 更新 `API_BASE_URL` 常數為 `https://ticket.centuryasia.com.tw/ximen/ImportOldMovieWeb/ajax/Program_ShowMovieTime.ashx`
- [x] 1.2 修改 `fetchTimeData` 函數，將請求方法從 GET 改為 POST
- [x] 1.3 設定請求的 Content-Type header 為 `application/x-www-form-urlencoded`
- [x] 1.4 在 POST 請求 body 中加入以下參數（使用 URLSearchParams 或 FormData 格式）：
  - `ProgramID`: "0004304"（寫死）
  - `Date`: "2026-02-07"（寫死）
  - `CodeControl`: ""（空白字串，寫死）

## 2. 更新資料解析邏輯
- [x] 2.1 移除 `parseTimeOptions` 函數中的 HTML DOM 解析邏輯（Panel1、querySelectorAll 等）
- [x] 2.2 實作 JSON 回應解析邏輯，從 API 回應陣列中提取所有場次時間
- [x] 2.3 遍歷回應陣列中的每個項目，從 `mytime` 陣列中提取所有場次
- [x] 2.4 將每個場次的 `RealShowTime` 作為選項的 text，`Url` 作為選項的 value

## 3. 測試與驗證
- [ ] 3.1 測試選擇電影後是否能正確載入場次時間
- [ ] 3.2 測試重新整理按鈕是否能正確重新載入場次時間
- [ ] 3.3 驗證時間選項的 text 和 value 是否正確顯示
- [ ] 3.4 驗證選擇時間後，後續訂票流程是否正常運作
