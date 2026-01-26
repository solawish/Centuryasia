## ADDED Requirements

### Requirement: 電影選擇功能
系統 SHALL 提供電影選擇下拉選單，允許使用者選擇想要觀看的電影。電影選項為寫死的固定值。

#### Scenario: 使用者選擇電影
- **WHEN** 使用者開啟 popup 介面
- **THEN** 系統顯示電影選擇下拉選單
- **AND** 下拉選單包含兩個選項：
  - text 為 "佐賀偶像是傳奇 夢幻銀河樂園(特別場)"，value 為 "0004304"
  - text 為 "美好的世界獻上祝福！紅傳說"，value 為 "0004290"
- **AND** 使用者可以從下拉選單中選擇任一電影

### Requirement: Cookie 管理功能
系統 SHALL 在發送 API 請求時帶入該站台的 cookie。系統需從瀏覽器 cookie 中取得 `ASP.NET_SessionId` 的值，並在請求時將其包含在 Cookie header 中。

#### Scenario: 取得並使用 ASP.NET_SessionId cookie
- **WHEN** 系統需要發送 API 請求至喜樂影城網站
- **THEN** 系統從瀏覽器 cookie 中取得 key 為 "ASP.NET_SessionId" 的值
- **AND** 系統在請求的 Cookie header 中包含 `ASP.NET_SessionId={取得的值}`

### Requirement: 時間選擇功能
系統 SHALL 提供時間選擇下拉選單，允許使用者選擇場次時間。時間選擇功能必須在選擇電影後才能啟用。時間資料來源為 GET 請求 `https://ticket.centuryasia.com.tw/ximen/movie_timetable.aspx?ProgramID={電影的value}`，系統需解析回應中 id 為 "Panel1" 的元素，提取時間選項。請求時需帶入 ASP.NET_SessionId cookie。

#### Scenario: 選擇電影後載入時間選項
- **WHEN** 使用者選擇了電影（value 為 "0004304" 或 "0004290"）
- **THEN** 系統從瀏覽器 cookie 中取得 `ASP.NET_SessionId` 的值
- **AND** 系統發送 GET 請求至 `https://ticket.centuryasia.com.tw/ximen/movie_timetable.aspx?ProgramID={選擇的電影value}`，並在 Cookie header 中包含 `ASP.NET_SessionId={取得的值}`
- **AND** 系統解析回應中 id 為 "Panel1" 的元素
- **AND** 系統從 Panel1 中提取所有時間選項（從 `<li class="movie_timetable_times">` 中的 `<a>` 標籤）
- **AND** 每個時間選項的 text 為 `<a>` 標籤的文字內容（如 "10:30(113) 日"）
- **AND** 每個時間選項的 value 為 `<a>` 標籤的 href 屬性值
- **AND** 時間選擇下拉選單變為可用狀態並顯示提取的時間選項
- **AND** 使用者可以從下拉選單中選擇場次時間

#### Scenario: 未選擇電影時時間選擇禁用
- **WHEN** 使用者尚未選擇電影
- **THEN** 時間選擇下拉選單處於禁用狀態
- **AND** 使用者無法選擇時間

### Requirement: 時間重新刷新功能
系統 SHALL 在時間選擇區域提供重新刷新按鈕，允許使用者重新載入場次時間。重新載入時需重新發送 GET 請求並解析 Panel1 元素。請求時需帶入 ASP.NET_SessionId cookie。

#### Scenario: 重新載入場次時間
- **WHEN** 使用者點擊時間重新刷新按鈕
- **THEN** 系統從瀏覽器 cookie 中取得 `ASP.NET_SessionId` 的值
- **AND** 系統重新發送 GET 請求至 `https://ticket.centuryasia.com.tw/ximen/movie_timetable.aspx?ProgramID={當前選擇的電影value}`，並在 Cookie header 中包含 `ASP.NET_SessionId={取得的值}`
- **AND** 系統重新解析回應中 id 為 "Panel1" 的元素
- **AND** 系統更新時間選擇下拉選單為最新的場次時間選項

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
