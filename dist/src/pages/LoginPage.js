// src/pages/LoginPage.js

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { setToken } from '../utils/auth';
import googleIcon from '../assets/icons/google.svg';
import '../styles/auth.css'; // ✅ Correct path to auth.css

const LoginPage = () => {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('https://your-backend.up.railway.app/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (res.ok && data.token) {
        setToken(data.token);
        navigate('/dashboard'); // ✅ redirect to dashboard on success
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Server error. Please try again later.');
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = 'https://your-backend.up.railway.app/api/auth/google';
  };

  return (
    <div className="auth-container">
      <h2>🔐 Login</h2>
      {error && <p className="error">{error}</p>}

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />
        <button type="submit">Login</button>
      </form>

      <hr className="divider" />

      <button onClick={handleGoogleLogin} className="google-login">
        <img src={googleIcon} alt="Google Icon" />
        Login with Google
      </button>
    </div>
  );
};

export default LoginPage;
