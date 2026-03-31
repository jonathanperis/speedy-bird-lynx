import { BG_W, BG_H, CANVAS_HEIGHT } from '../constants.js';

const BG_SRC = require('../../assets/sprites/background.png');

interface BackgroundProps {
  bgElRef: React.RefObject<any>;
}

export default function Background({ bgElRef }: BackgroundProps) {
  const y = CANVAS_HEIGHT - BG_H;

  return (
    <view
      ref={bgElRef}
      style={{
        position: 'absolute',
        top: y,
        left: 0,
        width: BG_W * 3,
        height: BG_H,
        zIndex: 0,
        display: 'flex',
        flexDirection: 'row',
      }}
    >
      <image src={BG_SRC} style={{ width: BG_W, height: BG_H }} />
      <image src={BG_SRC} style={{ width: BG_W, height: BG_H }} />
      <image src={BG_SRC} style={{ width: BG_W, height: BG_H }} />
    </view>
  );
}
