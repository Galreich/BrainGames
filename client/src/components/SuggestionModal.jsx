import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

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
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.65)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 2000,
        padding: '20px',
        backdropFilter: 'blur(4px)',
        boxSizing: 'border-box',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: 'linear-gradient(145deg, #1a1a2e, #16213e)',
        borderRadius: '24px',
        padding: '32px',
        width: '100%',
        maxWidth: '560px',
        maxHeight: '90vh',
        overflowY: 'auto',
        border: '1px solid rgba(255,255,255,0.12)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        direction: 'rtl',
        position: 'relative',
      }}>
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: '16px', left: '16px',
            background: 'rgba(255,255,255,0.1)', border: 'none',
            borderRadius: '50%', width: '36px', height: '36px',
            color: '#fff', fontSize: '1.2rem', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >✕</button>

        {status === 'success' ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🎉</div>
            <h2 style={{ color: '#fff', fontSize: '1.6rem', fontWeight: '900', marginBottom: '10px' }}>
              תודה רבה!
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '24px', lineHeight: 1.6 }}>
              ההצעה שלך נשלחה בהצלחה.<br />אנחנו ניקח אותה בחשבון!
            </p>
            <button
              onClick={onClose}
              style={{
                background: 'linear-gradient(135deg, #f9ca24, #f0932b)',
                color: '#1a1a2e', border: 'none', borderRadius: '50px',
                padding: '12px 32px', fontSize: '1rem', fontWeight: '900', cursor: 'pointer',
              }}
            >
              סגור
            </button>
          </div>
        ) : (
          <>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>💡</div>
              <h2 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: '900', margin: 0 }}>
                הצע משחק חדש
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: '6px', fontSize: '0.9rem' }}>
                יש לך רעיון? נשמח לשמוע!
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Subject */}
              <div>
                <label style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', fontWeight: '700', display: 'block', marginBottom: '6px' }}>
                  נושא
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  style={{
                    width: '100%', padding: '12px 14px',
                    background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '12px', color: '#fff', fontSize: '1rem',
                    outline: 'none', cursor: 'pointer',
                    direction: 'rtl',
                    fontFamily: 'inherit'
                  }}
                >
                  {SUBJECTS.map((s) => (
                    <option key={s.value} value={s.value} style={{ background: '#1a1a2e'}}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <label style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', fontWeight: '700', display: 'block', marginBottom: '6px' }}>
                  כותרת המשחק <span style={{ color: '#ff7675' }}>*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={100}
                  placeholder="הכנס פה הצעה למשחק"
                  style={{
                    width: '100%', padding: '12px 14px', boxSizing: 'border-box',
                    background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '12px', color: '#fff', fontSize: '1rem',
                    outline: 'none', direction: 'rtl',
                    fontFamily: 'inherit', lineHeight: 1.5,
                  }}
                />
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', marginTop: '4px', textAlign: 'left' }}>
                  {title.length}/100
                </div>
              </div>

              {/* Description */}
              <div>
                <label style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', fontWeight: '700', display: 'block', marginBottom: '6px' }}>
                  תיאור <span style={{ color: '#ff7675' }}>*</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={1000}
                  rows={4}
                  placeholder="תאר את המשחק שאתה מציע - איך הוא עובד, מה לומדים, למה הוא כיפי..."
                  style={{
                    width: '100%', padding: '12px 14px', boxSizing: 'border-box',
                    background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '12px', color: '#fff', fontSize: '1rem',
                    outline: 'none', resize: 'vertical', direction: 'rtl',
                    fontFamily: 'inherit', lineHeight: 1.5,
                  }}
                />
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', marginTop: '4px', textAlign: 'left' }}>
                  {description.length}/1000
                </div>
              </div>

              {/* Image upload */}
              <div>
                <label style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', fontWeight: '700', display: 'block', marginBottom: '6px' }}>
                  תמונה (אופציונלי)
                </label>
                <label style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '12px 14px', cursor: 'pointer',
                  background: 'rgba(255,255,255,0.06)', border: '1px dashed rgba(255,255,255,0.25)',
                  borderRadius: '12px', color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem',
                }}>
                  <span style={{ fontSize: '1.4rem' }}>🖼️</span>
                  <span>{imageData ? 'תמונה נבחרה ✓' : 'לחץ לבחירת תמונה (עד 2MB)'}</span>
                  <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                </label>
                {imageData && (
                  <div style={{ marginTop: '8px', position: 'relative', display: 'inline-block' }}>
                    <img src={imageData} alt="תצוגה מקדימה" style={{ maxHeight: '120px', maxWidth: '100%', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.15)' }} />
                    <button
                      type="button"
                      onClick={() => setImageData(null)}
                      style={{
                        position: 'absolute', top: '-8px', right: '-8px',
                        background: '#ff7675', border: 'none', borderRadius: '50%',
                        width: '22px', height: '22px', color: '#fff', fontSize: '0.75rem',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >✕</button>
                  </div>
                )}
                {imageError && (
                  <div style={{ color: '#ff7675', fontSize: '0.8rem', marginTop: '4px' }}>{imageError}</div>
                )}
              </div>

              {errorMsg && (
                <div style={{
                  background: 'rgba(255,118,118,0.15)', border: '1px solid rgba(255,118,118,0.4)',
                  borderRadius: '10px', padding: '10px 14px', color: '#ff7675',
                  fontSize: '0.9rem', textAlign: 'center',
                }}>
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={status === 'loading'}
                style={{
                  background: status === 'loading'
                    ? 'rgba(255,255,255,0.2)'
                    : 'linear-gradient(135deg, #f9ca24, #f0932b)',
                  color: status === 'loading' ? 'rgba(255,255,255,0.6)' : '#1a1a2e',
                  border: 'none', borderRadius: '50px',
                  padding: '14px', fontSize: '1.1rem', fontWeight: '900',
                  cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  marginTop: '4px',
                }}
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
