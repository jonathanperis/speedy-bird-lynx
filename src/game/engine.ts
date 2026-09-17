import {
  ANIM_GETREADY_INTERVAL, ANIM_PLAY_INTERVAL, BG_DX, BG_W, BIRD_FLAP,
  BIRD_GRAVITY, BIRD_H, BIRD_RADIUS, BIRD_X, BIRD_Y_START, CANVAS_HEIGHT,
  CANVAS_WIDTH, GROUND_DX, GROUND_H, GROUND_W, PIPE_DX, PIPE_GAP, PIPE_H,
  PIPE_MAX_Y, PIPE_MIN_Y, PIPE_SPAWN_INTERVAL, PIPE_W, ROTATION_DOWN,
  ROTATION_NEUTRAL, ROTATION_UP,
} from '../constants.js';
import { STATE_OVER, STATE_PLAY, STATE_READY } from '../types.js';
import type { GameState, PipeData, SoundName } from '../types.js';

export const STEP_MS = 17;
export interface GameConfig { width: number; height: number; gap: number; timeScale: number }
export function gameConfig(practice = false, height = CANVAS_HEIGHT): GameConfig {
  return { width: CANVAS_WIDTH, height, gap: practice ? 190 : PIPE_GAP, timeScale: practice ? 0.65 : 1 };
}

export interface GameSnapshot {
  gameState: GameState;
  frame: number;
  birdY: number;
  birdVelocity: number;
  birdFrame: number;
  birdRotation: number;
  pipes: PipeData[];
  score: number;
  bestScore: number;
  bgX: number;
  groundX: number;
  framesSinceLastPipe: number;
  nextPipeId: number;
  seed: number;
  randomState: number;
}

export interface Transition { state: GameSnapshot; sounds: SoundName[] }
export function createGame(seed = 1, bestScore = 0): GameSnapshot {
  return {
    gameState: STATE_READY, frame: 0, birdY: BIRD_Y_START, birdVelocity: 0,
    birdFrame: 0, birdRotation: ROTATION_NEUTRAL, pipes: [], score: 0, bestScore,
    bgX: 0, groundX: 0, framesSinceLastPipe: 0, nextPipeId: 0,
    seed: seed >>> 0, randomState: (seed >>> 0) || 1,
  };
}

export function pipeGeometry(y: number, config: GameConfig) {
  return { top: y + PIPE_H, bottom: y + PIPE_H + config.gap, ground: config.height - GROUND_H };
}

export function collidesWithPipe(birdY: number, pipe: PipeData, config: GameConfig): boolean {
  const { top, bottom } = pipeGeometry(pipe.y, config);
  return BIRD_X - BIRD_RADIUS < pipe.x + PIPE_W && BIRD_X + BIRD_RADIUS > pipe.x
    && (birdY - BIRD_RADIUS < top || birdY + BIRD_RADIUS > bottom);
}

export function medalForScore(score: number): 'bronze' | 'silver' | 'gold' | 'platinum' | null {
  if (score >= 100) return 'platinum';
  if (score >= 50) return 'gold';
  if (score >= 25) return 'silver';
  if (score >= 10) return 'bronze';
  return null;
}

export function tap(state: GameSnapshot): Transition {
  if (state.gameState === STATE_OVER) return { state: createGame(state.seed, state.bestScore), sounds: ['swoosh'] };
  return { state: { ...state, gameState: STATE_PLAY, birdVelocity: -BIRD_FLAP }, sounds: ['flap'] };
}

export function isSettled(state: GameSnapshot, config: GameConfig): boolean {
  return state.gameState === STATE_OVER && state.birdY >= config.height - GROUND_H - BIRD_H / 2;
}

// One fixed simulation step. No clock, framework, storage, or audio APIs live here.
export function step(previous: GameSnapshot, config: GameConfig): Transition {
  if (isSettled(previous, config)) return { state: previous, sounds: [] };
  const state = { ...previous, pipes: previous.pipes.map(pipe => ({ ...pipe })) };
  const sounds: SoundName[] = [];
  const end = (sound: SoundName) => {
    state.gameState = STATE_OVER;
    state.bestScore = Math.max(state.bestScore, state.score);
    sounds.push(sound);
  };
  if (state.gameState === STATE_READY) {
    if (state.frame % ANIM_GETREADY_INTERVAL === 0) state.birdFrame = (state.birdFrame + 1) % 4;
  } else {
    if (state.frame % ANIM_PLAY_INTERVAL === 0) state.birdFrame = (state.birdFrame + 1) % 4;
    state.birdVelocity += BIRD_GRAVITY;
    state.birdY += state.birdVelocity;
    state.birdRotation = state.birdVelocity < -2 ? ROTATION_UP
      : state.birdVelocity > 2 ? ROTATION_DOWN : ROTATION_NEUTRAL;
    if (state.birdY + BIRD_H / 2 >= config.height - GROUND_H) {
      state.birdY = config.height - GROUND_H - BIRD_H / 2;
      state.birdVelocity = 0;
      state.birdFrame = 2;
      state.birdRotation = ROTATION_DOWN;
      if (state.gameState === STATE_PLAY) end('fall');
    }
    if (state.birdY < BIRD_RADIUS) {
      state.birdY = BIRD_RADIUS;
      state.birdVelocity = Math.max(0, state.birdVelocity);
    }
  }
  if (state.gameState === STATE_PLAY) {
    const multiplier = 1 + state.score * 0.01;
    const speed = PIPE_DX * multiplier;
    const interval = Math.max(20, Math.round(PIPE_SPAWN_INTERVAL / multiplier));
    state.framesSinceLastPipe++;
    if (state.framesSinceLastPipe >= interval) {
      state.framesSinceLastPipe = 0;
      // xorshift32: the RNG state is part of the replayable simulation.
      let random = state.randomState;
      random ^= random << 13;
      random ^= random >>> 17;
      random ^= random << 5;
      state.randomState = random >>> 0;
      state.pipes.push({ id: state.nextPipeId++, x: config.width,
        y: PIPE_MIN_Y + Math.floor((state.randomState / 0x100000000) * (PIPE_MAX_Y - PIPE_MIN_Y + 1)) });
    }
    state.pipes = state.pipes.filter(pipe => {
      pipe.x -= speed;
      if (pipe.x >= -PIPE_W) return true;
      state.score++;
      sounds.push('score');
      return false;
    });
    if (state.pipes.some(pipe => collidesWithPipe(state.birdY, pipe, config))) end('collision');
    state.bgX = (state.bgX - BG_DX * multiplier) % BG_W;
    state.groundX = (state.groundX - GROUND_DX * multiplier) % GROUND_W;
  }
  state.frame++;
  return { state, sounds };
}

export function fitViewport(width: number, height: number, config: GameConfig) {
  const scale = Math.min(width / config.width, height / config.height);
  return { scale, x: (width - config.width * scale) / 2, y: (height - config.height * scale) / 2 };
}
