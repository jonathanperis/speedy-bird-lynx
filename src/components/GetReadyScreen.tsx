import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants.js';

const GET_READY_SRC = require('../../assets/sprites/get-ready.png');

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
        top: '0px',
        left: '0px',
        width: `${CANVAS_WIDTH}px`,
        height: `${CANVAS_HEIGHT}px`,
        zIndex: 5,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <image
        src={GET_READY_SRC}
        style={{
          width: `${IMG_W}px`,
          height: `${IMG_H}px`,
          position: 'absolute',
          top: `${CANVAS_HEIGHT / 2 - IMG_H}px`,
          left: `${(CANVAS_WIDTH - IMG_W) / 2}px`,
        }}
      />
    </view>
  );
}
