import React from 'react';
import { useNavigate } from 'react-router-dom';

const GameCard = ({ title, subtitle, image, description, path, theme, stars, gamesPlayed, starColor }) => {
  const navigate = useNavigate();

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
          <span className="games-played">{gamesPlayed} משחקים</span>
        </div>

        <button className="card-play-btn">שחק עכשיו! 🎮</button>
      </div>
    </div>
  );
};

export default GameCard;