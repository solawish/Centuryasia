# popup-interface Specification

## Purpose
TBD - created by archiving change add-popup-interface. Update Purpose after archive.
## Requirements
### Requirement: 電影選擇功能
系統 SHALL 提供電影選擇下拉選單，允許使用者選擇想要觀看的電影。電影選項需從喜樂影城官方網站動態解析取得。

#### Scenario: 初始化時載入電影列表
- **WHEN** 使用者開啟 popup 介面
- **THEN** 系統發送 GET 請求至 `https://ticket.centuryasia.com.tw/ximen/index.aspx`
- **AND** 系統解析回應的 HTML，尋找兩個 `ul` 元素：
  - `ul` 元素，id 為 `detail_pagedetail_ulinser2`
  - `ul` 元素，id 為 `detail_pagedetail_ulinser1`
- **AND** 系統遍歷每個 `ul` 元素中的所有 `li` 子元素
- **AND** 對於每個 `li` 元素，系統提取以下資料：
  - 電影名稱：從 `div.trn_text > div.trn_mn > span` 元素中取得文字內容
  - ProgramID：從 `a.trn_img` 或 `a` 元素的 `href` 屬性中解析 `ProgramID` 參數值（例如：從 `movie_timetable.aspx?ProgramID=0004088` 中取得 `0004088`）
- **AND** 系統合併兩個 `ul` 元素的電影資料
- **AND** 系統去除重複的 ProgramID（若同一 ProgramID 出現多次，只保留一個）
- **AND** 系統將解析得到的電影資料填入電影選擇下拉選單
- **AND** 每個選項的 text 為電影名稱，value 為 ProgramID
- **AND** 使用者可以從下拉選單中選擇任一電影

#### Scenario: 載入電影列表失敗時的處理
- **WHEN** 系統嘗試載入電影列表
- **AND** 請求失敗（例如：網路錯誤、HTTP 錯誤）
- **THEN** 系統在 API 狀態顯示區域顯示錯誤訊息
- **AND** 電影下拉選單保持可用狀態，但只顯示預設的 "請選擇電影" 選項
- **AND** 系統不阻止使用者繼續使用其他功能

#### Scenario: HTML 解析失敗時的處理
- **WHEN** 系統嘗試解析電影列表 HTML
- **AND** 找不到目標 `ul` 元素（`detail_pagedetail_ulinser2` 或 `detail_pagedetail_ulinser1`）
- **OR** HTML 結構不符合預期
- **THEN** 系統在 API 狀態顯示區域顯示錯誤訊息
- **AND** 電影下拉選單保持可用狀態，但只顯示預設的 "請選擇電影" 選項
- **AND** 系統不阻止使用者繼續使用其他功能

#### Scenario: 載入中狀態顯示
- **WHEN** 系統正在載入電影列表
- **THEN** 電影下拉選單顯示 "載入中..." 選項
- **AND** 電影下拉選單處於禁用狀態
- **AND** 系統在 API 狀態顯示區域顯示載入狀態訊息

### Requirement: Cookie 管理功能
系統 SHALL 在發送 API 請求時帶入該站台的 cookie。系統需從瀏覽器 cookie 中取得 `ASP.NET_SessionId` 的值，並在請求時將其包含在 Cookie header 中。

#### Scenario: 取得並使用 ASP.NET_SessionId cookie
- **WHEN** 系統需要發送 API 請求至喜樂影城網站
- **THEN** 系統從瀏覽器 cookie 中取得 key 為 "ASP.NET_SessionId" 的值
- **AND** 系統在請求的 Cookie header 中包含 `ASP.NET_SessionId={取得的值}`

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

### Requirement: 票種選擇功能
系統 SHALL 提供票種選擇下拉選單，允許使用者選擇票種。票種選項為寫死的固定值。

#### Scenario: 使用者選擇票種
- **WHEN** 使用者開啟 popup 介面
- **THEN** 系統顯示票種選擇下拉選單
- **AND** 下拉選單包含一個選項：text 為 "999(超。盲目猜測)"，value 為 "999"
- **AND** 使用者可以從下拉選單中選擇該票種

### Requirement: 數量選擇功能
系統 SHALL 提供數量選擇下拉選單，允許使用者選擇票數。數量選項為寫死的固定值 1~4。

#### Scenario: 使用者選擇數量
- **WHEN** 使用者開啟 popup 介面
- **THEN** 系統顯示數量選擇下拉選單
- **AND** 下拉選單包含四個選項：1、2、3、4
- **AND** 使用者可以從下拉選單中選擇票數（1~4）

### Requirement: 訂票按鈕功能
系統 SHALL 在 popup.html 最下面提供訂票按鈕，允許使用者執行訂票動作。

#### Scenario: 顯示訂票按鈕
- **WHEN** 使用者開啟 popup 介面
- **THEN** 系統在介面最下面顯示訂票按鈕
- **AND** 使用者可以點擊訂票按鈕執行訂票動作

### Requirement: API 狀態顯示功能
系統 SHALL 提供一個 textarea 元素，用於顯示呼叫 API 的成功與否狀態。

#### Scenario: 顯示 API 呼叫狀態
- **WHEN** 系統呼叫 API（如載入時間選項或執行訂票）
- **THEN** 系統在 textarea 中顯示 API 呼叫的狀態訊息
- **AND** 成功時顯示成功訊息
- **AND** 失敗時顯示錯誤訊息

