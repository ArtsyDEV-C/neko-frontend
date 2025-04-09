// filepath: src/components/UserProfile.js

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getToken } from '../utils/auth';
import './UserProfile.css'; // Optional: style the profile panel

const UserProfile = () => {
  const [profile, setProfile] = useState({
    username: '',
    email: '',
    avatar: ''
  });

  const [newAvatar, setNewAvatar] = useState(null);
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '' });
  const [message, setMessage] = useState('');

  const token = getToken();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get('https://your-backend.up.railway.app/api/user/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(res.data);
    } catch (err) {
      console.error('Failed to load profile:', err.message);
    }
  };

  const handleNameChange = (e) => {
    setProfile({ ...profile, username: e.target.value });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setNewAvatar(reader.result); // base64 string
      reader.readAsDataURL(file);
    }
  };

  const saveProfile = async () => {
    try {
      const res = await axios.put('https://your-backend.up.railway.app/api/user/profile', {
        username: profile.username,
        avatar: newAvatar || profile.avatar
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('✅ Profile updated!');
      fetchProfile();
    } catch (err) {
      setMessage('❌ Failed to update profile');
    }
  };

  const handlePasswordChange = async () => {
    try {
      await axios.put('https://your-backend.up.railway.app/api/user/change-password', passwordData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('✅ Password changed');
      setPasswordData({ currentPassword: '', newPassword: '' });
    } catch (err) {
      setMessage('❌ Failed to change password');
    }
  };

  return (
    <div className="user-profile">
      <h2>👤 User Profile</h2>

      <div className="profile-section">
        <label>Display Picture:</label>
        <input type="file" accept="image/*" onChange={handleAvatarChange} />
        <div className="avatar-preview">
          <img src={newAvatar || profile.avatar || '/assets/icons/default-avatar.png'} alt="Avatar" />
        </div>
      </div>

      <div className="profile-section">
        <label>Display Name:</label>
        <input type="text" value={profile.username} onChange={handleNameChange} />
      </div>

      <div className="profile-section">
        <label>Email (read-only):</label>
        <input type="email" value={profile.email} disabled />
      </div>

      <button onClick={saveProfile}>💾 Save Profile</button>

      <hr />

      <div className="profile-section">
        <label>Change Password:</label>
        <input
          type="password"
          placeholder="Current Password"
          value={passwordData.currentPassword}
          onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
        />
        <input
          type="password"
          placeholder="New Password"
          value={passwordData.newPassword}
          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
        />
        <button onClick={handlePasswordChange}>🔑 Change Password</button>
      </div>

      {message && <p className="status-msg">{message}</p>}
    </div>
  );
};

export default UserProfile;
