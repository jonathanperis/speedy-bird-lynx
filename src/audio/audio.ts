import type { SoundName } from '../types.js';

/** Implemented by the Android, iOS and standalone web hosts. */
export interface HostBridge {
  play(sound: SoundName): void;
  stopAudio(): void;
  loadPreferences(callback: (value: string) => void): void;
  savePreferences(value: string): void;
}

declare const NativeModules: { SpeedyBirdModule?: HostBridge };

export function getHostBridge(): HostBridge | undefined {
  'background only';
  return typeof NativeModules === 'undefined' ? undefined : NativeModules.SpeedyBirdModule;
}
