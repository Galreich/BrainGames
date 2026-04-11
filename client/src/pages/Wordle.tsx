import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useProgress, useAuth } from '../context';
import { Tile } from '../components';
import { useNavigate } from 'react-router-dom';
import './WordleStyle.css';
import { useTranslation } from 'react-i18next';
import { Emojis } from '../utils/Emojis';
import Instructions from './Instructions';

const WORD_LENGTHS = [4, 5, 6];
const MAX_ATTEMPTS = 6;

type WordleProps = {
  language: 'hebrew' | 'english';
};

const Wordle = ({ language }: WordleProps) => {
  const navigate = useNavigate();
  const { saveProgress } = useProgress();
  const { token, updateUser } = useAuth();
  const { t } = useTranslation();

  const isHebrew = language === 'hebrew';

  const KEYBOARD_ROWS = useMemo(
    () =>
      isHebrew
        ? [
            t('Keyboard_Row_1_HE', { returnObjects: true }) as string[],
            t('Keyboard_Row_2_HE', { returnObjects: true }) as string[],
            t('Keyboard_Row_3_HE', { returnObjects: true }) as string[],
            t('Keyboard_Row_4_HE', { returnObjects: true }) as string[],
          ]
        : [
            t('Keyboard_Row_1_EN', { returnObjects: true }) as string[],
            t('Keyboard_Row_2_EN', { returnObjects: true }) as string[],
            t('Keyboard_Row_3_EN', { returnObjects: true }) as string[],
          ],
    [t, isHebrew],
  );

  const [wordLength, setWordLength] = useState(5);
  const [targetWord, setTargetWord] = useState('');
  const [guesses, setGuesses] = useState(Array(MAX_ATTEMPTS).fill(''));
  const [guessResults, setGuessResults] = useState(
    Array(MAX_ATTEMPTS).fill(null),
  );
  const [currentGuess, setCurrentGuess] = useState('');
  const [currentRow, setCurrentRow] = useState(0);
  const [gameStatus, setGameStatus] = useState('playing'); // 'playing', 'won', 'lost'
  const [keyboardStatus, setKeyboardStatus] = useState<{
    [key: string]: string;
  }>({});
  const [revealingRow, setRevealingRow] = useState(-1);
  const [shakingRow, setShakingRow] = useState(-1);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const showMessage = useCallback((msg: string, duration = 2500) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), duration);
  }, []);

  const fetchWord = useCallback(
    async (len: number) => {
      setLoading(true);
      try {
        const response = await fetch(`/api/words/${language}?length=${len}`);
        if (response.ok) {
          const data = await response.json();
          setTargetWord(isHebrew ? data.word : data.word.toUpperCase());
        } else {
          const suffix = isHebrew ? 'HE' : 'EN';
          const words = t(`Fallback_Words_${suffix}_${len}`, {
            returnObjects: true,
          }) as string[];
          const word = words[Math.floor(Math.random() * words.length)];
          setTargetWord(isHebrew ? word : word.toUpperCase());
        }
      } catch (err) {
        const suffix = isHebrew ? 'HE' : 'EN';
        const words = t(`Fallback_Words_${suffix}_${len}`, {
          returnObjects: true,
        }) as string[];
        const word = words[Math.floor(Math.random() * words.length)];
        setTargetWord(isHebrew ? word : word.toUpperCase());
      } finally {
        setLoading(false);
      }
    },
    [language, isHebrew, t],
  );

  const startNewGame = useCallback(
    async (len?: number) => {
      const length = len ?? wordLength;
      setGuesses(Array(MAX_ATTEMPTS).fill(''));
      setGuessResults(Array(MAX_ATTEMPTS).fill(null));
      setCurrentGuess('');
      setCurrentRow(0);
      setGameStatus('playing');
      setKeyboardStatus({});
      setRevealingRow(-1);
      setShakingRow(-1);
      setMessage('');
      await fetchWord(length);
    },
    [wordLength, fetchWord],
  );

  // Restart game immediately if language changes
  useEffect(() => {
    startNewGame(wordLength);
  }, [language]); // eslint-disable-line

  const evaluateGuess = (guess: string, target: string | null) => {
    if (!target) return [];
    const result = Array(target.length).fill('absent');
    const targetArr: (string | null)[] = target.split('');
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
      showMessage(t('Word_length_must_be', { length: wordLength }));
      setShakingRow(currentRow);
      setTimeout(() => setShakingRow(-1), 600);
      return;
    }

    if (gameStatus !== 'playing') return;

    try {
      const res = await fetch(
        `/api/words/${language}/validate?word=${encodeURIComponent(currentGuess)}`,
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
    } catch {
      /* offline fallback */
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
        if (result[i] === 'correct') newKeyboard[letter] = 'correct';
        else if (result[i] === 'present' && current !== 'correct')
          newKeyboard[letter] = 'present';
        else if (!current) newKeyboard[letter] = 'absent';
      }
    });
    setKeyboardStatus(newKeyboard);

    const won = result.every((r) => r === 'correct');
    const nextRow = currentRow + 1;

    if (won || nextRow >= MAX_ATTEMPTS) {
      const stars = won ? 1 : 0;
      setTimeout(
        () => {
          setGameStatus(won ? 'won' : 'lost');
          if (won)
            showMessage(`${t('Well_done_You_won')} ${Emojis.Party}`, 5000);
          else showMessage(`${t('The_word_was', { word: targetWord })}`, 6000);

          if (token) {
            fetch('/api/game-records', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                game: `${language}-wordle`,
                stars,
                score: won ? currentRow + 1 : MAX_ATTEMPTS,
              }),
            })
              .then((r) => r.json())
              .then((d) => {
                updateUser({
                  red_stars: d.red_stars,
                  blue_stars: d.blue_stars,
                  green_stars: d.green_stars,
                });
                saveProgress();
              })
              .catch(() => {});
          }
        },
        wordLength * 300 + 400,
      );
    }

    setCurrentRow(nextRow);
    setCurrentGuess('');
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
    language,
    t,
  ]);

  const handleKeyPress = useCallback(
    (key: string) => {
      if (gameStatus !== 'playing') return;

      if (key === Emojis.Backspace || key === 'Backspace' || key === '⌫') {
        setCurrentGuess((prev) => prev.slice(0, -1));
      } else if (
        key === t('Enter_Symbol_HE') ||
        key === 'Enter' ||
        key === 'ENTER'
      ) {
        submitGuess();
      } else if (currentGuess.length < wordLength) {
        if (isHebrew) {
          if (t('Hebrew_Letters_String').includes(key))
            setCurrentGuess((prev) => prev + key);
        } else {
          if (/^[a-zA-Z]$/.test(key))
            setCurrentGuess((prev) => prev + key.toUpperCase());
        }
      }
    },
    [gameStatus, currentGuess, wordLength, submitGuess, isHebrew, t],
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Backspace' || e.key === 'Enter') handleKeyPress(e.key);
      else if (isHebrew && t('Hebrew_Letters_String').includes(e.key))
        handleKeyPress(e.key);
      else if (!isHebrew && /^[a-zA-Z]$/i.test(e.key))
        handleKeyPress(e.key.toUpperCase());
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyPress, isHebrew, t]);

  if (loading) {
    return (
      <div className={`wordle-page ${language}`}>
        <div className='wordle-loading'>
          <div className='spinner'>{Emojis.Hourglass}</div>
          <div>{t('Loading_word')}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`wordle-page ${language}`}>
      {/* Floating Instructions - Placed top right via CSS */}
      {gameStatus === 'playing' && <Instructions />}

      {message && <div className='wordle-message'>{message}</div>}

      <div className='wordle-container'>
        <div className='wordle-header'>
          <h1 className='wordle-title'>
            {isHebrew ? t('Hebrew_Wordle') : t('English_Wordle_Title')}
          </h1>
          <p className='wordle-subtitle'>{t('Guess_the_secret_word')}</p>
        </div>

        <div className='length-selector'>
          {WORD_LENGTHS.map((len) => (
            <button
              key={len}
              className={`length-btn ${wordLength === len ? 'active' : ''}`}
              onClick={() => {
                setWordLength(len);
                startNewGame(len);
              }}
            >
              {t('Letters_Count', { count: len })}
            </button>
          ))}
        </div>

        <div className='wordle-board'>
          {Array.from({ length: MAX_ATTEMPTS }, (_, rowIdx) => {
            const guess =
              rowIdx === currentRow ? currentGuess : guesses[rowIdx];
            const result = guessResults[rowIdx];
            return (
              <div
                key={rowIdx}
                className={`row ${shakingRow === rowIdx ? 'shake' : ''}`}
              >
                {Array.from({ length: wordLength }, (_, colIdx) => (
                  <Tile
                    key={colIdx}
                    letter={guess ? guess[colIdx] || '' : ''}
                    status={result ? result[colIdx] : null}
                    isRevealing={revealingRow === rowIdx && !!result}
                    revealIndex={colIdx}
                  />
                ))}
              </div>
            );
          })}
        </div>

        {gameStatus !== 'playing' && (
          <div className='game-over-panel'>
            <div className='game-over-title'>
              {gameStatus === 'won'
                ? `${Emojis.Party} ${t('Well_done_Title')}`
                : `${Emojis.Sad} ${t('Try_Again_Title')}`}
            </div>
            <p className='game-over-text'>
              {gameStatus === 'won'
                ? t('Guessed_in_tries', {
                    count: currentRow + (currentGuess ? 1 : 0),
                  })
                : t('The_word_was', { word: '' })}
              {gameStatus === 'lost' && (
                <strong className='failed-word'> {targetWord}</strong>
              )}
            </p>
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

        <div className='keyboard'>
          {KEYBOARD_ROWS.map((row, rowIdx) => (
            <div key={rowIdx} className='keyboard-row'>
              {row.map((key) => (
                <button
                  key={key}
                  className={`key ${keyboardStatus[key] || ''} ${key === Emojis.Backspace || key === t('Enter_Symbol_HE') || key === 'ENTER' ? 'special' : ''}`}
                  onClick={() => handleKeyPress(key)}
                  disabled={gameStatus !== 'playing'}
                >
                  {key}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Wordle;
