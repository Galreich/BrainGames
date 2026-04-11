import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Emojis } from '../utils/Emojis';

type HeaderUserActionsProps = {
  user: { username: string; is_admin: boolean } | null;
  currentPath: string;
  onLogout: () => void;
  onShowSuggestion: () => void;
  onLoginClick: () => void;
};

const HeaderUserActions = ({
  user,
  currentPath,
  onLogout,
  onShowSuggestion,
  onLoginClick,
}: HeaderUserActionsProps) => {
  const { t } = useTranslation();

  if (!user) {
    return (
      <div className='right-section'>
        <button className='login-btn' onClick={onLoginClick}>
          {t('Login')}
        </button>
      </div>
    );
  }

  return (
    <div className='right-section'>
      <span className='user-info'>
        {Emojis.User} {user.username}
      </span>
      {user.is_admin && (
        <Link
          to='/admin'
          className={`nav-link ${currentPath === '/admin' ? 'active' : ''}`}
        >
          {Emojis.Gear} {t('Admin')}
        </Link>
      )}
      <button className='suggestion-btn' onClick={onShowSuggestion}>
        {Emojis.Bulb} {t('Suggest_a_Game')}
      </button>
      <button className='logout-btn' onClick={onLogout}>
        {t('Logout')}
      </button>
    </div>
  );
};

export default HeaderUserActions;
