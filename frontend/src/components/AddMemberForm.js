import React from 'react';

const AddMemberForm = ({ selectedChat, newMemberUsername, setNewMemberUsername, handleAddMember }) => (
  selectedChat && (
    <div className="add-member">
      <input
        type="text"
        placeholder="Username to add"
        value={newMemberUsername}
        onChange={e => setNewMemberUsername(e.target.value)}
      />
      <button onClick={handleAddMember}>Add Member</button>
    </div>
  )
);

export default AddMemberForm;
