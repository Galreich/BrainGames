import React, { useEffect, useState } from 'react';
import { useAuth } from '../context';
import { Confetti, GameCard } from '../components';
import './HomeStyle.css';
import { useTranslation } from 'react-i18next';
import { Emojis } from '../utils/Emojis';
import { apiUrl } from '../utils/api';

const Home = () => {
  const { user, token } = useAuth();
  const { t } = useTranslation();
  const [showWelcome, setShowWelcome] = useState(true);

  const [summary, setSummary] = useState({
    'math-puzzle': { stars: 0, games_played: 0 },
    'hebrew-wordle': { stars: 0, games_played: 0 },
    'english-wordle': { stars: 0, games_played: 0 },
  });

  useEffect(() => {
    const timer = setTimeout(() => setShowWelcome(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!token) return;
    fetch(apiUrl('/api/game-records/summary'), {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setSummary(data))
      .catch(() => {});
  }, [token]);

  const totalStars =
    (user?.red_stars || 0) + (user?.blue_stars || 0) + (user?.green_stars || 0);

  return (
    <div className='home-page'>
      <Confetti />
      <div className='home-container'>
        {/* Welcome Banner */}
        {user && showWelcome && (
          <div className='welcome-banner'>
            {t('Welcome_User', { username: user.username })} {Emojis.Party}
          </div>
        )}

        {/* Hero Section */}
        <div className='hero-section'>
          <h1 className='hero-title'>{t('Welcome_to_BrainGames')}</h1>
          <p className='hero-subtitle'>
            {t('Learn_play_and_collect_stars')} {Emojis.Star}
          </p>

          {user && (
            <div className='total-stars-container'>
              <div className='total-stars-badge'>
                {Emojis.Star} {t('Total_Stars')} <strong>{totalStars}</strong>
              </div>
            </div>
          )}

          {!user && (
            <p className='login-prompt'>
              {Emojis.Bulb} {t('Login_to_save_progress')}
            </p>
          )}
        </div>

        {/* Game Cards */}
        <div className='game-grid'>
          <GameCard
            title={t('Math_Title')}
            subtitle={t('Math')}
            image='/math-game.svg'
            description={t('Math_Game_Description')}
            path='/math'
            theme='math'
            stars={summary['math-puzzle']?.stars || 0}
            gamesPlayed={summary['math-puzzle']?.games_played || 0}
            starColor='#ff6b6b'
          />
          <GameCard
            title={t('Hebrew_Wordle').trim()}
            subtitle={t('Language')}
            image='/hebrew-wordle.svg'
            description={t('Hebrew_Wordle_Description')}
            path='/hebrew-wordle'
            theme='hebrew'
            stars={summary['hebrew-wordle']?.stars || 0}
            gamesPlayed={summary['hebrew-wordle']?.games_played || 0}
            starColor='#74b9ff'
          />
          <GameCard
            title={t('English_Wordle_Title')}
            subtitle={t('English')}
            image='/english-wordle.svg'
            description={t('English_Wordle_Description')}
            path='/english-wordle'
            theme='english'
            stars={summary['english-wordle']?.stars || 0}
            gamesPlayed={summary['english-wordle']?.games_played || 0}
            starColor='#55efc4'
          />
        </div>

        <div className='home-footer'>
          <p>
            {Emojis.Graduation} {t('Footer_Text')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
