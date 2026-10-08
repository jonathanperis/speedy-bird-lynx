// Live timing panel next to the demo: reads the snapshot the demo just drew and updates only
// the values that changed. It adds no loop of its own.

import { MEDAL_BRONZE, MEDAL_GOLD, MEDAL_PLATINUM, MEDAL_SILVER, PIPE_DX } from '../../../src/constants.ts';
import { spawnInterval, speedMultiplier } from '../../../src/game/engine.ts';
import { STATE_OVER, STATE_PLAY, STATE_READY } from '../../../src/types.ts';
import type { DemoFrame } from './controller.ts';

const MEDALS = [
  { name: 'Bronze', score: MEDAL_BRONZE },
  { name: 'Silver', score: MEDAL_SILVER },
  { name: 'Gold', score: MEDAL_GOLD },
  { name: 'Platinum', score: MEDAL_PLATINUM },
] as const;

export function createTimingPanel(panel: HTMLElement) {
  const field = (name: string) => panel.querySelector<HTMLElement>(`[data-field="${name}"]`);
  const fields = {
    state: field('state'),
    run: field('run'),
    score: field('score'),
    speed: field('speed'),
    scroll: field('scroll'),
    spawn: field('spawn'),
    medal: field('medal'),
    best: field('best'),
  };
  const shown = new Map<HTMLElement, string>();
  const set = (element: HTMLElement | null, value: string) => {
    if (!element || shown.get(element) === value) return;
    shown.set(element, value);
    element.textContent = value;
  };

  let run = 0;
  let lastState: number = STATE_READY;

  return (frame: DemoFrame) => {
    const { game, started, paused } = frame;
    if (game.gameState === STATE_PLAY && lastState !== STATE_PLAY) run++;
    lastState = game.gameState;

    const state = !started
      ? 'Waiting'
      : paused
        ? 'Paused'
        : game.gameState === STATE_READY
          ? 'Ready'
          : game.gameState === STATE_PLAY
            ? 'Flying'
            : 'Crashed';
    panel.dataset.state = state.toLowerCase();
    set(fields.state, state);
    set(fields.run, run ? `Run ${run}` : 'No runs yet');
    set(fields.score, String(game.score));
    set(fields.speed, speedMultiplier(game.score).toFixed(2));
    set(fields.scroll, (PIPE_DX * speedMultiplier(game.score)).toFixed(2));
    set(fields.spawn, String(spawnInterval(game.score)));
    const next = MEDALS.find((medal) => game.score < medal.score);
    set(fields.medal, next ? `${next.name} in ${next.score - game.score}` : 'Platinum ✓');
    set(fields.best, String(game.bestScore));
    if (game.gameState === STATE_OVER && game.newBest) panel.dataset.newBest = 'true';
    else delete panel.dataset.newBest;
  };
}
