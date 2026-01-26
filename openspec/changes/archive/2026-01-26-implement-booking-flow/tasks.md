## 1. 實作座位選擇頁面載入
- [x] 1.1 解析時間選單的 value（href），提取 URL 和參數
- [x] 1.2 發送 GET 請求至時間選單的 value URL，載入座位選擇頁面
- [x] 1.3 驗證請求時需帶入 ASP.NET_SessionId cookie

## 2. 實作座位資料解析
- [x] 2.1 解析回應 HTML，找到 id 為 "sitemaptable" 的元素
- [x] 2.2 提取所有 class 為 "seat_avi" 的座位元素
- [x] 2.3 從每個座位元素中提取屬性：x, y, row, col, position, status

## 3. 實作智慧座位選擇邏輯
- [x] 3.1 根據數量下拉選單的票數，決定需要選取的座位數量
- [x] 3.2 實作第一個座位的隨機選擇邏輯（從所有 seat_avi 座位中隨機選擇）
- [x] 3.3 實作後續座位的鄰近選擇邏輯：
  - 從前一個座位的前後左右（row±1, col±1）尋找可用的 seat_avi 座位
  - 確保選取的座位彼此相鄰，不可單獨
- [x] 3.4 驗證選取的座位數量是否符合票數要求

## 4. 實作新開 tab 並導入訂票頁面
- [x] 4.1 解析時間選單 value 中的參數（ProgramID, Progsubid, roomid, date, platform, siteid, sernum, eventsn, computerid 等）
- [x] 4.2 根據選取的座位，構建 seatinfo 參數（格式：row1,col1,row2,col2,...）
- [x] 4.3 根據選取的座位，構建 xy 參數（格式：x1,y1,x2,y2,...）
- [x] 4.4 構建其他必要參數（ststus, position, seatcount 等）
- [x] 4.5 構建完整的 `buyticket_process-2.aspx` URL，包含所有參數
- [x] 4.6 使用 Chrome Extension API (`chrome.tabs.create`) 新開 tab 並導入該 URL
- [x] 4.7 等待新開的 tab 載入完成

## 5. 實作票種資料解析（在新開的 tab 中）
- [x] 5.1 在新開的 tab 中，使用 content script 或 tabs API 取得頁面 DOM
- [x] 5.2 從頁面 DOM 中找到 id 為 "TicketInfo" 的元素
- [x] 5.3 從 TicketInfo 中提取所有 class 為 "bps_content_tickettypes_numberofsheets" 的票種元素
- [x] 5.4 從每個票種元素中提取：
  - label class="bctn_t" 的文字內容（票種名稱，如「全票」）
  - input id="price{N}" 的 value 屬性（價格，如「310」）
  - 用 text 和 value 組成搜尋條件（格式："{票種名稱} & {價格}"，如「全票 & 310」）
  - 票種的索引位置（從 0 開始遞增，對應到 quantityadd 的參數）

## 6. 實作票種選擇邏輯（透過 DOM 操作）
- [x] 6.1 實作優先選擇邏輯：從所有票種中尋找 price value 為 "999" 的票種
- [x] 6.2 若找不到 value 999 的票種，則尋找票種名稱（label text）為「全票」的票種
- [x] 6.3 若找不到「全票」，則選擇所有票種資料中的第一個
- [x] 6.4 找到對應票種後，定位該票種後方 class 為 "bctn_i" 的元素
- [x] 6.5 在 bctn_i 元素中，找到包含 `quantityadd({索引})` 的連結（索引對應到票種的位置，從 0 開始）
- [x] 6.6 點擊該連結，觸發票種數量增加

## 7. 錯誤處理與驗證
- [x] 7.1 驗證時間選單已選擇
- [x] 7.2 驗證座位選擇頁面載入成功
- [x] 7.3 驗證有足夠的可用座位
- [x] 7.4 處理座位選擇失敗的情況（如找不到相鄰座位）
- [x] 7.5 處理新開 tab 失敗的情況
- [x] 7.6 處理新開 tab 頁面載入失敗的情況
- [x] 7.7 處理票種資料解析失敗的情況（如找不到 TicketInfo 或票種元素）
- [x] 7.8 處理票種 DOM 操作失敗的情況（如找不到 bctn_i 元素或 quantityadd 連結）
- [x] 7.9 在 API 狀態顯示區域顯示詳細的錯誤訊息
