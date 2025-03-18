// src/components/Comments.js
import React, { useState } from 'react';

const Comments = ({ comments, token, videoId }) => {
  const [newComment, setNewComment] = useState('');

  const handleAddComment = async () => {
    try {
      const response = await fetch(`/api/videos/${videoId}/comments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: newComment }),
      });
      if (!response.ok) throw new Error('Failed to add comment');
      const comment = await response.json();
      setComments((prev) => [...prev, comment]);
      setNewComment('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ marginTop: '20px' }}>
      <h2>Комментарии</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {comments.map((comment, index) => (
          <div key={index} style={{ borderBottom: '1px solid #ddd', padding: '10px' }}>
            <p>{comment.text}</p>
            <span style={{ fontSize: '12px', color: '#666' }}>{comment.author}</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: '20px' }}>
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Оставьте комментарий..."
          style={{ width: '100%', padding: '10px', height: '60px' }}
        />
        <button 
          onClick={handleAddComment} 
          style={{ padding: '10px 20px', marginTop: '10px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}
        >
          Отправить
        </button>
      </div>
    </div>
  );
};

export default Comments;
