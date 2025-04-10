// src/utils/auth.js

// 🔐 Store JWT token securely in localStorage
export function setToken(token) {
    localStorage.setItem('neko_jwt_token', token);
  }
  
  // 📦 Get token (used for authenticated API requests)
  export function getToken() {
    return localStorage.getItem('neko_jwt_token');
  }
  
  // ❌ Remove token from localStorage (logout)
  export function removeToken() {
    localStorage.removeItem('neko_jwt_token');
  }
  
  // ✅ Check if user is logged in
  export function isAuthenticated() {
    return !!getToken();
  }
  
  