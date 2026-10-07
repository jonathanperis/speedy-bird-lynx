import bird0 from '../../assets/sprites/bird-0.png';
import bird1 from '../../assets/sprites/bird-1.png';
import bird2 from '../../assets/sprites/bird-2.png';
import { BIRD_H, BIRD_W, BIRD_X, BIRD_Y_START } from '../constants.js';

// Wing cycle: up, middle, down, middle. All frames stay mounted and the main thread
// toggles their opacity, so a frame change never waits for an image to decode.
const BIRD_SPRITES = [bird0, bird1, bird2, bird1] as const;

/** Static structure; the main-thread loop owns its transform and frame opacity. */
export default function Bird() {
  return (
    <view
      id="bird"
      style={{
        position: 'absolute',
        width: `${BIRD_W}px`,
        height: `${BIRD_H}px`,
        top: '0px',
        left: '0px',
        zIndex: 2,
        transform: `translate(${BIRD_X - BIRD_W / 2}px, ${BIRD_Y_START - BIRD_H / 2}px)`,
      }}
    >
      {BIRD_SPRITES.map((src, index) => (
        <image
          key={index}
          id={`bird-frame-${index}`}
          src={src}
          style={{
            position: 'absolute',
            width: `${BIRD_W}px`,
            height: `${BIRD_H}px`,
            top: '0px',
            left: '0px',
            opacity: index === 0 ? 1 : 0,
          }}
        />
      ))}
    </view>
  );
}
