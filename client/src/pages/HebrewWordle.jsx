import React, { useState, useEffect, useCallback } from 'react';
import { useProgress, useAuth } from '../context';
import { Tile } from '../components';
import { useNavigate } from 'react-router-dom';
import './HebrewWordleStyle.css';
import { useTranslation } from 'react-i18next';
import { Emojis } from '../utils/Emojis';

const WORD_LENGTHS = [4, 5, 6];

const MAX_ATTEMPTS = 6;

const HebrewWordle = () => {
  const navigate = useNavigate();
  const { saveProgress } = useProgress();
  const { token, updateUser } = useAuth();
  const { t } = useTranslation();

  const KEYBOARD_ROWS = [
    t('Keyboard_Row_1_HE', { returnObjects: true }),
    t('Keyboard_Row_2_HE', { returnObjects: true }),
    t('Keyboard_Row_3_HE', { returnObjects: true }),
    t('Keyboard_Row_4_HE', { returnObjects: true }),
  ];

  const fallbackWordsHe = {
    4: t('Fallback_Words_HE_4', { returnObjects: true }),
    5: t('Fallback_Words_HE_5', { returnObjects: true }),
    6: t('Fallback_Words_HE_6', { returnObjects: true }),
  };

  const [wordLength, setWordLength] = useState(5);
  const [targetWord, setTargetWord] = useState('');
  const [guesses, setGuesses] = useState(Array(MAX_ATTEMPTS).fill(''));
  const [guessResults, setGuessResults] = useState(
    Array(MAX_ATTEMPTS).fill(null),
  );
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
        const words = fallbackWordsHe[len];
        setTargetWord(words[Math.floor(Math.random() * words.length)]);
      }
    } catch (err) {
      const words = fallbackWordsHe[len];
      setTargetWord(words[Math.floor(Math.random() * words.length)]);
    } finally {
      setLoading(false);
    }
  }, []);

  const startNewGame = useCallback(
    async (len) => {
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
    },
    [wordLength, fetchWord],
  );

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
      showMessage(t('Word_length_must_be', { length: wordLength }));
      setShakingRow(currentRow);
      setTimeout(() => setShakingRow(-1), 600);
      return;
    }

    if (gameStatus !== 'playing') return;

    // Validate word exists in the list
    try {
      const res = await fetch(
        `/api/words/hebrew/validate?word=${encodeURIComponent(currentGuess)}`,
      );
      if (res.ok) {
        const data = await res.json();
        if (!data.isValid) {
          showMessage(`${t('Word_not_in_list')} ${Emojis.Book}`);
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
        showMessage(`${t('Well_done_You_won')} ${Emojis.Party}`, 5000);
        if (token)
          fetch('/api/game-records', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ game: 'hebrew-wordle', stars, score: currentRow + 1 }),
          })
            .then((r) => r.json())
            .then((d) => { updateUser({ red_stars: d.red_stars, blue_stars: d.blue_stars, green_stars: d.green_stars }); saveProgress(); })
            .catch(() => {});
      }, wordLength * 300 + 400);
    } else if (nextRow >= MAX_ATTEMPTS) {
      setTimeout(() => {
        setGameStatus('lost');
        showMessage(t('The_word_was', { word: targetWord }), 6000);
        if (token)
          fetch('/api/game-records', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ game: 'hebrew-wordle', stars: 0, score: MAX_ATTEMPTS }),
          })
            .then((r) => r.json())
            .then((d) => { updateUser({ red_stars: d.red_stars, blue_stars: d.blue_stars, green_stars: d.green_stars }); saveProgress(); })
            .catch(() => {});
      }, wordLength * 300 + 400);
    } else {
      setCurrentRow(nextRow);
      setCurrentGuess('');
    }
  }, [
    currentGuess,
    wordLength,
    gameStatus,
    targetWord,
    guesses,
    guessResults,
    currentRow,
    keyboardStatus,
    saveProgress,
    token,
  ]);

  const handleKeyPress = useCallback(
    (key) => {
      if (gameStatus !== 'playing') return;

      if (key === Emojis.Backspace || key === 'Backspace') {
        setCurrentGuess((prev) => prev.slice(0, -1));
      } else if (key === t('Enter_Symbol_HE') || key === 'Enter') {
        submitGuess();
      } else if (currentGuess.length < wordLength) {
        // Hebrew letter
        const hebrewLetters = t('Hebrew_Letters_String');
        if (hebrewLetters.includes(key)) {
          setCurrentGuess((prev) => prev + key);
        }
      }
    },
    [gameStatus, currentGuess, wordLength, submitGuess],
  );

  // Physical keyboard support (Hebrew layout keys)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Backspace') handleKeyPress(Emojis.Backspace);
      else if (e.key === 'Enter') handleKeyPress(t('Enter_Symbol_HE'));
      else {
        const hebrewLetters = t('Hebrew_Letters_String');
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
      <div className='wordle-page hebrew'>
        <div className='wordle-loading'>
          <div className='spinner'>{Emojis.Hourglass}</div>
          <div>{t('Loading_word')}</div>
        </div>
      </div>
    );
  }

  return (
    <div className='wordle-page hebrew'>
      {message && <div className='wordle-message'>{message}</div>}

      <div className='wordle-container'>
        {/* Header */}
        <div className='wordle-header'>
          <h1 className='wordle-title'>{t('Hebrew_Wordle_Title')}</h1>
          <p className='wordle-subtitle'>{t('Guess_the_secret_word')}</p>
        </div>

        {/* Word Length Selector */}
        <div className='length-selector'>
          {WORD_LENGTHS.map((len) => (
            <button
              key={len}
              className={`length-btn ${wordLength === len ? 'active' : ''}`}
              onClick={() => handleWordLengthChange(len)}
            >
              {t('Letters_Count', { count: len })}
            </button>
          ))}
        </div>

        {/* Game Board */}
        <div className='wordle-board'>
          {Array.from({ length: MAX_ATTEMPTS }, (_, rowIdx) => {
            const guess =
              rowIdx === currentRow ? currentGuess : guesses[rowIdx];
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
          <div className='game-over-panel'>
            {gameStatus === 'won' ? (
              <>
                <div className='game-over-title'>
                  {Emojis.Party} {t('Well_done_Title')}
                </div>
                <p className='game-over-text'>
                  {t('Guessed_in_tries', { count: currentRow + 1 })}
                </p>
                <p className='game-over-subtext'>
                  {t('The_word_was', { word: '' })}{' '}
                  <strong className='correct-word'>{targetWord}</strong>
                </p>
              </>
            ) : (
              <>
                <div className='game-over-title'>
                  {Emojis.Sad} {t('Try_Again_Title')}
                </div>
                <p className='game-over-text'>
                  {t('The_word_was', { word: '' })}{' '}
                  <strong className='failed-word'>{targetWord}</strong>
                </p>
              </>
            )}
            <div className='game-over-buttons'>
              <button className='new-game-btn' onClick={() => startNewGame()}>
                {t('New_Game')} {Emojis.Refresh}
              </button>
              <button
                className='new-game-btn secondary'
                onClick={() => navigate('/')}
              >
                {Emojis.House} {t('Back_to_Home')}
              </button>
            </div>
          </div>
        )}

        {/* Keyboard */}
        <div className='keyboard'>
          {KEYBOARD_ROWS.map((row, rowIdx) => (
            <div key={rowIdx} className='keyboard-row'>
              {row.map((key) => {
                const isSpecial =
                  key === Emojis.Backspace || key === t('Enter_Symbol_HE');
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
          <div className='instructions-panel'>
            <h3 className='instructions-title'>{t('How_to_play')}</h3>
            <div className='instructions-list'>
              {[
                { type: 'correct', text: t('Letter_in_correct_spot') },
                { type: 'present', text: t('Letter_in_wrong_spot') },
                { type: 'absent', text: t('Letter_not_in_word') },
              ].map((item) => (
                <div key={item.type} className='instruction-item'>
                  <div className={`instruction-tile ${item.type}`} />
                  <span className='instruction-text'>{item.text}</span>
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
