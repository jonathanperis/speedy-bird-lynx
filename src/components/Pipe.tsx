import { PIPE_W, PIPE_H, PIPE_GAP } from '../constants.js';
import pipeTopBody from '../../assets/sprites/pipes/pipe-top.png';
import pipeTopMouth from '../../assets/sprites/pipes/pipe-top-mouth.png';
import pipeBottomBody from '../../assets/sprites/pipes/pipe-bottom.png';
import pipeBottomMouth from '../../assets/sprites/pipes/pipe-bottom-mouth.png';

const TILE_H = Math.round(25 * (PIPE_W / 26)); // ~53px display height per tile

interface PipeProps {
  x: number;
  y: number;
}

export default function Pipe({ x, y }: PipeProps) {
  // Top pipe: collision box from y to y+PIPE_H
  // Mouth sits at the bottom of the collision box
  // Body fills above the mouth, extending past top of screen
  const topMouthY = y + PIPE_H - TILE_H; // mouth bottom edge = y + PIPE_H
  const topTiles = [];

  // Fill body tiles from mouth upward, well past screen top
  const topBodyCount = Math.ceil((PIPE_H + 400) / TILE_H); // enough to overflow screen
  for (let i = 0; i < topBodyCount; i++) {
    topTiles.push(
      <image
        key={`tb${i}`}
        src={pipeTopBody}
        style={{
          position: 'absolute',
          top: `${topMouthY - (i + 1) * TILE_H}px`,
          left: '0px',
          width: `${PIPE_W}px`,
          height: `${TILE_H + 1}px`,
        }}
      />
    );
  }
  // Mouth at the exact collision boundary
  topTiles.push(
    <image
      key="tm"
      src={pipeTopMouth}
      style={{
        position: 'absolute',
        top: `${topMouthY}px`,
        left: '0px',
        width: `${PIPE_W}px`,
        height: `${TILE_H}px`,
      }}
    />
  );

  // Bottom pipe: collision box from (y+PIPE_H+PIPE_GAP) downward
  // Mouth sits at the top of the collision box
  // Body fills below the mouth, extending past ground
  const bottomY = y + PIPE_H + PIPE_GAP;
  const bottomTiles = [];

  // Mouth at top
  bottomTiles.push(
    <image
      key="bm"
      src={pipeBottomMouth}
      style={{
        position: 'absolute',
        top: '0px',
        left: '0px',
        width: `${PIPE_W}px`,
        height: `${TILE_H}px`,
      }}
    />
  );
  // Body tiles extending down past ground
  const bottomBodyCount = Math.ceil((PIPE_H + 400) / TILE_H);
  for (let i = 0; i < bottomBodyCount; i++) {
    bottomTiles.push(
      <image
        key={`bb${i}`}
        src={pipeBottomBody}
        style={{
          position: 'absolute',
          top: `${(i + 1) * TILE_H}px`,
          left: '0px',
          width: `${PIPE_W}px`,
          height: `${TILE_H + 1}px`,
        }}
      />
    );
  }

  return (
    <view
      style={{
        position: 'absolute',
        top: '0px',
        left: '0px',
        width: `${PIPE_W}px`,
        height: '100%',
        zIndex: 1,
        transform: `translateX(${x}px)`,
      }}
    >
      {/* Top pipe — positioned absolutely, tiles overflow upward */}
      {topTiles}

      {/* Bottom pipe */}
      <view
        style={{
          position: 'absolute',
          top: `${bottomY}px`,
          left: '0px',
          width: `${PIPE_W}px`,
          height: `${(bottomBodyCount + 1) * TILE_H}px`,
        }}
      >
        {bottomTiles}
      </view>
    </view>
  );
}
