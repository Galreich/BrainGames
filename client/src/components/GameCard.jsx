import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Emojis } from '../utils/Emojis';

const GameCard = ({ title, subtitle, image, description, path, theme, stars, gamesPlayed, starColor }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="game-card" data-theme={theme} onClick={() => navigate(path)}>
      {/* Background decoration */}
      <div className="card-deco-1" />
      <div className="card-deco-2" />

      <div className="card-content">
        <div className="card-image-container">
          <img src={image} alt={title} className="card-image" />
        </div>

        <h2 className="card-title">{title}</h2>
        <p className="card-subtitle">{subtitle}</p>
        <p className="card-description">{description}</p>

        {/* Stars and stats */}
        <div className="card-stats">
          <span className="games-played">{t('Games_Played', { count: gamesPlayed })}</span>
        </div>

        <button className="card-play-btn">{t('Play_Now')} {Emojis.Gamepad}</button>
      </div>
    </div>
  );
};

export default GameCard;