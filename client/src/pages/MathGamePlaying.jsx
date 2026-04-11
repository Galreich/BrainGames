import React from 'react';
import { useTranslation } from 'react-i18next';
import { Emojis } from '../utils/Emojis';

const MathGamePlaying = ({
  station,
  totalStations,
  totalAnswers,
  formattedTime,
  progress,
  question,
  selectedAnswer,
  answerStatus,
  handleAnswer,
}) => {
  const { t } = useTranslation();

  return (
    <>
      {/* Info Row */}
      <div className='info-row'>
        <div className='info-badge station'>
          {Emojis.Rocket}{' '}
          {t('Station_Count', { station, total: totalStations })}
        </div>
        <div className='info-badge score'>
          {Emojis.Star} {t('Correct_Answers_Count', { count: totalAnswers })}
        </div>
        <div className='info-badge time'>
          {Emojis.Stopwatch} {formattedTime}
        </div>
      </div>

      {/* Rocket Path */}
      <div className='rocket-path'>
        <div className='path-line' />
        <div className='station-dots'>
          {Array.from({ length: totalStations }, (_, i) => (
            <div
              key={i}
              className={`station-dot 
                ${i + 1 < station ? 'completed' : ''} 
                ${i + 1 === station ? 'current' : ''}
                ${i + 1 === totalStations ? 'finish' : ''}
              `}
            >
              {i + 1 === totalStations && Emojis.FinishFlag}
            </div>
          ))}
        </div>
      </div>

      {/* Progress Bar */}
      <div className='progress-section'>
        <div className='progress-labels'>
          <span>{t('Progress')}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className='progress-bar'>
          <div className='progress-fill' style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Question */}
      <div className='question-card'>
        <div className='station-label'>
          {t('Station_Out_Of', { station, total: totalStations })}
        </div>
        <div className='question-text'>{question.text}</div>
        <p className='question-subtext'>
          {station <= 3
            ? t('Addition_and_Subtraction_up_to_20')
            : station <= 7
              ? t('Addition_and_Subtraction_up_to_100')
              : t('Multiplication')}
        </p>
      </div>

      {/* Options */}
      <div className='options-grid'>
        {question.options.map((opt) => (
          <button
            key={opt}
            className={`option-btn ${selectedAnswer === opt ? 'selected' : ''} ${selectedAnswer === opt ? answerStatus : ''} ${answerStatus === 'wrong' && opt === question.answer ? 'show-correct' : ''}`}
            onClick={() => handleAnswer(opt)}
            disabled={!!answerStatus}
          >
            {opt}
          </button>
        ))}
      </div>
    </>
  );
};

export default MathGamePlaying;
