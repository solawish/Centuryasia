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
  "https://ticket.centuryasia.com.tw/ximen/movie_timetable.aspx";

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

// 發送 GET 請求獲取時間資料
async function fetchTimeData(programId) {
  try {
    // 驗證 cookie 是否存在
    await getSessionCookie();
    const url = `${API_BASE_URL}?ProgramID=${programId}`;

    // Chrome Extension 會自動帶入該網域的 cookie
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
    updateApiStatus(`取得時間資料失敗: ${error.message}`, true);
    throw error;
  }
}

// 解析 Panel1 元素並提取時間選項
function parseTimeOptions(html) {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const panel1 = doc.getElementById("Panel1");

    if (!panel1) {
      throw new Error("找不到 Panel1 元素");
    }

    const timeOptions = [];
    const timeLinks = panel1.querySelectorAll(
      "li.movie_timetable_times a"
    );

    timeLinks.forEach((link) => {
      const text = link.textContent.trim();
      const value = link.getAttribute("href");
      if (text && value) {
        timeOptions.push({ text, value });
      }
    });

    return timeOptions;
  } catch (error) {
    updateApiStatus(`解析時間選項失敗: ${error.message}`, true);
    throw error;
  }
}

// 載入時間選項
async function loadTimeOptions(programId) {
  try {
    updateApiStatus("正在載入時間選項...");
    timeSelect.disabled = true;
    refreshTimeBtn.disabled = true;
    timeSelect.innerHTML = '<option value="">載入中...</option>';

    const html = await fetchTimeData(programId);
    const options = parseTimeOptions(html);

    if (options.length === 0) {
      timeSelect.innerHTML = '<option value="">無可用時間</option>';
      timeSelect.disabled = true;
      refreshTimeBtn.disabled = false; // 即使找不到時間，仍可重新整理
      updateApiStatus("未找到可用時間", true);
    } else {
      timeSelect.innerHTML = '<option value="">請選擇時間</option>';
      options.forEach((option) => {
        const optionElement = document.createElement("option");
        optionElement.value = option.value;
        optionElement.textContent = option.text;
        timeSelect.appendChild(optionElement);
      });
      timeSelect.disabled = false;
      refreshTimeBtn.disabled = false;
      updateApiStatus(`成功載入 ${options.length} 個時間選項`);
    }
  } catch (error) {
    timeSelect.innerHTML = '<option value="">載入失敗</option>';
    timeSelect.disabled = true;
    refreshTimeBtn.disabled = false; // 即使載入失敗，仍可重新整理
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

// 初始化
updateApiStatus("系統已就緒");
