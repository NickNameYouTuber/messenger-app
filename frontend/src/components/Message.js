import React from 'react';

const Message = ({ msg, userId, setReplyMessage }) => (
  <div className={`message ${msg.user_id === userId ? 'own' : ''}`}>
    <div className="message-header">
      {msg.user_profile ? (
        <img src={msg.user_profile} alt="User" className="message-user-photo" />
      ) : (
        <div className="message-user-placeholder">?</div>
      )}
      <span className="message-author">
        {msg.user_id === userId ? 'You' : msg.username}
      </span>
      <button className="reply-btn" onClick={() => setReplyMessage(msg)}>Reply</button>
    </div>
    {msg.reply_to && (
      <div className="reply-block">
        <small>Replying to: {msg.reply_to.content || (msg.reply_to.image_urls?.length > 0 && 'Image')} ({msg.reply_to.username})</small>
      </div>
    )}
    {msg.image_urls?.length > 0 && (
      <div className="message-image">
        {msg.image_urls.map((url, idx) => (
          <img key={idx} src={url} alt="Sent" />
        ))}
      </div>
    )}
    {msg.content && <span className="message-text">{msg.content}</span>}
    <small className="message-time">{new Date(msg.created_at).toLocaleTimeString()}</small>
  </div>
);

export default Message;
