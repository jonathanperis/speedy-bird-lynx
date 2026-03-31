import { PIPE_W, PIPE_H, PIPE_GAP } from '../constants.js';

const PIPE_TOP_BODY = require('../../assets/sprites/pipes/pipe-top.png');
const PIPE_TOP_MOUTH = require('../../assets/sprites/pipes/pipe-top-mouth.png');
const PIPE_BOTTOM_BODY = require('../../assets/sprites/pipes/pipe-bottom.png');
const PIPE_BOTTOM_MOUTH = require('../../assets/sprites/pipes/pipe-bottom-mouth.png');

const TILE_SIZE = 25;
const TILE_DISPLAY = Math.round(TILE_SIZE * (PIPE_W / 26));

const BODY_TILES = Math.ceil(PIPE_H / TILE_DISPLAY);

interface PipeProps {
  x: number;
  y: number;
}

export default function Pipe({ x, y }: PipeProps) {
  const topPipeY = y;
  const bottomPipeY = y + PIPE_H + PIPE_GAP;

  // Top pipe: 1 extra tile above (overflows off screen), mouth stays at BODY_TILES position
  const topTiles = [];
  // Overflow tile at negative offset
  topTiles.push(
    <image
      key="to"
      src={PIPE_TOP_BODY}
      style={{
        position: 'absolute',
        top: `${-TILE_DISPLAY}px`,
        left: '0px',
        width: `${PIPE_W}px`,
        height: `${TILE_DISPLAY}px`,
      }}
    />
  );
  for (let i = 0; i < BODY_TILES; i++) {
    topTiles.push(
      <image
        key={`tb${i}`}
        src={PIPE_TOP_BODY}
        style={{
          position: 'absolute',
          top: `${i * TILE_DISPLAY}px`,
          left: '0px',
          width: `${PIPE_W}px`,
          height: `${TILE_DISPLAY}px`,
        }}
      />
    );
  }
  topTiles.push(
    <image
      key="tm"
      src={PIPE_TOP_MOUTH}
      style={{
        position: 'absolute',
        top: `${BODY_TILES * TILE_DISPLAY}px`,
        left: '0px',
        width: `${PIPE_W}px`,
        height: `${TILE_DISPLAY}px`,
      }}
    />
  );

  // Bottom pipe: mouth at top, body tiles down, 1 extra at the end
  const bottomTiles = [];
  bottomTiles.push(
    <image
      key="bm"
      src={PIPE_BOTTOM_MOUTH}
      style={{
        position: 'absolute',
        top: '0px',
        left: '0px',
        width: `${PIPE_W}px`,
        height: `${TILE_DISPLAY}px`,
      }}
    />
  );
  const bottomBodyTiles = BODY_TILES + 7;
  for (let i = 0; i < bottomBodyTiles; i++) {
    bottomTiles.push(
      <image
        key={`bb${i}`}
        src={PIPE_BOTTOM_BODY}
        style={{
          position: 'absolute',
          top: `${(i + 1) * TILE_DISPLAY}px`,
          left: '0px',
          width: `${PIPE_W}px`,
          height: `${TILE_DISPLAY}px`,
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
      <view
        style={{
          position: 'absolute',
          top: `${topPipeY}px`,
          left: '0px',
          width: `${PIPE_W}px`,
          height: `${(BODY_TILES + 1) * TILE_DISPLAY}px`,
          overflow: 'hidden',
        }}
      >
        {topTiles}
      </view>

      <view
        style={{
          position: 'absolute',
          top: `${bottomPipeY}px`,
          left: '0px',
          width: `${PIPE_W}px`,
          height: `${(bottomBodyTiles + 2) * TILE_DISPLAY}px`,
        }}
      >
        {bottomTiles}
      </view>
    </view>
  );
}
