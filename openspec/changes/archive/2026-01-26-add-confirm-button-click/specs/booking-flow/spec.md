## ADDED Requirements
### Requirement: 確認按鈕點擊功能
系統 SHALL 在完成票種數量 DOM 操作後，自動點擊頁面上的確認按鈕以完成訂票流程。系統需在新開的 tab 中，定位 id 為 "detail_imgcursor" 的確認按鈕（或 name 為 "ctl00$detail$imgcursor"），並點擊該按鈕。

#### Scenario: 成功點擊確認按鈕
- **WHEN** 系統已完成票種數量的 DOM 操作
- **AND** 頁面 DOM 中存在 id 為 "detail_imgcursor" 的確認按鈕
- **THEN** 系統定位該確認按鈕元素
- **AND** 系統點擊該確認按鈕
- **AND** 系統在 API 狀態顯示區域顯示成功訊息："已點擊確認按鈕"

#### Scenario: 使用 name 屬性定位確認按鈕
- **WHEN** 系統已完成票種數量的 DOM 操作
- **AND** 頁面 DOM 中找不到 id 為 "detail_imgcursor" 的確認按鈕
- **AND** 頁面 DOM 中存在 name 為 "ctl00$detail$imgcursor" 的確認按鈕
- **THEN** 系統使用 name 屬性定位該確認按鈕元素
- **AND** 系統點擊該確認按鈕
- **AND** 系統在 API 狀態顯示區域顯示成功訊息："已點擊確認按鈕"

#### Scenario: 無法找到確認按鈕
- **WHEN** 系統已完成票種數量的 DOM 操作
- **AND** 頁面 DOM 中找不到 id 為 "detail_imgcursor" 的確認按鈕
- **AND** 頁面 DOM 中也找不到 name 為 "ctl00$detail$imgcursor" 的確認按鈕
- **THEN** 系統在 API 狀態顯示區域顯示錯誤訊息："無法找到確認按鈕"
- **AND** 系統不執行後續操作
