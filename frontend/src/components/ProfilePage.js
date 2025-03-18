import React, { useState, useEffect } from 'react';
import VideoUploadForm from './VideoUploadForm';
import VideoStats from './VideoStats';

const ProfilePage = ({ token }) => {
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [userVideos, setUserVideos] = useState([]);

  useEffect(() => {
    const fetchUserVideos = async () => {
      try {
        const response = await fetch('/api/videos/my_videos', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Не удалось загрузить видео');
        const data = await response.json();
        setUserVideos(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUserVideos();
  }, [token]);

  return (
    <div style={{ padding: '20px', marginTop: '60px' }}>
      <h1>Мой профиль</h1>
      <button 
        onClick={() => setShowUploadForm(!showUploadForm)} 
        style={{ padding: '10px 20px', marginBottom: '20px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}
      >
        {showUploadForm ? 'Скрыть форму загрузки' : 'Загрузить видео'}
      </button>
      {showUploadForm && <VideoUploadForm token={token} />}
      <h2>Мои видео</h2>
      {userVideos.map((video) => (
        <VideoStats key={video.id} video={video} />
      ))}
    </div>
  );
};

export default ProfilePage;
