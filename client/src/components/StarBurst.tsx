
import { Emojis } from '../utils/Emojis';

type StarBurstProps = {
  x: number;
  y: number;
  id: number;
};

const StarBurst = ({ x, y, id }: StarBurstProps) => {
  const style: Record<string, number | string> = {
    '--burst-x': `${x}px`,
    '--burst-y': `${y}px`,
  };
  return (
    <div className='star-burst' style={style}>
      {Emojis.Star}
    </div>
  );
};

export default StarBurst;
