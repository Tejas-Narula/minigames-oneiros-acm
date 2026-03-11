import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminLogin.css';
import acmLogo from './assets/acm_logo.png';

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123'; // Loaded from .env

function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (password === ADMIN_PASSWORD) {
      // Store admin session in localStorage
      localStorage.setItem('adminSession', 'true');
      localStorage.setItem('adminLoginTime', Date.now().toString());
      navigate('/admin/dashboard');
    } else {
      setError('Incorrect admin password');
      setPassword('');
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <img src={acmLogo} alt="ACM Logo" className="admin-login-logo" />
        <h1>Admin Portal</h1>
        <p>DEV RELAY Administration</p>

        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="password-input-wrapper">
            <span className="password-icon">🔐</span>
            <input
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="password-input"
              autoFocus
            />
          </div>

          {error && <p className="error-message">{error}</p>}

          <button type="submit" className="admin-login-btn">
            Access Dashboard
          </button>
        </form>

        <div className="admin-login-footer">
          <a href="/" className="back-link">
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;