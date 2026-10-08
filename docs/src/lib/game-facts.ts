// Build-time facts about the game, computed from the same engine the app and the demo run
// (src/game/engine.ts), so the site can never disagree with the game.

import {
  GROUND_DX,
  MEDAL_BRONZE,
  MEDAL_GOLD,
  MEDAL_PLATINUM,
  MEDAL_SILVER,
  PIPE_DX,
  PIPE_MIN_SPAWN_INTERVAL,
  PIPE_SPAWN_INTERVAL,
  SPEED_PER_POINT,
  STEP_MS,
} from '../../../src/constants.ts';
import { medalForScore, spawnInterval, speedMultiplier } from '../../../src/game/engine.ts';
import type { Medal } from '../../../src/types.ts';

export interface SpeedRow {
  score: number;
  speed: number;
  scroll: number;
  pipeEverySteps: number;
  pipeEverySeconds: number;
  medal: Medal | null;
  note?: string;
}

/** First score at which pipes stop spawning closer together. */
export const SPAWN_FLOOR_SCORE = (() => {
  let score = 0;
  while (spawnInterval(score) > PIPE_MIN_SPAWN_INTERVAL) score++;
  return score;
})();

const MEDAL_SCORES: number[] = [MEDAL_BRONZE, MEDAL_SILVER, MEDAL_GOLD, MEDAL_PLATINUM];

const row = (score: number, note?: string): SpeedRow => ({
  score,
  speed: speedMultiplier(score),
  scroll: PIPE_DX * speedMultiplier(score),
  pipeEverySteps: spawnInterval(score),
  pipeEverySeconds: (spawnInterval(score) * STEP_MS) / 1000,
  // A medal marks the row where it is earned, not every score above it.
  medal: MEDAL_SCORES.includes(score) ? medalForScore(score) : null,
  note,
});

export const SPEED_ROWS: SpeedRow[] = [
  row(0, 'Start'),
  row(MEDAL_BRONZE),
  row(MEDAL_SILVER),
  row(MEDAL_GOLD),
  row(MEDAL_PLATINUM),
  row(200),
  row(SPAWN_FLOOR_SCORE, 'Pipes stop getting closer'),
];

export const FACTS = {
  percentPerPoint: Math.round(SPEED_PER_POINT * 100),
  baseScroll: PIPE_DX,
  groundScroll: GROUND_DX,
  baseSpawnSteps: PIPE_SPAWN_INTERVAL,
  minSpawnSteps: PIPE_MIN_SPAWN_INTERVAL,
  stepsPerSecond: Math.round(1000 / STEP_MS),
  medals: { bronze: MEDAL_BRONZE, silver: MEDAL_SILVER, gold: MEDAL_GOLD, platinum: MEDAL_PLATINUM },
} as const;

export const fixed = (value: number, digits = 2) => value.toFixed(digits);
