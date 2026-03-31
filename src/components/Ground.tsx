import { GROUND_W, GROUND_H } from '../constants.js';

const GROUND_SRC = require('../../assets/sprites/ground.png');

interface GroundProps {
  groundX: number;
}

export default function Ground({ groundX }: GroundProps) {
  return (
    <view
      style={{
        position: 'absolute',
        bottom: '0px',
        left: '0px',
        width: `${GROUND_W * 5}px`,
        height: `${GROUND_H}px`,
        zIndex: 3,
        display: 'flex',
        flexDirection: 'row',
        transform: `translateX(${groundX}px)`,
      }}
    >
      <image src={GROUND_SRC} style={{ width: `${GROUND_W}px`, height: `${GROUND_H}px` }} />
      <image src={GROUND_SRC} style={{ width: `${GROUND_W}px`, height: `${GROUND_H}px` }} />
      <image src={GROUND_SRC} style={{ width: `${GROUND_W}px`, height: `${GROUND_H}px` }} />
      <image src={GROUND_SRC} style={{ width: `${GROUND_W}px`, height: `${GROUND_H}px` }} />
      <image src={GROUND_SRC} style={{ width: `${GROUND_W}px`, height: `${GROUND_H}px` }} />
    </view>
  );
}
