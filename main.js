// DOM Elements
const amountInput = document.getElementById('amount');
const firstOption = document.getElementById('firstCurrencyOption');
const secondOption = document.getElementById('secondCurrencyOption');
const resultInput = document.getElementById('result');
const currentRateSpan = document.getElementById('currentRate');
const lastUpdateSpan = document.getElementById('lastUpdate');
const addFavoriteBtn = document.getElementById('addFavorite');
const swapCurrenciesBtn = document.getElementById('swapCurrencies');
const autoUpdateCheckbox = document.getElementById('autoUpdate');
const clearHistoryBtn = document.getElementById('clearHistory');
const tabButtons = document.querySelectorAll('.tab-button');
const tabPanes = document.querySelectorAll('.tab-pane');

// State management
let updateInterval;
const FAVORITES_KEY = 'currency_favorites';
const HISTORY_KEY = 'conversion_history';
let favorites = JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]');
let conversionHistory = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');

// Initialize the application
function init() {
    setupEventListeners();
    updateExchangeRate();
    loadFavorites();
    loadHistory();
    setupTabs();
}

// Event listeners setup
function setupEventListeners() {
    amountInput.addEventListener('input', calculateResult);
    firstOption.addEventListener('change', handleCurrencyChange);
    secondOption.addEventListener('change', handleCurrencyChange);
    addFavoriteBtn.addEventListener('click', addToFavorites);
    swapCurrenciesBtn.addEventListener('click', swapCurrencies);
    autoUpdateCheckbox.addEventListener('change', toggleAutoUpdate);
    clearHistoryBtn.addEventListener('click', clearHistory);

    tabButtons.forEach(button => {
        button.addEventListener('click', () => switchTab(button.dataset.tab));
    });
}

// Update exchange rate and display
async function updateExchangeRate() {
    try {
        const fromCurrency = firstOption.value;
        const toCurrency = secondOption.value;
        const rate = await getExchangeRate(fromCurrency, toCurrency);
        
        if (rate === null) {
            currentRateSpan.innerHTML = `<span style="color: #dc3545;">Kur bilgisi alınamadı!</span>`;
            return;
        }
        
        currentRateSpan.innerHTML = `Anlık Kur: <strong>1 ${fromCurrency} = ${rate.toFixed(4)} ${toCurrency}</strong>`;
        lastUpdateSpan.textContent = `Son Güncelleme: ${new Date().toLocaleTimeString()}`;
        
        calculateResult();
    } catch (error) {
        console.error('Kur güncelleme hatası:', error);
        currentRateSpan.innerHTML = `<span style="color: #dc3545;">Kur bilgisi alınamadı!</span>`;
    }
}

// Calculate and display result
function calculateResult() {
    const amount = parseFloat(amountInput.value);
    if (!amount) {
        resultInput.value = '';
        return;
    }

    getExchangeRate(firstOption.value, secondOption.value).then(rate => {
        if (rate === null) {
            resultInput.value = 'Hata!';
            return;
        }
        const result = amount * rate;
        resultInput.value = result.toFixed(2);
        addToHistory(amount, firstOption.value, secondOption.value, result);
    }).catch(error => {
        console.error('Hesaplama hatası:', error);
        resultInput.value = 'Hata!';
    });
}

// Handle currency change
function handleCurrencyChange() {
    updateExchangeRate();
}

// Swap currencies
function swapCurrencies() {
    const temp = firstOption.value;
    firstOption.value = secondOption.value;
    secondOption.value = temp;
    updateExchangeRate();
}

// Toggle auto update
function toggleAutoUpdate(event) {
    if (event.target.checked) {
        updateInterval = setInterval(updateExchangeRate, 60000);
    } else {
        clearInterval(updateInterval);
    }
}

// Favorites management
function addToFavorites() {
    const pair = {
        from: firstOption.value,
        to: secondOption.value
    };

    if (!favorites.some(f => f.from === pair.from && f.to === pair.to)) {
        favorites.push(pair);
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
        loadFavorites();
    }
}

function loadFavorites() {
    const favoritesList = document.getElementById('favoritesList');
    favoritesList.innerHTML = '';

    favorites.forEach((pair, index) => {
        const div = document.createElement('div');
        div.className = 'favorite-item';
        div.innerHTML = `
            <span>${pair.from} → ${pair.to}</span>
            <button onclick="loadFavoritePair(${index})">Yükle</button>
            <button onclick="removeFavorite(${index})">Sil</button>
        `;
        favoritesList.appendChild(div);
    });
}

function loadFavoritePair(index) {
    const pair = favorites[index];
    firstOption.value = pair.from;
    secondOption.value = pair.to;
    updateExchangeRate();
}

function removeFavorite(index) {
    favorites.splice(index, 1);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    loadFavorites();
}

// History management
function addToHistory(amount, from, to, result) {
    const conversion = {
        timestamp: new Date().toISOString(),
        amount,
        from,
        to,
        result
    };

    conversionHistory.unshift(conversion);
    if (conversionHistory.length > 10) conversionHistory.pop();
    
    localStorage.setItem(HISTORY_KEY, JSON.stringify(conversionHistory));
    loadHistory();
}

function loadHistory() {
    const historyList = document.getElementById('conversionHistory');
    historyList.innerHTML = '';

    conversionHistory.forEach(conversion => {
        const div = document.createElement('div');
        div.className = 'history-item';
        div.innerHTML = `
            <span>${new Date(conversion.timestamp).toLocaleString()}</span>
            <span>${conversion.amount} ${conversion.from} = ${conversion.result.toFixed(2)} ${conversion.to}</span>
        `;
        historyList.appendChild(div);
    });
}

function clearHistory() {
    conversionHistory = [];
    localStorage.setItem(HISTORY_KEY, JSON.stringify(conversionHistory));
    loadHistory();
}

// Tab management
function setupTabs() {
    tabButtons.forEach(button => {
        button.addEventListener('click', () => switchTab(button.dataset.tab));
    });
}

function switchTab(tabId) {
    tabButtons.forEach(button => {
        button.classList.toggle('active', button.dataset.tab === tabId);
    });

    tabPanes.forEach(pane => {
        pane.classList.toggle('active', pane.id === `${tabId}Tab`);
    });
}

// Initialize the app
init();