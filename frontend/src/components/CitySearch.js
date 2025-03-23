import React, { useState, useEffect } from 'react';
import { fetchCityTime, fetchCityImage } from '../utils/api';

function CitySearch() {
  const [city, setCity] = useState('');
  const [currentCity, setCurrentCity] = useState(null);
  const [time, setTime] = useState(null);
  const [image, setImage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);

  // Load search history from localStorage on component mount
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('searchHistory');
      if (savedHistory) {
        setSearchHistory(JSON.parse(savedHistory));
      } else {
        setSearchHistory([]);
      }
    } catch (e) {
      console.error('Error loading search history from localStorage:', e);
      setSearchHistory([]);
    }
  }, []);

  // Save search history to localStorage when it changes
  useEffect(() => {
    if (searchHistory && searchHistory.length > 0) {
      localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
    }
  }, [searchHistory]);

  const handleSearch = async () => {
    if (!city.trim()) {
      setError('Пожалуйста, введите название города');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const cityTime = await fetchCityTime(city);
      const cityImage = await fetchCityImage(city);

      setTime(cityTime);
      setImage(cityImage);
      setCurrentCity(city);
      
      // Add to search history if not already exists
      if (!searchHistory.includes(city)) {
        setSearchHistory(prev => {
          const newHistory = [...prev, city];
          // Keep only the last 5 searches
          return newHistory.slice(-5);
        });
      }
    } catch (error) {
      setError(`Ошибка: ${error.message || 'Не удалось получить данные'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setCity(e.target.value);
  };

  const handleHistoryClick = (historyCity) => {
    setCity(historyCity);
    // Optionally auto-search when clicking on history item
    // Uncomment the next line if you want this behavior
    // setTimeout(() => handleSearch(), 0);
  };

  const handleClearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
  };

  return (
    <div className="container">
      <header>
        <h1>Время городов мира</h1>
        <p>Введите название города, чтобы узнать текущее время и увидеть фотографию</p>
      </header>

      <div className="search-container">
        <input 
          type="text" 
          value={city} 
          onChange={handleInputChange} 
          placeholder="Введите название города..." 
          aria-label="Название города"
        />
        <button onClick={handleSearch}>Поиск</button>
      </div>

      {loading && <div className="loading">Загрузка...</div>}
      
      {error && <div className="error">{error}</div>}
      
      {currentCity && time && !loading && (
        <div className="result">
          <h2>{currentCity}</h2>
          <p className="time">{time}</p>
          {image && <img src={image} alt={`Фото города ${currentCity}`} />}
        </div>
      )}

      <div className="history">
        <h2>История поиска</h2>
        <ul className="history-list">
          {searchHistory && searchHistory.length > 0 ? (
            searchHistory.map((historyCity, index) => (
              <li
                key={index}
                className="history-item"
                onClick={() => handleHistoryClick(historyCity)}
              >
                {historyCity}
              </li>
            ))
          ) : (
            <li className="empty-history">История поиска пуста</li>
          )}
        </ul>
        {searchHistory && searchHistory.length > 0 && (
          <button className="clear-history" onClick={handleClearHistory}>
            Очистить историю
          </button>
        )}
      </div>
    </div>
  );
}

export default CitySearch;