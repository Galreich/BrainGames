import React from 'react';

const StarBurst = ({ x, y, id }) => {
  const style = {
    '--burst-x': `${x}px`,
    '--burst-y': `${y}px`,
  };
  return <div className="star-burst" style={style}>⭐</div>;
};

export default StarBurst;