import React from 'react';
import { Emojis } from '../utils/Emojis';

const StarBurst = ({ x, y, id }) => {
  const style = {
    '--burst-x': `${x}px`,
    '--burst-y': `${y}px`,
  };
  return <div className="star-burst" style={style}>{Emojis.Star}</div>;
};

export default StarBurst;