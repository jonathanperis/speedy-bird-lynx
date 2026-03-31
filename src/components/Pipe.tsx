import { PIPE_W, PIPE_H, PIPE_GAP, CANVAS_HEIGHT } from '../constants.js';

const PIPE_TOP_SRC = require('../../assets/sprites/pipe-top.png');
const PIPE_BOTTOM_SRC = require('../../assets/sprites/pipe-bottom.png');

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
        height: `${CANVAS_HEIGHT}px`,
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
    </view>
  );
}
