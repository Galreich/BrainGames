import React, { useState, useEffect, useCallback } from 'react';
import { useProgress } from '../context/ProgressContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// Hebrew keyboard layout
const KEYBOARD_ROWS = [
  ['פ', 'ו', 'ט', 'א', 'ר', 'ק'],
  ['ל', 'ח', 'י', 'כ', 'ע', 'נ', 'מ', 'צ'],
  ['ת', 'ש', 'ד', 'ג', 'ז', 'ס', 'ב', 'ה'],
  ['ן', 'ף', 'ך', 'ם', 'ץ', '⌫', 'אישור'],
];

const WORD_LENGTHS = [4, 5, 6];

// Fallback word lists for offline/demo mode
const FALLBACK_WORDS = {
  4: ['שלום', 'ילדה', 'כיתה', 'מורה', 'חברה', 'אהבה', 'כדור', 'שמחה', 'לילה', 'תפוח'],
  5: ['ילדים', 'חברים', 'ציפור', 'לימוד', 'שיעור', 'חשבון', 'משפחה', 'ספריה', 'תותים', 'שמחים'],
  6: ['מחברות', 'ספריות', 'חגיגות', 'פרפרים', 'חתולות', 'שעונים', 'מנורות', 'כדורים', 'מזלגות', 'שמחות'],
};

const MAX_ATTEMPTS = 6;

const getTileColor = (status) => {
  switch (status) {
    case 'correct': return { bg: '#6aaa64', border: '#6aaa64', color: '#fff' };
    case 'present': return { bg: '#c9b458', border: '#c9b458', color: '#fff' };
    case 'absent': return { bg: '#787c7e', border: '#787c7e', color: '#fff' };
    default: return { bg: '#fff', border: '#d3d6da', color: '#333' };
  }
};

const getKeyColor = (status) => {
  switch (status) {
    case 'correct': return '#6aaa64';
    case 'present': return '#c9b458';
    case 'absent': return '#787c7e';
    default: return '#e8eaed';
  }
};

const Tile = ({ letter, status, isRevealing, revealIndex }) => {
  const colors = getTileColor(status);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (isRevealing) {
      const timer = setTimeout(() => setRevealed(true), revealIndex * 300);
      return () => clearTimeout(timer);
    } else if (status && status !== 'empty') {
      setRevealed(true);
    } else {
      setRevealed(false);
    }
  }, [isRevealing, status, revealIndex]);

  const tileStyle = {
    width: '56px',
    height: '56px',
    border: `2px solid ${revealed && status ? colors.border : letter ? '#999' : colors.border}`,
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.6rem',
    fontWeight: '900',
    background: revealed && status ? colors.bg : colors.bg,
    color: revealed && status ? colors.color : colors.color,
    transition: 'all 0.1s',
    transform: letter && !status ? 'scale(1.05)' : 'scale(1)',
    animation: isRevealing && revealed ? `flip 0.6s ease ${revealIndex * 0.3}s` : 'none',
    userSelect: 'none',
    boxShadow: revealed && status === 'correct' ? '0 0 12px rgba(106,170,100,0.5)' : 'none',
  };

  return <div style={tileStyle}>{letter}</div>;
};

const HebrewWordle = () => {
  const navigate = useNavigate();
  const { saveProgress } = useProgress();
  const { token, updateUser } = useAuth();
  const [wordLength, setWordLength] = useState(5);
  const [targetWord, setTargetWord] = useState('');
  const [guesses, setGuesses] = useState(Array(MAX_ATTEMPTS).fill(''));
  const [guessResults, setGuessResults] = useState(Array(MAX_ATTEMPTS).fill(null));
  const [currentGuess, setCurrentGuess] = useState('');
  const [currentRow, setCurrentRow] = useState(0);
  const [gameStatus, setGameStatus] = useState('playing'); // 'playing', 'won', 'lost'
  const [keyboardStatus, setKeyboardStatus] = useState({});
  const [revealingRow, setRevealingRow] = useState(-1);
  const [shakingRow, setShakingRow] = useState(-1);
  const [message, setMessage] = useState('');
  const [starsEarned, setStarsEarned] = useState(0);
  const [loading, setLoading] = useState(true);

  const showMessage = (msg, duration = 2500) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), duration);
  };

  const fetchWord = useCallback(async (len) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/words/hebrew?length=${len}`);
      if (response.ok) {
        const data = await response.json();
        setTargetWord(data.word);
      } else {
        // Fallback
        const words = FALLBACK_WORDS[len];
        setTargetWord(words[Math.floor(Math.random() * words.length)]);
      }
    } catch (err) {
      const words = FALLBACK_WORDS[len];
      setTargetWord(words[Math.floor(Math.random() * words.length)]);
    } finally {
      setLoading(false);
    }
  }, []);

  const startNewGame = useCallback(async (len) => {
    const length = len || wordLength;
    setGuesses(Array(MAX_ATTEMPTS).fill(''));
    setGuessResults(Array(MAX_ATTEMPTS).fill(null));
    setCurrentGuess('');
    setCurrentRow(0);
    setGameStatus('playing');
    setKeyboardStatus({});
    setRevealingRow(-1);
    setShakingRow(-1);
    setMessage('');
    setStarsEarned(0);
    await fetchWord(length);
  }, [wordLength, fetchWord]);

  useEffect(() => {
    startNewGame(5);
  }, []); // eslint-disable-line

  const evaluateGuess = (guess, target) => {
    const result = Array(target.length).fill('absent');
    const targetArr = target.split('');
    const guessArr = guess.split('');

    // First pass: mark correct letters
    guessArr.forEach((letter, i) => {
      if (letter === targetArr[i]) {
        result[i] = 'correct';
        targetArr[i] = null;
      }
    });

    // Second pass: mark present letters
    guessArr.forEach((letter, i) => {
      if (result[i] !== 'correct') {
        const idx = targetArr.indexOf(letter);
        if (idx !== -1) {
          result[i] = 'present';
          targetArr[idx] = null;
        }
      }
    });

    return result;
  };

  const submitGuess = useCallback(async () => {
    if (currentGuess.length !== wordLength) {
      showMessage(`המילה חייבת להיות בת ${wordLength} אותיות`);
      setShakingRow(currentRow);
      setTimeout(() => setShakingRow(-1), 600);
      return;
    }

    if (gameStatus !== 'playing') return;

    // Validate word exists in the list
    try {
      const res = await fetch(`/api/words/hebrew/validate?word=${encodeURIComponent(currentGuess)}`);
      if (res.ok) {
        const data = await res.json();
        if (!data.isValid) {
          showMessage('המילה לא נמצאת ברשימה 📖');
          setShakingRow(currentRow);
          setTimeout(() => setShakingRow(-1), 600);
          return;
        }
      }
      // If server unreachable, allow the guess (offline fallback)
    } catch {
      // offline — allow the guess
    }

    const result = evaluateGuess(currentGuess, targetWord);

    const newGuesses = [...guesses];
    newGuesses[currentRow] = currentGuess;
    setGuesses(newGuesses);

    const newResults = [...guessResults];
    newResults[currentRow] = result;
    setGuessResults(newResults);

    // Start reveal animation
    setRevealingRow(currentRow);
    setTimeout(() => setRevealingRow(-1), wordLength * 300 + 300);

    // Update keyboard status
    const newKeyboard = { ...keyboardStatus };
    currentGuess.split('').forEach((letter, i) => {
      const current = newKeyboard[letter];
      if (current !== 'correct') {
        if (result[i] === 'correct') {
          newKeyboard[letter] = 'correct';
        } else if (result[i] === 'present' && current !== 'correct') {
          newKeyboard[letter] = 'present';
        } else if (!current) {
          newKeyboard[letter] = 'absent';
        }
      }
    });
    setKeyboardStatus(newKeyboard);

    const won = result.every((r) => r === 'correct');
    const nextRow = currentRow + 1;

    if (won) {
      const stars = 1;

      setStarsEarned(stars);
      setTimeout(() => {
        setGameStatus('won');
        showMessage('כל הכבוד! ניצחת! 🎉', 5000);
        saveProgress('hebrew', stars);
        if (token) fetch('/api/game-records', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ game: 'hebrew-wordle', subject: 'hebrew', stars, score: currentRow + 1 }) }).then(r => r.json()).then(d => updateUser({ red_stars: d.red_stars, blue_stars: d.blue_stars, green_stars: d.green_stars })).catch(() => {});
      }, wordLength * 300 + 400);
    } else if (nextRow >= MAX_ATTEMPTS) {
      setTimeout(() => {
        setGameStatus('lost');
        showMessage(`המילה הייתה: ${targetWord}`, 6000);
        saveProgress('hebrew', 0);
        if (token) fetch('/api/game-records', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ game: 'hebrew-wordle', subject: 'hebrew', stars: 0, score: MAX_ATTEMPTS }) }).then(r => r.json()).then(d => updateUser({ red_stars: d.red_stars, blue_stars: d.blue_stars, green_stars: d.green_stars })).catch(() => {});
      }, wordLength * 300 + 400);
    } else {
      setCurrentRow(nextRow);
      setCurrentGuess('');
    }
  }, [currentGuess, wordLength, gameStatus, targetWord, guesses, guessResults, currentRow, keyboardStatus, saveProgress, token]);

  const handleKeyPress = useCallback((key) => {
    if (gameStatus !== 'playing') return;

    if (key === '⌫' || key === 'Backspace') {
      setCurrentGuess((prev) => prev.slice(0, -1));
    } else if (key === 'אישור' || key === 'Enter') {
      submitGuess();
    } else if (currentGuess.length < wordLength) {
      // Hebrew letter
      const hebrewLetters = 'אבגדהוזחטיכלמנסעפצקרשתףךןםץ';
      if (hebrewLetters.includes(key)) {
        setCurrentGuess((prev) => prev + key);
      }
    }
  }, [gameStatus, currentGuess, wordLength, submitGuess]);

  // Physical keyboard support (Hebrew layout keys)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Backspace') handleKeyPress('⌫');
      else if (e.key === 'Enter') handleKeyPress('אישור');
      else {
        const hebrewLetters = 'אבגדהוזחטיכלמנסעפצקרשתףךןםץ';
        if (hebrewLetters.includes(e.key)) {
          handleKeyPress(e.key);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyPress]);

  const handleWordLengthChange = (len) => {
    setWordLength(len);
    startNewGame(len);
  };

  const styles = {
    page: {
      minHeight: 'calc(100vh - 70px)',
      background: 'linear-gradient(135deg, #1e3799 0%, #0a3d62 100%)',
      padding: '20px',
      direction: 'rtl',
    },
    container: {
      maxWidth: '500px',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '20px',
    },
    title: {
      color: '#fff',
      fontSize: '2rem',
      textAlign: 'center',
      textShadow: '0 2px 10px rgba(0,0,0,0.3)',
    },
    subtitle: {
      color: 'rgba(255,255,255,0.7)',
      fontSize: '1rem',
      textAlign: 'center',
    },
    lengthSelector: {
      display: 'flex',
      gap: '10px',
      background: 'rgba(255,255,255,0.1)',
      borderRadius: '50px',
      padding: '6px',
    },
    lengthBtn: (active) => ({
      padding: '8px 20px',
      borderRadius: '50px',
      border: 'none',
      background: active ? '#74b9ff' : 'transparent',
      color: active ? '#1e3799' : '#fff',
      fontSize: '1rem',
      cursor: 'pointer',
      transition: 'all 0.2s',
    }),
    board: {
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
      padding: '16px',
      background: 'rgba(255,255,255,0.08)',
      borderRadius: '16px',
      backdropFilter: 'blur(10px)',
    },
    row: (isShaking) => ({
      display: 'flex',
      gap: '6px',
      direction: 'rtl',
      animation: isShaking ? 'shake 0.5s ease' : 'none',
    }),
    message: {
      position: 'fixed',
      top: '100px',
      left: '50%',
      transform: 'translateX(-50%)',
      background: 'rgba(0,0,0,0.85)',
      color: '#fff',
      padding: '14px 28px',
      borderRadius: '50px',
      fontWeight: '800',
      fontSize: '1.1rem',
      zIndex: 100,
      animation: 'fadeIn 0.3s ease',
      whiteSpace: 'nowrap',
      boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
    },
    keyboard: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      width: '100%',
    },
    keyboardRow: {
      display: 'flex',
      gap: '6px',
      justifyContent: 'center',
    },
    key: (status, isSpecial) => ({
      padding: isSpecial ? '14px 12px' : '14px 0',
      width: isSpecial ? 'auto' : '40px',
      minWidth: isSpecial ? '65px' : '40px',
      borderRadius: '8px',
      border: 'none',
      background: getKeyColor(status),
      color: status && status !== 'default' ? '#fff' : '#333',
      fontSize: isSpecial ? '0.75rem' : '1rem',
      cursor: 'pointer',
      transition: 'all 0.2s',
      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
      direction: 'ltr',
    }),
    gameOver: {
      background: 'rgba(255,255,255,0.15)',
      borderRadius: '20px',
      padding: '24px',
      textAlign: 'center',
      backdropFilter: 'blur(10px)',
      width: '100%',
    },
    gameOverTitle: {
      color: '#fff',
      fontSize: '1.8rem',
      fontWeight: '900',
      marginBottom: '12px',
    },
    newGameBtn: {
      background: 'linear-gradient(135deg, #74b9ff, #0984e3)',
      color: '#fff',
      border: 'none',
      borderRadius: '50px',
      padding: '14px 36px',
      fontSize: '1.2rem',
      cursor: 'pointer',
      marginTop: '16px',
      boxShadow: '0 6px 20px rgba(9,132,227,0.4)',
      transition: 'all 0.2s',
    },
    loading: {
      color: '#fff',
      fontSize: '1.5rem',
      textAlign: 'center',
      padding: '40px',
    },
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loading}>
          <div style={{ animation: 'spin 1s linear infinite', display: 'inline-block', fontSize: '3rem' }}>⏳</div>
          <div style={{ marginTop: '16px' }}>טוען מילה...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {message && <div style={styles.message}>{message}</div>}

      <div style={styles.container}>
        {/* Header */}
        <div style={{ textAlign: 'center' }}>
          <h1 style={styles.title}> וורדעל עברית</h1>
          <p style={styles.subtitle}>נחש את המילה הסודית!</p>
        </div>

        {/* Word Length Selector */}
        <div style={styles.lengthSelector}>
          {WORD_LENGTHS.map((len) => (
            <button
              key={len}
              style={styles.lengthBtn(wordLength === len)}
              onClick={() => handleWordLengthChange(len)}
            >
              {len} אותיות
            </button>
          ))}
        </div>

        {/* Game Board */}
        <div style={styles.board}>
          {Array.from({ length: MAX_ATTEMPTS }, (_, rowIdx) => {
            const guess = rowIdx === currentRow ? currentGuess : guesses[rowIdx];
            const result = guessResults[rowIdx];
            const isShaking = shakingRow === rowIdx;
            const isRevealing = revealingRow === rowIdx;

            return (
              <div key={rowIdx} style={styles.row(isShaking)}>
                {Array.from({ length: wordLength }, (_, colIdx) => {
                  const letter = guess ? guess[colIdx] || '' : '';
                  const status = result ? result[colIdx] : null;
                  const isRevealingThisRow = isRevealing && !!result;

                  return (
                    <Tile
                      key={colIdx}
                      letter={letter}
                      status={status}
                      isRevealing={isRevealingThisRow}
                      revealIndex={colIdx}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Game Over Panel */}
        {gameStatus !== 'playing' && (
          <div style={styles.gameOver}>
            {gameStatus === 'won' ? (
              <>
                <div style={styles.gameOverTitle}>🎉 כל הכבוד!</div>
                <p style={{ color: 'rgba(255,255,255,0.9)', marginBottom: '12px' }}>
                  ניחשת נכון תוך {currentRow + 1} ניסיונות!
                </p>
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
                  המילה הייתה: <strong style={{ color: '#74b9ff' }}>{targetWord}</strong>
                </p>
              </>
            ) : (
              <>
                <div style={styles.gameOverTitle}>😞 נסה שוב!</div>
                <p style={{ color: 'rgba(255,255,255,0.9)', marginBottom: '8px' }}>
                  המילה הייתה: <strong style={{ color: '#ff7675', fontSize: '1.3rem' }}>{targetWord}</strong>
                </p>
              </>
            )}
            <div>
              <button style={styles.newGameBtn} onClick={() => startNewGame()}>
                משחק חדש 🔄
              </button>
            </div>
            <div>
              <button style={{ ...styles.newGameBtn, background: 'rgba(255,255,255,0.15)', color: '#fff', boxShadow: 'none' }} onClick={() => navigate('/')}>
                🏠 חזור לדף הבית
              </button>
            </div>
          </div>
        )}

        {/* Keyboard */}
        <div style={styles.keyboard}>
          {KEYBOARD_ROWS.map((row, rowIdx) => (
            <div key={rowIdx} style={styles.keyboardRow}>
              {row.map((key) => {
                const isSpecial = key === '⌫' || key === 'אישור';
                const status = keyboardStatus[key];
                return (
                  <button
                    key={key}
                    style={styles.key(status, isSpecial)}
                    onClick={() => handleKeyPress(key)}
                    disabled={gameStatus !== 'playing'}
                  >
                    {key}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Instructions */}
        {gameStatus === 'playing' && (
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '16px',
            padding: '16px',
            width: '100%',
            direction: 'rtl',
          }}>
            <h3 style={{ color: '#fff', marginBottom: '10px', fontSize: '1rem' }}>איך משחקים:</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { color: '#6aaa64', text: 'האות במקום הנכון' },
                { color: '#c9b458', text: 'האות קיימת אך במקום הלא נכון' },
                { color: '#787c7e', text: 'האות לא קיימת במילה' },
              ].map((item) => (
                <div key={item.color} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '28px',
                    height: '28px',
                    background: item.color,
                    borderRadius: '6px',
                    flexShrink: 0,
                  }} />
                  <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.9rem' }}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HebrewWordle;
