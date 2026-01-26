# Change: 更新場次時間資料來源為 POST API

## Why
目前系統使用 GET 請求從 `movie_timetable.aspx` 取得 HTML 並解析 DOM 來提取場次時間。此方式需要解析 HTML 結構，較為脆弱且維護成本高。改用 POST API `Program_ShowMovieTime.ashx` 可直接取得 JSON 格式的場次時間資料，提升穩定性和維護性。

## What Changes
- 將場次時間資料來源從 GET `movie_timetable.aspx` 改為 POST `Program_ShowMovieTime.ashx`
- 使用 `application/x-www-form-urlencoded` 格式發送 POST 請求
- POST 請求參數寫死在程式碼中：
  - `ProgramID`: "0004304"
  - `Date`: "2026-02-07"
  - `CodeControl`: ""（空白字串）
- 移除 HTML DOM 解析邏輯（`parseTimeOptions` 函數中的 Panel1 解析）
- 新增 JSON 回應解析邏輯，從 API 回應中提取場次時間
- 時間選項的 text 使用 `RealShowTime` 欄位，value 使用 `Url` 欄位

## Impact
- **Affected specs**: `popup-interface` (時間選擇功能相關需求)
- **Affected code**: 
  - `popup.js` 中的 `fetchTimeData` 函數（改為 POST 請求）
  - `popup.js` 中的 `parseTimeOptions` 函數（改為解析 JSON）
  - `popup.js` 中的 `API_BASE_URL` 常數（更新為新 API URL）
