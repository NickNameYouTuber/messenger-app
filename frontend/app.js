// app.js
const { fetchCityTime, fetchCityImage, addToSearchHistory } = require('./app-logic.js');

const elements = {
    cityInput: document.getElementById('city-input'),
    searchBtn: document.getElementById('search-btn'),
    resultCard: document.getElementById('result-card'),
    cityName: document.getElementById('city-name'),
    cityTime: document.getElementById('city-time'),
    updateTimestamp: document.getElementById('update-timestamp'),
    cityImage: document.getElementById('city-image'),
    noImage: document.getElementById('no-image'),
    loading: document.getElementById('loading'),
    errorMessage: document.getElementById('error-message'),
    historyList: document.getElementById('history-list')
};

let searchHistory = JSON.parse(localStorage.getItem('citySearchHistory')) || [];

function init() {
    renderSearchHistory();
    setupEventListeners();
}

function setupEventListeners() {
    elements.searchBtn.addEventListener('click', searchCity);
    elements.cityInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchCity();
    });
}

async function searchCity() {
    const city = elements.cityInput.value.trim();
    
    if (!city) {
        showError('Пожалуйста, введите название города');
        return;
    }

    showLoading(true);
    hideError();
    hideResults();

    try {
        const [timeData, imageData] = await Promise.all([
            fetchCityTime(city),
            fetchCityImage(city)
        ]);

        if (timeData) {
            displayResults(city, timeData, imageData);
            updateSearchHistory(city);
        } else {
            showError('Не удалось получить информацию о городе');
        }
    } catch (error) {
        console.error('Error fetching city data:', error);
        showError('Произошла ошибка при получении данных');
    } finally {
        showLoading(false);
    }
}

function displayResults(city, time, imageUrl) {
    elements.cityName.textContent = city;
    elements.cityTime.textContent = time;
    elements.updateTimestamp.textContent = new Date().toLocaleTimeString();
    
    if (imageUrl) {
        elements.cityImage.src = imageUrl;
        elements.cityImage.alt = `Фото города ${city}`;
        elements.cityImage.style.display = 'block';
        elements.noImage.style.display = 'none';
    } else {
        elements.cityImage.style.display = 'none';
        elements.noImage.style.display = 'block';
    }
    
    elements.resultCard.style.display = 'block';
}

function updateSearchHistory(city) {
    searchHistory = addToSearchHistory(city, searchHistory);
    localStorage.setItem('citySearchHistory', JSON.stringify(searchHistory));
    renderSearchHistory();
}

function renderSearchHistory() {
    elements.historyList.innerHTML = '';
    searchHistory.forEach(city => {
        const li = document.createElement('li');
        li.className = 'history-item';
        li.textContent = city;
        li.addEventListener('click', () => {
            elements.cityInput.value = city;
            searchCity();
        });
        elements.historyList.appendChild(li);
    });
}

function showLoading(show) {
    elements.loading.style.display = show ? 'block' : 'none';
}

function showError(message) {
    elements.errorMessage.textContent = message;
    elements.errorMessage.style.display = 'block';
}

function hideError() {
    elements.errorMessage.style.display = 'none';
}

function hideResults() {
    elements.resultCard.style.display = 'none';
}

document.addEventListener('DOMContentLoaded', init);