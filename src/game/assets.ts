import type { SoundName } from '../types.js';

export const SOUND_FILES: Record<SoundName, string> = {
  flap: 'sfx_wing.wav', score: 'sfx_point.wav', collision: 'sfx_hit.wav', fall: 'sfx_die.wav', swoosh: 'sfx_swooshing.wav',
};
export const SPRITE_FILES = {
  bird0: 'bird-0.png', bird1: 'bird-1.png', bird2: 'bird-2.png', background: 'background.png',
  ground: 'ground.png', ready: 'get-ready.png', over: 'game-over.png',
  top: 'pipes/pipe-top.png', topMouth: 'pipes/pipe-top-mouth.png',
  bottom: 'pipes/pipe-bottom.png', bottomMouth: 'pipes/pipe-bottom-mouth.png',
  bronze: 'medals/medal-bronze.png', silver: 'medals/medal-silver.png',
  gold: 'medals/medal-gold.png', platinum: 'medals/medal-platinum.png',
} as const;
