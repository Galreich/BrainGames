
import { useTranslation } from 'react-i18next';
import { Emojis } from '../utils/Emojis';

type SuggestionSuccessProps = {
  onClose: () => void;
};

const SuggestionSuccess = ({ onClose }: SuggestionSuccessProps) => {
  const { t } = useTranslation();

  return (
    <div className='suggestion-success-container'>
      <div className='suggestion-success-icon'>{Emojis.Party}</div>
      <h2 className='suggestion-success-title'>{t('Thank_you')}</h2>
      <p className='suggestion-success-text'>
        {t('Suggestion_sent')}
        <br />
        {t('Suggestion_sent_2')}
      </p>
      <button onClick={onClose} className='suggestion-success-btn'>
        {t('Close')}
      </button>
    </div>
  );
};

export default SuggestionSuccess;
