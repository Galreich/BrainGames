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
  const { t } = useTranslation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

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
            <Link to='/' className='header-logo'>
              <span className='logo-emoji'>{Emojis.Brain}</span>
              {!user && (
                <span className='logo-text'>{t('Braingames_Title')}</span>
              )}
            </Link>
            <StarsProgressBar user={user} />
          </div>

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
      </header>
    </>
  );
};

export default Header;
