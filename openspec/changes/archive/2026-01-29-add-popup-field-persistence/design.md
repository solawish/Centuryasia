# Design: Popup 欄位儲存與還原

## Context
- Popup 生命週期短，關閉即銷毀；需用擴充功能儲存介面保存使用者選擇。
- 電影與時間選項為動態載入，還原時須在資料載入完成後再設定選單值。
- project.md 已載明使用 Chrome Storage API 管理狀態。

## Goals / Non-Goals
- Goals: 使用 chrome.storage.local 儲存/還原影城、電影、時間、票種、數量；還原時若選項不存在則不強制還原。
- Non-Goals: 不儲存 API 狀態 textarea；不變更既有載入電影/時間的 API 行為。

## Decisions
- **儲存媒介**：使用 `chrome.storage.local`，需在 manifest 加上 `storage` 權限。
- **儲存鍵**：單一 key（例如 `popupFormState`）存一物件，內含 cinema、movieProgramId、timeValue、ticketTypeKeyword、quantity。
- **儲存時機**：影城/電影/時間/票種/數量任一欄位發生 change 或 input（票種為文字框）時，寫入目前表單狀態。
- **還原順序**：popup 載入時非同步讀取 Storage → 若有儲存的影城且與目前影城不同則先切換影城 → 載入電影列表 → 電影列表載入完成後若儲存中有 movieProgramId 且存在於選項則還原電影 → 若還原了電影則觸發載入時間選項 → 時間選項載入完成後若儲存中有 timeValue 且存在於選項則還原時間 → 還原票種關鍵字與數量。
- **不存在時的處理**：儲存的電影 ProgramID 若不在本次電影選項中，或儲存的時間 URL 不在本次時間選項中，則該欄位維持預設（不還原），其餘欄位仍照常還原。

## Risks / Trade-offs
- 儲存的時間 URL 可能因場次過期而無法再次選到，屬預期；僅在選項存在時還原即可。
