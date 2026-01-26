## MODIFIED Requirements

### Requirement: 時間選擇功能
系統 SHALL 提供時間選擇下拉選單，允許使用者選擇場次時間。時間選擇功能必須在選擇電影後才能啟用。時間資料來源為 POST 請求 `https://ticket.centuryasia.com.tw/ximen/ImportOldMovieWeb/ajax/Program_ShowMovieTime.ashx`，使用 `application/x-www-form-urlencoded` 格式，系統需解析 JSON 回應，提取場次時間選項。請求時需帶入 ASP.NET_SessionId cookie。

#### Scenario: 選擇電影後載入時間選項
- **WHEN** 使用者選擇了電影（value 為 "0004304" 或 "0004290"）
- **THEN** 系統從瀏覽器 cookie 中取得 `ASP.NET_SessionId` 的值
- **AND** 系統發送 POST 請求至 `https://ticket.centuryasia.com.tw/ximen/ImportOldMovieWeb/ajax/Program_ShowMovieTime.ashx`，並在 Cookie header 中包含 `ASP.NET_SessionId={取得的值}`
- **AND** 系統設定請求的 Content-Type header 為 `application/x-www-form-urlencoded`
- **AND** 系統在 POST 請求 body 中包含以下參數（參數值寫死在程式碼中）：
  - `ProgramID`: "0004304"
  - `Date`: "2026-02-07"
  - `CodeControl`: ""（空白字串）
- **AND** 系統解析 JSON 回應，從回應陣列中提取所有場次時間
- **AND** 系統遍歷回應陣列中的每個項目，從每個項目的 `mytime` 陣列中提取所有場次
- **AND** 每個時間選項的 text 為 `mytime` 項目中的 `RealShowTime` 欄位值（如 "2026/01/27 17:15"）
- **AND** 每個時間選項的 value 為 `mytime` 項目中的 `Url` 欄位值
- **AND** 時間選擇下拉選單變為可用狀態並顯示提取的時間選項
- **AND** 使用者可以從下拉選單中選擇場次時間

#### Scenario: 未選擇電影時時間選擇禁用
- **WHEN** 使用者尚未選擇電影
- **THEN** 時間選擇下拉選單處於禁用狀態
- **AND** 使用者無法選擇時間

### Requirement: 時間重新刷新功能
系統 SHALL 在時間選擇區域提供重新刷新按鈕，允許使用者重新載入場次時間。重新載入時需重新發送 POST 請求並解析 JSON 回應。請求時需帶入 ASP.NET_SessionId cookie。

#### Scenario: 重新載入場次時間
- **WHEN** 使用者點擊時間重新刷新按鈕
- **THEN** 系統從瀏覽器 cookie 中取得 `ASP.NET_SessionId` 的值
- **AND** 系統重新發送 POST 請求至 `https://ticket.centuryasia.com.tw/ximen/ImportOldMovieWeb/ajax/Program_ShowMovieTime.ashx`，並在 Cookie header 中包含 `ASP.NET_SessionId={取得的值}`
- **AND** 系統設定請求的 Content-Type header 為 `application/x-www-form-urlencoded`
- **AND** 系統在 POST 請求 body 中包含以下參數（參數值寫死在程式碼中）：
  - `ProgramID`: "0004304"
  - `Date`: "2026-02-07"
  - `CodeControl`: ""（空白字串）
- **AND** 系統重新解析 JSON 回應，從回應陣列中提取所有場次時間
- **AND** 系統更新時間選擇下拉選單為最新的場次時間選項
