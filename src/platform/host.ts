import type { SoundName } from '../types.js';

/**
 * Native module implemented by the Android, iOS and standalone web hosts as
 * `SpeedyBirdModule`. Hosts without it (for example Lynx Explorer) still run the game,
 * just without sound or saved scores.
 */
export interface HostBridge {
  play(sound: SoundName): void;
  stopAudio(): void;
  loadPreferences(callback: (value: string) => void): void;
  savePreferences(value: string): void;
  /** Speak a short status message through the platform screen reader. Optional. */
  announce?(message: string): void;
  /**
   * Receive the HUD (`gameState`, `score`, `bestScore`, `newBest`, `paused`) as JSON each
   * time it changes, for hosts that show game data outside the game view. Optional.
   */
  reportHud?(json: string): void;
}

declare const NativeModules: { SpeedyBirdModule?: HostBridge } | undefined;

export function getHostBridge(): HostBridge | undefined {
  'background only';
  return typeof NativeModules === 'undefined' ? undefined : NativeModules?.SpeedyBirdModule;
}

/** Host events delivered through Lynx's GlobalEventEmitter. */
export const HOST_PAUSE_EVENT = 'SpeedyBirdPause';
export const HOST_RESUME_EVENT = 'SpeedyBirdResume';
export const HOST_TAP_EVENT = 'SpeedyBirdTap';
