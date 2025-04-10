// filepath: src/pages/SignupPage.js

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../../styles/auth.css'; // Ensure this exists
import googleIcon from '../assets/icons/google.svg'; // Place the icon here

const SignupPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post('https://your-backend.up.railway.app/api/auth/register', formData);
      alert(res.data.message);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed');
    }
  };

  const handleGoogleSignup = () => {
    window.location.href = 'https://your-backend.up.railway.app/api/auth/google';
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Create Account</h2>
        <input type="text" name="username" placeholder="Username" onChange={handleChange} required />
        <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
        <input type="password" name="password" placeholder="Password" onChange={handleChange} required />

        {error && <p className="auth-error">{error}</p>}

        <button type="submit">Sign Up</button>

        <p>or</p>
        <button type="button" className="google-btn" onClick={handleGoogleSignup}>
          <img src={googleIcon} alt="Google Icon" />
          Sign up with Google
        </button>

        <p className="auth-footer">Already have an account? <a href="/login">Login</a></p>
      </form>
    </div>
  );
};

export default SignupPage;
