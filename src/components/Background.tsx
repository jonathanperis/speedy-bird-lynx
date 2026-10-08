import bgSrc from '../../assets/sprites/background.png';
import { BG_H, BG_W, CANVAS_HEIGHT, GROUND_H, PIXEL_ART } from '../constants.js';

const TILES = [0, 1, 2, 3, 4];

/** City skyline tiles; the main-thread loop scrolls them with `transform`. */
export default function Background() {
  return (
    <view
      id="background"
      style={{
        position: 'absolute',
        top: `${CANVAS_HEIGHT - GROUND_H - BG_H}px`,
        left: '0px',
        width: `${BG_W * TILES.length}px`,
        height: `${BG_H}px`,
        zIndex: 0,
        display: 'flex',
        flexDirection: 'row',
      }}
    >
      {TILES.map((tile) => (
        <image
          key={tile}
          src={bgSrc}
          // Overlap by one pixel so fractional scaling never shows a seam between tiles.
          style={{ ...PIXEL_ART, width: `${BG_W + 1}px`, height: `${BG_H}px`, marginRight: '-1px' }}
        />
      ))}
    </view>
  );
}
