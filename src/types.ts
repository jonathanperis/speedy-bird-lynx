export type GameState = 0 | 1 | 2;

export const STATE_READY = 0 as const;
export const STATE_PLAY = 1 as const;
export const STATE_OVER = 2 as const;

export interface PipeData {
  id: number;
  x: number;
  /** Top edge of the upper pipe's collision box; the gap starts at y + PIPE_H. */
  y: number;
  /** Set once the bird has cleared the pipe and the point was awarded. */
  passed: boolean;
}

export type SoundName = 'flap' | 'score' | 'collision' | 'fall' | 'swoosh';

export type Medal = 'bronze' | 'silver' | 'gold' | 'platinum';
