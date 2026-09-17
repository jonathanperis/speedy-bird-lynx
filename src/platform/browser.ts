import { SOUND_FILES } from '../game/assets.js';
import { STORAGE_KEY } from '../game/preferences.js';
import type { HostBridge } from '../audio/audio.js';
import type { SoundName } from '../types.js';

export function createBrowserBridge(baseUrl: string): HostBridge {
  const sounds = new Map<SoundName, HTMLAudioElement>();
  for (const [name, file] of Object.entries(SOUND_FILES)) {
    const audio = new Audio(`${baseUrl}assets/audio/${file}`);
    audio.preload = 'auto';
    sounds.set(name as SoundName, audio);
  }
  return {
    play(sound) {
      const audio = sounds.get(sound)!;
      audio.currentTime = 0;
      // Audio availability never gates gameplay; browsers may require another gesture.
      void audio.play().catch(() => {});
    },
    stopAudio() { sounds.forEach(audio => { audio.pause(); audio.currentTime = 0; }); },
    loadPreferences(callback) {
      try { callback(localStorage.getItem(STORAGE_KEY) ?? ''); }
      catch { callback(''); } // Storage can be unavailable in a private/sandboxed context.
    },
    savePreferences(value) {
      try { localStorage.setItem(STORAGE_KEY, value); }
      catch { /* Session progress remains available when browser storage is disabled. */ }
    },
  };
}

export function loadImage(url: string, createImage: () => HTMLImageElement = () => new Image()): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = createImage();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Unable to load required image: ${url}`));
    image.src = url;
  });
}
