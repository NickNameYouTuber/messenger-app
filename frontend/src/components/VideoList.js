// src/components/VideoList.js
import React from 'react';
import VideoItem from './VideoItem';

const VideoList = ({ videos, title }) => {
  return (
    <div style={{ padding: '10px' }}>
      <h2>{title}</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
        {videos.map((video) => (
          <VideoItem key={video.id} video={video} />
        ))}
      </div>
    </div>
  );
};

export default VideoList;
