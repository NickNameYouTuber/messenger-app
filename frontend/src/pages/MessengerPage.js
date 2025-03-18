import React, { useState, useEffect } from 'react';
import ProfileCard from '../components/ProfileCard';
import ChatList from '../components/ChatList';
import ChatWindow from '../components/ChatWindow';
import NewChatForm from '../components/NewChatForm';
import AddMemberForm from '../components/AddMemberForm';

const MessengerPage = ({
  profile,
  logout,
  profilePhotoInputRef,
  handleUpdateProfilePhoto,
  chats,
  selectedChat,
  setSelectedChat,
  setReplyMessage,
  setAttachedImages,
  messages,
  userId,
  newMessage,
  setNewMessage,
  sendMessage,
  fileInputRef,
  handleImageChange,
  attachedImages,
  removeAttachedImage,
  replyMessage,
  newChatName,
  setNewChatName,
  createChat,
  newMemberUsername,
  setNewMemberUsername,
  handleAddMember,
  error,
  generateChatLink
}) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showSidebar, setShowSidebar] = useState(true);
  
  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setShowSidebar(true);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Handle chat selection on mobile
  useEffect(() => {
    if (isMobile && selectedChat) {
      setShowSidebar(false);
    }
  }, [selectedChat, isMobile]);

  // Get current chat name
  const getCurrentChatName = () => {
    if (!selectedChat) return '';
    const chat = chats.find(c => c.id === selectedChat);
    return chat ? chat.name : '';
  };
  
  // Handle back button click
  const handleBackToChats = () => {
    setShowSidebar(true);
  };
  
  return (
    <div className="messenger">
      <div className={`sidebar ${isMobile && !showSidebar ? 'sidebar-hidden' : ''}`}>
        <ProfileCard
          profile={profile}
          logout={logout}
          profilePhotoInputRef={profilePhotoInputRef}
          handleUpdateProfilePhoto={handleUpdateProfilePhoto}
        />
        <h3>Chats</h3>
        <ChatList
          chats={chats}
          selectedChat={selectedChat}
          setSelectedChat={setSelectedChat}
          setReplyMessage={setReplyMessage}
          setAttachedImages={setAttachedImages}
          generateChatLink={generateChatLink}
        />
        <NewChatForm
          newChatName={newChatName}
          setNewChatName={setNewChatName}
          createChat={createChat}
        />
        <AddMemberForm
          selectedChat={selectedChat}
          newMemberUsername={newMemberUsername}
          setNewMemberUsername={setNewMemberUsername}
          handleAddMember={handleAddMember}
        />
      </div>
      
      <div className={`chat-area ${isMobile && showSidebar ? 'chat-area-hidden' : ''}`}>
        {selectedChat ? (
          <>
            {isMobile && (
              <div className="chat-header">
                <button className="back-to-chats" onClick={handleBackToChats}>
                  <span>←</span> Back to Chats
                </button>
                <h3>{getCurrentChatName()}</h3>
              </div>
            )}
            <ChatWindow
              messages={messages}
              userId={userId}
              newMessage={newMessage}
              setNewMessage={setNewMessage}
              sendMessage={sendMessage}
              fileInputRef={fileInputRef}
              handleImageChange={handleImageChange}
              attachedImages={attachedImages}
              removeAttachedImage={removeAttachedImage}
              replyMessage={replyMessage}
              setReplyMessage={setReplyMessage}
            />
          </>
        ) : (
          <div className="no-chat">Select a chat</div>
        )}
        {error && <div className="error">{error}</div>}
      </div>
    </div>
  );
};

export default MessengerPage;
