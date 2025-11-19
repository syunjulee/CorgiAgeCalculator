// 妙麗的生日（固定值）
const BIRTHDAY = new Date('2023-02-28T00:00:00');
// localStorage key
const STORAGE_KEY = 'meili-age-calculator-last-result';

function formatToISODate(date) {
  return date.toISOString().split('T')[0];
}

// 計算實際年齡與「人類歲數」
function calculateAges(targetDate) {
  const diffMs = targetDate - BIRTHDAY;
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  // 以年為基本單位
  const humanYears = diffDays / 365.25;

  // 整數年與月數（向下取整）
  const yearsFloor = Math.floor(humanYears);
  const months = Math.floor((humanYears - yearsFloor) * 12);

  // 對應人類歲數：簡單採用 1 : 7 比例
  const humanEquivalentYears = humanYears * 7;

  return {
    humanYears,
    humanYearsYears: yearsFloor,
    humanYearsMonths: months,
    humanEquivalentYears: humanEquivalentYears
  };
}

// 將結果渲染到畫面 & 存入 localStorage
function renderAndPersist(dateStr, ageInfo) {
  const resultEl = document.getElementById('result');

  const html = `
    <p>
      截至今日（<strong>${dateStr}</strong>），妙麗的實際年齡為
      <strong>${ageInfo.humanYearsYears}</strong> 歲
      <strong>${ageInfo.humanYearsMonths}</strong> 個月，
    </p>
    <p>
      換算下來，妙麗的「人類歲數」約為
      <strong>${ageInfo.humanEquivalentYears.toFixed(1)}</strong> 歲。
    </p>
  `;

  resultEl.innerHTML = html;

  // 儲存最後一次運算結果
  const payload = {
    date: dateStr,
    resultHtml: html
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (e) {
    console.warn('localStorage 寫入失敗：', e);
  }
}

// 共用的計算流程
function handleCalculation(dateStrOverride) {
  const dateInput = document.getElementById('calcDate');
  const resultEl = document.getElementById('result');

  const value = dateStrOverride || dateInput.value;

  if (!value) {
    resultEl.textContent = '請先選擇計算日期。';
    return;
  }

  const targetDate = new Date(value + 'T00:00:00');

  // 保護邏輯：不能早於妙麗生日
  if (targetDate < BIRTHDAY) {
    resultEl.textContent = '計算日期不能早於妙麗的生日（2023-02-28）。';
    return;
  }

  const ageInfo = calculateAges(targetDate);
  renderAndPersist(value, ageInfo);
}

document.addEventListener('DOMContentLoaded', () => {
  const dateInput = document.getElementById('calcDate');
  const resultEl = document.getElementById('result');
  const todayBtn = document.getElementById('todayBtn');

  // 設定計算日期的預設值與上限（今天）
  const today = new Date();
  const todayStr = formatToISODate(today);
  dateInput.max = todayStr;
  dateInput.value = todayStr;

  // 嘗試讀取上一次的運算結果
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      if (data.date) {
        dateInput.value = data.date;
      }
      if (data.resultHtml) {
        resultEl.innerHTML = data.resultHtml;
      }
    }
  } catch (e) {
    console.warn('localStorage 讀取失敗：', e);
  }

  // 「開始計算」按鈕
  document.getElementById('calcBtn').addEventListener('click', () => {
    handleCalculation();
  });

  // 「以今天為準」按鈕
  if (todayBtn) {
    todayBtn.addEventListener('click', () => {
      const now = new Date();
      const nowStr = formatToISODate(now);
      dateInput.value = nowStr;
      handleCalculation(nowStr);
    });
  }
});