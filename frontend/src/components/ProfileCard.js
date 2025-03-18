import React from 'react';

const ProfileCard = ({ profile, logout, profilePhotoInputRef, handleUpdateProfilePhoto }) => (
  <div className="profile">
    {profile ? (
      <div className="profile-info">
        {profile.profile_photo ? (
          <img src={profile.profile_photo} alt="Profile" className="profile-photo" />
        ) : (
          <div className="profile-placeholder">?</div>
        )}
        <p>{profile.username}</p>
        <button onClick={() => profilePhotoInputRef.current.click()}>Change Avatar</button>
        <input
          type="file"
          style={{ display: 'none' }}
          ref={profilePhotoInputRef}
          onChange={handleUpdateProfilePhoto}
          accept="image/*"
        />
        <button onClick={logout}>Logout</button>
      </div>
    ) : (
      <p>Loading profile...</p>
    )}
  </div>
);

export default ProfileCard;
