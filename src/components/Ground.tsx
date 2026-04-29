import { GROUND_W, GROUND_H, CANVAS_HEIGHT } from '../constants.js';
import groundSrc from '../../assets/sprites/ground.png';

interface GroundProps {
  groundX: number;
}

export default function Ground({ groundX }: GroundProps) {
  const y = CANVAS_HEIGHT - GROUND_H;

  return (
    <view
      style={{
        position: 'absolute',
        top: `${y}px`,
        left: '0px',
        width: `${GROUND_W * 5}px`,
        height: `${GROUND_H}px`,
        zIndex: 3,
        display: 'flex',
        flexDirection: 'row',
        transform: `translateX(${groundX}px)`,
      }}
    >
      <image src={groundSrc} style={{ width: `${GROUND_W}px`, height: `${GROUND_H}px` }} />
      <image src={groundSrc} style={{ width: `${GROUND_W}px`, height: `${GROUND_H}px` }} />
      <image src={groundSrc} style={{ width: `${GROUND_W}px`, height: `${GROUND_H}px` }} />
      <image src={groundSrc} style={{ width: `${GROUND_W}px`, height: `${GROUND_H}px` }} />
      <image src={groundSrc} style={{ width: `${GROUND_W}px`, height: `${GROUND_H}px` }} />
    </view>
  );
}
