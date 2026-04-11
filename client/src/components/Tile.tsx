import React, { useState, useEffect } from 'react';

type TileProps = {
  letter: string;
  status: string | null;
  isRevealing: boolean;
  revealIndex: number;
};

const Tile = ({ letter, status, isRevealing, revealIndex }: TileProps) => {
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
    <div className={classes} style={{ '--reveal-index': revealIndex } as Record<string, number | string>}>
      {letter}
    </div>
  );
};

export default Tile;
