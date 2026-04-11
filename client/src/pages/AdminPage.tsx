import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context';
import './AdminPageStyle.css';
import { useTranslation } from 'react-i18next';
import { Emojis } from '../utils/Emojis';

type Suggestion = {
  id: number;
  username: string;
  subject: string;
  title: string;
  description: string;
  image_data: string | null;
  created_at: string;
};

const AdminPage = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [popupDesc, setPopupDesc] = useState<string | null>(null);

  const SUBJECT_LABELS: Record<string, string> = {
    math: t('Math_Subject'),
    hebrew: t('Hebrew'),
    english: t('English'),
    other: t('Other_Subject'),
  };

  useEffect(() => {
    if (!user || !user.is_admin) {
      navigate('/');
      return;
    }
    const fetchSuggestions = async () => {
      try {
        const res = await fetch('/api/admin/suggestions', {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store',
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error_loading_suggestions');
        setSuggestions(data.suggestions);
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : 'Error_loading_suggestions';
        const errorKey = msg === 'Failed to fetch' ? 'Network_error' : msg;
        setError(t(errorKey));
      } finally {
        setLoading(false);
      }
    };
    fetchSuggestions();

    const handleSuggestionAdded = () => fetchSuggestions();
    window.addEventListener('suggestionAdded', handleSuggestionAdded);
    return () =>
      window.removeEventListener('suggestionAdded', handleSuggestionAdded);
  }, [user, token, navigate]);

  if (!user || !user.is_admin) return null;

  return (
    <div className='admin-page'>
      <div className='admin-container'>
        <h1 className='admin-title'>
          {Emojis.Gear} {t('Admin_Panel')}
        </h1>
        <p className='admin-subtitle'>
          {t('User_Suggestions', { count: suggestions.length })}
        </p>

        {loading && <p className='admin-loading'>{t('Loading')}</p>}
        {error && <div className='admin-error-box'>{error}</div>}

        {!loading && !error && suggestions.length === 0 && (
          <div className='admin-empty'>{t('No_suggestions_yet')}</div>
        )}

        {!loading && !error && suggestions.length > 0 && (
          <table className='admin-table'>
            <thead>
              <tr>
                <th className='admin-th'>{t('Table_User')}</th>
                <th className='admin-th'>{t('Table_Subject')}</th>
                <th className='admin-th'>{t('Table_Title')}</th>
                <th className='admin-th'>{t('Table_Image')}</th>
                <th className='admin-th'>{t('Table_Date')}</th>
                <th className='admin-th'>{t('Description')}</th>
              </tr>
            </thead>
            <tbody>
              {suggestions.map((s) => (
                <tr key={s.id} className='admin-tr'>
                  <td className='admin-td'>
                    {Emojis.User} {s.username}
                  </td>
                  <td className='admin-td'>
                    <span className={`admin-badge ${s.subject || 'general'}`}>
                      {s.subject ? SUBJECT_LABELS[s.subject] || s.subject : '—'}
                    </span>
                  </td>
                  <td className='admin-td admin-fw-700'>{s.title}</td>
                  <td className='admin-td'>
                    {s.image_data ? (
                      <a href={s.image_data} target='_blank' rel='noreferrer'>
                        <img
                          src={s.image_data}
                          alt={t('Image_Preview')}
                          className='admin-image-preview'
                        />
                      </a>
                    ) : (
                      <span className='admin-no-image'>—</span>
                    )}
                  </td>
                  <td className='admin-td admin-date-col'>
                    {new Date(s.created_at).toLocaleDateString(
                      t('Date_Locale'),
                      {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      },
                    )}
                  </td>
                  <td
                    className='admin-td admin-desc-col'
                    onClick={() => setPopupDesc(s.description)}
                    title={t('Description')}
                  >
                    <div className='admin-desc-icon'>{Emojis.Document}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Description Popup Modal */}
      {popupDesc && (
        <div className='admin-popup-overlay' onClick={() => setPopupDesc(null)}>
          <div
            className='admin-popup-content'
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className='admin-popup-close'
              onClick={() => setPopupDesc(null)}
            >
              {Emojis.Cross}
            </button>
            <h3 className='admin-popup-title'>{t('Description')}</h3>
            <p className='admin-popup-text'>{popupDesc}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
