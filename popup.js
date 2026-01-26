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

// 訂票按鈕事件
bookBtn.addEventListener("click", async () => {
  const movieValue = movieSelect.value;
  const timeValue = timeSelect.value;
  const ticketTypeValue = ticketTypeSelect.value;
  const quantityValue = quantitySelect.value;

  if (!movieValue) {
    updateApiStatus("請選擇電影", true);
    return;
  }

  if (!timeValue) {
    updateApiStatus("請選擇時間", true);
    return;
  }

  try {
    updateApiStatus("正在執行訂票...");
    // TODO: 實作訂票邏輯
    updateApiStatus(
      `訂票資訊: 電影=${movieValue}, 時間=${timeValue}, 票種=${ticketTypeValue}, 數量=${quantityValue}`
    );
  } catch (error) {
    updateApiStatus(`訂票失敗: ${error.message}`, true);
  }
});

// 初始化
updateApiStatus("系統已就緒");
