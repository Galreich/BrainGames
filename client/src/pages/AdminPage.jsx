import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SUBJECT_LABELS = {
  math: '🔢 מתמטיקה',
  hebrew: '🔤 עברית',
  english: '🔡 אנגלית',
  other: '💡 אחר',
};

const AdminPage = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user || !user.isAdmin) {
      navigate('/');
      return;
    }
    const fetchSuggestions = async () => {
      try {
        const res = await fetch('/api/admin/suggestions', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('שגיאה בטעינת ההצעות');
        const data = await res.json();
        setSuggestions(data.suggestions);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSuggestions();
  }, [user, token, navigate]);

  const styles = {
    page: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      padding: '40px 20px',
      color: '#fff',
      direction: 'rtl',
    },
    title: {
      fontSize: '2rem',
      fontWeight: '900',
      marginBottom: '8px',
      background: 'linear-gradient(90deg, #f9ca24, #f0932b)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    },
    subtitle: {
      color: 'rgba(255,255,255,0.6)',
      marginBottom: '32px',
      fontSize: '0.95rem',
    },
    table: {
      width: '100%',
      maxWidth: '1000px',
      margin: '0 auto',
      borderCollapse: 'separate',
      borderSpacing: '0 8px',
    },
    th: {
      background: 'rgba(255,255,255,0.08)',
      padding: '12px 16px',
      textAlign: 'right',
      fontSize: '0.9rem',
      color: 'rgba(255,255,255,0.8)',
    },
    tr: {
      background: 'rgba(255,255,255,0.05)',
    },
    td: {
      padding: '14px 16px',
      fontSize: '0.9rem',
      verticalAlign: 'top',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
    },
    badge: (subject) => ({
      display: 'inline-block',
      padding: '3px 10px',
      borderRadius: '12px',
      fontSize: '0.8rem',
      fontWeight: '700',
      background: subject === 'math' ? 'rgba(249,202,36,0.2)'
        : subject === 'hebrew' ? 'rgba(116,185,255,0.2)'
        : subject === 'english' ? 'rgba(85,239,196,0.2)'
        : 'rgba(162,155,254,0.2)',
      color: subject === 'math' ? '#f9ca24'
        : subject === 'hebrew' ? '#74b9ff'
        : subject === 'english' ? '#55efc4'
        : '#a29bfe',
    }),
    empty: {
      textAlign: 'center',
      padding: '60px',
      color: 'rgba(255,255,255,0.4)',
      fontSize: '1.1rem',
    },
    errorBox: {
      color: '#ff7675',
      background: 'rgba(255,118,117,0.1)',
      border: '1px solid rgba(255,118,117,0.3)',
      borderRadius: '12px',
      padding: '20px',
      textAlign: 'center',
    },
  };

  const container = {
    maxWidth: '1100px',
    margin: '0 auto',
  };

  if (!user || !user.isAdmin) return null;

  return (
    <div style={styles.page}>
      <div style={container}>
        <h1 style={styles.title}>⚙️ מסך ניהול</h1>
        <p style={styles.subtitle}>הצעות משתמשים ({suggestions.length})</p>

        {loading && <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>טוען...</p>}
        {error && <div style={styles.errorBox}>{error}</div>}

        {!loading && !error && suggestions.length === 0 && (
          <div style={styles.empty}>אין הצעות עדיין</div>
        )}

        {!loading && !error && suggestions.length > 0 && (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>משתמש</th>
                <th style={styles.th}>נושא</th>
                <th style={styles.th}>כותרת</th>
                <th style={styles.th}>תיאור</th>
                <th style={styles.th}>תמונה</th>
                <th style={styles.th}>תאריך</th>
              </tr>
            </thead>
            <tbody>
              {suggestions.map((s) => (
                <tr key={s.id} style={styles.tr}>
                  <td style={styles.td}>👤 {s.username}</td>
                  <td style={styles.td}>
                    <span style={styles.badge(s.subject)}>
                      {SUBJECT_LABELS[s.subject] || s.subject || '—'}
                    </span>
                  </td>
                  <td style={{ ...styles.td, fontWeight: '700' }}>{s.title}</td>
                  <td style={{ ...styles.td, color: 'rgba(255,255,255,0.75)', maxWidth: '300px' }}>{s.description}</td>
                  <td style={styles.td}>
                    {s.image_data ? (
                      <a href={s.image_data} target="_blank" rel="noreferrer">
                        <img
                          src={s.image_data}
                          alt="תמונה"
                          style={{ maxHeight: '80px', maxWidth: '120px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer' }}
                        />
                      </a>
                    ) : (
                      <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.8rem' }}>—</span>
                    )}
                  </td>
                  <td style={{ ...styles.td, color: 'rgba(255,255,255,0.5)', whiteSpace: 'nowrap', fontSize: '0.8rem' }}>
                    {new Date(s.created_at).toLocaleDateString('he-IL', {
                      year: 'numeric', month: 'short', day: 'numeric',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
