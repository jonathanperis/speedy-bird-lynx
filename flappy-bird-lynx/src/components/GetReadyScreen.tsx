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
        top: 0,
        left: 0,
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
        zIndex: 5,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <image
        src={GET_READY_SRC}
        style={{
          width: IMG_W,
          height: IMG_H,
          position: 'absolute',
          top: CANVAS_HEIGHT / 2 - IMG_H,
          left: (CANVAS_WIDTH - IMG_W) / 2,
        }}
      />
    </view>
  );
}
