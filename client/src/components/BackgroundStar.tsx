type BackgroundStarProps = {
  index: number;
};

const BackgroundStar = ({ index }: BackgroundStarProps) => {
  const starStyle: Record<string, number | string> = {
    '--star-width': `${2 + Math.random() * 3}px`,
    '--star-left': `${(index * 7.3) % 100}%`,
    '--star-top': `${(index * 11.7) % 100}%`,
    '--star-opacity': 0.4 + (index % 5) * 0.1,
    '--animation-duration': `${1 + (index % 3)}s`,
  }
  return <div className='background-star' style={starStyle} />;
};

export default BackgroundStar;
