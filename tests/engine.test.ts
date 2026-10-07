import { describe, expect, test } from '@rstest/core';

import {
  BIRD_FLAP,
  BIRD_H,
  BIRD_RADIUS,
  BIRD_X,
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  GROUND_H,
  MAX_FRAME_MS,
  PIPE_DX,
  PIPE_GAP,
  PIPE_H,
  PIPE_MAX_Y,
  PIPE_MIN_Y,
  PIPE_SPAWN_INTERVAL,
  PIPE_W,
  RESTART_DELAY_STEPS,
  ROTATION_DOWN,
  ROTATION_UP,
  STEP_MS,
} from '../src/constants.js';
import type { GameSnapshot } from '../src/game/engine.js';
import {
  canRestart,
  collidesWithPipe,
  consumeElapsed,
  createGame,
  fitViewport,
  isIdle,
  medalForScore,
  spawnInterval,
  speedMultiplier,
  step,
  tap,
  tiltForVelocity,
} from '../src/game/engine.js';
import type { SoundName } from '../src/types.js';
import { STATE_OVER, STATE_PLAY, STATE_READY } from '../src/types.js';

const REST_Y = CANVAS_HEIGHT - GROUND_H - BIRD_H / 2;

function run(state: GameSnapshot, steps: number) {
  let current = state;
  const sounds: SoundName[] = [];
  for (let index = 0; index < steps; index++) {
    const transition = step(current);
    current = transition.state;
    sounds.push(...transition.sounds);
  }
  return { state: current, sounds };
}

/** A playing bird held in the middle of a pipe gap, so only scoring logic matters. */
function playingAt(birdY: number, overrides: Partial<GameSnapshot> = {}): GameSnapshot {
  return { ...tap(createGame(1)).state, birdY, birdVelocity: -BIRD_FLAP, ...overrides };
}

describe('state transitions', () => {
  test('a new game waits for the first tap', () => {
    const game = createGame(42, 9);
    expect(game.gameState).toBe(STATE_READY);
    expect(game.bestScore).toBe(9);
    expect(game.pipes).toEqual([]);
    const ready = run(game, 50).state;
    expect(ready.birdY).toBe(game.birdY);
    expect(ready.pipes).toEqual([]);
  });

  test('tapping starts the run and every tap flaps', () => {
    const start = tap(createGame(1));
    expect(start.state.gameState).toBe(STATE_PLAY);
    expect(start.state.birdVelocity).toBe(-BIRD_FLAP);
    expect(start.sounds).toEqual(['flap']);
    const falling = run(start.state, 20).state;
    const flap = tap(falling);
    expect(flap.state.birdVelocity).toBe(-BIRD_FLAP);
    expect(flap.sounds).toEqual(['flap']);
  });

  test('steps never mutate the previous snapshot', () => {
    const before = playingAt(300, { pipes: [{ id: 0, x: 200, y: -150, passed: false }] });
    const frozen = structuredClone(before);
    step(before);
    expect(before).toEqual(frozen);
  });
});

describe('physics', () => {
  test('tilt follows velocity within the configured limits', () => {
    expect(tiltForVelocity(-BIRD_FLAP)).toBe(ROTATION_UP);
    expect(tiltForVelocity(2)).toBe(0);
    expect(tiltForVelocity(30)).toBe(ROTATION_DOWN);
    expect(tiltForVelocity(4)).toBeGreaterThan(0);
  });

  test('the ceiling stops upward motion instead of pinning the bird', () => {
    const next = step(playingAt(BIRD_H / 2 + 1)).state;
    expect(next.birdY).toBe(BIRD_H / 2);
    expect(next.birdVelocity).toBe(0);
    expect(step(next).state.birdY).toBeGreaterThan(BIRD_H / 2);
  });

  test('hitting the ground ends the run once and records the best score', () => {
    const result = run(playingAt(REST_Y - 1, { birdVelocity: 5, score: 4, bestScore: 3 }), 3);
    expect(result.state.gameState).toBe(STATE_OVER);
    expect(result.state.grounded).toBe(true);
    expect(result.state.birdY).toBe(REST_Y);
    expect(result.state.bestScore).toBe(4);
    expect(result.state.newBest).toBe(true);
    expect(result.sounds).toEqual(['fall']);
  });

  test('a pipe hit plays the hit, then the landing thud once', () => {
    const pipe = { id: 0, x: BIRD_X - 10, y: PIPE_MIN_Y, passed: false };
    // Below the gap: inside the lower pipe.
    const hit = step(playingAt(PIPE_MIN_Y + PIPE_H + PIPE_GAP + 40, { pipes: [pipe] }));
    expect(hit.state.gameState).toBe(STATE_OVER);
    expect(hit.sounds).toEqual(['collision']);
    const landed = run(hit.state, 200);
    expect(landed.sounds).toEqual(['fall']);
    expect(landed.state.grounded).toBe(true);
  });
});

describe('pipes and scoring', () => {
  test('pipes spawn on schedule at the right edge within the gap range', () => {
    const result = run(tap(createGame(7)).state, PIPE_SPAWN_INTERVAL);
    expect(result.state.pipes).toHaveLength(1);
    const [pipe] = result.state.pipes;
    expect(pipe?.x).toBeCloseTo(CANVAS_WIDTH - PIPE_DX);
    expect(pipe?.y).toBeGreaterThanOrEqual(PIPE_MIN_Y);
    expect(pipe?.y).toBeLessThanOrEqual(PIPE_MAX_Y);
  });

  test('the same seed produces the same pipes', () => {
    const play = (seed: number) =>
      run(tap(createGame(seed)).state, PIPE_SPAWN_INTERVAL * 2).state.pipes.map((pipe) => pipe.y);
    expect(play(123)).toEqual(play(123));
    const many = Array.from({ length: 20 }, (_, seed) => play(seed + 1)[0]);
    expect(new Set(many).size).toBeGreaterThan(1);
  });

  test('a point is scored as soon as the bird clears a pipe, exactly once', () => {
    const gapCenter = PIPE_MIN_Y + PIPE_H + PIPE_GAP / 2;
    // Trailing edge one step away from clearing the bird.
    const x = BIRD_X - BIRD_RADIUS - PIPE_W + PIPE_DX / 2;
    const scored = run(playingAt(gapCenter, { pipes: [{ id: 0, x, y: PIPE_MIN_Y, passed: false }] }), 1);
    expect(scored.state.score).toBe(1);
    expect(scored.sounds).toEqual(['score']);
    expect(scored.state.pipes[0]?.passed).toBe(true);
    const later = step({ ...scored.state, birdVelocity: -BIRD_FLAP });
    expect(later.state.score).toBe(1);
    expect(later.sounds).toEqual([]);
  });

  test('pipes leave the screen without scoring again', () => {
    const offscreen = playingAt(300, { pipes: [{ id: 0, x: -PIPE_W + 1, y: -150, passed: true }], score: 1 });
    const next = step(offscreen).state;
    expect(next.pipes).toEqual([]);
    expect(next.score).toBe(1);
  });

  test('speed grows 1% per point and spawning has a floor', () => {
    expect(speedMultiplier(0)).toBe(1);
    expect(speedMultiplier(50)).toBe(1.5);
    expect(spawnInterval(0)).toBe(PIPE_SPAWN_INTERVAL);
    expect(spawnInterval(10_000)).toBe(20);
  });

  test('collision boxes cover both pipe bodies but not the gap', () => {
    const pipe = { id: 0, x: BIRD_X - 10, y: -200, passed: false };
    const gapTop = -200 + PIPE_H;
    expect(collidesWithPipe(gapTop + BIRD_RADIUS - 1, pipe)).toBe(true);
    expect(collidesWithPipe(gapTop + BIRD_RADIUS + 1, pipe)).toBe(false);
    expect(collidesWithPipe(gapTop + PIPE_GAP - BIRD_RADIUS - 1, pipe)).toBe(false);
    expect(collidesWithPipe(gapTop + PIPE_GAP - BIRD_RADIUS + 1, pipe)).toBe(true);
    expect(collidesWithPipe(0, { ...pipe, x: BIRD_X + BIRD_RADIUS })).toBe(false);
  });
});

describe('game over and restart', () => {
  const crashed = () => run(playingAt(REST_Y - 1, { birdVelocity: 5, score: 3 }), 2).state;

  test('taps right after a crash do not skip the results', () => {
    const over = crashed();
    expect(canRestart(over)).toBe(false);
    expect(tap(over)).toEqual({ state: over, sounds: [] });
  });

  test('once landed and the delay passes, a tap starts a fresh run with a new seed', () => {
    const settled = run(crashed(), RESTART_DELAY_STEPS).state;
    expect(canRestart(settled)).toBe(true);
    expect(isIdle(settled)).toBe(true);
    expect(step(settled).state).toBe(settled);
    const restart = tap(settled);
    expect(restart.sounds).toEqual(['swoosh']);
    expect(restart.state.gameState).toBe(STATE_READY);
    expect(restart.state.score).toBe(0);
    expect(restart.state.bestScore).toBe(3);
    expect(restart.state.randomState).not.toBe(settled.randomState);
  });
});

describe('presentation helpers', () => {
  test('medals follow the documented thresholds', () => {
    expect([9, 10, 24, 25, 49, 50, 99, 100].map(medalForScore)).toEqual([
      null,
      'bronze',
      'bronze',
      'silver',
      'silver',
      'gold',
      'gold',
      'platinum',
    ]);
  });

  test('elapsed time becomes whole fixed steps and stalls are clamped', () => {
    const clock = { accumulator: 0 };
    expect(consumeElapsed(clock, STEP_MS / 2)).toBe(0);
    expect(consumeElapsed(clock, STEP_MS / 2)).toBe(1);
    expect(consumeElapsed(clock, 10_000)).toBe(Math.floor(MAX_FRAME_MS / STEP_MS));
    expect(consumeElapsed({ accumulator: 0 }, -50)).toBe(0);
  });

  test('the playfield fits the screen and sits on the bottom edge', () => {
    expect(fitViewport(400, 750)).toEqual({ scale: 1, x: 0, y: 0 });
    // Tall phone: fill the width, extra height above becomes sky.
    const phone = fitViewport(800, 2000);
    expect(phone.scale).toBe(2);
    expect(phone.x).toBe(0);
    expect(phone.y).toBe(500);
    // Wide desktop: fill the height, center horizontally.
    expect(fitViewport(1280, 750)).toEqual({ scale: 1, x: 440, y: 0 });
    expect(fitViewport(0, 0)).toEqual({ scale: 1, x: 0, y: 0 });
  });
});
