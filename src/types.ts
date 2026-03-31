export type GameState = 0 | 1 | 2;

export const STATE_READY = 0 as const;
export const STATE_PLAY = 1 as const;
export const STATE_OVER = 2 as const;

export interface PipeData {
  id: number;
  x: number;
  y: number;
}

export type SoundName = 'flap' | 'score' | 'collision' | 'fall' | 'swoosh';
