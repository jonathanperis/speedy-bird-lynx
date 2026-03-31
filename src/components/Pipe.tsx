import { useEffect, useRef } from '@lynx-js/react';
import { PIPE_W, PIPE_H, PIPE_GAP } from '../constants.js';

interface PipeProps {
  id: number;
  y: number;
  registerPipeRef: (id: number, refs: { top: any; bottom: any; container: any }) => void;
  unregisterPipeRef: (id: number) => void;
}

const PIPE_TOP_SRC = require('../../assets/sprites/pipe-top.png');
const PIPE_BOTTOM_SRC = require('../../assets/sprites/pipe-bottom.png');

export default function Pipe({ id, y, registerPipeRef, unregisterPipeRef }: PipeProps) {
  const containerRef = useRef<any>(null);
  const topRef = useRef<any>(null);
  const bottomRef = useRef<any>(null);

  useEffect(() => {
    registerPipeRef(id, {
      top: topRef.current,
      bottom: bottomRef.current,
      container: containerRef.current,
    });
    return () => unregisterPipeRef(id);
  }, [id, registerPipeRef, unregisterPipeRef]);

  const topPipeY = y;
  const bottomPipeY = y + PIPE_H + PIPE_GAP;

  return (
    <view
      ref={containerRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: PIPE_W,
        height: '100%',
        zIndex: 1,
      }}
    >
      {/* Top pipe */}
      <image
        ref={topRef}
        src={PIPE_TOP_SRC}
        style={{
          position: 'absolute',
          top: topPipeY,
          left: 0,
          width: PIPE_W,
          height: PIPE_H,
        }}
      />
      {/* Bottom pipe */}
      <image
        ref={bottomRef}
        src={PIPE_BOTTOM_SRC}
        style={{
          position: 'absolute',
          top: bottomPipeY,
          left: 0,
          width: PIPE_W,
          height: PIPE_H,
        }}
      />
    </view>
  );
}
