import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import StarDisplay from '../components/StarDisplay';
import './HomeStyle.css';

const Confetti = () => {
  const pieces = Array.from({ length: 20 }, (_, i) => {
    const style = {
      '--left': `${Math.random() * 100}%`,
      '--delay': `${Math.random() * 3}s`,
      '--duration': `${2 + Math.random() * 3}s`,
      '--color': ['#f9ca24', '#eb4d4b', '#6c5ce7', '#00b894', '#0984e3', '#fd79a8'][Math.floor(Math.random() * 6)],
      '--size': `${8 + Math.random() * 12}px`,
      '--border-radius': Math.random() > 0.5 ? '50%' : '2px',
    };
    return <div key={i} className="confetti-piece" style={style} />;
  });

  return (
    <div className="confetti-container">
      {pieces}
    </div>
  );
};

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

const Home = () => {
  const { user, token } = useAuth();
  const [showWelcome, setShowWelcome] = useState(true);
  const [summary, setSummary] = useState({ math: { stars: 0, games_played: 0 }, hebrew: { stars: 0, games_played: 0 }, english: { stars: 0, games_played: 0 } });

  useEffect(() => {
    const timer = setTimeout(() => setShowWelcome(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!token) return;
    fetch('/api/game-records/summary', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => setSummary(data))
      .catch(() => {});
  }, [token]);

  const totalStars = (user?.red_stars || 0) + (user?.blue_stars || 0) + (user?.green_stars || 0)

  return (
    <div className="home-page">
      <Confetti />
      <div className="home-container">
        {/* Welcome Banner */}
        {user && showWelcome && (
          <div className="welcome-banner">
            ברוך הבא, {user.username}! 🎉 בוא נשחק!
          </div>
        )}

        {/* Hero Section */}
        <div className="hero-section">
          <h1 className="hero-title">
             ברוך הבא ל-BrainGames!
          </h1>
          <p className="hero-subtitle">
            למד, שחק ותאסוף כוכבים! 🌟
          </p>

          {user && (
            <div className="total-stars-container">
              <div className="total-stars-badge">
                ⭐ סה"כ כוכבים: <strong>{totalStars}</strong>
              </div>
            </div>
          )}

          {!user && (
            <p className="login-prompt">
              💡 התחבר כדי לשמור את ההתקדמות שלך!
            </p>
          )}
        </div>

        {/* Game Cards */}
        <div className="game-grid">
          <GameCard
            title="הרפתקת המספרים"
            subtitle="חשבון"
            image="/math-game.svg"
            description="עזור לאסטרונאוט לעוף בחלל! פתור תרגילים ועבור דרך 10 תחנות."
            path="/math"
            theme="math"
            stars={summary.math?.stars || 0}
            gamesPlayed={summary.math?.games_played || 0}
            starColor="#ff6b6b"
          />
          <GameCard
            title="וורדעל עברית"
            subtitle="לשון"
            image="/hebrew-wordle.svg"
            description="נחש את המילה הסודית בעברית! יש לך 6 ניסיונות. מילים בנות 4-6 אותיות."
            path="/hebrew-wordle"
            theme="hebrew"
            stars={summary.hebrew?.stars || 0}
            gamesPlayed={summary.hebrew?.games_played || 0}
            starColor="#74b9ff"
          />
          <GameCard
            title="English Wordle"
            subtitle="אנגלית"
            image="/english-wordle.svg"
            description="נחש את המילה הסודית באנגלית! יש לך 6 ניסיונות. מילים בנות 4-6 אותיות."
            path="/english-wordle"
            theme="english"
            stars={summary.english?.stars || 0}
            gamesPlayed={summary.english?.games_played || 0}
            starColor="#55efc4"
          />
        </div>

        <div className="home-footer">
          <p>🎓 BrainGames - משחקי מוח לתלמידי בית ספר יסודי</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
