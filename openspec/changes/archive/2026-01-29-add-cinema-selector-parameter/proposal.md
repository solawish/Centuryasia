# Change: 新增影城下拉選單並將 API 影城改為參數

## Why
目前所有 API 與頁面 URL 皆寫死為「ximen」（今日影城），無法切換其他影城。使用者需要能選擇影城，且所有請求應依選擇的影城動態組出 URL。

## What Changes
- 在 popup.html 最上方新增「影城」下拉選單，選項為指定 text-value 清單。
- 將 popup.js 中所有以 `ximen` 寫死的影城路徑改為使用影城下拉選單的 value。
- 電影列表、場次時間 API、座位頁、訂票頁等 URL 皆改為 `https://ticket.centuryasia.com.tw/{影城value}/...`。

## Impact
- Affected specs: popup-interface
- Affected code: popup.html, popup.js
