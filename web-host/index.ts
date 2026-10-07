/// <reference types="@rsbuild/core/types" />

import '@lynx-js/web-core/client';
import '@lynx-js/web-elements/all';
import '@lynx-js/web-elements/index.css';
import type { LynxViewElement } from '@lynx-js/web-core/client';

const STORAGE_KEY = 'speedy-bird.preferences.v1';
const SOUND_FILES = {
  flap: 'sfx_wing.wav',
  score: 'sfx_point.wav',
  collision: 'sfx_hit.wav',
  fall: 'sfx_die.wav',
  swoosh: 'sfx_swooshing.wav',
} as const;
type SoundName = keyof typeof SOUND_FILES;

const view = document.querySelector<LynxViewElement>('lynx-view');
if (!view) throw new Error('Missing <lynx-view> element');
// Lynx web elements do not expose accessibility labels to the browser, so the game
// announces state changes through this live region instead.
const status = document.querySelector<HTMLElement>('#game-status');

// Decode once into Web Audio buffers: low latency, overlapping playback, and no
// network request per flap. Browsers only start audio after a user gesture.
const audio = new AudioContext();
const buffers = new Map<SoundName, AudioBuffer>();
const playing = new Set<AudioBufferSourceNode>();
for (const [name, file] of Object.entries(SOUND_FILES) as [SoundName, string][]) {
  fetch(new URL(`audio/${file}`, document.baseURI))
    .then((response) => response.arrayBuffer())
    .then((data) => audio.decodeAudioData(data))
    .then((buffer) => buffers.set(name, buffer))
    .catch(() => {
      // Sound is optional; the game stays playable without it.
    });
}

function play(sound: SoundName) {
  const buffer = buffers.get(sound);
  if (!buffer) return;
  if (audio.state === 'suspended') void audio.resume();
  const source = audio.createBufferSource();
  source.buffer = buffer;
  source.connect(audio.destination);
  source.onended = () => playing.delete(source);
  playing.add(source);
  source.start();
}

function stopAudio() {
  for (const source of playing) source.stop();
  playing.clear();
}

view.nativeModulesMap = { SpeedyBirdModule: new URL('native-module.js', document.baseURI).href };
view.onNativeModulesCall = (name, data) => {
  switch (name) {
    case 'play':
      if (typeof data === 'string' && data in SOUND_FILES) play(data as SoundName);
      return null;
    case 'stopAudio':
      stopAudio();
      return null;
    case 'loadPreferences':
      try {
        return localStorage.getItem(STORAGE_KEY) ?? '';
      } catch {
        return ''; // Storage can be unavailable in private or sandboxed contexts.
      }
    case 'savePreferences':
      try {
        if (typeof data === 'string') localStorage.setItem(STORAGE_KEY, data);
      } catch {
        // Progress stays in memory when storage is unavailable.
      }
      return null;
    case 'announce':
      if (typeof data === 'string' && status) {
        // Clear first so repeating the same message is announced again.
        status.textContent = '';
        requestAnimationFrame(() => {
          status.textContent = data;
        });
      }
      return null;
    default:
      return null;
  }
};

// Development serves the bundle from Rspeedy; the built host ships its own copy.
// Override with ?bundle=<url>.
const defaultBundle = import.meta.env.DEV ? 'http://localhost:3000/main.web.bundle' : './main.web.bundle';
view.url = new URLSearchParams(location.search).get('bundle') ?? defaultBundle;

// Keyboard: Space or Enter flaps while the game has focus.
view.addEventListener('keydown', (event) => {
  if (event.repeat || (event.code !== 'Space' && event.code !== 'Enter')) return;
  event.preventDefault();
  void audio.resume();
  view.sendGlobalEvent('SpeedyBirdTap', []);
});
view.addEventListener('pointerdown', () => void audio.resume());

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    stopAudio();
    view.sendGlobalEvent('SpeedyBirdPause', []);
  } else {
    view.sendGlobalEvent('SpeedyBirdResume', []);
  }
});
window.addEventListener('pagehide', stopAudio);
view.focus();
