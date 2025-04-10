// src/components/Dashboard.jsx

import React, { useEffect, useState } from 'react';
import NavigationBar from './NavigationBar';
import UserProfile from './UserProfile';
import FavoritesPanel from './FavoritesPanel';
import CurrentLocationWidget from './CurrentLocationWidget';
import './styles/dashboard.css'; // Ensure styles are applied

const Dashboard = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // ✅ Optionally fetch user from backend if not already passed
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setUser(storedUser);
    } else {
      // Fallback dummy user if needed
      setUser({ displayName: 'User' });
    }
  }, []);

  return (
    <div className="dashboard-container">
      {/* 🔹 Top Navigation Bar */}
      <NavigationBar user={user} />

      {/* 🔲 Main Grid Layout */}
      <div className="dashboard-grid">
        {/* 👤 Profile Card */}
        <UserProfile />

        {/* 📍 Current Location Weather */}
        <CurrentLocationWidget />

        {/* ⭐ Favorite Cities */}
        <FavoritesPanel />
      </div>
    </div>
  );
};

export default Dashboard;
