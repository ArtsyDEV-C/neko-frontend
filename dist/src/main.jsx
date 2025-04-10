// src/main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// ✅ Import global styles (optional but recommended)
import './styles/dashboard.css';
// import './styles/global.css'; // Add if you have a general stylesheet

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
