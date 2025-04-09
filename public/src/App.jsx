// src/App.jsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import { getAuthToken } from './utils/auth';

const App = () => {
  const isAuthenticated = !!getAuthToken();

  return (
    <Router>
      <Routes>
        {/* 🔐 Protected Route for Dashboard */}
        <Route
          path="/dashboard"
          element={isAuthenticated ? <DashboardPage /> : <Navigate to="/login" replace />}
        />

        {/* 🔓 Public Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* 🔁 Fallback: redirect unknown routes to dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
