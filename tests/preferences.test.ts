import { describe, expect, test } from '@rstest/core';

import { announcementFor, describeHud } from '../src/game/announcements.js';
import { parsePreferences, serializePreferences } from '../src/game/preferences.js';
import { STATE_OVER, STATE_PLAY, STATE_READY } from '../src/types.js';

describe('preferences', () => {
  test('round-trips a valid best score', () => {
    expect(parsePreferences(serializePreferences({ version: 1, bestScore: 25 }))).toEqual({
      version: 1,
      bestScore: 25,
    });
  });

  test.each([
    null,
    '',
    '{bad',
    '[]',
    '{"version":2,"bestScore":5}',
    '{"version":1,"bestScore":-1}',
    '{"version":1,"bestScore":1.5}',
  ])('falls back to defaults for %s', (value) => {
    expect(parsePreferences(value)).toEqual({ version: 1, bestScore: 0 });
  });
});

describe('announcements', () => {
  const hud = { gameState: STATE_READY, score: 0, bestScore: 4, newBest: false, paused: false } as const;

  test('describes each state', () => {
    expect(describeHud(hud)).toBe('Speedy Bird. Tap to start flapping.');
    expect(describeHud({ ...hud, gameState: STATE_PLAY, score: 2 })).toBe('Speedy Bird. Score 2. Tap to flap.');
    expect(describeHud({ ...hud, gameState: STATE_OVER, score: 5, bestScore: 5, newBest: true })).toBe(
      'Game over. Score 5. New best score 5. Tap to play again.',
    );
    expect(describeHud({ ...hud, gameState: STATE_PLAY, paused: true })).toBe(
      'Speedy Bird paused. Score 0. Tap to resume.',
    );
  });

  test('announces transitions but not individual points', () => {
    const playing = { ...hud, gameState: STATE_PLAY };
    expect(announcementFor(null, hud)).toBeNull();
    expect(announcementFor(hud, playing)).toBe('Game started.');
    expect(announcementFor(playing, { ...playing, score: 1 })).toBeNull();
    expect(announcementFor(playing, { ...playing, paused: true })).toBe('Paused. Tap to resume.');
    expect(announcementFor({ ...playing, paused: true }, playing)).toBe('Resumed.');
    expect(announcementFor(playing, { ...playing, gameState: STATE_OVER })).toBe(
      'Game over. Score 0. Best 4. Tap to play again.',
    );
  });
});
