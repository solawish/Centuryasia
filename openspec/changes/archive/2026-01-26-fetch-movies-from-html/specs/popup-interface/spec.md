## MODIFIED Requirements

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
