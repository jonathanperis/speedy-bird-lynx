import { PIPE_W, PIPE_H, PIPE_GAP } from '../constants.js';

const PIPE_TOP_SRC = require('../../assets/sprites/pipe-top.png');
const PIPE_BOTTOM_SRC = require('../../assets/sprites/pipe-bottom.png');

// Color matching the pipe body for the extension below the bottom pipe sprite
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
      {/* Bottom pipe: sprite at normal size + green extension to ground */}
      <image
        src={PIPE_BOTTOM_SRC}
        style={{
          position: 'absolute',
          top: `${bottomPipeY}px`,
          left: '0px',
          width: `${PIPE_W}px`,
          height: `${PIPE_H}px`,
        }}
      />
      <view
        style={{
          position: 'absolute',
          top: `${bottomPipeY + PIPE_H}px`,
          left: '3px',
          width: `${PIPE_W - 6}px`,
          height: '400px',
          backgroundColor: PIPE_BODY_COLOR,
        }}
      />
    </view>
  );
}
