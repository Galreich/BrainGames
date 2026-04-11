import React, { useState, useEffect } from 'react';
import { useAuth } from '../context';
import './SuggestionModalStyle.css';

const SUBJECTS = [
  { value: '', label: 'כללי (לא קשור לנושא ספציפי)' },
  { value: 'math', label: '🔴 חשבון' },
  { value: 'hebrew', label: '🔵 עברית' },
  { value: 'english', label: '🟡 אנגלית' },
];

const SuggestionModal = ({ onClose }) => {
  const { token } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('');
  const [imageData, setImageData] = useState(null);
  const [imageError, setImageError] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState('');

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageError('');
    if (!file) { setImageData(null); return; }
    if (!file.type.startsWith('image/')) { setImageError('הקובץ חייב להיות תמונה'); return; }
    if (file.size > 2 * 1024 * 1024) { setImageError('התמונה גדולה מדי (מקסימום 2MB)'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => setImageData(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setErrorMsg('אנא מלא כותרת ותיאור');
      return;
    }
    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ title, description, subject, imageData }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'שגיאה בשליחה');
        setStatus('error');
      } else {
        setStatus('success');
      }
    } catch {
      setErrorMsg('שגיאת רשת, נסה שוב');
      setStatus('error');
    }
  };

  return (
    <div className="suggestion-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="suggestion-modal">
        {/* Close button */}
        <button onClick={onClose} className="suggestion-close-btn">✕</button>

        {status === 'success' ? (
          <div className="suggestion-success-container">
            <div className="suggestion-success-icon">🎉</div>
            <h2 className="suggestion-success-title">
              תודה רבה!
            </h2>
            <p className="suggestion-success-text">
              ההצעה שלך נשלחה בהצלחה.<br />אנחנו ניקח אותה בחשבון!
            </p>
            <button onClick={onClose} className="suggestion-success-btn">
              סגור
            </button>
          </div>
        ) : (
          <>
            <div className="suggestion-header">
              <div className="suggestion-icon">💡</div>
              <h2 className="suggestion-title">
                הצע משחק חדש
              </h2>
              <p className="suggestion-subtitle">
                יש לך רעיון? נשמח לשמוע!
              </p>
            </div>

            <form onSubmit={handleSubmit} className="suggestion-form">
              {/* Subject */}
              <div>
                <label className="suggestion-label">
                  נושא
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="suggestion-select"
                >
                  {SUBJECTS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="suggestion-label">
                  כותרת המשחק <span style={{ color: '#ff7675' }}>*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={100}
                  placeholder="הכנס פה הצעה למשחק"
                  className="suggestion-input"
                />
                <div className="suggestion-char-count">
                  {title.length}/100
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="suggestion-label">
                  תיאור <span style={{ color: '#ff7675' }}>*</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={1000}
                  rows={4}
                  placeholder="תאר את המשחק שאתה מציע - איך הוא עובד, מה לומדים, למה הוא כיפי..."
                  className="suggestion-textarea"
                />
                <div className="suggestion-char-count">
                  {description.length}/1000
                </div>
              </div>

              {/* Image upload */}
              <div>
                <label className="suggestion-label">
                  תמונה (אופציונלי)
                </label>
                <label className="suggestion-file-label">
                  <span className="suggestion-file-icon">🖼️</span>
                  <span>{imageData ? 'תמונה נבחרה ✓' : 'לחץ לבחירת תמונה (עד 2MB)'}</span>
                  <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                </label>
                {imageData && (
                  <div className="suggestion-image-preview-container">
                    <img src={imageData} alt="תצוגה מקדימה" className="suggestion-image-preview" />
                    <button
                      type="button"
                      onClick={() => setImageData(null)}
                      className="suggestion-image-remove-btn"
                    >✕</button>
                  </div>
                )}
                {imageError && (
                  <div className="suggestion-image-error">{imageError}</div>
                )}
              </div>

              {errorMsg && (
                <div className="suggestion-error-msg">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={status === 'loading'}
                className={`suggestion-submit-btn ${status === 'loading' ? 'loading' : ''}`}
              >
                {status === 'loading' ? '⏳ שולח...' : '📨 שלח הצעה'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default SuggestionModal;
