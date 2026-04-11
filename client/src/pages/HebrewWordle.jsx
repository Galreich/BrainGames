import React, { useState, useEffect, useCallback } from 'react';
import { useProgress, useAuth } from '../context';
import { Tile } from '../components';
import { useNavigate } from 'react-router-dom';
import './HebrewWordleStyle.css';

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

const Tile = ({ letter, status, isRevealing, revealIndex }) => {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (isRevealing) {
      // Animation is handled by CSS, but we need to set state for colors
      const timer = setTimeout(() => setRevealed(true), revealIndex * 300 + 300);
      return () => clearTimeout(timer);
    } else if (status && status !== 'empty') {
      setRevealed(true);
    } else {
      setRevealed(false);
    }
  }, [isRevealing, status, revealIndex, setRevealed]);

  const classes = [
    'tile',
    status && (isRevealing || revealed) ? status : '',
    letter && !status ? 'has-letter' : '',
    isRevealing ? 'is-revealing' : ''
  ].filter(Boolean).join(' ');

  return <div className={classes} style={{'--reveal-index': revealIndex}}>{letter}</div>;
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

  if (loading) {
    return (
      <div className="wordle-page hebrew">
        <div className="wordle-loading">
          <div className="spinner">⏳</div>
          <div>טוען מילה...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="wordle-page hebrew">
      {message && <div className="wordle-message">{message}</div>}

      <div className="wordle-container">
        {/* Header */}
        <div className="wordle-header">
          <h1 className="wordle-title"> וורדעל עברית</h1>
          <p className="wordle-subtitle">נחש את המילה הסודית!</p>
        </div>

        {/* Word Length Selector */}
        <div className="length-selector">
          {WORD_LENGTHS.map((len) => (
            <button
              key={len}
              className={`length-btn ${wordLength === len ? 'active' : ''}`}
              onClick={() => handleWordLengthChange(len)}
            >
              {len} אותיות
            </button>
          ))}
        </div>

        {/* Game Board */}
        <div className="wordle-board">
          {Array.from({ length: MAX_ATTEMPTS }, (_, rowIdx) => {
            const guess = rowIdx === currentRow ? currentGuess : guesses[rowIdx];
            const result = guessResults[rowIdx];
            const isShaking = shakingRow === rowIdx;
            const isRevealing = revealingRow === rowIdx;

            return (
              <div key={rowIdx} className={`row ${isShaking ? 'shake' : ''}`}>
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
          <div className="game-over-panel">
            {gameStatus === 'won' ? (
              <>
                <div className="game-over-title">🎉 כל הכבוד!</div>
                <p className="game-over-text">
                  ניחשת נכון תוך {currentRow + 1} ניסיונות!
                </p>
                <p className="game-over-subtext">
                  המילה הייתה: <strong className="correct-word">{targetWord}</strong>
                </p>
              </>
            ) : (
              <>
                <div className="game-over-title">😞 נסה שוב!</div>
                <p className="game-over-text">
                  המילה הייתה: <strong className="failed-word">{targetWord}</strong>
                </p>
              </>
            )}
            <div className="game-over-buttons">
              <button className="new-game-btn" onClick={() => startNewGame()}>
                משחק חדש 🔄
              </button>
              <button className="new-game-btn secondary" onClick={() => navigate('/')}>
                🏠 חזור לדף הבית
              </button>
            </div>
          </div>
        )}

        {/* Keyboard */}
        <div className="keyboard">
          {KEYBOARD_ROWS.map((row, rowIdx) => (
            <div key={rowIdx} className="keyboard-row">
              {row.map((key) => {
                const isSpecial = key === '⌫' || key === 'אישור';
                const status = keyboardStatus[key];
                return (
                  <button
                    key={key}
                    className={`key ${status || ''} ${isSpecial ? 'special' : ''}`}
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
          <div className="instructions-panel">
            <h3 className="instructions-title">איך משחקים:</h3>
            <div className="instructions-list">
              {[
                { type: 'correct', text: 'האות במקום הנכון' },
                { type: 'present', text: 'האות קיימת אך במקום הלא נכון' },
                { type: 'absent', text: 'האות לא קיימת במילה' },
              ].map((item) => (
                <div key={item.type} className="instruction-item">
                  <div className={`instruction-tile ${item.type}`} />
                  <span className="instruction-text">{item.text}</span>
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
