// src/components/VideoStats.js
import React from 'react';

const VideoStats = ({ video }) => {
  return (
    <div style={{ border: '1px solid #ddd', padding: '10px', marginBottom: '10px' }}>
      <h3>{video.title}</h3>
      <p>Просмотры: {video.views}</p>
      <p>Лайки: {video.likes}</p>
      <p>Дизлайки: {video.dislikes}</p>
    </div>
  );
};

export default VideoStats;
