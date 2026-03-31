import { GROUND_W, GROUND_H, CANVAS_HEIGHT } from '../constants.js';

const GROUND_SRC = require('../../assets/sprites/ground.png');

interface GroundProps {
  groundElRef: React.RefObject<any>;
}

export default function Ground({ groundElRef }: GroundProps) {
  const y = CANVAS_HEIGHT - GROUND_H;

  return (
    <view
      ref={groundElRef}
      style={{
        position: 'absolute',
        top: y,
        left: 0,
        width: GROUND_W * 3,
        height: GROUND_H,
        zIndex: 3,
        display: 'flex',
        flexDirection: 'row',
      }}
    >
      <image src={GROUND_SRC} style={{ width: GROUND_W, height: GROUND_H }} />
      <image src={GROUND_SRC} style={{ width: GROUND_W, height: GROUND_H }} />
      <image src={GROUND_SRC} style={{ width: GROUND_W, height: GROUND_H }} />
    </view>
  );
}
