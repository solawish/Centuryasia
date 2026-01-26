## MODIFIED Requirements

### Requirement: 時間選擇功能
系統 SHALL 提供時間選擇下拉選單，允許使用者選擇場次時間。時間選擇功能必須在選擇電影後才能啟用。時間資料來源為 POST 請求 `https://ticket.centuryasia.com.tw/ximen/ImportOldMovieWeb/ajax/Program_ShowMovieTime.ashx`，使用 `application/x-www-form-urlencoded` 格式，系統需解析 JSON 回應，提取場次時間選項。請求時需帶入 ASP.NET_SessionId cookie。系統需為今天起未來14天的每個日期發送 API 請求，並合併所有日期的場次時間選項。

#### Scenario: 選擇電影後載入時間選項
- **WHEN** 使用者選擇了電影（value 為電影下拉選單的 value，如 "0004304" 或 "0004290"）
- **THEN** 系統從瀏覽器 cookie 中取得 `ASP.NET_SessionId` 的值
- **AND** 系統生成今天起未來14天的日期陣列（格式：YYYY-MM-DD）
- **AND** 系統為每個日期發送 POST 請求至 `https://ticket.centuryasia.com.tw/ximen/ImportOldMovieWeb/ajax/Program_ShowMovieTime.ashx`，並在 Cookie header 中包含 `ASP.NET_SessionId={取得的值}`
- **AND** 系統設定每個請求的 Content-Type header 為 `application/x-www-form-urlencoded`
- **AND** 系統在每個 POST 請求 body 中包含以下參數：
  - `ProgramID`: 電影下拉選單的 value（動態取得，如 "0004304"）
  - `Date`: 日期陣列中的日期（動態生成，格式：YYYY-MM-DD）
  - `CodeControl`: ""（空白字串）
- **AND** 系統解析每個日期的 JSON 回應，從回應陣列中提取所有場次時間
- **AND** 系統遍歷每個回應陣列中的每個項目，從每個項目的 `mytime` 陣列中提取所有場次
- **AND** 系統合併所有日期的場次時間選項，去除重複項目
- **AND** 系統按照時間先後順序排序場次時間選項（時間越早的越靠前，比較靠近現在的要在上面）
- **AND** 每個時間選項的 text 為 `mytime` 項目中的 `RealShowTime` 欄位值（如 "2026/01/27 17:15"）
- **AND** 每個時間選項的 value 為 `mytime` 項目中的 `Url` 欄位值
- **AND** 時間選擇下拉選單變為可用狀態並顯示排序後的時間選項
- **AND** 使用者可以從下拉選單中選擇場次時間

#### Scenario: 未選擇電影時時間選擇禁用
- **WHEN** 使用者尚未選擇電影
- **THEN** 時間選擇下拉選單處於禁用狀態
- **AND** 使用者無法選擇時間

#### Scenario: 部分日期請求失敗時的處理
- **WHEN** 系統為多個日期發送 API 請求
- **AND** 部分日期的請求失敗（例如：網路錯誤、API 錯誤）
- **THEN** 系統繼續處理其他成功的請求
- **AND** 系統合併所有成功請求的場次時間選項
- **AND** 系統按照時間先後順序排序場次時間選項（時間越早的越靠前，比較靠近現在的要在上面）
- **AND** 系統在 API 狀態顯示區域顯示錯誤訊息（針對失敗的日期）
- **AND** 系統在時間選擇下拉選單中顯示排序後的場次時間選項

### Requirement: 時間重新刷新功能
系統 SHALL 在時間選擇區域提供重新刷新按鈕，允許使用者重新載入場次時間。重新載入時需重新發送 POST 請求並解析 JSON 回應。請求時需帶入 ASP.NET_SessionId cookie。系統需為今天起未來14天的每個日期發送 API 請求，並合併所有日期的場次時間選項。

#### Scenario: 重新載入場次時間
- **WHEN** 使用者點擊時間重新刷新按鈕
- **AND** 電影下拉選單已選擇（value 不為空）
- **THEN** 系統從瀏覽器 cookie 中取得 `ASP.NET_SessionId` 的值
- **AND** 系統生成今天起未來14天的日期陣列（格式：YYYY-MM-DD）
- **AND** 系統為每個日期重新發送 POST 請求至 `https://ticket.centuryasia.com.tw/ximen/ImportOldMovieWeb/ajax/Program_ShowMovieTime.ashx`，並在 Cookie header 中包含 `ASP.NET_SessionId={取得的值}`
- **AND** 系統設定每個請求的 Content-Type header 為 `application/x-www-form-urlencoded`
- **AND** 系統在每個 POST 請求 body 中包含以下參數：
  - `ProgramID`: 電影下拉選單的 value（動態取得，如 "0004304"）
  - `Date`: 日期陣列中的日期（動態生成，格式：YYYY-MM-DD）
  - `CodeControl`: ""（空白字串）
- **AND** 系統重新解析每個日期的 JSON 回應，從回應陣列中提取所有場次時間
- **AND** 系統合併所有日期的場次時間選項，去除重複項目
- **AND** 系統按照時間先後順序排序場次時間選項（時間越早的越靠前，比較靠近現在的要在上面）
- **AND** 系統更新時間選擇下拉選單為排序後的最新場次時間選項
