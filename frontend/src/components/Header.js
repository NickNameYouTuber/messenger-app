// src/components/Header.js
import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      padding: '10px', 
      background: '#333', 
      color: 'white', 
      position: 'fixed', 
      top: 0, 
      width: '100%', 
      zIndex: 1000 
    }}>
      <div>
        <Link to="/chat" style={{ color: 'white', textDecoration: 'none', marginRight: '20px' }}>Мессенджер</Link>
        <Link to="/youtube" style={{ color: 'white', textDecoration: 'none', marginRight: '20px' }}>Ютуб</Link>
        <Link to="/profile" style={{ color: 'white', textDecoration: 'none', marginRight: '20px' }}>Профиль</Link>
        <Link to="/future" style={{ color: 'white', textDecoration: 'none' }}>Другое</Link>
      </div>
    </header>
  );
};

export default Header;
