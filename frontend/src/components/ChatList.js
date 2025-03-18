import React from 'react';

const ChatList = ({ chats, selectedChat, setSelectedChat, setReplyMessage, setAttachedImages, generateChatLink }) => (
  <div className="chat-list">
    {chats.map(chat => (
      <div
        key={chat.id}
        className={`chat-item ${selectedChat === chat.id ? 'active' : ''}`}
      >
        <div
          className="chat-name"
          onClick={() => {
            setSelectedChat(chat.id);
            setReplyMessage(null);
            setAttachedImages([]);
          }}
        >
          {chat.name}
        </div>
        <button
          className="share-btn"
          onClick={() => {
            const link = generateChatLink(chat.id);
            navigator.clipboard.writeText(link);
            alert(`Link copied to clipboard: ${link}`);
          }}
        >
          Share
        </button>
      </div>
    ))}
  </div>
);

export default ChatList;
