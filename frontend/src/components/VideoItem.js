// src/components/VideoItem.js
import React from 'react';
import { Link } from 'react-router-dom';

const VideoItem = ({ video }) => {
  return (
    <div style={{ width: '200px', border: '1px solid #ddd', borderRadius: '5px', overflow: 'hidden' }}>
      <Link to={`/video/${video.id}`}>
        <img 
          src={video.thumbnail} 
          alt={video.title} 
          style={{ width: '100%', height: '120px', objectFit: 'cover' }} 
        />
      </Link>
      <div style={{ padding: '10px' }}>
        <Link to={`/video/${video.id}`} style={{ textDecoration: 'none', color: 'black' }}>
          <h3 style={{ fontSize: '14px', margin: '0' }}>{video.title}</h3>
        </Link>
        <p style={{ fontSize: '12px', color: '#666' }}>{video.channel}</p>
      </div>
    </div>
  );
};

export default VideoItem;
