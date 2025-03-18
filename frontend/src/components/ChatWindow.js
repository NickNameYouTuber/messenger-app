import React from 'react';
import Message from './Message';

const ChatWindow = ({
  messages = [], // Default to empty array
  userId,
  newMessage,
  setNewMessage,
  sendMessage,
  fileInputRef,
  handleImageChange,
  attachedImages,
  removeAttachedImage,
  replyMessage,
  setReplyMessage
}) => (
  <div className="chat-window">
    {replyMessage && (
      <div className="reply-preview">
        <p>Replying to: {replyMessage.content || (replyMessage.image_urls?.length > 0 && 'Image')}</p>
        <button onClick={() => setReplyMessage(null)}>Cancel</button>
      </div>
    )}
    <div className="messages">
      {Array.isArray(messages) && messages.length > 0 ? (
        messages.map((msg, index) => (
          <Message key={msg.id || index} msg={msg} userId={userId} setReplyMessage={setReplyMessage} />
        ))
      ) : (
        <p>No messages yet</p>
      )}
    </div>
    <div className="message-input-area">
      {attachedImages.length > 0 && (
        <div className="attached-images">
          {attachedImages.map((img, index) => (
            <div key={index} className="attached-image-preview">
              <img src={img} alt="Attached" />
              <button onClick={() => removeAttachedImage(index)}>Remove</button>
            </div>
          ))}
        </div>
      )}
      <input
        value={newMessage}
        onChange={e => setNewMessage(e.target.value)}
        onKeyPress={e => e.key === 'Enter' && sendMessage()}
        placeholder="Type a message..."
      />
      <button onClick={sendMessage}>Send</button>
      <button onClick={() => fileInputRef.current.click()}>Attach Image</button>
      <input
        type="file"
        style={{ display: 'none' }}
        ref={fileInputRef}
        onChange={handleImageChange}
        accept="image/*"
        multiple
      />
    </div>
  </div>
);

export default ChatWindow;
