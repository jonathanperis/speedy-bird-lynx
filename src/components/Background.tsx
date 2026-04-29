import { BG_W, BG_H, CANVAS_HEIGHT, GROUND_H } from '../constants.js';
import bgSrc from '../../assets/sprites/background.png';

interface BackgroundProps {
  bgX: number;
}

export default function Background({ bgX }: BackgroundProps) {
  // Position from top instead of bottom for Lynx native compatibility
  const y = CANVAS_HEIGHT - GROUND_H - BG_H;

  return (
    <view
      style={{
        position: 'absolute',
        top: `${y}px`,
        left: '0px',
        width: `${BG_W * 5}px`,
        height: `${BG_H}px`,
        zIndex: 0,
        display: 'flex',
        flexDirection: 'row',
        transform: `translateX(${bgX}px)`,
      }}
    >
      <image src={bgSrc} style={{ width: `${BG_W}px`, height: `${BG_H}px` }} />
      <image src={bgSrc} style={{ width: `${BG_W}px`, height: `${BG_H}px` }} />
      <image src={bgSrc} style={{ width: `${BG_W}px`, height: `${BG_H}px` }} />
      <image src={bgSrc} style={{ width: `${BG_W}px`, height: `${BG_H}px` }} />
      <image src={bgSrc} style={{ width: `${BG_W}px`, height: `${BG_H}px` }} />
    </view>
  );
}
