// src/utils/api.js
import axios from 'axios';
import { getToken } from './auth';

const api = axios.create({
  baseURL: 'https://your-backend.up.railway.app/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 🔐 Automatically attach JWT token
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
