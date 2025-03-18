// src/App.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BrowserRouter as Router, Route, Routes, useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import Header from './components/Header';
import AuthPage from './pages/AuthPage';
import MessengerPage from './pages/MessengerPage';
import YouTubePage from './pages/YouTubePage';
import VideoPage from './components/VideoPage';
import ProfilePage from './components/ProfilePage';
import './App.css';

let socket;

function AppContent() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [userId, setUserId] = useState(() => localStorage.getItem('userId') ? Number(localStorage.getItem('userId')) : null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [profile, setProfile] = useState(null);
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [attachedImages, setAttachedImages] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [error, setError] = useState('');
  const [newChatName, setNewChatName] = useState('');
  const [newMemberUsername, setNewMemberUsername] = useState('');
  const [replyMessage, setReplyMessage] = useState(null);
  const fileInputRef = useRef(null);
  const profilePhotoInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (token && userId && !socket) {
      socket = io('/', {
        withCredentials: true,
        transports: ['websocket'],
        query: { user_id: userId }
      });

      socket.on('connect', () => console.log('Connected to socket'));
      socket.on('connect_error', (err) => console.log('Socket connection error:', err));
    }

    return () => {
      if (socket) {
        socket.disconnect();
        socket = null;
      }
    };
  }, [token, userId]);

  const fetchProfile = useCallback(async () => {
    try {
      const response = await fetch('/api/profile', {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      if (!response.ok) throw new Error(await response.text() || 'Failed to fetch profile');
      const data = await response.json();
      setProfile(data);
    } catch (err) {
      setError(err.message);
    }
  }, [token]);

  const fetchChats = useCallback(async () => {
    try {
      const response = await fetch('/api/chats', {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      if (!response.ok) throw new Error(await response.text() || 'Failed to fetch chats');
      const data = await response.json();
      setChats(data);
    } catch (err) {
      setError(err.message);
    }
  }, [token]);

  const fetchMessages = useCallback(async () => {
    if (!selectedChat) return;
    try {
      const response = await fetch(`/api/chats/${selectedChat}/messages`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error(await response.text() || 'Failed to fetch messages');
      const data = await response.json();
      setMessages(data.messages);
      scrollToBottom();
    } catch (err) {
      setError(err.message);
    }
  }, [selectedChat, token]);

  const handleAddMember = async () => {
    if (!selectedChat || !newMemberUsername) return;
    try {
      const response = await fetch(`/api/chats/${selectedChat}/add_member`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        credentials: 'include',
        body: JSON.stringify({ username: newMemberUsername })
      });
      if (!response.ok) throw new Error(await response.text() || 'Failed to add member');
      await response.json();
      setNewMemberUsername('');
      fetchChats();
    } catch (err) {
      setError(err.message);
    }
  };

  const resizeImage = (file, maxWidth, maxHeight, callback) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        callback(canvas.toDataURL('image/jpeg'));
      };
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateProfilePhoto = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    resizeImage(file, 500, 500, async (resizedImage) => {
      try {
        const response = await fetch('/api/profile/update_photo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          credentials: 'include',
          body: JSON.stringify({ profile_photo: resizedImage })
        });
        if (!response.ok) throw new Error(await response.text() || 'Failed to update profile photo');
        fetchProfile();
      } catch (err) {
        setError(err.message);
      }
    });
  };

  useEffect(() => {
    if (token && userId) {
      fetchProfile();
      fetchChats();
    }
  }, [token, userId, fetchProfile, fetchChats]);

  useEffect(() => {
    if (selectedChat && socket) {
      socket.emit('join_chat', { chat_id: selectedChat, user_id: userId });
      fetchMessages();

      const newMessageHandler = (message) => {
        setMessages(prev => [...prev, message]);
        scrollToBottom();
      };

      const errorHandler = (data) => {
        setError(data.message);
      };

      socket.on('new_message', newMessageHandler);
      socket.on('error', errorHandler);

      return () => {
        socket.off('new_message', newMessageHandler);
        socket.off('error', errorHandler);
      };
    }
  }, [selectedChat, fetchMessages]);

  const register = async () => {
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, profile_photo: '' }),
        credentials: 'include'
      });
      if (!response.ok) {
        const errorText = await response.text();
        if (errorText.includes('UNIQUE constraint failed: user.username')) {
          throw new Error('Username is already taken. Please choose a different one.');
        }
        throw new Error(errorText || 'Registration failed');
      }
      setUsername('');
      setPassword('');
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  const login = async () => {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        credentials: 'include'
      });
      if (!response.ok) throw new Error(await response.text() || 'Login failed');
      const data = await response.json();
      setToken(data.token);
      setUserId(data.user_id);
      localStorage.setItem('token', data.token);
      localStorage.setItem('userId', data.user_id.toString());
      setUsername('');
      setPassword('');
      fetchChats();
      fetchProfile();
      navigate('/chat');
    } catch (err) {
      setError(err.message);
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/logout', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        credentials: 'include'
      });
    } catch (err) {
      console.error(err);
    }
    
    setToken(null);
    setUserId(null);
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    setProfile(null);
    setChats([]);
    setMessages([]);
    setSelectedChat(null);
    setAttachedImages([]);
    if (socket) {
      socket.disconnect();
      socket = null;
    }
    navigate('/auth');
  };

  const createChat = async () => {
    if (!newChatName) return;
    try {
      const response = await fetch('/api/chats', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newChatName }),
        credentials: 'include'
      });
      if (!response.ok) throw new Error(await response.text() || 'Failed to create chat');
      const data = await response.json();
      setChats(prevChats => [...prevChats, data]);
      setNewChatName('');
    } catch (err) {
      setError(err.message);
    }
  };

  const sendMessage = () => {
    if ((!newMessage && attachedImages.length === 0) || !selectedChat || !socket) return;

    const messageData = {
      content: newMessage || '',
      image_urls: attachedImages,
      user_id: userId,
      chat_id: selectedChat,
      reply_to_id: replyMessage ? replyMessage.id : null
    };

    socket.emit('send_message', messageData);
    setNewMessage('');
    setAttachedImages([]);
    setReplyMessage(null);
  };

  const handleImageChange = (event) => {
    const files = event.target.files;
    if (!files.length || !selectedChat) return;

    Array.from(files).forEach(file => {
      resizeImage(file, 300, 300, (resizedImage) => {
        setAttachedImages(prev => [...prev, resizedImage]);
      });
    });
  };

  const removeAttachedImage = (index) => {
    setAttachedImages(prev => prev.filter((_, i) => i !== index));
  };

  const generateChatLink = (chatId) => {
    return `${window.location.origin}/join/${chatId}`;
  };

  const JoinChatPage = () => {
    const { chatId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
      if (!token) {
        navigate('/auth', { state: { redirectTo: `/join/${chatId}` } });
        return;
      }

      const joinChat = async () => {
        try {
          const response = await fetch(`/api/chats/${chatId}/join`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            credentials: 'include'
          });
          if (!response.ok) throw new Error(await response.text() || 'Failed to join chat');
          await fetchChats();
          setSelectedChat(chatId);
          navigate('/chat');
        } catch (err) {
          setError(err.message);
          navigate('/chat');
        }
      };

      joinChat();
    }, [chatId, token, navigate]);

    return <div>Joining chat...</div>;
  };

  return (
    <>
      <Header />
      <div style={{ marginTop: '60px' }}>
        <Routes>
          <Route
            path="/auth"
            element={
              <AuthPage
                username={username}
                password={password}
                setUsername={setUsername}
                setPassword={setPassword}
                login={login}
                register={register}
                error={error}
              />
            }
          />
          <Route
            path="/chat"
            element={
              token ? (
                <MessengerPage
                  profile={profile}
                  logout={logout}
                  profilePhotoInputRef={profilePhotoInputRef}
                  handleUpdateProfilePhoto={handleUpdateProfilePhoto}
                  chats={chats}
                  selectedChat={selectedChat}
                  setSelectedChat={setSelectedChat}
                  setReplyMessage={setReplyMessage}
                  setAttachedImages={setAttachedImages}
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
                  newChatName={newChatName}
                  setNewChatName={setNewChatName}
                  createChat={createChat}
                  newMemberUsername={newMemberUsername}
                  setNewMemberUsername={setNewMemberUsername}
                  handleAddMember={handleAddMember}
                  error={error}
                  generateChatLink={generateChatLink}
                  messagesEndRef={messagesEndRef}
                />
              ) : (
                <AuthPage
                  username={username}
                  password={password}
                  setUsername={setUsername}
                  setPassword={setPassword}
                  login={login}
                  register={register}
                  error={error}
                />
              )
            }
          />
          <Route path="/youtube" element={<YouTubePage token={token} profile={profile} />} />
          <Route path="/video/:videoId" element={<VideoPage token={token} />} />
          <Route path="/profile" element={<ProfilePage userVideos={[]} token={token} />} />
          <Route path="/join/:chatId" element={<JoinChatPage />} />
          <Route path="*" element={<AuthPage
            username={username}
            password={password}
            setUsername={setUsername}
            setPassword={setPassword}
            login={login}
            register={register}
            error={error}
          />} />
        </Routes>
      </div>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
