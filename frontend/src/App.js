import React from 'react';
import CitySearch from './components/CitySearch';
import './App.css';

function App() {
  return (
    <div className="container">
      <header>
        <h1>Время городов мира</h1>
        <p>Введите название города, чтобы узнать текущее время и увидеть фотографию</p>
      </header>
      <CitySearch />
    </div>
  );
}

export default App;