// 取得 DOM 元素
const movieSelect = document.getElementById("movie-select");
const timeSelect = document.getElementById("time-select");
const refreshTimeBtn = document.getElementById("refresh-time-btn");
const ticketTypeSelect = document.getElementById("ticket-type-select");
const quantitySelect = document.getElementById("quantity-select");
const bookBtn = document.getElementById("book-btn");
const apiStatus = document.getElementById("api-status");

// API 基礎 URL
const API_BASE_URL =
  "https://ticket.centuryasia.com.tw/ximen/ImportOldMovieWeb/ajax/Program_ShowMovieTime.ashx";

// 更新 API 狀態顯示
function updateApiStatus(message, isError = false) {
  const timestamp = new Date().toLocaleTimeString("zh-TW");
  const status = isError ? "❌ 錯誤" : "✅ 成功";
  apiStatus.value = `[${timestamp}] ${status}: ${message}\n${apiStatus.value}`;
}

// 取得 ASP.NET_SessionId cookie
async function getSessionCookie() {
  try {
    const cookies = await chrome.cookies.getAll({
      domain: "ticket.centuryasia.com.tw",
    });
    const sessionCookie = cookies.find(
      (cookie) => cookie.name === "ASP.NET_SessionId"
    );
    if (!sessionCookie) {
      throw new Error("找不到 ASP.NET_SessionId cookie");
    }
    return sessionCookie.value;
  } catch (error) {
    updateApiStatus(`取得 cookie 失敗: ${error.message}`, true);
    throw error;
  }
}

// 生成今天起未來14天的日期陣列（格式：YYYY-MM-DD）
function generateDateRange() {
  const dates = [];
  const today = new Date();
  
  for (let i = 0; i < 14; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    dates.push(`${year}-${month}-${day}`);
  }
  
  return dates;
}

// 發送 POST 請求獲取時間資料
async function fetchTimeData(programId, date) {
  try {
    // 驗證 cookie 是否存在
    await getSessionCookie();

    // 構建 POST 請求參數（動態參數）
    const params = new URLSearchParams();
    params.append("ProgramID", programId);
    params.append("Date", date);
    params.append("CodeControl", "");

    // Chrome Extension 會自動帶入該網域的 cookie
    const response = await fetch(API_BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      credentials: "include",
      body: params.toString(),
    });

    if (!response.ok) {
      throw new Error(`HTTP 錯誤: ${response.status}`);
    }

    const json = await response.json();
    return json;
  } catch (error) {
    updateApiStatus(`取得時間資料失敗 (${date}): ${error.message}`, true);
    throw error;
  }
}

// 解析 JSON 回應並提取時間選項
function parseTimeOptions(jsonData) {
  try {
    if (!Array.isArray(jsonData)) {
      throw new Error("API 回應格式錯誤：預期為陣列");
    }

    const timeOptions = [];

    // 遍歷回應陣列中的每個項目
    jsonData.forEach((item) => {
      // 從每個項目的 mytime 陣列中提取所有場次
      if (item.mytime && Array.isArray(item.mytime)) {
        item.mytime.forEach((timeItem) => {
          const text = timeItem.RealShowTime;
          const value = timeItem.Url;
          if (text && value) {
            timeOptions.push({ text, value });
          }
        });
      }
    });

    return timeOptions;
  } catch (error) {
    updateApiStatus(`解析時間選項失敗: ${error.message}`, true);
    throw error;
  }
}

// 將時間字串轉換為 Date 物件以便排序（格式：2026/01/27 17:15）
function parseTimeString(timeString) {
  try {
    // 將 "2026/01/27 17:15" 轉換為 Date 物件
    const [datePart, timePart] = timeString.split(" ");
    const [year, month, day] = datePart.split("/").map(Number);
    const [hour, minute] = timePart.split(":").map(Number);
    return new Date(year, month - 1, day, hour, minute);
  } catch (error) {
    // 如果解析失敗，返回一個很遠的未來日期，讓它排在最後
    return new Date(9999, 0, 1);
  }
}

// 按照時間先後順序排序場次時間選項（時間越早的越靠前）
function sortTimeOptions(timeOptions) {
  return timeOptions.sort((a, b) => {
    const dateA = parseTimeString(a.text);
    const dateB = parseTimeString(b.text);
    return dateA - dateB;
  });
}

// 去除重複的時間選項（基於 value 或 text）
function removeDuplicateTimeOptions(timeOptions) {
  const seen = new Set();
  const unique = [];
  
  for (const option of timeOptions) {
    // 使用 value 作為唯一識別（因為 URL 應該是唯一的）
    const key = option.value;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(option);
    }
  }
  
  return unique;
}

// 載入時間選項
async function loadTimeOptions(programId) {
  try {
    updateApiStatus("正在載入時間選項...");
    timeSelect.disabled = true;
    refreshTimeBtn.disabled = true;
    timeSelect.innerHTML = '<option value="">載入中...</option>';

    // 生成今天起未來14天的日期陣列
    const dates = generateDateRange();
    updateApiStatus(`正在查詢 ${dates.length} 天的場次時間...`);

    // 為每個日期並行發送 API 請求
    const fetchPromises = dates.map(async (date) => {
      try {
        const jsonData = await fetchTimeData(programId, date);
        const options = parseTimeOptions(jsonData);
        return { success: true, date, options };
      } catch (error) {
        return { success: false, date, error };
      }
    });

    // 等待所有請求完成（使用 Promise.allSettled 確保即使部分失敗也能繼續）
    const results = await Promise.allSettled(fetchPromises);

    // 處理結果
    const allTimeOptions = [];
    const failedDates = [];
    let successCount = 0;

    results.forEach((result) => {
      if (result.status === "fulfilled") {
        const { success, date, options, error } = result.value;
        if (success) {
          allTimeOptions.push(...options);
          successCount++;
        } else {
          failedDates.push(date);
        }
      } else {
        // Promise.allSettled 理論上不會進入這裡，但為了安全起見
        updateApiStatus(`請求處理異常: ${result.reason}`, true);
      }
    });

    // 去除重複項目
    const uniqueOptions = removeDuplicateTimeOptions(allTimeOptions);

    // 按照時間先後順序排序
    const sortedOptions = sortTimeOptions(uniqueOptions);

    // 顯示結果
    if (sortedOptions.length === 0) {
      timeSelect.innerHTML = '<option value="">無可用時間</option>';
      timeSelect.disabled = true;
      refreshTimeBtn.disabled = false;
      updateApiStatus("未找到可用時間", true);
    } else {
      timeSelect.innerHTML = '<option value="">請選擇時間</option>';
      sortedOptions.forEach((option) => {
        const optionElement = document.createElement("option");
        optionElement.value = option.value;
        optionElement.textContent = option.text;
        timeSelect.appendChild(optionElement);
      });
      timeSelect.disabled = false;
      refreshTimeBtn.disabled = false;
      
      // 顯示載入統計
      let statusMessage = `成功載入 ${sortedOptions.length} 個時間選項（${successCount}/${dates.length} 天成功）`;
      if (failedDates.length > 0) {
        statusMessage += `，${failedDates.length} 天載入失敗`;
      }
      updateApiStatus(statusMessage);
    }

    // 如果有失敗的日期，顯示錯誤訊息
    if (failedDates.length > 0) {
      updateApiStatus(`以下日期載入失敗: ${failedDates.join(", ")}`, true);
    }
  } catch (error) {
    timeSelect.innerHTML = '<option value="">載入失敗</option>';
    timeSelect.disabled = true;
    refreshTimeBtn.disabled = false;
    updateApiStatus(`載入時間選項失敗: ${error.message}`, true);
  }
}

// 電影選擇變更事件
movieSelect.addEventListener("change", (e) => {
  const programId = e.target.value;
  if (programId) {
    loadTimeOptions(programId);
  } else {
    timeSelect.innerHTML = '<option value="">請先選擇電影</option>';
    timeSelect.disabled = true;
    refreshTimeBtn.disabled = true;
  }
});

// 時間重新整理按鈕事件
refreshTimeBtn.addEventListener("click", () => {
  const programId = movieSelect.value;
  if (programId) {
    loadTimeOptions(programId);
  }
});

// 解析 URL 參數
function parseUrlParams(url) {
  const params = {};
  try {
    const urlObj = new URL(url, "https://ticket.centuryasia.com.tw");
    urlObj.searchParams.forEach((value, key) => {
      params[key] = value;
    });
  } catch (error) {
    // 如果 URL 是相對路徑，嘗試手動解析
    const queryString = url.includes("?") ? url.split("?")[1] : url;
    if (queryString) {
      queryString.split("&").forEach((param) => {
        const [key, value] = param.split("=");
        if (key && value) {
          params[decodeURIComponent(key)] = decodeURIComponent(value);
        }
      });
    }
  }
  return params;
}

// 載入座位選擇頁面
async function loadSeatSelectionPage(timeValue) {
  try {
    await getSessionCookie();
    const baseUrl = "https://ticket.centuryasia.com.tw/ximen/";
    const url = timeValue.startsWith("http")
      ? timeValue
      : timeValue.startsWith("/")
      ? `https://ticket.centuryasia.com.tw${timeValue}`
      : `${baseUrl}${timeValue}`;

    const response = await fetch(url, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`HTTP 錯誤: ${response.status}`);
    }

    const html = await response.text();
    return html;
  } catch (error) {
    updateApiStatus(`載入座位選擇頁面失敗: ${error.message}`, true);
    throw error;
  }
}

// 解析座位資料
function parseSeatData(html) {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const sitemaptable = doc.getElementById("sitemaptable");

    if (!sitemaptable) {
      throw new Error("找不到 sitemaptable 元素");
    }

    const seats = [];
    const seatElements = sitemaptable.querySelectorAll("td.seat_avi");

    seatElements.forEach((seat) => {
      const x = seat.getAttribute("x");
      const y = seat.getAttribute("y");
      const row = seat.getAttribute("row");
      const col = seat.getAttribute("col");
      const position = seat.getAttribute("position");
      const status = seat.getAttribute("status");

      if (x !== null && y !== null && row !== null && col !== null) {
        seats.push({
          x: parseInt(x),
          y: parseInt(y),
          row: parseInt(row),
          col: parseInt(col),
          position: position ? parseInt(position) : null,
          status: status ? parseInt(status) : null,
          element: seat,
        });
      }
    });

    return seats;
  } catch (error) {
    updateApiStatus(`解析座位資料失敗: ${error.message}`, true);
    throw error;
  }
}

// 計算兩個座位的距離
function getSeatDistance(seat1, seat2) {
  const rowDiff = Math.abs(seat1.row - seat2.row);
  const colDiff = Math.abs(seat1.col - seat2.col);
  return rowDiff + colDiff;
}

// 檢查座位是否相鄰
function areSeatsAdjacent(seat1, seat2) {
  const rowDiff = Math.abs(seat1.row - seat2.row);
  const colDiff = Math.abs(seat1.col - seat2.col);
  return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
}

// 智慧座位選擇
function selectSeats(seats, quantity) {
  if (seats.length === 0) {
    throw new Error("沒有可用座位");
  }

  if (quantity > seats.length) {
    throw new Error("可用座位不足");
  }

  const selectedSeats = [];

  if (quantity === 1) {
    // 單張票：隨機選擇
    const randomIndex = Math.floor(Math.random() * seats.length);
    selectedSeats.push(seats[randomIndex]);
  } else {
    // 多張票：第一個隨機選擇，後續選擇相鄰座位
    const availableSeats = [...seats];
    const randomIndex = Math.floor(Math.random() * availableSeats.length);
    const firstSeat = availableSeats[randomIndex];
    selectedSeats.push(firstSeat);
    availableSeats.splice(randomIndex, 1);

    // 選擇後續相鄰座位
    while (selectedSeats.length < quantity) {
      let found = false;
      let bestSeat = null;
      let minDistance = Infinity;

      // 從已選座位中尋找相鄰座位
      for (const selectedSeat of selectedSeats) {
        for (const availableSeat of availableSeats) {
          if (areSeatsAdjacent(selectedSeat, availableSeat)) {
            const distance = getSeatDistance(selectedSeat, availableSeat);
            if (distance < minDistance) {
              minDistance = distance;
              bestSeat = availableSeat;
              found = true;
            }
          }
        }
      }

      if (found && bestSeat) {
        selectedSeats.push(bestSeat);
        const index = availableSeats.indexOf(bestSeat);
        if (index > -1) {
          availableSeats.splice(index, 1);
        }
      } else {
        throw new Error("無法找到足夠的相鄰座位");
      }
    }
  }

  return selectedSeats;
}

// 構建訂票頁面 URL
function buildBookingUrl(timeValue, selectedSeats) {
  const params = parseUrlParams(timeValue);
  const baseUrl = "https://ticket.centuryasia.com.tw/ximen/buyticket_process-2.aspx";

  // 構建 seatinfo 參數
  const seatinfo = selectedSeats
    .map((seat) => `${seat.row},${seat.col},`)
    .join("");

  // 構建 xy 參數
  const xy = selectedSeats.map((seat) => `${seat.x},${seat.y},`).join("");

  // 構建 ststus 參數
  const ststus = selectedSeats
    .map((seat) => `${seat.status || 1},`)
    .join("");

  // 構建 position 參數
  const position = selectedSeats
    .map((seat) => `${seat.position || 0},`)
    .join("");

  // 構建完整 URL
  const urlParams = new URLSearchParams();
  urlParams.set("ProgramID", params.ProgramID || "");
  urlParams.set("Progsubid", params.Progsubid || "");
  urlParams.set("roomid", params.roomid || "");
  urlParams.set("date", params.date || "");
  urlParams.set("platform", params.platform || "Century");
  urlParams.set("siteid", params.siteid || "");
  urlParams.set("sernum", params.sernum || "");
  urlParams.set("eventsn", params.eventsn || "");
  urlParams.set("computerid", params.computerid || "");
  urlParams.set("seatinfo", seatinfo);
  urlParams.set("xy", xy);
  urlParams.set("ststus", ststus);
  urlParams.set("position", position);
  urlParams.set("seatcount", selectedSeats.length.toString());
  urlParams.set("ShowDate", params.ShowDate || "");
  urlParams.set("ScreenNO", params.ScreenNO || "");
  urlParams.set("session", params.session || "");
  urlParams.set("RoomName", params.RoomName || "");
  urlParams.set("bacletplfo", params.bacletplfo || params.ProgramID || "");
  urlParams.set("backettheater", params.backettheater || "");

  return `${baseUrl}?${urlParams.toString()}`;
}

// 等待 tab 載入完成
function waitForTabLoad(tabId) {
  return new Promise((resolve, reject) => {
    const checkTab = () => {
      chrome.tabs.get(tabId, (tab) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        if (tab.status === "complete") {
          resolve(tab);
        } else {
          setTimeout(checkTab, 100);
        }
      });
    };
    checkTab();
  });
}

// 在新開的 tab 中解析票種資料
async function parseTicketTypes(tabId) {
  try {
    // 使用 chrome.scripting.executeScript 注入腳本
    const results = await chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: () => {
        const ticketInfo = document.getElementById("TicketInfo");
        if (!ticketInfo) {
          return null;
        }

        const ticketTypes = [];
        const ticketElements = ticketInfo.querySelectorAll(
          ".bps_content_tickettypes_numberofsheets"
        );

        ticketElements.forEach((element, index) => {
          const label = element.querySelector("label.bctn_t");
          const priceInput = element.querySelector('input[id^="price"]');
          const ticketName = label ? label.textContent.trim() : "";
          const price = priceInput ? priceInput.value : "";
          
          // 從 price input 的 id 中提取索引（例如：price0 -> 0）
          let ticketIndex = index;
          if (priceInput && priceInput.id) {
            const match = priceInput.id.match(/price(\d+)/);
            if (match) {
              ticketIndex = parseInt(match[1]);
            }
          }

          ticketTypes.push({
            index: ticketIndex,
            name: ticketName,
            price: price,
            searchKey: `${ticketName} & ${price}`,
            element: element,
          });
        });

        return ticketTypes;
      },
    });

    if (!results || !results[0] || !results[0].result) {
      throw new Error("無法解析票種資料");
    }

    return results[0].result;
  } catch (error) {
    updateApiStatus(`解析票種資料失敗: ${error.message}`, true);
    throw error;
  }
}

// 選擇票種並操作 DOM
async function selectTicketType(tabId, ticketTypes, quantity) {
  try {
    let selectedTicket = null;

    // 優先尋找 value 999 的票種
    selectedTicket = ticketTypes.find((t) => t.price === "999");

    // 若沒有就選擇「全票」
    if (!selectedTicket) {
      selectedTicket = ticketTypes.find((t) => t.name === "全票");
    }

    // 再沒有就選擇第一個
    if (!selectedTicket && ticketTypes.length > 0) {
      selectedTicket = ticketTypes[0];
    }

    if (!selectedTicket) {
      throw new Error("無法找到可用票種");
    }

    // 根據票數點擊 quantityadd 連結多次
    await chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: (index, count) => {
        const ticketInfo = document.getElementById("TicketInfo");
        if (!ticketInfo) {
          throw new Error("找不到 TicketInfo 元素");
        }

        const ticketElements = ticketInfo.querySelectorAll(
          ".bps_content_tickettypes_numberofsheets"
        );
        if (index >= ticketElements.length) {
          throw new Error("票種索引超出範圍");
        }

        const ticketElement = ticketElements[index];
        
        // bctn_i 是票種元素的兄弟元素（下一個元素），不是子元素
        let bctnI = ticketElement.nextElementSibling;
        
        // 如果下一個元素不是 bctn_i，繼續尋找
        while (bctnI && !bctnI.classList.contains("bctn_i")) {
          bctnI = bctnI.nextElementSibling;
        }
        
        if (!bctnI) {
          throw new Error(`找不到 bctn_i 元素 (索引: ${index})`);
        }

        // 直接調用 quantityadd 函數，而不是執行 javascript: URL
        // 這樣可以避免 CSP 限制
        // 嘗試多種方式找到並調用函數
        let quantityaddFunc = null;
        
        // 方式1: 從 window 物件尋找
        if (typeof window.quantityadd === 'function') {
          quantityaddFunc = window.quantityadd;
        }
        // 方式2: 從全域範圍尋找（某些網站可能這樣定義）
        else if (typeof quantityadd === 'function') {
          quantityaddFunc = quantityadd;
        }
        
        if (quantityaddFunc) {
          // 根據票數調用函數多次
          for (let i = 0; i < count; i++) {
            quantityaddFunc(index);
          }
        } else {
          // 如果找不到函數，直接操作 DOM 來更新數量
          // 這是最安全的方式，完全避免 CSP 限制
          const numberLabel = bctnI.querySelector(`label#number${index}`);
          const numberInput = bctnI.querySelector(`input#txtnum${index}`);
          
          if (numberLabel && numberInput) {
            const currentValue = parseInt(numberLabel.textContent || numberInput.value || 0);
            const newValue = currentValue + count;
            
            // 更新顯示的值
            numberLabel.textContent = newValue;
            numberInput.value = newValue;
            
            // 觸發 input 事件，讓頁面知道值已改變
            const inputEvent = new Event('input', { bubbles: true });
            numberInput.dispatchEvent(inputEvent);
            
            // 觸發 change 事件
            const changeEvent = new Event('change', { bubbles: true });
            numberInput.dispatchEvent(changeEvent);
          } else {
            throw new Error(`找不到數量控制元素 (索引: ${index})`);
          }
        }
      },
      args: [selectedTicket.index, quantity],
    });

    return selectedTicket;
  } catch (error) {
    updateApiStatus(`選擇票種失敗: ${error.message}`, true);
    throw error;
  }
}

// 點擊確認按鈕
async function clickConfirmButton(tabId) {
  try {
    const result = await chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: () => {
        // 先嘗試使用 id 定位
        let confirmButton = document.getElementById("detail_imgcursor");
        
        // 如果找不到，嘗試使用 name 屬性定位
        if (!confirmButton) {
          confirmButton = document.querySelector('input[name="ctl00$detail$imgcursor"]');
        }
        
        if (!confirmButton) {
          return { success: false, error: "無法找到確認按鈕" };
        }
        
        // 點擊確認按鈕
        confirmButton.click();
        
        return { success: true };
      },
    });

    if (!result || !result[0] || !result[0].result) {
      throw new Error("執行確認按鈕點擊腳本失敗");
    }

    const clickResult = result[0].result;
    
    if (!clickResult.success) {
      throw new Error(clickResult.error || "無法點擊確認按鈕");
    }

    updateApiStatus("已點擊確認按鈕");
  } catch (error) {
    updateApiStatus(`點擊確認按鈕失敗: ${error.message}`, true);
    throw error;
  }
}

// 訂票按鈕事件
bookBtn.addEventListener("click", async () => {
  const movieValue = movieSelect.value;
  const timeValue = timeSelect.value;
  const ticketTypeValue = ticketTypeSelect.value;
  const quantityValue = parseInt(quantitySelect.value);

  // 驗證時間選單已選擇
  if (!timeValue) {
    updateApiStatus("請選擇時間", true);
    return;
  }

  try {
    updateApiStatus("正在執行訂票...");

    // 1. 載入座位選擇頁面
    updateApiStatus("正在載入座位選擇頁面...");
    const seatPageHtml = await loadSeatSelectionPage(timeValue);

    // 2. 解析座位資料
    updateApiStatus("正在解析座位資料...");
    const seats = parseSeatData(seatPageHtml);

    if (seats.length === 0) {
      updateApiStatus("沒有可用座位", true);
      return;
    }

    // 3. 驗證有足夠的可用座位
    if (quantityValue > seats.length) {
      updateApiStatus("可用座位不足", true);
      return;
    }

    // 4. 智慧座位選擇
    updateApiStatus("正在選擇座位...");
    const selectedSeats = selectSeats(seats, quantityValue);
    updateApiStatus(
      `已選取 ${selectedSeats.length} 個座位: ${selectedSeats
        .map((s) => `(${s.row},${s.col})`)
        .join(", ")}`
    );

    // 5. 構建訂票頁面 URL
    updateApiStatus("正在構建訂票頁面 URL...");
    const bookingUrl = buildBookingUrl(timeValue, selectedSeats);

    // 6. 取得當前活動的 tab
    updateApiStatus("正在取得當前 tab...");
    const [currentTab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (!currentTab || !currentTab.id) {
      throw new Error("無法取得當前 tab");
    }

    // 7. 在當前 tab 中導航到訂票頁面
    updateApiStatus("正在導航到訂票頁面...");
    await chrome.tabs.update(currentTab.id, { url: bookingUrl });

    // 8. 等待 tab 載入完成
    updateApiStatus("等待訂票頁面載入...");
    await waitForTabLoad(currentTab.id);

    // 9. 解析票種資料
    updateApiStatus("正在解析票種資料...");
    const ticketTypes = await parseTicketTypes(currentTab.id);

    if (!ticketTypes || ticketTypes.length === 0) {
      updateApiStatus("無法找到票種資料", true);
      return;
    }

    // 10. 選擇票種並操作 DOM
    updateApiStatus("正在選擇票種...");
    const selectedTicket = await selectTicketType(
      currentTab.id,
      ticketTypes,
      quantityValue
    );
    updateApiStatus(
      `已選擇票種: ${selectedTicket.name} (${selectedTicket.price} 元) x ${quantityValue} 張`
    );

    // 11. 點擊確認按鈕
    updateApiStatus("正在點擊確認按鈕...");
    await clickConfirmButton(currentTab.id);
    updateApiStatus("訂票成功！已點擊確認按鈕");
  } catch (error) {
    updateApiStatus(`訂票失敗: ${error.message}`, true);
  }
});

// 取得電影列表 HTML
async function fetchMovieListHtml() {
  try {
    const url = "https://ticket.centuryasia.com.tw/ximen/index.aspx";
    const response = await fetch(url, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`HTTP 錯誤: ${response.status}`);
    }

    const html = await response.text();
    return html;
  } catch (error) {
    updateApiStatus(`取得電影列表 HTML 失敗: ${error.message}`, true);
    throw error;
  }
}

// 解析電影資料
function parseMovieData(html) {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    
    // 取得兩個 ul 元素
    const ul1 = doc.getElementById("detail_pagedetail_ulinser2");
    const ul2 = doc.getElementById("detail_pagedetail_ulinser1");
    
    if (!ul1 && !ul2) {
      throw new Error("找不到目標 ul 元素（detail_pagedetail_ulinser2 或 detail_pagedetail_ulinser1）");
    }

    const movies = [];
    const seenProgramIds = new Set();

    // 解析函數
    const parseLiElement = (li) => {
      try {
        // 取得電影名稱：從 div.trn_text > div.trn_mn > span
        const trnText = li.querySelector("div.trn_text");
        if (!trnText) return null;
        
        const trnMn = trnText.querySelector("div.trn_mn");
        if (!trnMn) return null;
        
        const span = trnMn.querySelector("span");
        if (!span) return null;
        
        const movieName = span.textContent.trim();
        if (!movieName) return null;

        // 取得 ProgramID：從 a 元素的 href 屬性中解析
        const link = li.querySelector("a.trn_img") || li.querySelector("a");
        if (!link || !link.getAttribute("href")) return null;
        
        // 取得 href 屬性值（可能是相對路徑）
        const hrefAttr = link.getAttribute("href");
        
        // 使用 base URL 解析相對路徑
        const baseUrl = "https://ticket.centuryasia.com.tw/ximen/";
        const url = new URL(hrefAttr, baseUrl);
        const programId = url.searchParams.get("ProgramID");
        if (!programId) return null;

        return { movieName, programId };
      } catch (error) {
        return null;
      }
    };

    // 解析第一個 ul
    if (ul1) {
      const lis = ul1.querySelectorAll("li");
      lis.forEach((li) => {
        const movie = parseLiElement(li);
        if (movie && !seenProgramIds.has(movie.programId)) {
          movies.push(movie);
          seenProgramIds.add(movie.programId);
        }
      });
    }

    // 解析第二個 ul
    if (ul2) {
      const lis = ul2.querySelectorAll("li");
      lis.forEach((li) => {
        const movie = parseLiElement(li);
        if (movie && !seenProgramIds.has(movie.programId)) {
          movies.push(movie);
          seenProgramIds.add(movie.programId);
        }
      });
    }

    return movies;
  } catch (error) {
    updateApiStatus(`解析電影資料失敗: ${error.message}`, true);
    throw error;
  }
}

// 載入電影選項
async function loadMovieOptions() {
  try {
    updateApiStatus("正在載入電影列表...");
    movieSelect.disabled = true;
    movieSelect.innerHTML = '<option value="">載入中...</option>';

    // 取得 HTML
    const html = await fetchMovieListHtml();
    
    // 解析電影資料
    const movies = parseMovieData(html);

    if (movies.length === 0) {
      movieSelect.innerHTML = '<option value="">無可用電影</option>';
      movieSelect.disabled = false;
      updateApiStatus("未找到可用電影", true);
      return;
    }

    // 更新下拉選單
    movieSelect.innerHTML = '<option value="">請選擇電影</option>';
    movies.forEach((movie) => {
      const option = document.createElement("option");
      option.value = movie.programId;
      option.textContent = movie.movieName;
      movieSelect.appendChild(option);
    });

    movieSelect.disabled = false;
    updateApiStatus(`成功載入 ${movies.length} 部電影`);
  } catch (error) {
    movieSelect.innerHTML = '<option value="">載入失敗</option>';
    movieSelect.disabled = false;
    updateApiStatus(`載入電影選項失敗: ${error.message}`, true);
  }
}

// 初始化
updateApiStatus("系統已就緒");
loadMovieOptions();
