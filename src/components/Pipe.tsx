import { PIPE_W, PIPE_H, PIPE_GAP } from '../constants.js';

const PIPE_TOP_SRC = require('../../assets/sprites/pipe-top.png');
const PIPE_BOTTOM_SRC = require('../../assets/sprites/pipe-bottom.png');

const PIPE_BODY_COLOR = '#73bf2e';

interface PipeProps {
  x: number;
  y: number;
}

export default function Pipe({ x, y }: PipeProps) {
  const topPipeY = y;
  const bottomPipeY = y + PIPE_H + PIPE_GAP;

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
      {/* Top pipe */}
      <image
        src={PIPE_TOP_SRC}
        style={{
          position: 'absolute',
          top: `${topPipeY}px`,
          left: '0px',
          width: `${PIPE_W}px`,
          height: `${PIPE_H}px`,
        }}
      />
      {/* Bottom pipe: green fill first (behind), then sprite on top */}
      <view
        style={{
          position: 'absolute',
          top: `${bottomPipeY + 20}px`,
          left: '4px',
          width: `${PIPE_W - 8}px`,
          height: '500px',
          backgroundColor: PIPE_BODY_COLOR,
          zIndex: 0,
        }}
      />
      <image
        src={PIPE_BOTTOM_SRC}
        style={{
          position: 'absolute',
          top: `${bottomPipeY}px`,
          left: '0px',
          width: `${PIPE_W}px`,
          height: `${PIPE_H}px`,
          zIndex: 1,
        }}
      />
    </view>
  );
}
