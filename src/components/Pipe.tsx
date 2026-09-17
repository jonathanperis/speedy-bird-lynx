import { memo } from '@lynx-js/react';
import { PIPE_W, PIPE_H, GROUND_H } from '../constants.js';
import pipeTopBody from '../../assets/sprites/pipes/pipe-top.png';
import pipeTopMouth from '../../assets/sprites/pipes/pipe-top-mouth.png';
import pipeBottomBody from '../../assets/sprites/pipes/pipe-bottom.png';
import pipeBottomMouth from '../../assets/sprites/pipes/pipe-bottom-mouth.png';

const TILE_H = Math.round(25 * PIPE_W / 26);
const PipeTiles = memo(function PipeTiles({ y, gap, height }: { y: number; gap: number; height: number }) {
  const mouthY = y + PIPE_H - TILE_H;
  const bottomY = y + PIPE_H + gap;
  const tiles: { key: string; src: string; top: number }[] = [
    { key: 'top-mouth', src: pipeTopMouth, top: mouthY },
    { key: 'bottom-mouth', src: pipeBottomMouth, top: bottomY },
  ];
  for (let top = mouthY - TILE_H; top > -TILE_H; top -= TILE_H) tiles.push({ key: `top-${top}`, src: pipeTopBody, top });
  for (let top = bottomY + TILE_H; top < height - GROUND_H; top += TILE_H) tiles.push({ key: `bottom-${top}`, src: pipeBottomBody, top });
  return <>{tiles.map(tile => <image key={tile.key} src={tile.src} style={{ position: 'absolute', left: '0px',
    top: `${tile.top}px`, width: `${PIPE_W}px`, height: `${TILE_H + (tile.key.endsWith('mouth') ? 0 : 1)}px` }} />)}</>;
});

export default function Pipe({ x, y, gap, height }: { x: number; y: number; gap: number; height: number }) {
  return <view style={{ position: 'absolute', top: '0px', left: '0px', width: `${PIPE_W}px`, height: '100%', zIndex: 1,
    transform: `translateX(${x}px)` }}><PipeTiles y={y} gap={gap} height={height} /></view>;
}
