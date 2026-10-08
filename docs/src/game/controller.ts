// Landing-page Canvas demo. Gameplay comes from the same pure engine as the ReactLynx app
// (src/game/engine.ts): fixed 1/60 s steps, seeded pipes, pass scoring, and the restart lock.
// This module only adds browser concerns: the frame loop, input, audio, storage, and
// screen-reader announcements.

import type { HudSummary } from '../../../src/game/announcements.ts';
import { announcementFor } from '../../../src/game/announcements.ts';
import type { GameSnapshot, StepClock } from '../../../src/game/engine.ts';
import { consumeElapsed, createGame, isIdle, step, tap } from '../../../src/game/engine.ts';
import { parsePreferences, serializePreferences } from '../../../src/game/preferences.ts';
import type { SoundName } from '../../../src/types.ts';
import { STATE_PLAY } from '../../../src/types.ts';
import type { Sprites } from './assets.ts';
import { loadSprites } from './assets.ts';
import { createAudio } from './audio.ts';
import { createRenderer } from './renderer.ts';

/** Same key and format as the standalone web host, so both share a best score. */
const PREFERENCES_KEY = 'speedy-bird.preferences.v1';
const MUTED_KEY = 'speedy-bird.demo.muted';
/** Start anyway if sprites are still loading after this long; missing ones get fallbacks. */
const SPRITE_TIMEOUT_MS = 8000;

export interface DemoElements {
  /** Wrapper that receives the `is-playing` and `is-started` state classes. */
  root: HTMLElement;
  canvas: HTMLCanvasElement;
  startButton: HTMLButtonElement;
  muteButton: HTMLButtonElement | null;
  /** Polite live region for game announcements. */
  status: HTMLElement;
  /** Base URL of the copied game assets, ending in a slash. */
  assetsUrl: URL;
  /** Called after every render with the snapshot on screen (drives the timing panel). */
  onFrame?: (frame: DemoFrame) => void;
}

export interface DemoFrame {
  game: GameSnapshot;
  started: boolean;
  paused: boolean;
}

function readStorage(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null; // Storage can be unavailable in private or sandboxed contexts.
  }
}

function writeStorage(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Progress stays in memory when storage is unavailable.
  }
}

function randomSeed(): number {
  if (typeof crypto !== 'undefined' && 'getRandomValues' in crypto) {
    return crypto.getRandomValues(new Uint32Array(1))[0] ?? Date.now();
  }
  return Date.now();
}

export function mountDemo({ root, canvas, startButton, muteButton, status, assetsUrl, onFrame }: DemoElements) {
  const renderer = createRenderer(canvas);
  const audio = createAudio(assetsUrl);

  let savedBest = parsePreferences(readStorage(PREFERENCES_KEY)).bestScore;
  let game: GameSnapshot = createGame(randomSeed(), savedBest);
  const clock: StepClock = { accumulator: 0 };
  let handle = 0;
  let lastTime = 0;
  let started = false;
  let starting = false;
  /** A run interrupted by hiding the tab or scrolling away; the next tap resumes it. */
  let paused = false;
  let inView = false;
  let spritesSettled = false;
  let lastHud: HudSummary | null = null;
  let announceTimer = 0;

  const hud = (): HudSummary => ({
    gameState: game.gameState,
    score: game.score,
    bestScore: game.bestScore,
    newBest: game.newBest,
    paused,
  });

  // Until the sprites arrive (or the start timeout passes), show plain sky rather than fallbacks.
  const render = () => {
    if (spritesSettled || started) renderer.draw(game, paused);
    else renderer.clear();
    onFrame?.({ game, started, paused });
  };

  const announce = (message: string) => {
    // Clear first so repeating the same message is announced again.
    status.textContent = '';
    window.clearTimeout(announceTimer);
    announceTimer = window.setTimeout(() => {
      status.textContent = message;
    }, 50);
  };

  // Play sounds, persist a new best score, and announce state changes.
  const publish = (sounds: SoundName[]) => {
    for (const sound of sounds) audio.play(sound);
    const next = hud();
    if (next.bestScore > savedBest) {
      savedBest = next.bestScore;
      writeStorage(PREFERENCES_KEY, serializePreferences({ version: 1, bestScore: savedBest }));
    }
    const message = announcementFor(lastHud, next);
    if (message) announce(message);
    lastHud = next;
    // While a run is in progress the canvas captures touches, so a quick swipe flaps
    // instead of scrolling. Otherwise touches scroll the page as usual.
    root.classList.toggle('is-playing', game.gameState === STATE_PLAY);
  };

  // Frame loop: requestAnimationFrame drives fixed 1/60 s engine steps. It runs only while
  // the game is started, on screen, in a visible tab, not paused, and not idle.
  const canRun = () => started && inView && !document.hidden && !paused;

  const frame = (now: number) => {
    handle = 0;
    if (!canRun()) return;
    const steps = consumeElapsed(clock, now - lastTime);
    lastTime = now;
    const sounds: SoundName[] = [];
    for (let index = 0; index < steps; index++) {
      const transition = step(game);
      game = transition.state;
      sounds.push(...transition.sounds);
    }
    render();
    publish(sounds);
    if (!isIdle(game)) handle = requestAnimationFrame(frame);
  };

  const wake = () => {
    if (handle || !canRun() || isIdle(game)) return;
    lastTime = performance.now();
    clock.accumulator = 0;
    handle = requestAnimationFrame(frame);
  };

  const halt = () => {
    if (handle) cancelAnimationFrame(handle);
    handle = 0;
  };

  // A run in progress pauses and shows "PAUSED"; the ready and game-over screens just stop.
  const suspend = () => {
    halt();
    audio.stop();
    if (started && game.gameState === STATE_PLAY && !paused) {
      paused = true;
      render();
      publish([]);
    }
  };

  // Sprites: start loading once the demo is near the viewport (or on first input).
  let spritesReady: Promise<void> | null = null;
  const prepare = () => {
    spritesReady ??= loadSprites(assetsUrl).then((sprites: Sprites) => {
      renderer.setSprites(sprites);
      spritesSettled = true;
      render();
    });
    return spritesReady;
  };

  const start = async () => {
    if (started || starting) return;
    starting = true;
    audio.unlock();
    startButton.disabled = true;
    if (!spritesSettled) {
      startButton.textContent = 'Loading…';
      root.setAttribute('aria-busy', 'true');
    }
    // Never wait on audio, and never wait forever on sprites.
    await Promise.race([prepare(), new Promise((resolve) => window.setTimeout(resolve, SPRITE_TIMEOUT_MS))]);
    started = true;
    starting = false;
    root.removeAttribute('aria-busy');
    root.classList.add('is-started');
    startButton.hidden = true;
    canvas.focus({ preventScroll: true });
    announce('Get ready. Press Space or Enter, click, or tap the game to flap.');
    lastHud = hud();
    render();
    wake();
  };

  const handleTap = () => {
    if (!started) {
      void start();
      return;
    }
    audio.unlock();
    if (paused) {
      paused = false;
      render();
      publish([]);
      wake();
      return;
    }
    const transition = tap(game);
    if (transition.state === game) return; // Restart is still locked.
    game = transition.state;
    render();
    publish(transition.sounds);
    wake();
  };

  // Input. During a run, flaps fire on pointerdown for the lowest latency. Starting and
  // restarting use click, which a scroll gesture never produces. Each physical tap therefore
  // triggers exactly one action: a click that follows a flap finds the run in progress and
  // is ignored.
  const runInProgress = () => started && game.gameState === STATE_PLAY;
  canvas.addEventListener('pointerdown', (event) => {
    if (event.button !== 0 || !runInProgress()) return;
    handleTap();
  });
  canvas.addEventListener('click', () => {
    if (!runInProgress()) handleTap();
  });
  // Keyboard only while the game itself has focus, so Space still scrolls the page elsewhere.
  canvas.addEventListener('keydown', (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.code !== 'Space' && event.key !== ' ' && event.key !== 'Enter') return;
    event.preventDefault();
    if (!event.repeat) handleTap();
  });
  startButton.addEventListener('click', () => void start());

  if (muteButton) {
    const applyMuted = (muted: boolean) => {
      audio.muted = muted;
      muteButton.setAttribute('aria-pressed', String(muted));
      if (muted) audio.stop();
    };
    applyMuted(readStorage(MUTED_KEY) === '1');
    muteButton.addEventListener('click', () => {
      const muted = !audio.muted;
      applyMuted(muted);
      writeStorage(MUTED_KEY, muted ? '1' : '0');
    });
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) suspend();
    else wake();
  });
  window.addEventListener('pagehide', () => audio.stop());

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(
      ([entry]) => {
        inView = entry?.isIntersecting ?? true;
        if (inView) wake();
        else suspend();
      },
      { threshold: 0 },
    ).observe(canvas);
    // Preload sprites shortly before the demo scrolls into view.
    const preload = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        preload.disconnect();
        void prepare();
      },
      { rootMargin: '100% 0px' },
    );
    preload.observe(canvas);
  } else {
    inView = true;
    void prepare();
  }

  if ('ResizeObserver' in window) {
    new ResizeObserver(() => {
      renderer.resize();
      render();
    }).observe(canvas);
  }
  renderer.resize();
  render();
}
