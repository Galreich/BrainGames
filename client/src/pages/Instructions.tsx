
import { useTranslation } from 'react-i18next';

const Instructions = () => {
  const { t } = useTranslation();

  return (
    <div className='instructions-panel'>
      <h3 className='instructions-title'>{t('How_to_play')}</h3>
      <div className='instructions-list'>
        {[
          { type: 'correct', text: t('Letter_in_correct_spot') },
          { type: 'present', text: t('Letter_in_wrong_spot') },
          { type: 'absent', text: t('Letter_not_in_word') },
        ].map((item) => (
          <div key={item.type} className='instruction-item'>
            <div className={`instruction-tile ${item.type}`} />
            <span className='instruction-text'>{item.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Instructions;
