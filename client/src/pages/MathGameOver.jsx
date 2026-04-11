import React from 'react';
import { useTranslation } from 'react-i18next';
import { Emojis } from '../utils/Emojis';

const MathGameOver = ({
  totalAnswers,
  totalStations,
  formattedTime,
  startGame,
  navigate,
}) => {
  const { t } = useTranslation();

  return (
    <div className='game-over-card'>
      <div className='game-over-icon'>
        {totalAnswers >= Math.ceil(totalStations / 2)
          ? Emojis.Trophy
          : Emojis.Rocket}
      </div>
      <div className='game-over-title'>
        {totalAnswers >= Math.ceil(totalStations / 2)
          ? `${t('Amazing_Rocket')} ${Emojis.Rocket}`
          : `${t('Failed_Astronaut')} ${Emojis.Sad}`}
      </div>
      <div className='game-over-stats'>
        <div className='stat-item'>
          <div className='stat-value'>{formattedTime}</div>
          <div className='stat-label'>{t('Time')}</div>
        </div>
        <div className='stat-item'>
          <div className='stat-value'>{totalAnswers}</div>
          <div className='stat-label'>{t('Correct_Answers')}</div>
        </div>
      </div>

      <div>
        <button className='play-again-btn' onClick={startGame}>
          {Emojis.Rocket} {t('Play_Again')}
        </button>
      </div>
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

export default MathGameOver;
