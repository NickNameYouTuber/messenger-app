import React from 'react';

const NewChatForm = ({ newChatName, setNewChatName, createChat }) => (
  <div className="new-chat">
    <input
      type="text"
      placeholder="New chat name"
      value={newChatName}
      onChange={e => setNewChatName(e.target.value)}
    />
    <button onClick={createChat}>Create Chat</button>
  </div>
);

export default NewChatForm;
