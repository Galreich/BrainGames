import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context';
import './LoginStyle.css';
import { useTranslation } from 'react-i18next';
import { Emojis } from '../utils/Emojis';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register, user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // If already logged in, redirect
  React.useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!username.trim() || !password.trim()) {
      setError(t('Please_fill_username_and_password'));
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        await login(username.trim(), password);
        setSuccess(t('Login_success_redirect'));
        setTimeout(() => navigate('/'), 1000);
      } else {
        if (password.length < 6) {
          setError(t('Password_min_length'));
          setLoading(false);
          return;
        }
        const regexStr = `[a-zA-Z${t('Hebrew_Letters_Regex')}]`;
        const regex = new RegExp(regexStr);
        if (!regex.test(password) || !/[0-9]/.test(password)) {
          setError(t('Password_requirements'));
          setLoading(false);
          return;
        }
        await register(username.trim(), password);
        setSuccess(t('Register_success_redirect'));
        setTimeout(() => navigate('/'), 1000);
      }
    } catch (err) {
      const errorKey =
        err.message === 'Failed to fetch'
          ? 'Network_error'
          : err.message || 'Error_try_again';
      setError(t(errorKey));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='login-page'>
      <div className='login-card'>
        {/* Logo */}
        <div className='login-logo-area'>
          <span className='login-emoji'>{Emojis.Brain}</span>
          <div className='login-title'>{t('Braingames_Title')}</div>
          <div className='login-sub'>
            {isLogin ? t('Login_to_your_account') : t('Create_a_new_account')}
          </div>
        </div>

        {/* Tabs */}
        <div className='login-tabs'>
          <button
            className={`login-tab ${isLogin ? 'active' : ''}`}
            onClick={() => {
              setIsLogin(true);
              setError('');
              setSuccess('');
            }}
          >
            {t('Login_Tab')}
          </button>
          <button
            className={`login-tab ${!isLogin ? 'active' : ''}`}
            onClick={() => {
              setIsLogin(false);
              setError('');
              setSuccess('');
            }}
          >
            {t('Register_Tab')}
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {error && (
            <div className='login-error'>
              {Emojis.Warning} {error}
            </div>
          )}
          {success && (
            <div className='login-success'>
              {Emojis.Check} {success}
            </div>
          )}

          <div className='login-form-group'>
            <label className='login-label' htmlFor='username'>
              {Emojis.User} {t('Username')}
            </label>
            <input
              id='username'
              type='text'
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={t('Enter_username')}
              className={`login-input ${!!error && !username ? 'error' : ''}`}
              autoComplete='username'
              maxLength={50}
              disabled={loading}
            />
          </div>

          <div className='login-form-group'>
            <label className='login-label' htmlFor='password'>
              {Emojis.Lock} {t('Password')}
            </label>
            <input
              id='password'
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isLogin ? t('Enter_password') : t('Choose_password')}
              className={`login-input ${!!error && !password ? 'error' : ''}`}
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              disabled={loading}
            />
          </div>

          <button
            type='submit'
            className={`login-submit-btn ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            {loading
              ? `${Emojis.Hourglass} ${t('Please_wait')}`
              : isLogin
                ? `${Emojis.Unlock} ${t('Login_Button')}`
                : `${Emojis.Rocket} ${t('Register_Button')}`}
          </button>

          <button
            type='button'
            className='login-guest-btn'
            onClick={() => navigate('/')}
          >
            {t('Continue_without_login')}
          </button>
        </form>
      </div>

      {/* Tips */}
      <div className='login-tips'>
        <div className='login-tips-title'>
          {Emojis.Bulb} {t('Why_register')}
        </div>
        <div className='login-tips-text'>
          {Emojis.Check} {t('Save_your_progress')}
          <br />
          {Emojis.Check} {t('Track_your_stars')}
          <br />
          {Emojis.Check} {t('Continue_where_you_left_off')}
        </div>
      </div>
    </div>
  );
};

export default Login;
