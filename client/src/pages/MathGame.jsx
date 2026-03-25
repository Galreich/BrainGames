import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProgress } from '../context/ProgressContext';
import { useAuth } from '../context/AuthContext';
import StarDisplay from '../components/StarDisplay';

const TOTAL_STATIONS = 10;

const generateQuestion = (station) => {
  let a, b, op, answer;

  if (station <= 3) {
    // Addition/subtraction up to 20
    op = Math.random() > 0.5 ? '+' : '-';
    if (op === '+') {
      a = Math.floor(Math.random() * 10) + 1;
      b = Math.floor(Math.random() * (20 - a)) + 1;
      answer = a + b;
    } else {
      a = Math.floor(Math.random() * 15) + 5;
      b = Math.floor(Math.random() * a);
      answer = a - b;
    }
  } else if (station <= 7) {
    // Addition/subtraction up to 100
    op = Math.random() > 0.5 ? '+' : '-';
    if (op === '+') {
      a = Math.floor(Math.random() * 50) + 10;
      b = Math.floor(Math.random() * (100 - a)) + 1;
      answer = a + b;
    } else {
      a = Math.floor(Math.random() * 80) + 20;
      b = Math.floor(Math.random() * a);
      answer = a - b;
    }
  } else {
    // Multiplication ×2, ×3, ×5, ×10
    op = '×';
    const multipliers = [2, 3, 5, 10];
    b = multipliers[Math.floor(Math.random() * multipliers.length)];
    a = Math.floor(Math.random() * 10) + 1;
    answer = a * b;
  }

  // Generate wrong answers
  const wrongAnswers = new Set();
  while (wrongAnswers.size < 3) {
    let wrong = answer + Math.floor(Math.random() * 11) - 5;
    if (wrong !== answer && wrong >= 0) wrongAnswers.add(wrong);
  }

  const options = [answer, ...Array.from(wrongAnswers)].sort(() => Math.random() - 0.5);

  return {
    text: `${a} ${op} ${b} = ?`,
    a, b, op, answer, options,
  };
};

const StarBurst = ({ x, y }) => (
  <div style={{
    position: 'fixed',
    left: x,
    top: y,
    fontSize: '2rem',
    pointerEvents: 'none',
    zIndex: 200,
    animation: 'confetti 1s ease forwards',
  }}>
    ⭐
  </div>
);

const MathGame = () => {
  const navigate = useNavigate();
  const { saveProgress } = useProgress();
  const { token, updateUser } = useAuth();
  const [gameState, setGameState] = useState('menu'); // 'menu', 'playing', 'gameover'
  const [station, setStation] = useState(1);
  const [question, setQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answerStatus, setAnswerStatus] = useState(null); // 'correct', 'wrong'
  const [starsEarned, setStarsEarned] = useState(0);
  const [totalStars, setTotalStars] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [message, setMessage] = useState('');
  const [starBursts, setStarBursts] = useState([]);
  const [animatingRocket, setAnimatingRocket] = useState(false);
  const timerRef = useRef(null);

  const showMessage = (msg, duration = 2000) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), duration);
  };

  const nextQuestion = useCallback((currentStation) => {
    setQuestion(generateQuestion(currentStation));
    setSelectedAnswer(null);
    setAnswerStatus(null);
  }, []);

  const startGame = () => {
    setGameState('playing');
    setStation(1);
    setStarsEarned(0);
    setTotalStars(0);
    setMistakes(0);
    setElapsed(0);
    nextQuestion(1);
  };

  useEffect(() => {
    if (gameState === 'playing') {
      timerRef.current = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [gameState]);

  const addStarBurst = () => {
    const id = Date.now();
    const x = Math.random() * (window.innerWidth - 100) + 50;
    const y = Math.random() * (window.innerHeight / 2) + 100;
    setStarBursts((prev) => [...prev, { id, x, y }]);
    setTimeout(() => setStarBursts((prev) => prev.filter((s) => s.id !== id)), 1200);
  };

  const handleAnswer = useCallback((answer) => {
    if (answerStatus || gameState !== 'playing') return;

    setSelectedAnswer(answer);

    if (answer === question.answer) {
      setAnswerStatus('correct');
      const starsForQuestion = mistakes === 0 ? 1 : 0;
      if (starsForQuestion) {
        addStarBurst();
        addStarBurst();
      }
      setTotalStars((prev) => prev + starsForQuestion);
      showMessage('נכון! 🎉');

      setAnimatingRocket(true);
      setTimeout(() => setAnimatingRocket(false), 800);

      setTimeout(() => {
        const nextStation = station + 1;
        if (nextStation > TOTAL_STATIONS) {
          // Game complete!
          setStarsEarned(1);
          setGameState('gameover');
          saveProgress('math', 1);
          if (token) fetch('/api/game-records', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ game: 'math', subject: 'math', stars: 1, score: station }) }).then(r => r.json()).then(d => updateUser({ red_stars: d.red_stars, blue_stars: d.blue_stars, green_stars: d.green_stars })).catch(() => {});
        } else {
          setStation(nextStation);
          setMistakes(0);
          nextQuestion(nextStation);
        }
      }, 1200);
    } else {
      setAnswerStatus('wrong');
      setMistakes((prev) => prev + 1);
      showMessage('נסה שוב! 💪');
      setTimeout(() => {
        setSelectedAnswer(null);
        setAnswerStatus(null);
      }, 800);
    }
  }, [answerStatus, gameState, question, station, totalStars, elapsed, mistakes, nextQuestion, saveProgress]);


  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const progress = station > 1 ? ((station - 1) / TOTAL_STATIONS) * 100 : 0;

  const styles = {
    page: {
      minHeight: 'calc(100vh - 70px)',
      background: 'linear-gradient(135deg, #2d3436 0%, #1a1a2e 100%)',
      padding: '20px',
      overflow: 'hidden',
      position: 'relative',
    },
    stars: Array.from({ length: 30 }, (_, i) => ({
      position: 'fixed',
      width: `${2 + Math.random() * 3}px`,
      height: `${2 + Math.random() * 3}px`,
      borderRadius: '50%',
      background: '#fff',
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      opacity: Math.random() * 0.7 + 0.3,
      animation: `pulse ${1 + Math.random() * 2}s ease infinite`,
    })),
    container: {
      maxWidth: '600px',
      margin: '0 auto',
      position: 'relative',
      zIndex: 1,
    },
    title: {
      color: '#fff',
      fontSize: '2rem',
      fontWeight: '900',
      textAlign: 'center',
      textShadow: '0 2px 10px rgba(0,0,0,0.5)',
      direction: 'rtl',
    },
    menuCard: {
      background: 'rgba(255,255,255,0.1)',
      backdropFilter: 'blur(20px)',
      borderRadius: '28px',
      padding: '40px',
      textAlign: 'center',
      border: '1px solid rgba(255,255,255,0.2)',
      marginTop: '20px',
    },
    startBtn: {
      background: 'linear-gradient(135deg, #ff6b6b, #ee5a24)',
      color: '#fff',
      border: 'none',
      borderRadius: '50px',
      padding: '18px 50px',
      fontSize: '1.4rem',
      fontWeight: '900',
      cursor: 'pointer',
      boxShadow: '0 8px 25px rgba(238,90,36,0.5)',
      transition: 'all 0.3s',
      animation: 'pulse 2s infinite',
    },
    progressSection: {
      background: 'rgba(255,255,255,0.08)',
      borderRadius: '20px',
      padding: '16px 20px',
      marginBottom: '16px',
    },
    progressBar: {
      height: '16px',
      background: 'rgba(255,255,255,0.15)',
      borderRadius: '8px',
      overflow: 'hidden',
      marginTop: '8px',
    },
    progressFill: {
      height: '100%',
      background: 'linear-gradient(90deg, #ff6b6b, #f0932b)',
      borderRadius: '8px',
      transition: 'width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
      width: `${progress}%`,
      boxShadow: '0 0 10px rgba(255,107,107,0.6)',
    },
    rocketPath: {
      position: 'relative',
      height: '80px',
      marginBottom: '16px',
      display: 'flex',
      alignItems: 'center',
      overflow: 'hidden',
    },
    rocketEmoji: {
      fontSize: '2.5rem',
      position: 'absolute',
      right: `${Math.max(4, Math.min(96, 100 - progress))}%`,
      transform: 'translateX(50%)',
      transition: 'right 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
      animation: animatingRocket ? 'bounce 0.5s ease' : 'none',
      filter: 'drop-shadow(0 0 10px rgba(255,107,107,0.8))',
    },
    pathLine: {
      position: 'absolute',
      top: '50%',
      left: 0,
      right: 0,
      height: '4px',
      background: 'rgba(255,255,255,0.2)',
      borderRadius: '2px',
    },
    stationDots: {
      position: 'absolute',
      top: '50%',
      left: 0,
      right: 0,
      display: 'flex',
      justifyContent: 'space-between',
      transform: 'translateY(-50%)',
      padding: '0 2%',
    },
    questionCard: {
      background: 'rgba(255,255,255,0.12)',
      backdropFilter: 'blur(20px)',
      borderRadius: '24px',
      padding: '30px',
      textAlign: 'center',
      border: '1px solid rgba(255,255,255,0.2)',
      marginBottom: '16px',
    },
    questionText: {
      color: '#fff',
      fontSize: '2.8rem',
      fontWeight: '900',
      marginBottom: '8px',
      direction: 'ltr',
      textShadow: '0 0 20px rgba(255,107,107,0.5)',
    },
    stationLabel: {
      color: 'rgba(255,255,255,0.6)',
      fontSize: '0.9rem',
      marginBottom: '6px',
      direction: 'rtl',
    },
    optionsGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '12px',
    },
    optionBtn: (selected, status, isCorrect) => {
      let bg = 'rgba(255,255,255,0.15)';
      let border = '2px solid rgba(255,255,255,0.2)';
      let color = '#fff';
      let transform = 'scale(1)';

      if (selected && status === 'correct') {
        bg = '#6aaa64';
        border = '2px solid #6aaa64';
        transform = 'scale(1.05)';
      } else if (selected && status === 'wrong') {
        bg = '#e74c3c';
        border = '2px solid #e74c3c';
        transform = 'scale(0.95)';
      } else if (isCorrect && status === 'wrong') {
        bg = 'rgba(106,170,100,0.4)';
        border = '2px solid #6aaa64';
      }

      return {
        background: bg,
        border,
        borderRadius: '16px',
        padding: '18px',
        color,
        fontSize: '1.6rem',
        fontWeight: '900',
        cursor: status ? 'default' : 'pointer',
        transition: 'all 0.2s',
        transform,
        boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
        direction: 'ltr',
      };
    },
    infoRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '12px',
      direction: 'rtl',
    },
    infoBadge: (color) => ({
      background: `rgba(${color}, 0.2)`,
      border: `1px solid rgba(${color}, 0.4)`,
      borderRadius: '20px',
      padding: '6px 14px',
      color: '#fff',
      fontWeight: '700',
      fontSize: '0.9rem',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
    }),
    message: {
      position: 'fixed',
      top: '90px',
      left: '50%',
      transform: 'translateX(-50%)',
      background: 'rgba(0,0,0,0.85)',
      color: '#fff',
      padding: '12px 26px',
      borderRadius: '50px',
      fontWeight: '800',
      fontSize: '1.1rem',
      zIndex: 100,
      animation: 'fadeIn 0.3s ease',
      whiteSpace: 'nowrap',
    },
    gameOver: {
      background: 'rgba(255,255,255,0.12)',
      backdropFilter: 'blur(20px)',
      borderRadius: '28px',
      padding: '40px',
      textAlign: 'center',
      border: '1px solid rgba(255,255,255,0.2)',
      marginTop: '20px',
    },
    gameOverTitle: {
      color: '#fff',
      fontSize: '2.2rem',
      fontWeight: '900',
      marginBottom: '16px',
      direction: 'rtl',
    },
    playAgainBtn: {
      background: 'linear-gradient(135deg, #ff6b6b, #ee5a24)',
      color: '#fff',
      border: 'none',
      borderRadius: '50px',
      padding: '16px 44px',
      fontSize: '1.3rem',
      fontWeight: '900',
      cursor: 'pointer',
      marginTop: '20px',
      boxShadow: '0 8px 25px rgba(238,90,36,0.4)',
      direction: 'rtl',
    },
  };

  return (
    <div style={styles.page}>
      {/* Background stars */}
      {Array.from({ length: 30 }, (_, i) => (
        <div
          key={i}
          style={{
            position: 'fixed',
            width: `${2 + Math.random() * 3}px`,
            height: `${2 + Math.random() * 3}px`,
            borderRadius: '50%',
            background: '#fff',
            left: `${(i * 7.3) % 100}%`,
            top: `${(i * 11.7) % 100}%`,
            opacity: 0.4 + (i % 5) * 0.1,
            animation: `pulse ${1 + (i % 3)}s ease infinite`,
          }}
        />
      ))}

      {/* Star bursts */}
      {starBursts.map((s) => (
        <StarBurst key={s.id} x={s.x} y={s.y} />
      ))}

      {message && <div style={styles.message}>{message}</div>}

      <div style={styles.container}>
        <h1 style={{ ...styles.title, marginBottom: '20px' }}>🚀 הרפתקת המספרים</h1>

        {/* MENU */}
        {gameState === 'menu' && (
          <div style={styles.menuCard}>
            <div style={{ fontSize: '5rem', marginBottom: '16px' }}>🚀</div>
            <h2 style={{ color: '#fff', fontSize: '1.6rem', fontWeight: '900', marginBottom: '12px', direction: 'rtl' }}>
              הרפתקת המספרים בחלל!
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '24px', lineHeight: '1.7', direction: 'rtl', fontSize: '1rem' }}>
              🌟 עזור לאסטרונאוט לעבור דרך 10 תחנות בחלל!<br />
              🔢 פתור חשבונות כדי להתקדם<br />
              ⭐ אסוף כוכבים על תשובות נכונות
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '28px', direction: 'rtl', flexWrap: 'wrap' }}>
              {[
                { emoji: '⭐', text: 'תחנות 1-3: חיבור וחיסור עד 20' },
                { emoji: '⭐⭐', text: 'תחנות 4-7: חיבור וחיסור עד 100' },
                { emoji: '⭐⭐⭐', text: 'תחנות 8-10: כפל ×2, ×3, ×5, ×10' },
              ].map((item) => (
                <div key={item.emoji} style={{
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '16px',
                  padding: '12px 16px',
                  color: '#fff',
                  fontSize: '0.85rem',
                  textAlign: 'right',
                  minWidth: '160px',
                }}>
                  <div style={{ fontSize: '1.2rem', marginBottom: '4px' }}>{item.emoji}</div>
                  <div>{item.text}</div>
                </div>
              ))}
            </div>
            <button style={styles.startBtn} onClick={startGame}>
              🚀 יצא לדרך!
            </button>
            <div>
              <button style={{ ...styles.playAgainBtn, background: 'rgba(255,255,255,0.15)', color: '#fff', boxShadow: 'none' }} onClick={() => navigate('/')}>
                🏠 חזור לדף הבית
              </button>
            </div>
          </div>
        )}

        {/* PLAYING */}
        {gameState === 'playing' && question && (
          <>
            {/* Info Row */}
            <div style={styles.infoRow}>
              <div style={styles.infoBadge('255, 107, 107')}>
                🚀 תחנה {station}/{TOTAL_STATIONS}
              </div>
              <div style={styles.infoBadge('249, 202, 36')}>
                ⭐ {totalStars} כוכבים
              </div>
              <div style={styles.infoBadge('116, 185, 255')}>
                ⏱️ {formatTime(elapsed)}
              </div>
            </div>

            {/* Rocket Path */}
            <div style={styles.rocketPath}>
              <div style={styles.pathLine} />
              <div style={styles.stationDots}>
                {Array.from({ length: TOTAL_STATIONS }, (_, i) => (
                  <div
                    key={i}
                    style={{
                      width: i + 1 === TOTAL_STATIONS ? '20px' : '10px',
                      height: i + 1 === TOTAL_STATIONS ? '20px' : '10px',
                      borderRadius: '50%',
                      background: i + 1 < station
                        ? '#6aaa64'
                        : i + 1 === station
                        ? '#ff6b6b'
                        : 'rgba(255,255,255,0.3)',
                      boxShadow: i + 1 === station ? '0 0 10px #ff6b6b' : 'none',
                      transition: 'all 0.3s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: i + 1 === TOTAL_STATIONS ? '0.7rem' : '0.5rem',
                    }}
                  >
                    {i + 1 === TOTAL_STATIONS && '🏁'}
                  </div>
                ))}
              </div>
              <div style={styles.rocketEmoji}>🚀</div>
            </div>

            {/* Progress Bar */}
            <div style={styles.progressSection}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', marginBottom: '6px', direction: 'rtl' }}>
                <span>התקדמות</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div style={styles.progressBar}>
                <div style={styles.progressFill} />
              </div>
            </div>

            {/* Question */}
            <div style={styles.questionCard}>
              <div style={styles.stationLabel}>תחנה {station} מתוך {TOTAL_STATIONS}</div>
              <div style={styles.questionText}>{question.text}</div>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', direction: 'rtl' }}>
                {station <= 3 ? 'חיבור וחיסור עד 20' :
                 station <= 7 ? 'חיבור וחיסור עד 100' :
                 'כפל - כמה זה?'}
              </p>
            </div>

            {/* Options */}
            <div style={styles.optionsGrid}>
              {question.options.map((opt) => (
                <button
                  key={opt}
                  style={styles.optionBtn(
                    selectedAnswer === opt,
                    selectedAnswer === opt ? answerStatus : null,
                    answerStatus === 'wrong' && opt === question.answer
                  )}
                  onClick={() => handleAnswer(opt)}
                  disabled={!!answerStatus}
                >
                  {opt}
                </button>
              ))}
            </div>
          </>
        )}

        {/* GAME OVER */}
        {gameState === 'gameover' && (
          <div style={styles.gameOver}>
            <div style={{ fontSize: '4rem', marginBottom: '16px' }}>
              {starsEarned === 3 ? '🏆' : starsEarned === 2 ? '🥈' : '🥉'}
            </div>
            <div style={styles.gameOverTitle}>
              {starsEarned === 3 ? 'מדהים! אלוף חלל! 🚀' :
               starsEarned === 2 ? 'כל הכבוד! עשית מצוין! ⭐' :
               'סיימת את המסלול! 🎉'}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
              <StarDisplay count={starsEarned} color="#ff6b6b" size="2.5rem" animated />
            </div>

            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', direction: 'rtl', marginBottom: '16px' }}>
              <div style={{
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '16px',
                padding: '14px 20px',
                textAlign: 'center',
                color: '#fff',
              }}>
                <div style={{ fontSize: '1.6rem', fontWeight: '900' }}>{totalStars}</div>
                <div style={{ fontSize: '0.85rem', opacity: 0.7 }}>כוכבים</div>
              </div>
              <div style={{
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '16px',
                padding: '14px 20px',
                textAlign: 'center',
                color: '#fff',
              }}>
                <div style={{ fontSize: '1.6rem', fontWeight: '900' }}>{formatTime(elapsed)}</div>
                <div style={{ fontSize: '0.85rem', opacity: 0.7 }}>זמן</div>
              </div>
              <div style={{
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '16px',
                padding: '14px 20px',
                textAlign: 'center',
                color: '#fff',
              }}>
                <div style={{ fontSize: '1.6rem', fontWeight: '900' }}>{TOTAL_STATIONS}</div>
                <div style={{ fontSize: '0.85rem', opacity: 0.7 }}>תחנות</div>
              </div>
            </div>
            
            <div>
              <button style={styles.playAgainBtn} onClick={startGame}>
                🚀 שחק שוב!
              </button>
            </div>
            <div>
              <button style={{ ...styles.playAgainBtn, background: 'rgba(255,255,255,0.15)', color: '#fff', boxShadow: 'none' }} onClick={() => navigate('/')}>
                🏠 חזור לדף הבית
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MathGame;
