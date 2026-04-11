import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context';
import './AdminPageStyle.css';

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

  if (!user || !user.isAdmin) return null;

  return (
    <div className="admin-page">
      <div className="admin-container">
        <h1 className="admin-title">⚙️ מסך ניהול</h1>
        <p className="admin-subtitle">הצעות משתמשים ({suggestions.length})</p>

        {loading && <p className="admin-loading">טוען...</p>}
        {error && <div className="admin-error-box">{error}</div>}

        {!loading && !error && suggestions.length === 0 && (
          <div className="admin-empty">אין הצעות עדיין</div>
        )}

        {!loading && !error && suggestions.length > 0 && (
          <table className="admin-table">
            <thead>
              <tr>
                <th className="admin-th">משתמש</th>
                <th className="admin-th">נושא</th>
                <th className="admin-th">כותרת</th>
                <th className="admin-th">תיאור</th>
                <th className="admin-th">תמונה</th>
                <th className="admin-th">תאריך</th>
              </tr>
            </thead>
            <tbody>
              {suggestions.map((s) => (
                <tr key={s.id} className="admin-tr">
                  <td className="admin-td">👤 {s.username}</td>
                  <td className="admin-td">
                    <span className={`admin-badge ${s.subject}`}>
                      {SUBJECT_LABELS[s.subject] || s.subject || '—'}
                    </span>
                  </td>
                  <td className="admin-td admin-fw-700">{s.title}</td>
                  <td className="admin-td admin-desc-col">{s.description}</td>
                  <td className="admin-td">
                    {s.image_data ? (
                      <a href={s.image_data} target="_blank" rel="noreferrer">
                        <img
                          src={s.image_data}
                          alt="תמונה"
                          className="admin-image-preview"
                        />
                      </a>
                    ) : (
                      <span className="admin-no-image">—</span>
                    )}
                  </td>
                  <td className="admin-td admin-date-col">
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
