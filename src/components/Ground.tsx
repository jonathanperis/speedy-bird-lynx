import groundSrc from '../../assets/sprites/ground.png';
import { CANVAS_HEIGHT, GROUND_COLOR, GROUND_H, GROUND_TILE_H, GROUND_W, PIXEL_ART } from '../constants.js';

const TILES = [0, 1, 2, 3, 4];

/** Scrolling ground tiles; the main-thread loop moves them in step with the pipes. */
export default function Ground() {
  return (
    <view
      id="ground"
      style={{
        position: 'absolute',
        top: `${CANVAS_HEIGHT - GROUND_H}px`,
        left: '0px',
        width: `${GROUND_W * TILES.length}px`,
        height: `${GROUND_H}px`,
        zIndex: 3,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-start',
        // The sprite is shorter than the ground band; its sand color continues below it.
        backgroundColor: GROUND_COLOR,
      }}
    >
      {TILES.map((tile) => (
        <image
          key={tile}
          src={groundSrc}
          // Overlap by one pixel so fractional scaling never shows a seam between tiles.
          style={{ ...PIXEL_ART, width: `${GROUND_W + 1}px`, height: `${GROUND_TILE_H}px`, marginRight: '-1px' }}
        />
      ))}
    </view>
  );
}
