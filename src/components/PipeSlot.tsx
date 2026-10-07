import pipeBottomBody from '../../assets/sprites/pipes/pipe-bottom.png';
import pipeBottomMouth from '../../assets/sprites/pipes/pipe-bottom-mouth.png';
import pipeTopBody from '../../assets/sprites/pipes/pipe-top.png';
import pipeTopMouth from '../../assets/sprites/pipes/pipe-top-mouth.png';
import { PIPE_H, PIPE_W } from '../constants.js';

// Source tiles are 26x25; scale them to the pipe width.
const TILE_H = Math.round(25 * (PIPE_W / 26));
// Enough body tiles to run past the top of a tall screen and below the ground.
const BODY_TILES = Array.from({ length: Math.ceil((PIPE_H + 400) / TILE_H) }, (_, index) => index);

const tileStyle = (top: number, height = TILE_H) => ({
  position: 'absolute' as const,
  top: `${top}px`,
  left: '0px',
  width: `${PIPE_W}px`,
  height: `${height}px`,
});

interface PipeSlotProps {
  index: number;
}

/**
 * One reusable pipe pair. The main-thread loop assigns pipes to slots, positions the
 * upper body at the pipe's y and the lower body below the gap, and scrolls the slot.
 * Coordinates inside each body are relative to its collision edge.
 */
export default function PipeSlot({ index }: PipeSlotProps) {
  return (
    <view
      id={`pipe-${index}`}
      style={{
        position: 'absolute',
        top: '0px',
        left: '0px',
        width: `${PIPE_W}px`,
        height: '100%',
        zIndex: 1,
        display: 'none',
      }}
    >
      {/* Upper pipe: its mouth ends at y + PIPE_H, the body extends upward. */}
      <view id={`pipe-${index}-top`} style={{ position: 'absolute', top: '0px', left: '0px', width: `${PIPE_W}px` }}>
        {BODY_TILES.map((tile) => (
          // The extra pixel hides seams between scaled tiles.
          <image key={tile} src={pipeTopBody} style={tileStyle(PIPE_H - TILE_H * (tile + 2), TILE_H + 1)} />
        ))}
        <image src={pipeTopMouth} style={tileStyle(PIPE_H - TILE_H)} />
      </view>

      {/* Lower pipe: its mouth starts at the bottom of the gap, the body extends downward. */}
      <view id={`pipe-${index}-bottom`} style={{ position: 'absolute', top: '0px', left: '0px', width: `${PIPE_W}px` }}>
        <image src={pipeBottomMouth} style={tileStyle(0)} />
        {BODY_TILES.map((tile) => (
          <image key={tile} src={pipeBottomBody} style={tileStyle(TILE_H * (tile + 1), TILE_H + 1)} />
        ))}
      </view>
    </view>
  );
}
