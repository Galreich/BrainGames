
import './StarDisplayStyle.css';

type StarDisplayProps = {
  count: number;
  maxStars?: number;
  color?: string;
  size?: string;
  animated?: boolean;
};

const StarDisplay = ({
  count,
  maxStars = 3,
  color = '#f9ca24',
  size = '1.5rem',
  animated = false,
}: StarDisplayProps) => {
  const style: Record<string, number | string> = { '--star-color': color, '--star-size': size };

  return (
    <div className='star-display-container' style={style}>
      {Array.from({ length: maxStars }, (_, i) => (
        <span
          key={i}
          className={`star ${i < count ? 'filled' : ''} ${animated && i < count ? 'animated' : ''}`}
          style={{ '--star-index': i } as Record<string, number | string>}
        >
          ★
        </span>
      ))}
    </div>
  );
};

export default StarDisplay;
