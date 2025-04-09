// src/components/NavigationBar.js

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuthToken, logout } from '../utils/auth';
import './styles/dashboard.css';

const NavigationBar = ({ user }) => {
  const navigate = useNavigate();
  const isLoggedIn = !!getAuthToken();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="chat-nav">
      <a href="/index.html">🏠 Home</a>
      <a href="/dashboard.html">📊 Dashboard</a>
      <a href="/weatherMap.html">📖 Weather Map</a>
      <a href="/business.html">🏗️ Industry</a>
      <a href="/weatherAdvisor.html">🌤️ Advisor</a>

      <span className="nav-right">
        {isLoggedIn && user ? (
          <>
            <span className="user-name">👤 {user.displayName}</span>
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <button className="login-btn" onClick={() => navigate('/login')}>Login</button>
        )}
      </span>
    </nav>
  );
};

export default NavigationBar;
