import React from 'react';

const BackgroundStar = ({ index }) => {
  const style = {
    '--star-width': `${2 + Math.random() * 3}px`,
    '--star-left': `${(index * 7.3) % 100}%`,
    '--star-top': `${(index * 11.7) % 100}%`,
    '--star-opacity': 0.4 + (index % 5) * 0.1,
    '--animation-duration': `${1 + (index % 3)}s`,
  };
  return <div className='background-star' style={style} />;
};

export default BackgroundStar;
