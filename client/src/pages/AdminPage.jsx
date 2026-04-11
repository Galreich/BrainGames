import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context';
import './AdminPageStyle.css';
import { useTranslation } from 'react-i18next';
import { Emojis } from '../utils/Emojis';

const AdminPage = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const SUBJECT_LABELS = {
    math: `${Emojis.Numbers} ${t('Math_Subject')}`,
    hebrew: `${Emojis.LettersHE} ${t('Hebrew_Subject')}`,
    english: `${Emojis.LettersEN} ${t('English_Subject')}`,
    other: `${Emojis.Bulb} ${t('Other_Subject')}`,
  };

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
        if (!res.ok) throw new Error(t('Error_loading_suggestions'));
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
        <h1 className="admin-title">{Emojis.Gear} {t('Admin_Panel')}</h1>
        <p className="admin-subtitle">{t('User_Suggestions', { count: suggestions.length })}</p>

        {loading && <p className="admin-loading">{t('Loading')}</p>}
        {error && <div className="admin-error-box">{error}</div>}

        {!loading && !error && suggestions.length === 0 && (
          <div className="admin-empty">{t('No_suggestions_yet')}</div>
        )}

        {!loading && !error && suggestions.length > 0 && (
          <table className="admin-table">
            <thead>
              <tr>
                <th className="admin-th">{t('Table_User')}</th>
                <th className="admin-th">{t('Table_Subject')}</th>
                <th className="admin-th">{t('Table_Title')}</th>
                <th className="admin-th">{t('Table_Description')}</th>
                <th className="admin-th">{t('Table_Image')}</th>
                <th className="admin-th">{t('Table_Date')}</th>
              </tr>
            </thead>
            <tbody>
              {suggestions.map((s) => (
                <tr key={s.id} className="admin-tr">
                  <td className="admin-td">{Emojis.User} {s.username}</td>
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
                          alt={t('Image_Preview')}
                          className="admin-image-preview"
                        />
                      </a>
                    ) : (
                      <span className="admin-no-image">—</span>
                    )}
                  </td>
                  <td className="admin-td admin-date-col">
                    {new Date(s.created_at).toLocaleDateString(t('Date_Locale'), {
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
