import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context';
import {
  SuggestionModal,
  StarsProgressBar,
  HeaderNav,
  HeaderUserActions,
} from '.';
import './HeaderStyle.css';
import { useTranslation } from 'react-i18next';
import { Emojis } from '../utils/Emojis';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { t } = useTranslation();

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    navigate('/');
  };

  const closeMenu = () => setMenuOpen(false);

  const navLinks = [
    { path: '/', label: `${Emojis.House} ${t('Home')}` },
    {
      path: '/hebrew-wordle',
      label: `${Emojis.LettersHE} ${t('Hebrew_Wordle')}`,
    },
    {
      path: '/english-wordle',
      label: `${Emojis.LettersEN} ${t('English_Wordle')}`,
    },
    { path: '/math', label: `${Emojis.Numbers} ${t('Math_Title')}` },
  ];

  return (
    <>
      {showSuggestion && (
        <SuggestionModal onClose={() => setShowSuggestion(false)} />
      )}
      <header className='app-header'>
        <div className='header-container'>
          {/* Logo + Stars */}
          <div className='header-left-section'>
            <Link to='/' className='header-logo' onClick={closeMenu}>
              <span className='logo-emoji'>{Emojis.Brain}</span>
              {!user && (
                <span className='logo-text'>{t('Braingames_Title')}</span>
              )}
            </Link>
            <StarsProgressBar user={user} />
          </div>

          {/* Mobile menu toggle */}
          <button
            className={`mobile-menu-toggle ${menuOpen ? 'open' : ''}`}
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={t('Menu')}
            aria-expanded={menuOpen}
          >
            <span />
            <span />
            <span />
          </button>

          <div
            className={`header-menu ${menuOpen ? 'open' : ''}`}
            onClick={closeMenu}
          >
            {/* Username */}
            {user && (
              <span className='user-info'>
                {Emojis.User} {user.username}
              </span>
            )}

            {/* Separator */}
            <div className='header-divider' />

            {/* Navigation */}
            <HeaderNav navLinks={navLinks} currentPath={location.pathname} />

            {/* Separator */}
            <div className='header-divider' />

            {/* Right actions */}
            <HeaderUserActions
              user={user}
              currentPath={location.pathname}
              onLogout={handleLogout}
              onShowSuggestion={() => setShowSuggestion(true)}
              onLoginClick={() => navigate('/login')}
            />
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
