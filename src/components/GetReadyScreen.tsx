import { CANVAS_HEIGHT } from '../constants.js';
import getReadySrc from '../../assets/sprites/get-ready.png';

const IMG_W = 174;
const IMG_H = 160;

interface GetReadyScreenProps {
  visible: boolean;
}

export default function GetReadyScreen({ visible }: GetReadyScreenProps) {
  if (!visible) return null;

  return (
    <view
      style={{
        position: 'absolute',
        top: `${CANVAS_HEIGHT / 2 - IMG_H}px`,
        left: '0px',
        width: '100%',
        zIndex: 5,
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <image
        src={getReadySrc}
        style={{
          width: `${IMG_W}px`,
          height: `${IMG_H}px`,
        }}
      />
    </view>
  );
}
