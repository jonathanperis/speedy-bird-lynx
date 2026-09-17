import { describe, expect, test } from 'bun:test';
import { collidesWithPipe, createGame, fitViewport, gameConfig, medalForScore, step, tap } from '../src/game/engine.js';
import { GameSession } from '../src/game/session.js';
import { parsePreferences } from '../src/game/preferences.js';
import { STATE_OVER, STATE_PLAY, STATE_READY } from '../src/types.js';

describe('shared simulation', () => {
  test.each([
    [750, -200, 80, true], [750, -200, 180, false], [750, -200, 400, true],
    [750, -200, 580, true], [600, -80, 300, false], [600, -80, 390, true],
    [750, -200, 112, false], [750, -200, 238, false],
  ])('pipe geometry height=%i y=%i bird=%i collides=%s', (height, y, birdY, collision) => {
    expect(collidesWithPipe(birdY, { id: 0, x: 80, y }, gameConfig(false, height))).toBe(collision);
  });

  test('state transitions, collision, ceiling and scoring preserve independent snapshots', () => {
    const config = gameConfig();
    const initial = createGame(42);
    const playing = tap(initial).state;
    expect(initial.gameState).toBe(STATE_READY);
    expect(playing.gameState).toBe(STATE_PLAY);
    const before = { ...playing, pipes: [{ id: 0, x: -55, y: -200 }] };
    const scored = step(before, config).state;
    expect(scored.score).toBe(1);
    expect(before.pipes[0]!.x).toBe(-55);
    const ground = step({ ...scored, birdY: 620 }, config).state;
    expect(ground.gameState).toBe(STATE_OVER);
    expect(ground.bestScore).toBe(1);
    expect(step(ground, config).state).toBe(ground);
    const reset = tap(ground).state;
    expect([reset.gameState, reset.score, reset.bestScore]).toEqual([STATE_READY, 0, 1]);
    const ceiling = step({ ...playing, birdY: 12 }, config).state;
    expect(ceiling.birdY).toBe(12);
    expect(ceiling.birdVelocity).toBe(0);
    expect(step({ ...playing, birdVelocity: 5 }, config).state.birdRotation).toBe(70);
  });

  test.each([false, true])('seed and tick-indexed input replay across render cadences (practice=%s)', (practice) => {
    const fast = new GameSession(gameConfig(practice), 73);
    const slow = new GameSession(gameConfig(practice), 73);
    fast.input(); slow.input();
    for (let chunk = 0; chunk < 24; chunk++) {
      if (chunk % 3 === 0) { fast.input(); slow.input(); }
      for (let i = 0; i < 5; i++) fast.advance(17);
      slow.advance(85);
    }
    expect(fast.state).toEqual(slow.state);
    expect(fast.state.nextPipeId).toBeGreaterThan(0);
    fast.input(); // Include an input at the recording's final tick, before another step.
    const final = structuredClone(fast.state);
    expect(fast.replay()).toBe(true);
    fast.advance(17);
    expect(fast.replay()).toBe(true); // Restart playback, not a new truncated recording.
    for (let i = 0; i < 200 && !fast.paused; i++) fast.advance(34);
    expect(fast.state).toEqual(final);
    expect(fast.paused).toBe(true);
  });

  test('pause discards elapsed time, step advances once, lag is bounded', () => {
    const session = new GameSession();
    session.setPaused(true);
    session.advance(60_000);
    expect(session.state.frame).toBe(0);
    session.singleStep();
    expect(session.state.frame).toBe(1);
    session.setPaused(false);
    session.advance(17);
    expect(session.state.frame).toBe(2);
    session.advance(60_000);
    expect(session.state.frame).toBe(16);
  });

  test('presentation and persistent preferences honor boundaries', () => {
    expect([9, 10, 24, 25, 49, 50, 99, 100].map(medalForScore))
      .toEqual([null, 'bronze', 'bronze', 'silver', 'silver', 'gold', 'gold', 'platinum']);
    expect(fitViewport(800, 750, gameConfig())).toEqual({ scale: 1, x: 200, y: 0 });
    expect(fitViewport(200, 400, gameConfig())).toEqual({ scale: 0.5, x: 0, y: 12.5 });
    expect(parsePreferences('{bad').bestScore).toBe(0);
    expect(parsePreferences('{"version":1,"bestScore":-1,"muted":true}'))
      .toEqual({ version: 1, bestScore: 0, muted: true, practice: false, debug: false });
    expect(parsePreferences('{"version":1,"bestScore":25}').bestScore).toBe(25);
  });
});
