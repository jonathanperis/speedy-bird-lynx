import { BG_W, BG_H, CANVAS_HEIGHT } from '../constants.js';

const BG_SRC = require('../../assets/sprites/background.png');

interface BackgroundProps {
  bgX: number;
}

export default function Background({ bgX }: BackgroundProps) {
  const y = CANVAS_HEIGHT - BG_H;

  return (
    <view
      style={{
        position: 'absolute',
        top: `${y}px`,
        left: '0px',
        width: `${BG_W * 3}px`,
        height: `${BG_H}px`,
        zIndex: 0,
        display: 'flex',
        flexDirection: 'row',
        transform: `translateX(${bgX}px)`,
      }}
    >
      <image src={BG_SRC} style={{ width: `${BG_W}px`, height: `${BG_H}px` }} />
      <image src={BG_SRC} style={{ width: `${BG_W}px`, height: `${BG_H}px` }} />
      <image src={BG_SRC} style={{ width: `${BG_W}px`, height: `${BG_H}px` }} />
    </view>
  );
}
