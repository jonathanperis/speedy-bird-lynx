import { BIRD_W, BIRD_H, BIRD_X } from '../constants.js';

const BIRD_SPRITES = [
  require('../../assets/sprites/bird-0.png'),
  require('../../assets/sprites/bird-1.png'),
  require('../../assets/sprites/bird-2.png'),
  require('../../assets/sprites/bird-1.png'),
];

interface BirdProps {
  y: number;
  rotation: number;
  frame: number;
}

export default function Bird({ y, rotation, frame }: BirdProps) {
  return (
    <view
      style={{
        position: 'absolute',
        width: `${BIRD_W}px`,
        height: `${BIRD_H}px`,
        top: '0px',
        left: '0px',
        zIndex: 2,
        transform: `translate(${BIRD_X - BIRD_W / 2}px, ${y - BIRD_H / 2}px) rotate(${rotation}deg)`,
      }}
    >
      {BIRD_SPRITES.map((src, i) => (
        <image
          key={i}
          src={src}
          style={{
            position: 'absolute',
            width: `${BIRD_W}px`,
            height: `${BIRD_H}px`,
            top: '0px',
            left: '0px',
            opacity: i === frame ? 1 : 0,
          }}
        />
      ))}
    </view>
  );
}
