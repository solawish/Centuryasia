## ADDED Requirements

### Requirement: 座位選擇頁面載入功能
系統 SHALL 在訂票流程中載入座位選擇頁面。當使用者點擊訂票按鈕後，系統需使用時間選單的 value（href 屬性值）作為 URL，發送 GET 請求載入座位選擇頁面。請求時需帶入 ASP.NET_SessionId cookie。

#### Scenario: 載入座位選擇頁面
- **WHEN** 使用者點擊訂票按鈕
- **AND** 時間選單已選擇（value 不為空）
- **THEN** 系統從瀏覽器 cookie 中取得 `ASP.NET_SessionId` 的值
- **AND** 系統使用時間選單的 value 作為 URL，發送 GET 請求
- **AND** 系統在請求的 Cookie header 中包含 `ASP.NET_SessionId={取得的值}`
- **AND** 系統等待回應載入完成

### Requirement: 座位資料解析功能
系統 SHALL 解析座位選擇頁面中的座位資料。系統需從回應 HTML 中找到 id 為 "sitemaptable" 的元素，並提取所有 class 為 "seat_avi" 的座位元素及其屬性。

#### Scenario: 解析座位資料
- **WHEN** 座位選擇頁面載入完成
- **THEN** 系統解析回應 HTML，找到 id 為 "sitemaptable" 的元素
- **AND** 系統從 sitemaptable 中提取所有 class 為 "seat_avi" 的座位元素
- **AND** 系統從每個座位元素中提取以下屬性：
  - x 屬性（座位的 x 座標）
  - y 屬性（座位的 y 座標）
  - row 屬性（座位的列號）
  - col 屬性（座位的行號）
  - position 屬性（座位位置）
  - status 屬性（座位狀態）

### Requirement: 智慧座位選擇功能
系統 SHALL 根據票數自動選擇座位。系統需根據數量下拉選單的票數，選取對應數量的座位。第一個座位可以從所有可用座位中隨機選擇，但後續座位必須在前一張座位的前後左右附近（row±1 或 col±1），確保選取的座位彼此相鄰，不可單獨選擇。

#### Scenario: 選擇單張票
- **WHEN** 使用者選擇票數為 1
- **AND** 系統已解析出所有 seat_avi 座位
- **THEN** 系統從所有可用座位中隨機選擇一個座位
- **AND** 系統記錄選取的座位資訊（row, col, x, y）

#### Scenario: 選擇多張相鄰票
- **WHEN** 使用者選擇票數為 N（N > 1）
- **AND** 系統已解析出所有 seat_avi 座位
- **THEN** 系統從所有可用座位中隨機選擇第一個座位
- **AND** 系統從第一個座位的前後左右（row±1, col±1）尋找可用的 seat_avi 座位
- **AND** 系統從找到的相鄰座位中選擇第二個座位
- **AND** 系統重複此過程，從已選座位的前後左右尋找相鄰座位，直到選取 N 個座位
- **AND** 系統確保所有選取的座位彼此相鄰（每個座位至少與另一個選取的座位相鄰）
- **AND** 系統記錄所有選取座位的資訊（row, col, x, y）

#### Scenario: 無法找到足夠相鄰座位
- **WHEN** 使用者選擇票數為 N
- **AND** 系統無法找到足夠的相鄰座位（例如：第一個座位周圍沒有足夠的可用座位）
- **THEN** 系統顯示錯誤訊息，說明無法找到足夠的相鄰座位
- **AND** 系統不執行訂票 API 呼叫

### Requirement: 新開 tab 並導入訂票頁面功能
系統 SHALL 新開 tab 並導入訂票頁面完成訂票流程。系統需解析時間選單 value 中的參數，並根據選取的座位構建 seatinfo 和 xy 參數，然後構建完整的 URL，使用 Chrome Extension API 新開 tab 導入該網址。

#### Scenario: 構建訂票頁面 URL
- **WHEN** 系統已選取座位
- **THEN** 系統解析時間選單 value（href）中的參數，提取以下參數：
  - ProgramID
  - Progsubid
  - roomid
  - date
  - platform
  - siteid
  - sernum
  - eventsn
  - computerid
  - 以及其他所有參數
- **AND** 系統根據選取的座位構建 seatinfo 參數：
  - 格式：`row1,col1,row2,col2,...`（每個座位用 row,col 表示，多個座位用逗號分隔）
  - 例如：選取座位 (8,1) 和 (8,2) 時，seatinfo 為 "8,1,8,2,"
- **AND** 系統根據選取的座位構建 xy 參數：
  - 格式：`x1,y1,x2,y2,...`（每個座位用 x,y 表示，多個座位用逗號分隔）
  - 例如：選取座位 (15,0) 和 (16,0) 時，xy 為 "15,0,16,0,"
- **AND** 系統構建 seatcount 參數，值為選取的座位數量（與票數相同）
- **AND** 系統構建其他必要參數（ststus, position 等）
- **AND** 系統構建完整的 `buyticket_process-2.aspx` URL，包含所有參數

#### Scenario: 新開 tab 並導入訂票頁面
- **WHEN** 系統已構建完整的訂票頁面 URL
- **THEN** 系統使用 Chrome Extension API (`chrome.tabs.create`) 新開 tab
- **AND** 系統在新開的 tab 中導入構建的 URL
- **AND** 系統等待新開的 tab 載入完成

#### Scenario: 新開 tab 失敗
- **WHEN** 系統嘗試新開 tab 失敗（例如：權限不足或 API 錯誤）
- **THEN** 系統在 API 狀態顯示區域顯示錯誤訊息
- **AND** 系統不執行後續操作

### Requirement: 票種資料解析功能
系統 SHALL 解析新開 tab 頁面中的票種資料。系統需在新開的 tab 中，從頁面 DOM 中找到 id 為 "TicketInfo" 的元素，並提取所有 class 為 "bps_content_tickettypes_numberofsheets" 的票種元素及其屬性。

#### Scenario: 解析票種資料
- **WHEN** 新開的 tab 頁面載入完成
- **THEN** 系統在新開的 tab 中取得頁面 DOM（使用 content script 或 tabs API）
- **AND** 系統從頁面 DOM 中找到 id 為 "TicketInfo" 的元素
- **AND** 系統從 TicketInfo 中提取所有 class 為 "bps_content_tickettypes_numberofsheets" 的票種元素
- **AND** 系統從每個票種元素中提取以下資訊：
  - label class="bctn_t" 的文字內容（票種名稱，如「全票」）
  - input id="price{N}" 的 value 屬性（價格，如「310」）
  - 用 text 和 value 組成搜尋條件（格式："{票種名稱} & {價格}"，如「全票 & 310」）
  - 票種的索引位置（從 0 開始遞增，對應到該票種在 TicketInfo 中的順序位置）

### Requirement: 票種選擇功能（透過 DOM 操作）
系統 SHALL 根據優先順序自動選擇票種並透過 DOM 操作完成選擇。系統需從解析出的所有票種中，按照以下優先順序選擇：優先尋找 price value 為 "999" 的票種；若沒有則選擇票種名稱（label text）為「全票」的票種；若再沒有則選擇所有票種資料中的第一個。選取票種後，系統需在該票種後方 class 為 "bctn_i" 的元素中，找到包含 `quantityadd({索引})` 的連結並點擊，其中索引對應到票種的位置（從 0 開始遞增）。

#### Scenario: 優先選擇 value 999 的票種並操作 DOM
- **WHEN** 系統已解析出所有票種資料
- **AND** 存在 price value 為 "999" 的票種
- **THEN** 系統選擇 price value 為 "999" 的票種
- **AND** 系統定位該票種後方 class 為 "bctn_i" 的元素
- **AND** 系統在 bctn_i 元素中，找到包含 `quantityadd({索引})` 的連結（索引對應到該票種的位置，從 0 開始）
- **AND** 系統點擊該連結，觸發票種數量增加

#### Scenario: 選擇全票並操作 DOM（當沒有 value 999 時）
- **WHEN** 系統已解析出所有票種資料
- **AND** 不存在 price value 為 "999" 的票種
- **AND** 存在票種名稱（label text）為「全票」的票種
- **THEN** 系統選擇票種名稱為「全票」的票種
- **AND** 系統定位該票種後方 class 為 "bctn_i" 的元素
- **AND** 系統在 bctn_i 元素中，找到包含 `quantityadd({索引})` 的連結（索引對應到該票種的位置，從 0 開始）
- **AND** 系統點擊該連結，觸發票種數量增加

#### Scenario: 選擇第一個票種並操作 DOM（當沒有 value 999 和全票時）
- **WHEN** 系統已解析出所有票種資料
- **AND** 不存在 price value 為 "999" 的票種
- **AND** 不存在票種名稱為「全票」的票種
- **THEN** 系統選擇所有票種資料中的第一個票種（索引為 0）
- **AND** 系統定位該票種後方 class 為 "bctn_i" 的元素
- **AND** 系統在 bctn_i 元素中，找到包含 `quantityadd(0)` 的連結
- **AND** 系統點擊該連結，觸發票種數量增加

#### Scenario: 無法找到票種資料
- **WHEN** 新開的 tab 頁面載入完成
- **AND** 頁面 DOM 中找不到 id 為 "TicketInfo" 的元素
- **OR** TicketInfo 中找不到 class 為 "bps_content_tickettypes_numberofsheets" 的票種元素
- **THEN** 系統在 API 狀態顯示區域顯示錯誤訊息："無法找到票種資料"
- **AND** 系統不執行後續操作

#### Scenario: 無法找到票種操作元素
- **WHEN** 系統已選取票種
- **AND** 該票種後方找不到 class 為 "bctn_i" 的元素
- **OR** bctn_i 元素中找不到包含 `quantityadd({索引})` 的連結
- **THEN** 系統在 API 狀態顯示區域顯示錯誤訊息："無法找到票種操作元素"
- **AND** 系統不執行後續操作

### Requirement: 訂票流程驗證功能
系統 SHALL 在執行訂票流程前驗證必要條件。系統需確保時間選單已選擇、座位選擇頁面載入成功、有足夠的可用座位等。

#### Scenario: 驗證時間選單已選擇
- **WHEN** 使用者點擊訂票按鈕
- **AND** 時間選單未選擇（value 為空）
- **THEN** 系統在 API 狀態顯示區域顯示錯誤訊息："請選擇時間"
- **AND** 系統不執行訂票流程

#### Scenario: 驗證座位選擇頁面載入成功
- **WHEN** 系統嘗試載入座位選擇頁面
- **AND** 請求失敗或回應中找不到 sitemaptable 元素
- **THEN** 系統在 API 狀態顯示區域顯示錯誤訊息
- **AND** 系統不執行後續座位選擇和訂票操作

#### Scenario: 驗證有足夠的可用座位
- **WHEN** 系統解析座位資料
- **AND** seat_avi 座位的數量少於使用者選擇的票數
- **THEN** 系統在 API 狀態顯示區域顯示錯誤訊息："可用座位不足"
- **AND** 系統不執行訂票操作

#### Scenario: 驗證新開 tab 頁面載入成功
- **WHEN** 系統嘗試在新開的 tab 中解析票種資料
- **AND** 新開的 tab 頁面載入失敗
- **OR** 頁面 DOM 中找不到 TicketInfo 元素或票種元素
- **THEN** 系統在 API 狀態顯示區域顯示錯誤訊息："無法找到票種資料"
- **AND** 系統不執行後續操作
