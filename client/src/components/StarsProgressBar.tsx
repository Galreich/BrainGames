
import { Emojis } from '../utils/Emojis';

type StarsProgressBarProps = {
  user: { red_stars: number; blue_stars: number; green_stars: number } | null;
};

const StarsProgressBar = ({ user }: StarsProgressBarProps) => {
  if (!user) return null;

  return (
    <div className='stars-progress-bar'>
      <div className='progress-item'>
        <span>{Emojis.Star}</span>
        <span className='red-star'>{user.red_stars || 0}</span>
      </div>
      <div className='progress-item'>
        <span>{Emojis.Star}</span>
        <span className='blue-star'>{user.blue_stars || 0}</span>
      </div>
      <div className='progress-item'>
        <span>{Emojis.Star}</span>
        <span className='green-star'>{user.green_stars || 0}</span>
      </div>
    </div>
  );
};

export default StarsProgressBar;
