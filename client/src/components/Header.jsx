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
      background: 'linear-gradient(90deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
      padding: '0',
      boxShadow: '0 2px 24px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.05) inset',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      borderBottom: '1px solid rgba(255,255,255,0.08)',
    },
    container: {
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '0 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'nowrap',
      height: '56px',
    },
    logo: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      textDecoration: 'none',
      flexShrink: 0,
    },
    logoEmoji: {
      fontSize: '1.7rem',
    },
    logoText: {
      color: '#fff',
      fontSize: '1.35rem',
      fontWeight: '900',
      letterSpacing: '-0.5px',
      background: 'linear-gradient(135deg, #f7971e, #ffd200)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    },
    nav: {
      display: 'flex',
      alignItems: 'center',
      gap: '2px',
      flexWrap: 'nowrap',
    },
    navLink: (isActive) => ({
      color: isActive ? '#ffd200' : 'rgba(255,255,255,0.7)',
      textDecoration: 'none',
      padding: '6px 14px',
      borderRadius: '8px',
      fontWeight: '700',
      fontSize: '0.9rem',
      background: isActive ? 'rgba(255,210,0,0.12)' : 'transparent',
      borderBottom: isActive ? '2px solid #ffd200' : '2px solid transparent',
      transition: 'all 0.2s',
      whiteSpace: 'nowrap',
    }),
    rightSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      flexShrink: 0,
    },
    userInfo: {
      color: 'rgba(255,255,255,0.9)',
      fontWeight: '600',
      fontSize: '0.82rem',
      whiteSpace: 'nowrap',
    },
    loginBtn: {
      background: 'linear-gradient(135deg, #ffd200, #f7971e)',
      color: '#1a1a2e',
      border: '1px solid rgba(255,255,255,0.2)',
      borderRadius: '8px',
      padding: '6px 14px',
      fontWeight: '600',
      fontSize: '0.8rem',
      cursor: 'pointer',
      transition: 'all 0.2s',
      boxShadow: '0 2px 8px rgba(255,210,0,0.3)',
    },
    logoutBtn: {
      background: 'transparent',
      color: 'rgba(255,255,255,0.7)',
      border: '1px solid rgba(255,255,255,0.2)',
      borderRadius: '8px',
      padding: '6px 14px',
      fontWeight: '600',
      fontSize: '0.8rem',
      cursor: 'pointer',
      transition: 'all 0.2s',
    },
    suggestionBtn: {
      background: 'linear-gradient(135deg, #a29bfe, #6c5ce7)',
      color: '#fff',
      border: 'none',
      borderRadius: '8px',
      padding: '6px 14px',
      fontWeight: '700',
      fontSize: '0.8rem',
      cursor: 'pointer',
      transition: 'all 0.2s',
      boxShadow: '0 2px 8px rgba(108,92,231,0.3)',
    },
    divider: {
      width: '1px',
      height: '24px',
      background: 'rgba(255,255,255,0.15)',
      flexShrink: 0,
    },
    progressBar: {
      display: 'flex',
      gap: '10px',
      alignItems: 'center',
      padding: '4px 10px',
      background: 'rgba(255,255,255,0.06)',
      borderRadius: '8px',
      border: '1px solid rgba(255,255,255,0.08)',
    },
    progressItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '3px',
      fontSize: '0.78rem',
      color: '#fff',
    },
  };

  return (
    <>
    {showSuggestion && <SuggestionModal onClose={() => setShowSuggestion(false)} />}
    <header style={styles.header}>
      <div style={styles.container}>
        {/* Logo + Stars */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
          <Link to="/" style={styles.logo}>
            <span style={styles.logoEmoji}>🧠</span>
            {!user && <span style={styles.logoText}>BrainGames</span>}
          </Link>
          {user && (
            <div style={styles.progressBar}>
              <div style={styles.progressItem}>
                <span>🔴</span>
                <span style={{ color: '#ff6b6b', fontWeight: '700' }}>{user.red_stars || 0}</span>
              </div>
              <div style={styles.progressItem}>
                <span>🔵</span>
                <span style={{ color: '#74b9ff', fontWeight: '700' }}>{user.blue_stars || 0}</span>
              </div>
              <div style={styles.progressItem}>
                <span>🟢</span>
                <span style={{ color: '#55efc4', fontWeight: '700' }}>{user.green_stars || 0}</span>
              </div>
            </div>
          )}
        </div>

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

        <div style={styles.divider} />

        {/* Right Section */}
        <div style={styles.rightSection}>
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
