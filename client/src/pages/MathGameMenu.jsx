import React from 'react';
import { useTranslation } from 'react-i18next';
import { Emojis } from '../utils/Emojis';

const MathGameMenu = ({ startGame, navigate }) => {
  const { t } = useTranslation();

  return (
    <div className='menu-card'>
      <div className='menu-icon'>{Emojis.Rocket}</div>
      <h2 className='menu-title'>{t('Math_Subtitle')}</h2>
      <p className='menu-description'>
        {Emojis.Star} {t('Math_Instructions_1')}
        <br />
        {Emojis.Numbers} {t('Math_Instructions_2')}
        <br />
      </p>
      <div className='difficulty-levels'>
        {[
          { emoji: Emojis.Star, text: t('Math_Level_1') },
          { emoji: Emojis.Star.repeat(2), text: t('Math_Level_2') },
          { emoji: Emojis.Star.repeat(3), text: t('Math_Level_3') },
        ].map((item) => (
          <div key={item.emoji} className='level-item'>
            <div className='level-emoji'>{item.emoji}</div>
            <div className='level-text'>{item.text}</div>
          </div>
        ))}
      </div>
      <button className='start-btn' onClick={startGame}>
        {t('Lets_Go')}
      </button>
      <div>
        <button
          className='play-again-btn secondary'
          onClick={() => navigate('/')}
        >
          {Emojis.House} {t('Back_to_Home')}
        </button>
      </div>
    </div>
  );
};

export default MathGameMenu;
