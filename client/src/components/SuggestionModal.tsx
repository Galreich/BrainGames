import React, { useState, useEffect } from 'react';
import { useAuth } from '../context';
import './SuggestionModalStyle.css';
import { useTranslation } from 'react-i18next';
import { Emojis } from '../utils/Emojis';
import { SuggestionSuccess, SuggestionImageUpload } from '.';

type SuggestionModalProps = {
  onClose: () => void;
};

const SuggestionModal = ({ onClose }: SuggestionModalProps) => {
  const { token } = useAuth();
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('');

  const SUBJECTS = [
    { value: '', label: t('General_Subject') },
    { value: 'math', label: `${Emojis.RedCircle} ${t('Math_Color')}` },
    { value: 'hebrew', label: `${Emojis.BlueCircle} ${t('Hebrew_Color')}` },
    { value: 'english', label: `${Emojis.GreenCircle} ${t('English_Color')}` },
  ];

  const [imageData, setImageData] = useState<string | null>(null);
  const [imageError, setImageError] = useState('');
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setImageError('');
    if (!file) {
      setImageData(null);
      return;
    }
    if (!file.type.startsWith('image/')) {
      setImageError(t('Error_must_be_image'));
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setImageError(t('Error_image_too_large'));
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => setImageData(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setErrorMsg(t('Error_fill_title_and_description'));
      return;
    }
    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, description, subject, imageData }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(t(data.error || 'Error_sending'));
        setStatus('error');
      } else {
        setStatus('success');
      }
    } catch {
      setErrorMsg(t('Network_error'));
      setStatus('error');
    }
  };

  return (
    <div
      className='suggestion-overlay'
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className='suggestion-modal'>
        {/* Close button */}
        <button onClick={onClose} className='suggestion-close-btn'>
          {Emojis.Cross}
        </button>

        {status === 'success' ? (
          <SuggestionSuccess onClose={onClose} />
        ) : (
          <>
            <div className='suggestion-header'>
              <div className='suggestion-icon'>{Emojis.Bulb}</div>
              <h2 className='suggestion-title'>{t('Suggest_new_game')}</h2>
              <p className='suggestion-subtitle'>{t('Got_an_idea')}</p>
            </div>

            <form onSubmit={handleSubmit} className='suggestion-form'>
              {/* Subject */}
              <div>
                <label className='suggestion-label'>{t('Table_Subject')}</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className='suggestion-select'
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
                <label className='suggestion-label'>
                  {t('Game_Title')} <span style={{ color: '#ff7675' }}>*</span>
                </label>
                <input
                  type='text'
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={100}
                  placeholder={t('Game_Title_Placeholder')}
                  className='suggestion-input'
                />
                <div className='suggestion-char-count'>{title.length}/100</div>
              </div>

              {/* Description */}
              <div>
                <label className='suggestion-label'>
                  {t('Description')} <span style={{ color: '#ff7675' }}>*</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={1000}
                  rows={4}
                  placeholder={t('Description_Placeholder')}
                  className='suggestion-textarea'
                />
                <div className='suggestion-char-count'>
                  {description.length}/1000
                </div>
              </div>

              {/* Image upload */}
              <SuggestionImageUpload
                imageData={imageData}
                imageError={imageError}
                onImageChange={handleImageChange}
                onRemoveImage={() => setImageData(null)}
              />

              {errorMsg && (
                <div className='suggestion-error-msg'>{errorMsg}</div>
              )}

              <button
                type='submit'
                disabled={status === 'loading'}
                className={`suggestion-submit-btn ${status === 'loading' ? 'loading' : ''}`}
              >
                {status === 'loading'
                  ? `${Emojis.Hourglass} ${t('Sending')}`
                  : `${Emojis.Email} ${t('Send_Suggestion')}`}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default SuggestionModal;
