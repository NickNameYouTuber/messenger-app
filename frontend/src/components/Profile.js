// src/components/Profile.js
import React from 'react';

const Profile = ({ user }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '10px' }}>
      {user.profile_photo ? (
        <img 
          src={user.profile_photo} 
          alt="Profile" 
          style={{ width: '40px', height: '40px', borderRadius: '50%' }} 
        />
      ) : (
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#ddd', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {user.username[0]}
        </div>
      )}
      <span style={{ marginLeft: '10px' }}>{user.username}</span>
    </div>
  );
};

export default Profile;
