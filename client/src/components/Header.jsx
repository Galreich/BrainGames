import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SuggestionModal from './SuggestionModal';

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
    { path: '/hebrew-wordle', label: '🔤 וורדל עברית' },
    { path: '/english-wordle', label: '🔡 וורדל אנגלית' },
    { path: '/math', label: '🔢 הרפתקת המספרים' },
  ];

  const styles = {
    header: {
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      padding: '0',
      boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
    },
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '12px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '10px',
    },
    logo: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      textDecoration: 'none',
    },
    logoEmoji: {
      fontSize: '2rem',
      animation: 'bounce 2s infinite',
    },
    logoText: {
      color: '#fff',
      fontSize: '1.6rem',
      fontWeight: '900',
      background: 'linear-gradient(90deg, #f9ca24, #f0932b, #eb4d4b)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    },
    nav: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      flexWrap: 'wrap',
    },
    navLink: (isActive) => ({
      color: isActive ? '#f9ca24' : 'rgba(255,255,255,0.85)',
      textDecoration: 'none',
      padding: '8px 14px',
      borderRadius: '20px',
      fontWeight: '700',
      fontSize: '0.9rem',
      background: isActive ? 'rgba(249,202,36,0.2)' : 'transparent',
      border: isActive ? '2px solid rgba(249,202,36,0.4)' : '2px solid transparent',
      transition: 'all 0.2s',
      whiteSpace: 'nowrap',
    }),
    rightSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },
    starsTotal: {
      background: 'rgba(255,255,255,0.1)',
      borderRadius: '20px',
      padding: '6px 14px',
      color: '#f9ca24',
      fontWeight: '800',
      fontSize: '1rem',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
    },
    userInfo: {
      color: '#fff',
      fontWeight: '700',
      fontSize: '0.9rem',
      background: 'rgba(255,255,255,0.1)',
      borderRadius: '20px',
      padding: '6px 14px',
    },
    loginBtn: {
      background: 'linear-gradient(135deg, #f9ca24, #f0932b)',
      color: '#1a1a2e',
      border: 'none',
      borderRadius: '20px',
      padding: '8px 18px',
      fontWeight: '800',
      fontSize: '0.9rem',
      cursor: 'pointer',
      transition: 'all 0.2s',
    },
    logoutBtn: {
      background: 'rgba(255,255,255,0.15)',
      color: '#fff',
      border: '2px solid rgba(255,255,255,0.3)',
      borderRadius: '20px',
      padding: '7px 16px',
      fontWeight: '700',
      fontSize: '0.85rem',
      cursor: 'pointer',
      transition: 'all 0.2s',
    },
    suggestionBtn: {
      background: 'linear-gradient(135deg, #a29bfe, #6c5ce7)',
      color: '#fff',
      border: '2px solid rgba(255,255,255,0.3)',
      borderRadius: '20px',
      padding: '7px 16px',
      fontWeight: '700',
      fontSize: '0.85rem',
      cursor: 'pointer',
      transition: 'all 0.2s',
    },
    progressBar: {
      display: 'flex',
      gap: '8px',
      alignItems: 'center',
      padding: '6px 12px',
      background: 'rgba(255,255,255,0.08)',
      borderRadius: '12px',
    },
    progressItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '3px',
      fontSize: '0.75rem',
      color: '#fff',
    },
  };

  return (
    <>
    {showSuggestion && <SuggestionModal onClose={() => setShowSuggestion(false)} />}
    <header style={styles.header}>
      <div style={styles.container}>
        {/* Logo */}
        <Link to="/" style={styles.logo}>
          <span style={styles.logoEmoji}>🧠</span>
          <span style={styles.logoText}>BrainGames</span>
        </Link>

        {/* Navigation */}
        <nav style={styles.nav}>
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              style={styles.navLink(location.pathname === link.path)}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Section */}
        <div style={styles.rightSection}>
          {/* Stars Display */}
          {user && (
            <div style={styles.progressBar}>
              <div style={styles.progressItem}>
                <span style={{ color: '#ff6b6b' }}>⭐</span>
                <span style={{ color: '#ff6b6b', fontWeight: '800' }}>{user.red_stars || 0}</span>
              </div>
              <div style={styles.progressItem}>
                <span style={{ color: '#74b9ff' }}>⭐</span>
                <span style={{ color: '#74b9ff', fontWeight: '800' }}>{user.blue_stars || 0}</span>
              </div>
              <div style={styles.progressItem}>
                <span style={{ color: '#55efc4' }}>⭐</span>
                <span style={{ color: '#55efc4', fontWeight: '800' }}>{user.green_stars || 0}</span>
              </div>
            </div>
          )}

          {user ? (
            <>
              <span style={styles.userInfo}>👤 {user.username}</span>
              {user.isAdmin && (
                <Link to="/admin" style={styles.navLink(location.pathname === '/admin')}>
                  ⚙️ ניהול
                </Link>
              )}
              <button style={styles.suggestionBtn} onClick={() => setShowSuggestion(true)}>
                💡 הצע משחק
              </button>
              <button style={styles.logoutBtn} onClick={handleLogout}>
                יציאה
              </button>
            </>
          ) : (
            <button style={styles.loginBtn} onClick={() => navigate('/login')}>
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
