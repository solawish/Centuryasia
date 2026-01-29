# popup-interface Specification

## Purpose
TBD - created by archiving change add-popup-interface. Update Purpose after archive.
## Requirements
### Requirement: 電影選擇功能
系統 SHALL 提供電影選擇下拉選單，允許使用者選擇想要觀看的電影。電影選項需從喜樂影城官方網站動態解析取得。系統 SHALL 使用當前選擇的影城 value 組出請求 URL。

#### Scenario: 初始化時載入電影列表
- **WHEN** 使用者開啟 popup 介面
- **THEN** 系統以當前影城下拉選單的 value 組出 URL，發送 GET 請求至 `https://ticket.centuryasia.com.tw/{影城value}/index.aspx`
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
系統 SHALL 提供時間選擇下拉選單，允許使用者選擇場次時間。時間選擇功能必須在選擇電影後才能啟用。時間資料來源為 POST 請求 `https://ticket.centuryasia.com.tw/{影城value}/ImportOldMovieWeb/ajax/Program_ShowMovieTime.ashx`，使用 `application/x-www-form-urlencoded` 格式，系統需解析 JSON 回應，提取場次時間選項。請求時需帶入 ASP.NET_SessionId cookie。系統需使用當前選擇的影城 value 組出請求 URL。系統需為今天起未來14天的每個日期發送 API 請求，並合併所有日期的場次時間選項。

#### Scenario: 選擇電影後載入時間選項
- **WHEN** 使用者選擇了電影（value 為電影下拉選單的 value，如 "0004304" 或 "0004290"）
- **THEN** 系統從瀏覽器 cookie 中取得 `ASP.NET_SessionId` 的值
- **AND** 系統生成今天起未來14天的日期陣列（格式：YYYY-MM-DD）
- **AND** 系統以當前影城下拉選單的 value 組出 URL，為每個日期發送 POST 請求至 `https://ticket.centuryasia.com.tw/{影城value}/ImportOldMovieWeb/ajax/Program_ShowMovieTime.ashx`，並在 Cookie header 中包含 `ASP.NET_SessionId={取得的值}`
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
系統 SHALL 在時間選擇區域提供重新刷新按鈕，允許使用者重新載入場次時間。重新載入時需使用當前選擇的影城 value 組出 URL，重新發送 POST 請求並解析 JSON 回應。請求時需帶入 ASP.NET_SessionId cookie。系統需為今天起未來14天的每個日期發送 API 請求，並合併所有日期的場次時間選項。

#### Scenario: 重新載入場次時間
- **WHEN** 使用者點擊時間重新刷新按鈕
- **AND** 電影下拉選單已選擇（value 不為空）
- **THEN** 系統從瀏覽器 cookie 中取得 `ASP.NET_SessionId` 的值
- **AND** 系統生成今天起未來14天的日期陣列（格式：YYYY-MM-DD）
- **AND** 系統以當前影城下拉選單的 value 組出 URL，為每個日期重新發送 POST 請求至 `https://ticket.centuryasia.com.tw/{影城value}/ImportOldMovieWeb/ajax/Program_ShowMovieTime.ashx`，並在 Cookie header 中包含 `ASP.NET_SessionId={取得的值}`
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
系統 SHALL 提供票種關鍵字輸入框（選填），允許使用者輸入票種名稱關鍵字。訂票時若輸入框有值，系統將優先使用名稱含有該關鍵字的票種；若無輸入或無符合者，則依 booking-flow 規範之後備順序選擇票種。

#### Scenario: 顯示票種輸入框（選填）
- **WHEN** 使用者開啟 popup 介面
- **THEN** 系統顯示票種表單區塊，label 為「票種」
- **AND** 系統顯示單行文字輸入框（input type="text"），用於輸入票種關鍵字
- **AND** 輸入框為選填（非必填），使用者可不輸入
- **AND** 輸入框可設 placeholder 提示為票種關鍵字（例如：「選填，輸入票種關鍵字」）

#### Scenario: 使用者輸入票種關鍵字
- **WHEN** 使用者在票種輸入框中輸入文字（例如「學生」「全票」）
- **THEN** 系統保留該值供訂票流程使用
- **AND** 訂票時系統將以該關鍵字（trim 後）優先匹配票種名稱；若為空則不套用關鍵字優先

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

### Requirement: 影城選擇功能
系統 SHALL 在 popup 介面最上方提供影城下拉選單，允許使用者選擇影城。所有與喜樂影城網站相關的 API 與頁面 URL 皆須使用所選影城的 value 作為路徑片段（即 `https://ticket.centuryasia.com.tw/{影城value}/...`）。

#### Scenario: 顯示影城選單與選項
- **WHEN** 使用者開啟 popup 介面
- **THEN** 系統在介面最上方（標題下方、電影選單上方）顯示「影城」表單區塊
- **AND** 影城下拉選單包含以下選項（text-value）：
  - 今日影城-ximen
  - 南港影城-nangang
  - 永和比漾-beyond
  - 桃園A19-taoyuan
  - 高雄總圖-Kaohsiung
- **AND** 預設選項為「今日影城」(value 為 ximen)
- **AND** 使用者可從下拉選單中選擇任一影城

#### Scenario: API 與頁面使用所選影城
- **WHEN** 使用者已選擇影城（影城下拉選單的 value 不為空）
- **AND** 系統發送電影列表、場次時間或訂票相關請求
- **THEN** 系統使用影城下拉選單的 value 作為 URL 路徑片段
- **AND** 所有請求的 base 為 `https://ticket.centuryasia.com.tw/{影城value}/`

### Requirement: Popup 欄位儲存與還原
系統 SHALL 將 popup 表單中的影城、電影、時間、票種、數量等欄位值持久化儲存，並在使用者關閉 popup 後再次開啟時還原上次的選擇。儲存媒介為 Chrome Extension 的 `chrome.storage.local`，manifest 須宣告 `storage` 權限。API 狀態（textarea）為顯示用，不納入儲存與還原。

#### Scenario: 儲存欄位變更
- **WHEN** 使用者變更影城、電影、時間、票種或數量任一欄位
- **THEN** 系統將目前表單狀態（影城 value、電影 value、時間 value、票種文字、數量 value）寫入 `chrome.storage.local`
- **AND** 儲存為單一鍵值（例如單一 key 對應一物件），供下次還原使用

#### Scenario: 開啟 popup 時還原選擇
- **WHEN** 使用者開啟 popup 介面
- **THEN** 系統非同步從 `chrome.storage.local` 讀取上次儲存的狀態
- **AND** 若有儲存的影城且與目前影城不同，系統先設定影城並觸發載入電影列表；否則直接載入電影列表
- **AND** 電影列表載入完成後，若儲存中有電影 ProgramID 且該選項存在於本次電影選單中，系統還原電影選擇；若還原了電影則觸發載入時間選項
- **AND** 時間選項載入完成後，若儲存中有時間 value（URL）且該選項存在於本次時間選單中，系統還原時間選擇
- **AND** 系統還原票種關鍵字與數量（無需依賴動態選項）
- **AND** 使用者看到上次的選擇（在選項仍存在的前提下）

#### Scenario: 儲存的電影或時間已不存在時不強制還原
- **WHEN** 使用者開啟 popup 介面並從 storage 讀取到上次儲存的狀態
- **AND** 儲存的電影 ProgramID 不在本次電影選單選項中（例如電影已下架）
- **OR** 儲存的時間 value（URL）不在本次時間選單選項中（例如場次已過期）
- **THEN** 系統不將該欄位還原為儲存值，該欄位維持預設或空選
- **AND** 其餘欄位（影城、票種、數量，以及若存在的電影/時間）仍照常還原

