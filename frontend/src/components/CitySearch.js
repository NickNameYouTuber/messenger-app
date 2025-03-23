import React, { useState, useEffect } from 'react';
import { fetchCityTime, fetchCityImage, addToSearchHistory } from '../utils/api';

function CitySearch() {
  const [city, setCity] = useState('');
  const [searchHistory, setSearchHistory] = useState(
    JSON.parse(localStorage.getItem('citySearchHistory')) || []
  );
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    localStorage.setItem('citySearchHistory', JSON.stringify(searchHistory));
  }, [searchHistory]);

  const handleSearch = async () => {
    if (!city.trim()) {
      setError('Пожалуйста, введите название города');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const [timeData, imageData] = await Promise.all([
        fetchCityTime(city),
        fetchCityImage(city)
      ]);

      if (timeData) {
        setResult({
          city,
          time: timeData,
          imageUrl: imageData,
          timestamp: new Date().toLocaleTimeString()
        });
        setSearchHistory(prev => addToSearchHistory(city, prev));
      } else {
        setError('Не удалось получить информацию о городе');
      }
    } catch (err) {
      setError('Произошла ошибка при получении данных');
      console.error('Error fetching city data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleHistoryClick = (historyCity) => {
    setCity(historyCity);
    handleSearch();
  };

  return (
    <>
      <div className="search-container">
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Введите название города..."
          aria-label="Название города"
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button onClick={handleSearch}>Поиск</button>
      </div>

      {loading && <div className="loading">Загрузка данных...</div>}
      {error && <div className="error-message">{error}</div>}

      {result && (
        <div className="result-card">
          <div className="city-info">
            <div className="time-info">
              <h2 className="city-name">{result.city}</h2>
              <div className="city-time">{result.time}</div>
              <div id="updated-time">Обновлено: <span>{result.timestamp}</span></div>
            </div>
            <div className="image-container">
              {result.imageUrl ? (
                <img
                  src={result.imageUrl}
                  alt={`Фото города ${result.city}`}
                  className="city-image"
                />
              ) : (
                <p className="no-image">Фотография города не найдена</p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="history">
        <h2>История поиска</h2>
        <ul className="history-list">
          {searchHistory.map((historyCity, index) => (
            <li
              key={index}
              className="history-item"
              onClick={() => handleHistoryClick(historyCity)}
            >
              {historyCity}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

export default CitySearch;