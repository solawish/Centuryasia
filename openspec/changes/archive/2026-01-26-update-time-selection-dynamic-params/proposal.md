# Change: 更新時間選擇功能使用動態參數

## Why
目前時間選擇功能的 API 請求參數是寫死的：
- `ProgramID` 固定為 "0004304"
- `Date` 固定為 "2026-02-07"

這導致系統無法根據使用者選擇的電影動態載入對應的場次時間，且只能查詢單一日期。為了提升系統的靈活性和實用性，需要將這些參數改為動態取得。

## What Changes
- **MODIFIED**: 時間選擇功能的 `ProgramID` 參數改為從電影下拉選單的 value 動態取得
- **MODIFIED**: 時間選擇功能的 `Date` 參數改為動態生成，包含今天起未來14天的日期範圍
- **MODIFIED**: 系統需要為每個日期發送 API 請求，並合併所有日期的場次時間選項

## Impact
- **Affected specs**: `popup-interface` (時間選擇功能相關需求)
- **Affected code**: 
  - `popup.js` 中的 `fetchTimeData` 函數（第 41-72 行）
  - `popup.js` 中的 `loadTimeOptions` 函數（第 105-137 行）
- **Breaking changes**: 無（僅改變內部實作，不影響外部介面）
