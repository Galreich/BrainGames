import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProgress, useAuth } from '../context';
import { StarBurst, BackgroundStar } from '../components';
import './MathGameStyle.css';
import { useTranslation } from 'react-i18next';
import { Emojis } from '../utils/Emojis';
import { apiUrl } from '../utils/api';
import MathGameMenu from './MathGameMenu';
import MathGamePlaying from './MathGamePlaying';
import MathGameOver from './MathGameOver';

const TOTAL_STATIONS = 10;

type Question = {
  text: string;
  a: number;
  b: number;
  op: string;
  answer: number;
  options: number[];
};

const generateQuestion = (station: number): Question => {
  let a: number, b: number, op: string, answer: number;

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
  const wrongAnswers = new Set<number>();
  while (wrongAnswers.size < 3) {
    const wrong: number = answer + Math.floor(Math.random() * 11) - 5;
    if (wrong !== answer && wrong >= 0) wrongAnswers.add(wrong);
  }

  const options = [answer, ...Array.from(wrongAnswers)].sort(
    () => Math.random() - 0.5,
  );

  return { text: `${a} ${op} ${b} = ?`, a, b, op, answer, options };
};

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const MathGame = () => {
  const navigate = useNavigate();
  const { saveProgress } = useProgress();
  const { token, updateUser } = useAuth();
  const { t } = useTranslation();
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover'>('menu');
  const [station, setStation] = useState(1);
  const [question, setQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answerStatus, setAnswerStatus] = useState<'correct' | 'wrong' | null>(null);
  const [totalAnswers, settotalAnswers] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [message, setMessage] = useState('');
  const [starBursts, setStarBursts] = useState<{ id: number; x: number; y: number }[]>([]);
  const [animatingRocket, setAnimatingRocket] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const showMessage = (msg: string, duration = 2000) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), duration);
  };

  const nextQuestion = useCallback((currentStation: number) => {
    setQuestion(generateQuestion(currentStation));
    setSelectedAnswer(null);
    setAnswerStatus(null);
  }, []);

  const startGame = () => {
    setGameState('playing');
    setStation(1);
    settotalAnswers(0);
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
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState]);

  const addStarBurst = () => {
    const id = Date.now();
    const x = Math.random() * (window.innerWidth - 100) + 50;
    const y = Math.random() * (window.innerHeight / 2) + 100;
    setStarBursts((prev) => [...prev, { id, x, y }]);
    setTimeout(
      () => setStarBursts((prev) => prev.filter((s) => s.id !== id)),
      1200,
    );
  };

  const handleAnswer = useCallback(
    (answer: number) => {
      if (answerStatus || gameState !== 'playing' || !question) return;

      setSelectedAnswer(answer);

      if (answer === question.answer) {
        setAnswerStatus('correct');
        const starsForQuestion = mistakes === 0 ? 1 : 0;
        if (starsForQuestion) {
          addStarBurst();
          addStarBurst();
        }
        settotalAnswers((prev) => prev + starsForQuestion);
        showMessage(`${t('Correct_Cheer')} ${Emojis.Party}`);

        setAnimatingRocket(true);
        setTimeout(() => setAnimatingRocket(false), 800);

        setTimeout(() => {
          const nextStation = station + 1;
          if (nextStation > TOTAL_STATIONS) {
            // Game complete!
            const finalCorrect = totalAnswers + starsForQuestion;
            const earned =
              finalCorrect >= Math.ceil(TOTAL_STATIONS / 2) ? 1 : 0;
            setGameState('gameover');
            if (token)
              fetch(apiUrl('/api/game-records'), {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  game: 'math-puzzle',
                  stars: earned,
                  score: finalCorrect,
                }),
              })
                .then((r) => (r.ok ? r.json() : null))
                .then((d) => {
                  if (d) {
                    updateUser({
                      red_stars: d.red_stars,
                      blue_stars: d.blue_stars,
                      green_stars: d.green_stars,
                    });
                    saveProgress();
                  }
                })
                .catch(() => {});
          } else {
            setStation(nextStation);
            setMistakes(0);
            nextQuestion(nextStation);
          }
        }, 1200);
      } else {
        setAnswerStatus('wrong');
        showMessage(`${t('Wrong_Continue')} ${Emojis.Flex}`);
        setTimeout(() => {
          const nextStation = station + 1;
          if (nextStation > TOTAL_STATIONS) {
            const earned =
              totalAnswers >= Math.ceil(TOTAL_STATIONS / 2) ? 1 : 0;
            setGameState('gameover');
            if (token)
              fetch(apiUrl('/api/game-records'), {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  game: 'math-puzzle',
                  stars: earned,
                  score: totalAnswers,
                }),
              })
                .then((r) => (r.ok ? r.json() : null))
                .then((d) => {
                  if (d) {
                    updateUser({
                      red_stars: d.red_stars,
                      blue_stars: d.blue_stars,
                      green_stars: d.green_stars,
                    });
                    saveProgress();
                  }
                })
                .catch(() => {});
          } else {
            setStation(nextStation);
            setMistakes(0);
            nextQuestion(nextStation);
          }
          setSelectedAnswer(null);
          setAnswerStatus(null);
        }, 1200);
      }
    },
    [
      answerStatus,
      gameState,
      question,
      station,
      totalAnswers,
      mistakes,
      nextQuestion,
      saveProgress,
      token,
      updateUser,
      t,
    ],
  );

  const progress = station > 1 ? ((station - 1) / TOTAL_STATIONS) * 100 : 0;

  return (
    <div className='math-game-page'>
      {/* Background stars */}
      {Array.from({ length: 30 }, (_, i) => (
        <BackgroundStar key={i} index={i} />
      ))}

      {/* Star bursts */}
      {starBursts.map((s) => (
        <StarBurst key={s.id} x={s.x} y={s.y} id={s.id} />
      ))}

      {message && <div className='math-game-message'>{message}</div>}

      <div className='math-game-container'>
        <h1 className='game-title'>{t('Math_Title')}</h1>

        {/* MENU */}
        {gameState === 'menu' && (
          <MathGameMenu startGame={startGame} navigate={navigate} />
        )}

        {/* PLAYING */}
        {gameState === 'playing' && question && (
          <MathGamePlaying
            station={station}
            totalStations={TOTAL_STATIONS}
            totalAnswers={totalAnswers}
            formattedTime={formatTime(elapsed)}
            progress={progress}
            question={question}
            selectedAnswer={selectedAnswer}
            answerStatus={answerStatus}
            handleAnswer={handleAnswer}
          />
        )}

        {/* GAME OVER */}
        {gameState === 'gameover' && (
          <MathGameOver
            totalAnswers={totalAnswers}
            totalStations={TOTAL_STATIONS}
            formattedTime={formatTime(elapsed)}
            startGame={startGame}
            navigate={navigate}
          />
        )}
      </div>
    </div>
  );
};

export default MathGame;
