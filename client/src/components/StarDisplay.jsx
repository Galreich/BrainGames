import React from 'react';

const StarDisplay = ({ count, maxStars = 3, color = '#f9ca24', size = '1.5rem', animated = false }) => {
  const styles = {
    container: {
      display: 'flex',
      gap: '4px',
      alignItems: 'center',
      direction: 'ltr',
    },
    star: (filled, index) => ({
      fontSize: size,
      color: filled ? color : 'rgba(0,0,0,0.15)',
      filter: filled ? `drop-shadow(0 0 6px ${color})` : 'none',
      animation: filled && animated ? `starPop 0.4s ease ${index * 0.15}s both` : 'none',
      display: 'inline-block',
      transition: 'all 0.3s',
    }),
  };

  return (
    <div style={styles.container}>
      {Array.from({ length: maxStars }, (_, i) => (
        <span key={i} style={styles.star(i < count, i)}>
          ★
        </span>
      ))}
    </div>
  );
};

export default StarDisplay;
