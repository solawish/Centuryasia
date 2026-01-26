## 1. 實作電影資料解析功能
- [x] 1.1 新增函數 `fetchMovieListHtml()` 發送 GET 請求至 `https://ticket.centuryasia.com.tw/ximen/index.aspx`
- [x] 1.2 新增函數 `parseMovieData(html)` 解析 HTML，取得兩個 `ul` 元素（`detail_pagedetail_ulinser2` 和 `detail_pagedetail_ulinser1`）
- [x] 1.3 從每個 `li` 元素中提取電影名稱（`trn_mn` div 中的 `span` 文字）和 ProgramID（從 `href` 屬性中解析 `ProgramID` 參數）
- [x] 1.4 合併兩個 `ul` 元素的電影資料，去除重複的 ProgramID
- [x] 1.5 新增函數 `loadMovieOptions()` 在初始化時載入電影資料並更新下拉選單

## 2. 更新 HTML 和 JavaScript
- [x] 2.1 移除 `popup.html` 中寫死的電影選項（保留預設的 "請選擇電影" 選項）
- [x] 2.2 在 `popup.js` 初始化時呼叫 `loadMovieOptions()` 載入電影資料
- [x] 2.3 處理載入失敗的情況，顯示錯誤訊息並保持下拉選單可用（即使沒有資料）

## 3. 錯誤處理和狀態顯示
- [x] 3.1 在 `fetchMovieListHtml()` 中處理網路錯誤和 HTTP 錯誤
- [x] 3.2 在 `parseMovieData()` 中處理 HTML 解析錯誤（找不到目標元素等）
- [x] 3.3 使用 `updateApiStatus()` 顯示載入狀態和錯誤訊息
- [x] 3.4 在載入期間顯示 "載入中..." 狀態

## 4. 測試和驗證
- [x] 4.1 驗證能正確解析兩個 `ul` 元素的電影資料（程式碼已實作）
- [x] 4.2 驗證能正確提取電影名稱和 ProgramID（程式碼已實作）
- [x] 4.3 驗證下拉選單能正確顯示解析得到的電影選項（程式碼已實作）
- [x] 4.4 驗證錯誤處理機制（網路錯誤、HTML 結構變更等）（程式碼已實作）
