## 1. 影城選單 UI
- [x] 1.1 在 popup.html 最上方（標題與電影選單之間）新增「影城」表單區塊，含 label 與 select，id 為 `cinema-select`
- [x] 1.2 在影城 select 內新增以下 option（text-value）：今日影城-ximen、南港影城-nangang、永和比漾-beyond、桃園A19-taoyuan、高雄總圖-Kaohsiung，預設選項為「今日影城」(value ximen)

## 2. popup.js 改為使用影城參數
- [x] 2.1 取得 `cinema-select` 元素，並提供取得當前影城 value 的函數或常數（用於組 URL）
- [x] 2.2 將電影列表 API URL（index.aspx）改為使用當前影城 value，不再寫死 ximen
- [x] 2.3 將場次時間 API URL（Program_ShowMovieTime.ashx）改為使用當前影城 value
- [x] 2.4 將載入座位選擇頁的 baseUrl、解析電影時用的 baseUrl、構建訂票頁的 baseUrl 皆改為使用當前影城 value
- [x] 2.5 當使用者變更影城時，視需求清空或重新載入電影/時間選單（例如：變更影城後重新載入電影列表）

## 3. 驗證
- [x] 3.1 手動測試：切換影城後電影列表與場次時間皆依所選影城請求
- [x] 3.2 手動測試：訂票流程（座位頁、訂票頁）皆使用所選影城 URL
