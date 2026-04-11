import React from 'react';
import './StarDisplayStyle.css';

const StarDisplay = ({ count, maxStars = 3, color = '#f9ca24', size = '1.5rem', animated = false }) => {
  const style = { '--star-color': color, '--star-size': size };

  return (
    <div className="star-display-container" style={style}>
      {Array.from({ length: maxStars }, (_, i) => (
        <span
          key={i}
          className={`star ${i < count ? 'filled' : ''} ${animated && i < count ? 'animated' : ''}`}
          style={{ '--star-index': i }}
        >
          ★
        </span>
      ))}
    </div>
  );
};

export default StarDisplay;
