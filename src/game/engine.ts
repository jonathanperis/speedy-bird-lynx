// Pure, deterministic game rules. This module runs on both Lynx threads (it is imported
// with `runtime: 'shared'`), in the docs canvas demo, and in unit tests, so it must not
// touch timers, rendering, storage, audio, or framework APIs.

import {
  ANIM_GETREADY_INTERVAL,
  ANIM_PLAY_INTERVAL,
  BG_DX,
  BG_W,
  BIRD_FLAP,
  BIRD_GRAVITY,
  BIRD_H,
  BIRD_RADIUS,
  BIRD_X,
  BIRD_Y_START,
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  GROUND_DX,
  GROUND_H,
  GROUND_W,
  MAX_FRAME_MS,
  MEDAL_BRONZE,
  MEDAL_GOLD,
  MEDAL_PLATINUM,
  MEDAL_SILVER,
  PIPE_DX,
  PIPE_GAP,
  PIPE_H,
  PIPE_MAX_Y,
  PIPE_MIN_SPAWN_INTERVAL,
  PIPE_MIN_Y,
  PIPE_SPAWN_INTERVAL,
  PIPE_W,
  RESTART_DELAY_STEPS,
  ROTATION_DOWN,
  ROTATION_NEUTRAL,
  ROTATION_UP,
  SPEED_PER_POINT,
  STEP_MS,
  TILT_LEVEL_VELOCITY,
  TILT_PER_VELOCITY,
} from '../constants.js';
import type { GameState, Medal, PipeData, SoundName } from '../types.js';
import { STATE_OVER, STATE_PLAY, STATE_READY } from '../types.js';

export interface GameSnapshot {
  gameState: GameState;
  /** Simulation steps since the run was created. */
  frame: number;
  birdY: number;
  birdVelocity: number;
  birdFrame: number;
  birdRotation: number;
  /** True while the bird rests on the ground. */
  grounded: boolean;
  pipes: PipeData[];
  score: number;
  bestScore: number;
  /** The current run beat the previous best score. */
  newBest: boolean;
  bgX: number;
  groundX: number;
  framesSinceLastPipe: number;
  nextPipeId: number;
  /** xorshift32 state; part of the snapshot so runs are reproducible. */
  randomState: number;
  /** Steps since the run ended. */
  overFrames: number;
}

export interface Transition {
  state: GameSnapshot;
  sounds: SoundName[];
}

const GROUND_Y = CANVAS_HEIGHT - GROUND_H;
const BIRD_REST_Y = GROUND_Y - BIRD_H / 2;

export function createGame(seed: number, bestScore = 0): GameSnapshot {
  return {
    gameState: STATE_READY,
    frame: 0,
    birdY: BIRD_Y_START,
    birdVelocity: 0,
    birdFrame: 0,
    birdRotation: ROTATION_NEUTRAL,
    grounded: false,
    pipes: [],
    score: 0,
    bestScore,
    newBest: false,
    bgX: 0,
    groundX: 0,
    framesSinceLastPipe: 0,
    nextPipeId: 0,
    randomState: mixSeed(seed),
    overFrames: 0,
  };
}

/** Murmur3 finalizer: spreads nearby seeds (such as consecutive timestamps) apart. */
function mixSeed(seed: number): number {
  let h = seed >>> 0;
  h = Math.imul(h ^ (h >>> 16), 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  h ^= h >>> 16;
  return h >>> 0 || 1;
}

/** xorshift32 step. */
function nextRandom(state: number): number {
  let x = state;
  x ^= x << 13;
  x ^= x >>> 17;
  x ^= x << 5;
  return x >>> 0 || 1;
}

/** Speed multiplier for a score: 1% faster per point. */
export function speedMultiplier(score: number): number {
  return 1 + score * SPEED_PER_POINT;
}

export function spawnInterval(score: number): number {
  return Math.max(PIPE_MIN_SPAWN_INTERVAL, Math.round(PIPE_SPAWN_INTERVAL / speedMultiplier(score)));
}

/** Bird tilt for a vertical velocity: nose up while rising, diving as it falls. */
export function tiltForVelocity(velocity: number): number {
  const angle = (velocity - TILT_LEVEL_VELOCITY) * TILT_PER_VELOCITY;
  return Math.max(ROTATION_UP, Math.min(ROTATION_DOWN, angle));
}

// #region collision
/** Circular bird hitbox, approximated by its bounding square, against both pipe bodies. */
export function collidesWithPipe(birdY: number, pipe: PipeData): boolean {
  const overlapsX = BIRD_X - BIRD_RADIUS < pipe.x + PIPE_W && BIRD_X + BIRD_RADIUS > pipe.x;
  if (!overlapsX) return false;
  const gapTop = pipe.y + PIPE_H;
  const gapBottom = gapTop + PIPE_GAP;
  return birdY - BIRD_RADIUS < gapTop || birdY + BIRD_RADIUS > gapBottom;
}
// #endregion collision

export function medalForScore(score: number): Medal | null {
  if (score >= MEDAL_PLATINUM) return 'platinum';
  if (score >= MEDAL_GOLD) return 'gold';
  if (score >= MEDAL_SILVER) return 'silver';
  if (score >= MEDAL_BRONZE) return 'bronze';
  return null;
}

/** The run is over, the bird has landed, and the restart delay has elapsed. */
export function canRestart(state: GameSnapshot): boolean {
  return state.gameState === STATE_OVER && state.grounded && state.overFrames >= RESTART_DELAY_STEPS;
}

/** No further step can change the snapshot until the player taps. */
export function isIdle(state: GameSnapshot): boolean {
  return canRestart(state);
}

export function tap(state: GameSnapshot): Transition {
  if (state.gameState === STATE_OVER) {
    if (!canRestart(state)) return { state, sounds: [] };
    return { state: createGame(nextRandom(state.randomState), state.bestScore), sounds: ['swoosh'] };
  }
  return {
    state: { ...state, gameState: STATE_PLAY, birdVelocity: -BIRD_FLAP, grounded: false },
    sounds: ['flap'],
  };
}

/** Advance one fixed simulation step. Returns the input object unchanged when idle. */
export function step(previous: GameSnapshot): Transition {
  if (isIdle(previous)) return { state: previous, sounds: [] };

  const state: GameSnapshot = { ...previous, pipes: previous.pipes.map((pipe) => ({ ...pipe })) };
  const sounds: SoundName[] = [];
  const endRun = (sound: SoundName) => {
    state.gameState = STATE_OVER;
    if (state.score > state.bestScore) {
      state.bestScore = state.score;
      state.newBest = true;
    }
    sounds.push(sound);
  };

  if (state.gameState === STATE_READY) {
    if (state.frame % ANIM_GETREADY_INTERVAL === 0) state.birdFrame = (state.birdFrame + 1) % 4;
  } else if (!state.grounded) {
    if (state.frame % ANIM_PLAY_INTERVAL === 0) state.birdFrame = (state.birdFrame + 1) % 4;
    state.birdVelocity += BIRD_GRAVITY;
    state.birdY += state.birdVelocity;
    state.birdRotation = tiltForVelocity(state.birdVelocity);
    // Wings stay still in a steep dive.
    if (state.birdVelocity >= BIRD_FLAP + 2) state.birdFrame = 1;

    if (state.birdY >= BIRD_REST_Y) {
      state.birdY = BIRD_REST_Y;
      state.birdVelocity = 0;
      state.birdFrame = 2;
      state.birdRotation = ROTATION_DOWN;
      state.grounded = true;
      // A ground hit ends the run; after a pipe hit it is the landing thud.
      if (state.gameState === STATE_PLAY) endRun('fall');
      else sounds.push('fall');
    } else if (state.birdY - BIRD_H / 2 <= 0) {
      // Ceiling: stop rising instead of sticking to the top of the screen.
      state.birdY = BIRD_H / 2;
      state.birdVelocity = Math.max(0, state.birdVelocity);
    }
  }

  if (state.gameState === STATE_PLAY) {
    const multiplier = speedMultiplier(state.score);
    const dx = PIPE_DX * multiplier;

    state.framesSinceLastPipe++;
    if (state.framesSinceLastPipe >= spawnInterval(state.score)) {
      state.framesSinceLastPipe = 0;
      state.randomState = nextRandom(state.randomState);
      const span = PIPE_MAX_Y - PIPE_MIN_Y + 1;
      state.pipes.push({
        id: state.nextPipeId++,
        x: CANVAS_WIDTH,
        y: PIPE_MIN_Y + Math.floor((state.randomState / 0x100000000) * span),
        passed: false,
      });
    }

    for (const pipe of state.pipes) {
      pipe.x -= dx;
      // Score as soon as the bird's trailing edge clears the pipe, not when it leaves the screen.
      if (!pipe.passed && pipe.x + PIPE_W < BIRD_X - BIRD_RADIUS) {
        pipe.passed = true;
        state.score++;
        sounds.push('score');
      }
    }
    state.pipes = state.pipes.filter((pipe) => pipe.x >= -PIPE_W);

    if (state.pipes.some((pipe) => collidesWithPipe(state.birdY, pipe))) endRun('collision');

    state.bgX = (state.bgX - BG_DX * multiplier) % BG_W;
    state.groundX = (state.groundX - GROUND_DX * multiplier) % (GROUND_W / 2);
  } else if (state.gameState === STATE_OVER) {
    state.overFrames = Math.min(RESTART_DELAY_STEPS, state.overFrames + 1);
  }

  state.frame++;
  return { state, sounds };
}

export interface StepClock {
  accumulator: number;
}

/**
 * Convert elapsed wall time into a whole number of fixed steps. Long gaps (a stalled or
 * backgrounded app) are clamped so the game never fast-forwards through a collision.
 */
export function consumeElapsed(clock: StepClock, elapsedMs: number): number {
  clock.accumulator += Math.max(0, Math.min(elapsedMs, MAX_FRAME_MS));
  const steps = Math.floor(clock.accumulator / STEP_MS);
  clock.accumulator -= steps * STEP_MS;
  return steps;
}

export interface Viewport {
  scale: number;
  x: number;
  y: number;
}

/**
 * Fit the logical playfield inside a host surface. The playfield keeps its aspect ratio,
 * is centered horizontally, and sits on the bottom edge so extra height becomes sky.
 */
export function fitViewport(width: number, height: number): Viewport {
  if (width <= 0 || height <= 0) return { scale: 1, x: 0, y: 0 };
  const scale = Math.min(width / CANVAS_WIDTH, height / CANVAS_HEIGHT);
  return { scale, x: (width - CANVAS_WIDTH * scale) / 2, y: height - CANVAS_HEIGHT * scale };
}
