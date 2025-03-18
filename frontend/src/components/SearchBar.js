// src/components/SearchBar.js
import React, { useState } from 'react';

const SearchBar = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = () => {
    onSearch(searchTerm);
    setSearchTerm('');
  };

  return (
    <div style={{ padding: '10px' }}>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Поиск видео..."
        style={{ padding: '5px', width: '300px' }}
      />
      <button 
        onClick={handleSearch} 
        style={{ padding: '5px 10px', marginLeft: '10px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}
      >
        Поиск
      </button>
    </div>
  );
};

export default SearchBar;
