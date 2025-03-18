import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import VideoPlayer from './VideoPlayer';
import Comments from './Comments';

const VideoPage = ({ token }) => {
  const { videoId } = useParams();
  const [video, setVideo] = useState(null);

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const response = await fetch(`/api/videos/${videoId}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Не удалось загрузить видео');
        const data = await response.json();
        setVideo(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchVideo();
  }, [videoId, token]);

  if (!video) return <div style={{ marginTop: '60px' }}>Загрузка...</div>;

  return (
    <div style={{ padding: '20px', marginTop: '60px' }}>
      <VideoPlayer videoUrl={video.url} />
      <h1>{video.title}</h1>
      {/* остальной код */}
    </div>
  );
};

export default VideoPage;
