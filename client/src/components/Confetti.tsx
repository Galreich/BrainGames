

const Confetti = () => {
  const pieces = Array.from({ length: 20 }, (_, i) => {
    const style: Record<string, number | string> = {
      '--left': `${Math.random() * 100}%`,
      '--delay': `${Math.random() * 3}s`,
      '--duration': `${2 + Math.random() * 3}s`,
      '--color': [
        '#f9ca24',
        '#eb4d4b',
        '#6c5ce7',
        '#00b894',
        '#0984e3',
        '#fd79a8',
      ][Math.floor(Math.random() * 6)],
      '--size': `${8 + Math.random() * 12}px`,
      '--border-radius': Math.random() > 0.5 ? '50%' : '2px',
    };
    return <div key={i} className='confetti-piece' style={style} />;
  });

  return <div className='confetti-container'>{pieces}</div>;
};

export default Confetti;
