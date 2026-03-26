import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import StarDisplay from '../components/StarDisplay';

const Confetti = () => {
  const pieces = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 3}s`,
    duration: `${2 + Math.random() * 3}s`,
    color: ['#f9ca24', '#eb4d4b', '#6c5ce7', '#00b894', '#0984e3', '#fd79a8'][Math.floor(Math.random() * 6)],
    size: `${8 + Math.random() * 12}px`,
  }));

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
      {pieces.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: p.left,
            top: '-20px',
            width: p.size,
            height: p.size,
            background: p.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            animation: `confetti ${p.duration} ${p.delay} linear infinite`,
            opacity: 0.8,
          }}
        />
      ))}
    </div>
  );
};

const GameCard = ({ title, subtitle, image, description, path, theme, stars, gamesPlayed, starColor }) => {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);

  const themes = {
    math: {
      bg: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
      shadow: 'rgba(238, 90, 36, 0.4)',
      badge: '#ff6b6b',
      border: '#ff9999',
    },
    hebrew: {
      bg: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)',
      shadow: 'rgba(9, 132, 227, 0.4)',
      badge: '#74b9ff',
      border: '#99ccff',
    },
    english: {
      bg: 'linear-gradient(135deg, #55efc4 0%, #00b894 100%)',
      shadow: 'rgba(0, 184, 148, 0.4)',
      badge: '#55efc4',
      border: '#88ffdd',
    },
  };

  const t = themes[theme];

  return (
    <div
      onClick={() => navigate(path)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: t.bg,
        borderRadius: '24px',
        padding: '36px 28px',
        cursor: 'pointer',
        transform: hovered ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)',
        boxShadow: hovered
          ? `0 20px 50px ${t.shadow}, 0 0 0 3px ${t.border}`
          : `0 8px 25px ${t.shadow}`,
        transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        position: 'relative',
        overflow: 'hidden',
        textAlign: 'center',
        userSelect: 'none',
      }}
    >
      {/* Background decoration */}
      <div style={{
        position: 'absolute',
        top: '-20px',
        right: '-20px',
        width: '120px',
        height: '120px',
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.15)',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-30px',
        left: '-10px',
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.1)',
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{
          marginBottom: '12px',
          display: 'flex',
          justifyContent: 'center',
        }}>
          <img
            src={image}
            alt={title}
            style={{
              width: '100px',
              height: '100px',
              objectFit: 'contain',
              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))',
              transition: 'transform 0.3s',
              transform: hovered ? 'scale(1.1)' : 'scale(1)',
            }}
          />
        </div>

        <h2 style={{
          color: '#fff',
          fontSize: '1.6rem',
          marginBottom: '6px',
          textShadow: '0 2px 4px rgba(0,0,0,0.2)',
        }}>
          {title}
        </h2>

        <p style={{
          color: 'rgba(255,255,255,0.85)',
          fontSize: '1rem',
          fontWeight: '600',
          marginBottom: '8px',
        }}>
          {subtitle}
        </p>

        <p style={{
          color: 'rgba(255,255,255,0.75)',
          fontSize: '0.9rem',
          marginBottom: '20px',
          lineHeight: '1.5',
        }}>
          {description}
        </p>

        {/* Stars and stats */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          background: 'rgba(0,0,0,0.15)',
          borderRadius: '16px',
          padding: '10px 16px',
          marginBottom: '16px',
        }}>
          {/* <StarDisplay count={Math.min(stars || 0, 3)} color={starColor} size="1.3rem" />
          <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.85rem', fontWeight: '700' }}>
            {stars || 0} כוכבים
          </span> */}
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem' }}>
               {gamesPlayed} משחקים
            </span>
        </div>

        <button style={{
          background: 'rgba(255,255,255,0.95)',
          color: theme === 'math' ? '#ee5a24' : theme === 'hebrew' ? '#0984e3' : '#00b894',
          border: 'none',
          borderRadius: '50px',
          padding: '12px 30px',
          fontSize: '1.1rem',
          cursor: 'pointer',
          width: '100%',
          transition: 'all 0.2s',
          boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
        }}>
          שחק עכשיו! 🎮
        </button>
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

  const styles = {
    page: {
      minHeight: 'calc(100vh - 70px)',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '30px 20px',
      position: 'relative',
      overflow: 'hidden',
    },
    container: {
      maxWidth: '1100px',
      margin: '0 auto',
      position: 'relative',
      zIndex: 1,
    },
    hero: {
      textAlign: 'center',
      marginBottom: '40px',
      animation: 'fadeIn 0.8s ease',
    },
    heroTitle: {
      color: '#fff',
      fontSize: '3rem',
      textShadow: '0 4px 20px rgba(0,0,0,0.3)',
      marginBottom: '12px',
      lineHeight: '1.2',
    },
    heroSubtitle: {
      color: 'rgba(255,255,255,0.85)',
      fontSize: '1.3rem',
      fontWeight: '600',
      marginBottom: '24px',
    },
    totalStars: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '10px',
      background: 'rgba(255,255,255,0.2)',
      backdropFilter: 'blur(10px)',
      borderRadius: '50px',
      padding: '12px 28px',
      color: '#fff',
      fontWeight: '800',
      fontSize: '1.2rem',
      border: '2px solid rgba(255,255,255,0.3)',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '28px',
      marginBottom: '40px',
    },
    footer: {
      textAlign: 'center',
      color: 'rgba(255,255,255,0.6)',
      fontSize: '0.9rem',
      paddingTop: '20px',
    },
    welcomeBanner: {
      background: 'linear-gradient(135deg, #f9ca24, #f0932b)',
      borderRadius: '20px',
      padding: '16px 24px',
      textAlign: 'center',
      marginBottom: '30px',
      animation: 'fadeIn 0.5s ease',
      boxShadow: '0 8px 25px rgba(249,202,36,0.4)',
    },
  };

  return (
    <div style={styles.page}>
      <Confetti />
      <div style={styles.container}>
        {/* Welcome Banner */}
        {user && showWelcome && (
          <div style={styles.welcomeBanner}>
            <span style={{ fontSize: '1.3rem', color: '#1a1a2e' }}>
              ברוך הבא, {user.username}! 🎉 בוא נשחק!
            </span>
          </div>
        )}

        {/* Hero Section */}
        <div style={styles.hero}>
          <h1 style={styles.heroTitle}>
             ברוך הבא ל-BrainGames!
          </h1>
          <p style={styles.heroSubtitle}>
            למד, שחק ותאסוף כוכבים! 🌟
          </p>

          {user && (
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
              <div style={styles.totalStars}>
                ⭐ סה"כ כוכבים: <strong>{totalStars}</strong>
              </div>
            </div>
          )}

          {!user && (
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem', marginTop: '10px' }}>
              💡 התחבר כדי לשמור את ההתקדמות שלך!
            </p>
          )}
        </div>

        {/* Game Cards */}
        <div style={styles.grid}>
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
            subtitle="שפה עברית"
            image="/hebrew-wordle.svg"
            description="נחש את המילה הסודית בעברית! יש לך 6 ניסיונות. מילים בנות 4-6 אותיות."
            path="/hebrew-wordle"
            theme="hebrew"
            stars={summary.hebrew?.stars || 0}
            gamesPlayed={summary.hebrew?.games_played || 0}
            starColor="#74b9ff"
          />
          <GameCard
            title="Wordle English"
            subtitle="English Language"
            image="/english-wordle.svg"
            description="Guess the secret English word! You have 6 attempts. Words with 4-6 letters."
            path="/english-wordle"
            theme="english"
            stars={summary.english?.stars || 0}
            gamesPlayed={summary.english?.games_played || 0}
            starColor="#55efc4"
          />
        </div>

        <div style={styles.footer}>
          <p>🎓 BrainGames - משחקי מוח לתלמידי בית ספר יסודי</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
