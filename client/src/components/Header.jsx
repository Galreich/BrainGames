import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context';
import { SuggestionModal } from '.';
import './HeaderStyle.css';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showSuggestion, setShowSuggestion] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { path: '/', label: '🏠 בית' },
    { path: '/hebrew-wordle', label: '🔤 וורדעל עברית' },
    { path: '/english-wordle', label: '🔡 וורדעל אנגלית' },
    { path: '/math', label: '🔢 הרפתקת המספרים' },
  ];

  return (
    <>
    {showSuggestion && <SuggestionModal onClose={() => setShowSuggestion(false)} />}
    <header className="app-header">
      <div className="header-container">
        {/* Logo + Stars */}
        <div className="header-left-section">
          <Link to="/" className="header-logo">
            <span className="logo-emoji">🧠</span>
            {!user && <span className="logo-text">BrainGames</span>}
          </Link>
          {user && (
            <div className="stars-progress-bar">
              <div className="progress-item">
                <span>⭐</span>
                <span className="red-star">{user.red_stars || 0}</span>
              </div>
              <div className="progress-item">
                <span>⭐</span>
                <span className="blue-star">{user.blue_stars || 0}</span>
              </div>
              <div className="progress-item">
                <span>⭐</span>
                <span className="green-star">{user.green_stars || 0}</span>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="header-nav">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="header-divider" />

        {/* Right Section */}
        <div className="right-section">
          {user ? (
            <>
              <span className="user-info">👤 {user.username}</span>
              {user.isAdmin && (
                <Link to="/admin" className={`nav-link ${location.pathname === '/admin' ? 'active' : ''}`}>
                  ⚙️ ניהול
                </Link>
              )}
              <button className="suggestion-btn" onClick={() => setShowSuggestion(true)}>
                💡 הצע משחק
              </button>
              <button className="logout-btn" onClick={handleLogout}>
                יציאה
              </button>
            </>
          ) : (
            <button className="login-btn" onClick={() => navigate('/login')}>
              התחברות
            </button>
          )}
        </div>
      </div>
    </header>
    </>
  );
};

export default Header;
