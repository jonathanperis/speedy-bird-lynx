import type { GameState } from '../types.js';
import { STATE_OVER, STATE_PLAY, STATE_READY } from '../types.js';

export interface HudSummary {
  gameState: GameState;
  score: number;
  bestScore: number;
  newBest: boolean;
  paused: boolean;
}

/** Label describing the whole game surface for screen readers. */
export function describeHud(hud: HudSummary): string {
  if (hud.paused) return `Speedy Bird paused. Score ${hud.score}. Tap to resume.`;
  if (hud.gameState === STATE_READY) return 'Speedy Bird. Tap to start flapping.';
  if (hud.gameState === STATE_PLAY) return `Speedy Bird. Score ${hud.score}. Tap to flap.`;
  const best = hud.newBest ? `New best score ${hud.bestScore}` : `Best ${hud.bestScore}`;
  return `Game over. Score ${hud.score}. ${best}. Tap to play again.`;
}

/**
 * Message to announce for a HUD transition, or null when nothing worth interrupting a
 * screen reader for happened (individual points are left to the label).
 */
export function announcementFor(previous: HudSummary | null, next: HudSummary): string | null {
  if (!previous) return null;
  if (next.paused !== previous.paused) return next.paused ? 'Paused. Tap to resume.' : 'Resumed.';
  if (next.gameState === previous.gameState) return null;
  if (next.gameState === STATE_PLAY) return 'Game started.';
  if (next.gameState === STATE_OVER) return describeHud(next);
  if (next.gameState === STATE_READY) return 'Get ready. Tap to start.';
  return null;
}
