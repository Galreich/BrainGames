import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context';
import './LoginStyle.css';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register, user } = useAuth();
  const navigate = useNavigate();

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
      setError('נא למלא שם משתמש וסיסמה');
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        await login(username.trim(), password);
        setSuccess('התחברת בהצלחה! מעביר אותך...');
        setTimeout(() => navigate('/'), 1000);
      } else {
        if (password.length < 6) {
          setError('סיסמה חייבת להיות לפחות 6 תווים');
          setLoading(false);
          return;
        }
        if (!/[a-zA-Zא-ת]/.test(password) || !/[0-9]/.test(password)) {
          setError('סיסמה חייבת להכיל לפחות אות אחת ומספר אחד');
          setLoading(false);
          return;
        }
        await register(username.trim(), password);
        setSuccess('נרשמת בהצלחה! מעביר אותך...');
        setTimeout(() => navigate('/'), 1000);
      }
    } catch (err) {
      setError(err.message || 'אירעה שגיאה, נסה שוב');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Logo */}
        <div className="login-logo-area">
          <span className="login-emoji">🧠</span>
          <div className="login-title">BrainGames</div>
          <div className="login-sub">
            {isLogin ? 'התחבר לחשבון שלך' : 'צור חשבון חדש'}
          </div>
        </div>

        {/* Tabs */}
        <div className="login-tabs">
          <button className={`login-tab ${isLogin ? 'active' : ''}`} onClick={() => { setIsLogin(true); setError(''); setSuccess(''); }}>
            התחברות
          </button>
          <button className={`login-tab ${!isLogin ? 'active' : ''}`} onClick={() => { setIsLogin(false); setError(''); setSuccess(''); }}>
            הרשמה
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {error && <div className="login-error">⚠️ {error}</div>}
          {success && <div className="login-success">✅ {success}</div>}

          <div className="login-form-group">
            <label className="login-label" htmlFor="username">
              👤 שם משתמש
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="הכנס שם משתמש..."
              className={`login-input ${!!error && !username ? 'error' : ''}`}
              autoComplete="username"
              maxLength={50}
              disabled={loading}
            />
          </div>

          <div className="login-form-group">
            <label className="login-label" htmlFor="password">
              🔐 סיסמה
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isLogin ? 'הכנס סיסמה...' : 'בחר סיסמה (לפחות 6 תווים, אות + מספר)...'}
              className={`login-input ${!!error && !password ? 'error' : ''}`}
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              disabled={loading}
            />
          </div>

          <button type="submit" className={`login-submit-btn ${loading ? 'loading' : ''}`} disabled={loading}>
            {loading ? '⏳ אנא המתן...' : isLogin ? '🔓 התחבר' : '🚀 הרשם'}
          </button>

          <button
            type="button"
            className="login-guest-btn"
            onClick={() => navigate('/')}
          >
            המשך ללא התחברות →
          </button>
        </form>

        {/* Tips */}
        <div className="login-tips">
          <div className="login-tips-title">💡 למה להירשם?</div>
          <div className="login-tips-text">
            ✅ שמור את ההתקדמות שלך<br />
            ✅ עקוב אחר הכוכבים שאספת<br />
            ✅ המשך ממקום שעצרת
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
