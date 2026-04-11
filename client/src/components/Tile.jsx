import React, { useState, useEffect } from 'react';

const Tile = ({ letter, status, isRevealing, revealIndex }) => {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (isRevealing) {
      // Animation is handled by CSS, but we need to set state for colors
      const timer = setTimeout(
        () => setRevealed(true),
        revealIndex * 300 + 300,
      );
      return () => clearTimeout(timer);
    } else if (status && status !== 'empty') {
      setRevealed(true);
    } else {
      setRevealed(false);
    }
  }, [isRevealing, status, revealIndex, setRevealed]);

  const classes = [
    'tile',
    status && (isRevealing || revealed) ? status : '',
    letter && !status ? 'has-letter' : '',
    isRevealing ? 'is-revealing' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} style={{ '--reveal-index': revealIndex }}>
      {letter}
    </div>
  );
};

export default Tile;
