## ADDED Requirements

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
