import { BIRD_W, BIRD_H } from '../constants.js';

interface BirdProps {
  birdElRef: React.RefObject<any>;
  birdFrameElRefs: React.RefObject<any>[];
}

// Bird animation frames: 0=up, 1=mid, 2=down, 3=mid (same as 1)
const BIRD_SPRITES = [
  require('../../assets/sprites/bird-0.png'),
  require('../../assets/sprites/bird-1.png'),
  require('../../assets/sprites/bird-2.png'),
  require('../../assets/sprites/bird-1.png'),
];

export default function Bird({ birdElRef, birdFrameElRefs }: BirdProps) {
  return (
    <view
      ref={birdElRef}
      style={{
        position: 'absolute',
        width: BIRD_W,
        height: BIRD_H,
        top: 0,
        left: 0,
        zIndex: 2,
      }}
    >
      {BIRD_SPRITES.map((src, i) => (
        <image
          key={i}
          ref={birdFrameElRefs[i]}
          src={src}
          style={{
            position: 'absolute',
            width: BIRD_W,
            height: BIRD_H,
            top: 0,
            left: 0,
            opacity: i === 0 ? 1 : 0,
          }}
        />
      ))}
    </view>
  );
}
