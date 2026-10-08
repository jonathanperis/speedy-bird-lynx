// Live timing panel next to the game: shows the HUD the Lynx app reports through
// SpeedyBirdModule.reportHud and derives the speed values from the same engine functions.
// It updates only the values that changed and adds no loop of its own.

import type { Hud } from '../../../web-host/host.ts';
import { MEDAL_BRONZE, MEDAL_GOLD, MEDAL_PLATINUM, MEDAL_SILVER, PIPE_DX } from '../../../src/constants.ts';
import { spawnInterval, speedMultiplier } from '../../../src/game/engine.ts';
import { STATE_OVER, STATE_PLAY, STATE_READY } from '../../../src/types.ts';

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
  const setState = (state: string) => {
    panel.dataset.state = state.toLowerCase();
    set(fields.state, state);
  };

  let run = 0;
  let lastState: number = STATE_READY;

  return {
    update(hud: Hud) {
      if (hud.gameState === STATE_PLAY && lastState !== STATE_PLAY) run++;
      lastState = hud.gameState;

      setState(
        hud.paused ? 'Paused' : hud.gameState === STATE_READY ? 'Ready' : hud.gameState === STATE_PLAY ? 'Flying' : 'Crashed',
      );
      set(fields.run, run ? `Run ${run}` : 'No runs yet');
      set(fields.score, String(hud.score));
      set(fields.speed, speedMultiplier(hud.score).toFixed(2));
      set(fields.scroll, (PIPE_DX * speedMultiplier(hud.score)).toFixed(2));
      set(fields.spawn, String(spawnInterval(hud.score)));
      const next = MEDALS.find((medal) => hud.score < medal.score);
      set(fields.medal, next ? `${next.name} in ${next.score - hud.score}` : 'Platinum ✓');
      set(fields.best, String(hud.bestScore));
      if (hud.gameState === STATE_OVER && hud.newBest) panel.dataset.newBest = 'true';
      else delete panel.dataset.newBest;
    },
    /** The game could not start in this browser. */
    fail() {
      setState('Unavailable');
    },
  };
}
