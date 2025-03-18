// src/pages/YouTubePage.js
import React, { useState, useEffect } from 'react';
import SearchBar from '../components/SearchBar';
import Profile from '../components/Profile';
import VideoList from '../components/VideoList';

const YouTubePage = ({ token, profile }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [beginners, setBeginners] = useState([]);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const recResponse = await fetch('/api/videos/recommendations', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const subResponse = await fetch('/api/videos/subscriptions', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const begResponse = await fetch('/api/videos/beginners', {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!recResponse.ok || !subResponse.ok || !begResponse.ok) throw new Error('Failed to fetch videos');
        
        const recData = await recResponse.json();
        const subData = await subResponse.json();
        const begData = await begResponse.json();

        setRecommendations(recData);
        setSubscriptions(subData);
        setBeginners(begData);
      } catch (err) {
        console.error(err);
      }
    };
    if (token) fetchVideos();
  }, [token]);

  const handleSearch = (searchTerm) => {
    console.log('Поиск:', searchTerm);
    // Здесь можно добавить логику поиска через API
  };

  return (
    <div style={{ marginTop: '60px' }}>
      <SearchBar onSearch={handleSearch} />
      {profile && <Profile user={profile} />}
      <VideoList videos={recommendations} title="Рекомендации" />
      <VideoList videos={subscriptions} title="Подписки" />
      <VideoList videos={beginners} title="Начинающие блогеры" />
    </div>
  );
};

export default YouTubePage;
