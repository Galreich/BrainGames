import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context';
import { SuggestionModal } from '.';
import './HeaderStyle.css';
import { useTranslation } from 'react-i18next';
import { Emojis } from '../utils/Emojis';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showSuggestion, setShowSuggestion] = useState(false);
  const { t } = useTranslation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { path: '/', label: `${Emojis.House} ${t('Home')}` },
    { path: '/hebrew-wordle', label: `${Emojis.LettersHE} ${t('Hebrew_Wordle')}` },
    { path: '/english-wordle', label: `${Emojis.LettersEN} ${t('English_Wordle')}` },
    { path: '/math', label: `${Emojis.Numbers} ${t('Math_Adventure')}` },
  ];

  return (
    <>
    {showSuggestion && <SuggestionModal onClose={() => setShowSuggestion(false)} />}
    <header className="app-header">
      <div className="header-container">
        {/* Logo + Stars */}
        <div className="header-left-section">
          <Link to="/" className="header-logo">
            <span className="logo-emoji">{Emojis.Brain}</span>
            {!user && <span className="logo-text">{t('Braingames_Title')}</span>}
          </Link>
          {user && (
            <div className="stars-progress-bar">
              <div className="progress-item">
                <span>{Emojis.Star}</span>
                <span className="red-star">{user.red_stars || 0}</span>
              </div>
              <div className="progress-item">
                <span>{Emojis.Star}</span>
                <span className="blue-star">{user.blue_stars || 0}</span>
              </div>
              <div className="progress-item">
                <span>{Emojis.Star}</span>
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
              <span className="user-info">{Emojis.User} {user.username}</span>
              {user.isAdmin && (
                <Link to="/admin" className={`nav-link ${location.pathname === '/admin' ? 'active' : ''}`}>
                  {Emojis.Gear} {t('Admin')}
                </Link>
              )}
              <button className="suggestion-btn" onClick={() => setShowSuggestion(true)}>
                {Emojis.Bulb} {t('Suggest_a_Game')}
              </button>
              <button className="logout-btn" onClick={handleLogout}>
                {t('Logout')}
              </button>
            </>
          ) : (
            <button className="login-btn" onClick={() => navigate('/login')}>
              {t('Login')}
            </button>
          )}
        </div>
      </div>
    </header>
    </>
  );
};

export default Header;
