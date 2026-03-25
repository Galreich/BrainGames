import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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
        if (password.length < 4) {
          setError('סיסמה חייבת להיות לפחות 4 תווים');
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

  const styles = {
    page: {
      minHeight: 'calc(100vh - 70px)',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    },
    card: {
      background: 'rgba(255,255,255,0.98)',
      borderRadius: '28px',
      padding: '48px 44px',
      width: '100%',
      maxWidth: '420px',
      boxShadow: '0 25px 60px rgba(0,0,0,0.25)',
      direction: 'rtl',
      animation: 'fadeIn 0.5s ease',
    },
    logoArea: {
      textAlign: 'center',
      marginBottom: '32px',
    },
    logoEmoji: {
      fontSize: '3.5rem',
      display: 'block',
      marginBottom: '8px',
    },
    logoTitle: {
      color: '#333',
      fontSize: '1.8rem',
      fontWeight: '900',
      marginBottom: '4px',
    },
    logoSub: {
      color: '#888',
      fontSize: '1rem',
    },
    tabs: {
      display: 'flex',
      background: '#f0f0f0',
      borderRadius: '16px',
      padding: '4px',
      marginBottom: '28px',
    },
    tab: (active) => ({
      flex: 1,
      padding: '12px',
      border: 'none',
      borderRadius: '12px',
      background: active ? '#fff' : 'transparent',
      color: active ? '#764ba2' : '#888',
      fontSize: '1rem',
      cursor: 'pointer',
      boxShadow: active ? '0 2px 10px rgba(0,0,0,0.1)' : 'none',
      transition: 'all 0.2s',
    }),
    formGroup: {
      marginBottom: '20px',
    },
    label: {
      display: 'block',
      color: '#555',
      fontWeight: '700',
      fontSize: '0.95rem',
      marginBottom: '8px',
    },
    input: (hasError) => ({
      width: '100%',
      padding: '14px 16px',
      border: `2px solid ${hasError ? '#e74c3c' : '#e0e0e0'}`,
      borderRadius: '14px',
      fontSize: '0.75rem',
      outline: 'none',
      transition: 'border-color 0.2s',
      direction: 'rtl',
      background: '#fafafa',
      fontFamily: 'inherit',
    }),
    error: {
      background: '#ffe8e8',
      border: '1px solid #ffaaaa',
      borderRadius: '12px',
      padding: '12px 16px',
      color: '#e74c3c',
      fontWeight: '700',
      fontSize: '0.95rem',
      marginBottom: '16px',
      textAlign: 'center',
    },
    success: {
      background: '#e8ffe8',
      border: '1px solid #aaffaa',
      borderRadius: '12px',
      padding: '12px 16px',
      color: '#27ae60',
      fontWeight: '700',
      fontSize: '0.95rem',
      marginBottom: '16px',
      textAlign: 'center',
    },
    submitBtn: {
      width: '100%',
      padding: '16px',
      background: 'linear-gradient(135deg, #667eea, #764ba2)',
      color: '#fff',
      border: 'none',
      borderRadius: '14px',
      fontSize: '1.1rem',
      cursor: loading ? 'not-allowed' : 'pointer',
      opacity: loading ? 0.7 : 1,
      boxShadow: '0 6px 20px rgba(102,126,234,0.4)',
      transition: 'all 0.2s',
      marginTop: '8px',
    },
    guestBtn: {
      width: '100%',
      padding: '14px',
      background: 'transparent',
      color: '#888',
      border: '2px solid #e0e0e0',
      borderRadius: '14px',
      fontSize: '1rem',
      fontWeight: '700',
      cursor: 'pointer',
      marginTop: '12px',
      transition: 'all 0.2s',
    },
    tips: {
      marginTop: '28px',
      padding: '16px',
      background: '#f8f4ff',
      borderRadius: '16px',
      border: '1px solid #e8d8ff',
    },
    tipsTitle: {
      color: '#764ba2',
      fontSize: '0.9rem',
      marginBottom: '8px',
    },
    tipsText: {
      color: '#888',
      fontSize: '0.85rem',
      lineHeight: '1.6',
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Logo */}
        <div style={styles.logoArea}>
          <span style={styles.logoEmoji}>🧠</span>
          <div style={styles.logoTitle}>BrainGames</div>
          <div style={styles.logoSub}>
            {isLogin ? 'התחבר לחשבון שלך' : 'צור חשבון חדש'}
          </div>
        </div>

        {/* Tabs */}
        <div style={styles.tabs}>
          <button style={styles.tab(isLogin)} onClick={() => { setIsLogin(true); setError(''); setSuccess(''); }}>
            התחברות
          </button>
          <button style={styles.tab(!isLogin)} onClick={() => { setIsLogin(false); setError(''); setSuccess(''); }}>
            הרשמה
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {error && <div style={styles.error}>⚠️ {error}</div>}
          {success && <div style={styles.success}>✅ {success}</div>}

          <div style={styles.formGroup}>
            <label style={styles.label} htmlFor="username">
              👤 שם משתמש
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="הכנס שם משתמש..."
              style={styles.input(!!error && !username)}
              autoComplete="username"
              maxLength={50}
              disabled={loading}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label} htmlFor="password">
              🔐 סיסמה
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isLogin ? 'הכנס סיסמה...' : 'בחר סיסמה (לפחות 4 תווים)...'}
              style={styles.input(!!error && !password)}
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              disabled={loading}
            />
          </div>

          <button type="submit" style={styles.submitBtn} disabled={loading}>
            {loading ? '⏳ אנא המתן...' : isLogin ? '🔓 התחבר' : '🚀 הרשם'}
          </button>

          <button
            type="button"
            style={styles.guestBtn}
            onClick={() => navigate('/')}
          >
            המשך ללא התחברות →
          </button>
        </form>

        {/* Tips */}
        <div style={styles.tips}>
          <div style={styles.tipsTitle}>💡 למה להירשם?</div>
          <div style={styles.tipsText}>
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
