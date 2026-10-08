// Browser side of SpeedyBirdModule, shared by the standalone host page (index.ts) and the
// website's home page (docs/src/scripts/game.ts). It wires one <lynx-view> to Web Audio,
// localStorage, a live region, and the host events. It has no build-tool dependencies, so
// both Rsbuild and Astro bundle it as-is.

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

/** What the game reports through `SpeedyBirdModule.reportHud` (see src/platform/host.ts). */
export interface Hud {
  gameState: number;
  score: number;
  bestScore: number;
  newBest: boolean;
  paused: boolean;
}

export interface HostOptions {
  /** Directory with `main.web.bundle`, `native-module.js`, and `audio/`, ending in a slash. */
  baseUrl: string | URL;
  /** Bundle to load instead of `<baseUrl>main.web.bundle`. */
  bundleUrl?: string;
  /** Polite live region. Lynx web elements do not expose accessibility labels to the browser. */
  status?: HTMLElement | null;
  /** Called with every HUD change; the first call means the game is on screen. */
  onHud?: (hud: Hud) => void;
}

export interface Host {
  /** Same as tapping the game. */
  tap(): void;
  /** Pause a run in progress and stop sounds. */
  pause(): void;
  /** Let the ready and game-over screens animate again; a paused run waits for a tap. */
  resume(): void;
  muted: boolean;
}

function readStorage(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? '';
  } catch {
    return ''; // Storage can be unavailable in private or sandboxed contexts.
  }
}

function writeStorage(value: string) {
  try {
    localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // Progress stays in memory when storage is unavailable.
  }
}

function parseHud(data: unknown): Hud | null {
  if (typeof data !== 'string') return null;
  try {
    const hud = JSON.parse(data) as Partial<Hud>;
    return typeof hud.gameState === 'number' && typeof hud.score === 'number' ? (hud as Hud) : null;
  } catch {
    return null;
  }
}

/**
 * Sound effects through Web Audio: decoded once, low latency, overlapping playback. The
 * context is created on the first user gesture, as browsers require; the files are fetched
 * once the game is on screen so the first flap already has its sound.
 */
function createAudio(baseUrl: URL) {
  const files = new Map<SoundName, Promise<ArrayBuffer | null>>();
  const buffers = new Map<SoundName, AudioBuffer>();
  const playing = new Set<AudioBufferSourceNode>();
  let context: AudioContext | null = null;

  const fetchAll = () => {
    if (files.size) return;
    for (const [name, file] of Object.entries(SOUND_FILES) as [SoundName, string][]) {
      files.set(
        name,
        fetch(new URL(`audio/${file}`, baseUrl))
          .then((response) => (response.ok ? response.arrayBuffer() : null))
          // Sound is optional; the game stays playable without it.
          .catch(() => null),
      );
    }
  };

  const decodeAll = (audio: AudioContext) => {
    fetchAll();
    for (const [name, file] of files) {
      void file.then(async (data) => {
        if (!data) return;
        try {
          buffers.set(name, await audio.decodeAudioData(data.slice(0)));
        } catch {
          // Undecodable sound: play the game without it.
        }
      });
    }
  };

  return {
    muted: false,
    preload: fetchAll,
    unlock() {
      if (!context) {
        if (typeof AudioContext !== 'function') return;
        try {
          context = new AudioContext();
        } catch {
          return;
        }
        decodeAll(context);
      }
      if (context.state === 'suspended') void context.resume().catch(() => {});
    },
    play(sound: SoundName) {
      const buffer = buffers.get(sound);
      if (this.muted || !context || !buffer) return;
      const source = context.createBufferSource();
      source.buffer = buffer;
      source.connect(context.destination);
      source.onended = () => playing.delete(source);
      playing.add(source);
      source.start();
    },
    stop() {
      for (const source of playing) {
        try {
          source.stop();
        } catch {
          // Already stopped.
        }
      }
      playing.clear();
    },
  };
}

export function mountSpeedyBird(view: LynxViewElement, options: HostOptions): Host {
  const baseUrl = new URL(options.baseUrl, document.baseURI);
  const { status, onHud } = options;
  const audio = createAudio(baseUrl);
  let announceFrame = 0;
  let ready = false;

  view.nativeModulesMap = { SpeedyBirdModule: new URL('native-module.js', baseUrl).href };
  view.onNativeModulesCall = (name, data) => {
    switch (name) {
      case 'play':
        if (typeof data === 'string' && data in SOUND_FILES) audio.play(data as SoundName);
        return null;
      case 'stopAudio':
        audio.stop();
        return null;
      case 'loadPreferences':
        return readStorage();
      case 'savePreferences':
        if (typeof data === 'string') writeStorage(data);
        return null;
      case 'announce':
        if (typeof data === 'string' && status) {
          // Clear first so repeating the same message is announced again.
          status.textContent = '';
          cancelAnimationFrame(announceFrame);
          announceFrame = requestAnimationFrame(() => {
            status.textContent = data;
          });
        }
        return null;
      case 'reportHud': {
        const hud = parseHud(data);
        if (hud) {
          if (!ready) audio.preload();
          ready = true;
          onHud?.(hud);
        }
        return null;
      }
      default:
        return null;
    }
  };
  view.url = options.bundleUrl ?? new URL('main.web.bundle', baseUrl).href;

  const host: Host = {
    tap() {
      audio.unlock();
      view.sendGlobalEvent('SpeedyBirdTap', []);
    },
    pause() {
      audio.stop();
      view.sendGlobalEvent('SpeedyBirdPause', []);
    },
    resume() {
      view.sendGlobalEvent('SpeedyBirdResume', []);
    },
    get muted() {
      return audio.muted;
    },
    set muted(value: boolean) {
      audio.muted = value;
      if (value) audio.stop();
    },
  };

  // Keyboard only while the game has focus, so Space still scrolls the page elsewhere.
  view.addEventListener('keydown', (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.code !== 'Space' && event.key !== ' ' && event.key !== 'Enter') return;
    event.preventDefault();
    if (!event.repeat) host.tap();
  });
  view.addEventListener('pointerdown', () => audio.unlock());

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) host.pause();
    else host.resume();
  });
  window.addEventListener('pagehide', () => audio.stop());

  return host;
}
