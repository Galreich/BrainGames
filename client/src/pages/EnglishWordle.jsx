import React, { useState, useEffect, useCallback } from 'react';
import { useProgress } from '../context/ProgressContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// QWERTY keyboard layout
const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '⌫'],
];

const WORD_LENGTHS = [4, 5, 6];

// Fallback word lists
const FALLBACK_WORDS = {
  4: ['cats', 'dogs', 'runs', 'hats', 'suns', 'cars', 'tree', 'book', 'fish', 'bird'],
  5: ['happy', 'sunny', 'dance', 'music', 'water', 'earth', 'apple', 'candy', 'funny', 'horse'],
  6: ['school', 'friend', 'garden', 'orange', 'purple', 'rabbit', 'simple', 'summer', 'winter', 'yellow'],
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
    userSelect: 'none',
    boxShadow: revealed && status === 'correct' ? '0 0 12px rgba(106,170,100,0.5)' : 'none',
  };

  return <div style={tileStyle}>{letter}</div>;
};

const EnglishWordle = () => {
  const navigate = useNavigate();
  const { saveProgress } = useProgress();
  const { token, updateUser } = useAuth();
  const [wordLength, setWordLength] = useState(5);
  const [targetWord, setTargetWord] = useState('');
  const [guesses, setGuesses] = useState(Array(MAX_ATTEMPTS).fill(''));
  const [guessResults, setGuessResults] = useState(Array(MAX_ATTEMPTS).fill(null));
  const [currentGuess, setCurrentGuess] = useState('');
  const [currentRow, setCurrentRow] = useState(0);
  const [gameStatus, setGameStatus] = useState('playing');
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
      const response = await fetch(`/api/words/english?length=${len}`);
      if (response.ok) {
        const data = await response.json();
        setTargetWord(data.word.toUpperCase());
      } else {
        const words = FALLBACK_WORDS[len];
        setTargetWord(words[Math.floor(Math.random() * words.length)].toUpperCase());
      }
    } catch (err) {
      const words = FALLBACK_WORDS[len];
      setTargetWord(words[Math.floor(Math.random() * words.length)].toUpperCase());
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

    guessArr.forEach((letter, i) => {
      if (letter === targetArr[i]) {
        result[i] = 'correct';
        targetArr[i] = null;
      }
    });

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
      showMessage(`Word must be ${wordLength} letters!`);
      setShakingRow(currentRow);
      setTimeout(() => setShakingRow(-1), 600);
      return;
    }

    if (gameStatus !== 'playing') return;

    // Validate word exists in the list
    try {
      const res = await fetch(`/api/words/english/validate?word=${encodeURIComponent(currentGuess)}`);
      if (res.ok) {
        const data = await res.json();
        if (!data.isValid) {
          showMessage('Not in word list 📖');
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

    setRevealingRow(currentRow);
    setTimeout(() => setRevealingRow(-1), wordLength * 300 + 300);

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
        showMessage('Amazing! You won! 🎉', 5000);
        saveProgress('english', stars);
        if (token) fetch('/api/game-records', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ game: 'english-wordle', subject: 'english', stars, score: currentRow + 1 }) }).then(r => r.json()).then(d => updateUser({ red_stars: d.red_stars, blue_stars: d.blue_stars, green_stars: d.green_stars })).catch(() => {});
      }, wordLength * 300 + 400);
    } else if (nextRow >= MAX_ATTEMPTS) {
      setTimeout(() => {
        setGameStatus('lost');
        showMessage(`The word was: ${targetWord}`, 6000);
        saveProgress('english', 0);
        if (token) fetch('/api/game-records', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ game: 'english-wordle', subject: 'english', stars: 0, score: MAX_ATTEMPTS }) }).then(r => r.json()).then(d => updateUser({ red_stars: d.red_stars, blue_stars: d.blue_stars, green_stars: d.green_stars })).catch(() => {});
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
    } else if (key === 'ENTER' || key === 'Enter') {
      submitGuess();
    } else if (currentGuess.length < wordLength) {
      if (/^[A-Z]$/.test(key)) {
        setCurrentGuess((prev) => prev + key);
      }
    }
  }, [gameStatus, currentGuess, wordLength, submitGuess]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toUpperCase();
      if (e.key === 'Backspace') handleKeyPress('⌫');
      else if (e.key === 'Enter') handleKeyPress('ENTER');
      else if (/^[A-Z]$/i.test(e.key)) handleKeyPress(key);
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
      background: 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)',
      padding: '20px',
      direction: 'ltr',
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
      fontWeight: '900',
      textAlign: 'center',
      textShadow: '0 2px 10px rgba(0,0,0,0.3)',
    },
    subtitle: {
      color: 'rgba(255,255,255,0.75)',
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
      background: active ? '#55efc4' : 'transparent',
      color: active ? '#134e5e' : '#fff',
      fontWeight: '800',
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
    },
    row: (isShaking) => ({
      display: 'flex',
      gap: '6px',
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
      gap: '5px',
      justifyContent: 'center',
    },
    key: (status, isSpecial) => ({
      padding: '14px 0',
      width: isSpecial ? '65px' : '38px',
      borderRadius: '8px',
      border: 'none',
      background: getKeyColor(status),
      color: status && status !== 'default' ? '#fff' : '#333',
      fontWeight: '800',
      fontSize: isSpecial ? '0.7rem' : '0.95rem',
      cursor: 'pointer',
      transition: 'all 0.2s',
      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
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
      background: 'linear-gradient(135deg, #55efc4, #00b894)',
      color: '#fff',
      border: 'none',
      borderRadius: '50px',
      padding: '14px 36px',
      fontSize: '1.2rem',
      fontWeight: '900',
      cursor: 'pointer',
      marginTop: '16px',
      boxShadow: '0 6px 20px rgba(0,184,148,0.4)',
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
          <div style={{ marginTop: '16px' }}>Loading word...</div>
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
          <h1 style={styles.title}>Wordle English</h1>
          <p style={styles.subtitle}>Guess the secret word!</p>
        </div>

        {/* Word Length Selector */}
        <div style={styles.lengthSelector}>
          {WORD_LENGTHS.map((len) => (
            <button
              key={len}
              style={styles.lengthBtn(wordLength === len)}
              onClick={() => handleWordLengthChange(len)}
            >
              {len} letters
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
                <div style={styles.gameOverTitle}>🎉 Amazing!</div>
                <p style={{ color: 'rgba(255,255,255,0.9)', marginBottom: '12px' }}>
                  You guessed it in {currentRow + 1} {currentRow + 1 === 1 ? 'try' : 'tries'}!
                </p>
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
                  The word was: <strong style={{ color: '#55efc4' }}>{targetWord}</strong>
                </p>
              </>
            ) : (
              <>
                <div style={styles.gameOverTitle}>😞 Try Again!</div>
                <p style={{ color: 'rgba(255,255,255,0.9)', marginBottom: '8px' }}>
                  The word was: <strong style={{ color: '#ff7675', fontSize: '1.3rem' }}>{targetWord}</strong>
                </p>
              </>
            )}
            <div>
              <button style={styles.newGameBtn} onClick={() => startNewGame()}>
                New Game 🔄
              </button>
            </div>
            <div>
                <button style={{ ...styles.newGameBtn, background: 'rgba(255,255,255,0.15)', color: '#fff', boxShadow: 'none' }} onClick={() => navigate('/')}>
                  🏠 Go Home
                </button>
            </div>
          </div>
        )}

        {/* Keyboard */}
        <div style={styles.keyboard}>
          {KEYBOARD_ROWS.map((row, rowIdx) => (
            <div key={rowIdx} style={styles.keyboardRow}>
              {row.map((key) => {
                const isSpecial = key === '⌫' || key === 'ENTER';
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
          }}>
            <h3 style={{ color: '#fff', marginBottom: '10px', fontSize: '1rem' }}>How to play:</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { color: '#6aaa64', text: 'Letter is in the correct spot' },
                { color: '#c9b458', text: 'Letter is in the word but wrong spot' },
                { color: '#787c7e', text: 'Letter is not in the word' },
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

export default EnglishWordle;
