// src/components/VideoPlayer.js
import React from 'react';

const VideoPlayer = ({ videoUrl }) => {
  return (
    <video controls style={{ width: '100%', maxHeight: '500px' }}>
      <source src={videoUrl} type="video/mp4" />
      Ваш браузер не поддерживает видео.
    </video>
  );
};

export default VideoPlayer;
