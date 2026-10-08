import {
  runOnBackground,
  runOnMainThread,
  useCallback,
  useEffect,
  useMainThreadRef,
  useRef,
  useState,
} from '@lynx-js/react';
import type { LayoutChangeEvent, MainThread } from '@lynx-js/types';

import { BIRD_H, BIRD_W, BIRD_X, PIPE_GAP, PIPE_H, PIPE_POOL_SIZE, STALL_PAUSE_MS } from '../constants.js';
import type { HudSummary } from '../game/announcements.js';
import { announcementFor } from '../game/announcements.js';
import { consumeElapsed, createGame, fitViewport, isIdle, step, tap } from '../game/engine.js' with {
  runtime: 'shared',
};
import type { GameSnapshot, Viewport } from '../game/engine.js';
import { DEFAULT_PREFERENCES, parsePreferences, serializePreferences } from '../game/preferences.js';
import { getHostBridge, HOST_PAUSE_EVENT, HOST_RESUME_EVENT, HOST_TAP_EVENT } from '../platform/host.js';
import type { SoundName } from '../types.js';
import { STATE_PLAY, STATE_READY } from '../types.js';

/** Discrete state rendered by React. Per-frame motion never goes through React. */
export type Hud = HudSummary;

/** Main-thread controller created once by `start`; all mutable game state lives in its closure. */
interface Controller {
  tap(): void;
  pause(): void;
  resume(): void;
  setBest(bestScore: number): void;
  stop(): void;
}

interface FrameScheduler {
  requestAnimationFrame?: (callback: () => void) => number;
  cancelAnimationFrame?: (handle: number) => void;
}

export function useGame() {
  const rootRef = useMainThreadRef<MainThread.Element | null>(null);
  const controllerRef = useMainThreadRef<Controller | null>(null);
  // Taps that arrive before the controller exists (the first frames after launch).
  const pendingTapRef = useMainThreadRef(false);
  const savedBest = useRef(DEFAULT_PREFERENCES.bestScore);
  const lastHud = useRef<Hud | null>(null);
  const [hud, setHud] = useState<Hud>({
    gameState: STATE_READY,
    score: 0,
    bestScore: 0,
    newBest: false,
    paused: false,
  });
  const [viewport, setViewport] = useState<Viewport>({ scale: 1, x: 0, y: 0 });

  // Background thread: play sounds, persist a new best score, and update the HUD.
  const onGameEvent = (next: Hud, sounds: SoundName[]) => {
    const bridge = getHostBridge();
    for (const sound of sounds) bridge?.play(sound);
    if (next.bestScore > savedBest.current) {
      savedBest.current = next.bestScore;
      bridge?.savePreferences(serializePreferences({ version: 1, bestScore: next.bestScore }));
    }
    const announcement = announcementFor(lastHud.current, next);
    if (announcement) bridge?.announce?.(announcement);
    bridge?.reportHud?.(JSON.stringify(next));
    lastHud.current = next;
    setHud(next);
  };

  // Main thread: build the controller that owns the simulation, the frame loop, and rendering.
  const start = (seed: number) => {
    'main thread';
    const root = rootRef.current;
    if (controllerRef.current || !root) return;

    const find = (id: string) => root.querySelector(`#${id}`);
    const bird = find('bird');
    const birdFrames = [0, 1, 2, 3].map((index) => find(`bird-frame-${index}`));
    const background = find('background');
    const ground = find('ground');
    const slots = Array.from({ length: PIPE_POOL_SIZE }, (_, index) => ({
      root: find(`pipe-${index}`),
      top: find(`pipe-${index}-top`),
      bottom: find(`pipe-${index}-bottom`),
      pipeId: -1,
    }));

    // Lynx 4.1 exposes requestAnimationFrame on the main-thread `lynx` object; newer
    // runtimes also provide it globally. A timer keeps the loop alive anywhere else.
    // Capture the functions once: they must keep working even if globals change later.
    const lynxApi = typeof lynx === 'undefined' ? undefined : (lynx as unknown as FrameScheduler);
    const globalApi = globalThis as FrameScheduler;
    const source =
      typeof lynxApi?.requestAnimationFrame === 'function'
        ? lynxApi
        : typeof globalApi.requestAnimationFrame === 'function'
          ? globalApi
          : undefined;
    const nativeRequest = source?.requestAnimationFrame?.bind(source);
    const nativeCancel = source?.cancelAnimationFrame?.bind(source);
    const timerRequest = setTimeout;
    const timerCancel = clearTimeout;
    const requestFrame = (callback: () => void): number =>
      nativeRequest ? nativeRequest(callback) : (timerRequest(callback, 16) as unknown as number);
    const cancelFrame = (handle: number) => {
      if (nativeRequest) nativeCancel?.(handle);
      else timerCancel(handle as unknown as ReturnType<typeof setTimeout>);
    };

    // Only touch the element tree when a style value actually changes.
    const applied = new Map<MainThread.Element, Record<string, string>>();
    const setStyle = (element: MainThread.Element | null, styles: Record<string, string>) => {
      if (!element) return;
      const previous = applied.get(element) ?? {};
      const changed: Record<string, string> = {};
      let dirty = false;
      for (const key of Object.keys(styles)) {
        if (previous[key] !== styles[key]) {
          changed[key] = styles[key] as string;
          dirty = true;
        }
      }
      if (!dirty) return;
      element.setStyleProperties(changed);
      applied.set(element, { ...previous, ...changed });
    };

    let game: GameSnapshot = createGame(seed, 0);
    const clock = { accumulator: 0 };
    let handle = 0;
    let lastTime = 0;
    let paused = false;
    let published: Hud | null = null;

    const render = () => {
      setStyle(bird, {
        transform: `translate(${BIRD_X - BIRD_W / 2}px, ${game.birdY - BIRD_H / 2}px) rotate(${game.birdRotation}deg)`,
      });
      birdFrames.forEach((element, index) => {
        setStyle(element, { opacity: index === game.birdFrame ? '1' : '0' });
      });
      setStyle(background, { transform: `translateX(${game.bgX}px)` });
      setStyle(ground, { transform: `translateX(${game.groundX}px)` });

      // Pipe ids are sequential and at most three are alive, so id % pool never collides.
      const live = new Set<number>();
      for (const pipe of game.pipes) {
        const slotIndex = pipe.id % PIPE_POOL_SIZE;
        const slot = slots[slotIndex];
        if (!slot) continue;
        live.add(slotIndex);
        if (slot.pipeId !== pipe.id) {
          slot.pipeId = pipe.id;
          setStyle(slot.top, { transform: `translateY(${pipe.y}px)` });
          setStyle(slot.bottom, { transform: `translateY(${pipe.y + PIPE_H + PIPE_GAP}px)` });
        }
        setStyle(slot.root, { display: 'flex', transform: `translateX(${pipe.x}px)` });
      }
      slots.forEach((slot, index) => {
        if (live.has(index) || slot.pipeId === -1) return;
        slot.pipeId = -1;
        setStyle(slot.root, { display: 'none' });
      });
    };

    const publish = (sounds: SoundName[]) => {
      const next: Hud = {
        gameState: game.gameState,
        score: game.score,
        bestScore: game.bestScore,
        newBest: game.newBest,
        paused,
      };
      const changed =
        !published ||
        published.gameState !== next.gameState ||
        published.score !== next.score ||
        published.bestScore !== next.bestScore ||
        published.newBest !== next.newBest ||
        published.paused !== next.paused;
      if (!changed && sounds.length === 0) return;
      published = next;
      void runOnBackground(onGameEvent)(next, sounds);
    };

    // #region frame-loop
    const frame = () => {
      handle = 0;
      if (paused) return;
      const now = Date.now();
      const elapsed = now - lastTime;
      lastTime = now;
      if (game.gameState === STATE_PLAY && elapsed >= STALL_PAUSE_MS) {
        paused = true;
        publish([]);
        return;
      }
      const steps = consumeElapsed(clock, elapsed);
      const sounds: SoundName[] = [];
      for (let index = 0; index < steps; index++) {
        const transition = step(game);
        game = transition.state;
        sounds.push(...transition.sounds);
      }
      render();
      publish(sounds);
      // Stop the loop once nothing can change until the next tap.
      if (!isIdle(game)) handle = requestFrame(frame);
    };
    // #endregion frame-loop

    const wake = () => {
      if (handle || paused) return;
      lastTime = Date.now();
      clock.accumulator = 0;
      handle = requestFrame(frame);
    };

    const halt = () => {
      if (handle) cancelFrame(handle);
      handle = 0;
    };

    controllerRef.current = {
      tap() {
        if (paused) {
          paused = false;
          publish([]);
          wake();
          return;
        }
        const transition = tap(game);
        if (transition.state === game) return;
        game = transition.state;
        render();
        publish(transition.sounds);
        wake();
      },
      // Called when the host goes to the background. Only a run in progress shows the
      // paused overlay; the ready and game-over screens simply stop animating.
      pause() {
        halt();
        if (game.gameState === STATE_PLAY && !paused) {
          paused = true;
          publish([]);
        }
      },
      resume() {
        if (!paused) wake();
      },
      setBest(bestScore: number) {
        if (bestScore <= game.bestScore) return;
        game = { ...game, bestScore };
        publish([]);
      },
      stop() {
        halt();
        paused = true;
      },
    };

    render();
    publish([]);
    wake();
    if (pendingTapRef.current) {
      pendingTapRef.current = false;
      controllerRef.current.tap();
    }
  };

  const handleTap = () => {
    'main thread';
    if (controllerRef.current) controllerRef.current.tap();
    else pendingTapRef.current = true;
  };
  const pauseOnMain = () => {
    'main thread';
    controllerRef.current?.pause();
  };
  const resumeOnMain = () => {
    'main thread';
    controllerRef.current?.resume();
  };
  const setBestOnMain = (bestScore: number) => {
    'main thread';
    controllerRef.current?.setBest(bestScore);
  };
  const stopOnMain = () => {
    'main thread';
    controllerRef.current?.stop();
    controllerRef.current = null;
  };

  // Start once after the first render (the main-thread refs are bound by then), load the
  // saved best score, and listen for host lifecycle and keyboard events. Effects only run
  // on the background thread.
  useEffect(() => {
    void runOnMainThread(start)(Date.now() >>> 0);
    const bridge = getHostBridge();
    bridge?.loadPreferences((value) => {
      const { bestScore } = parsePreferences(value);
      savedBest.current = Math.max(savedBest.current, bestScore);
      void runOnMainThread(setBestOnMain)(bestScore);
    });

    const onPause = () => {
      getHostBridge()?.stopAudio();
      void runOnMainThread(pauseOnMain)();
    };
    const onResume = () => void runOnMainThread(resumeOnMain)();
    const onHostTap = () => void runOnMainThread(handleTap)();
    const events = lynx.getJSModule('GlobalEventEmitter');
    events.addListener(HOST_PAUSE_EVENT, onPause);
    events.addListener(HOST_RESUME_EVENT, onResume);
    events.addListener(HOST_TAP_EVENT, onHostTap);

    return () => {
      events.removeListener(HOST_PAUSE_EVENT, onPause);
      events.removeListener(HOST_RESUME_EVENT, onResume);
      events.removeListener(HOST_TAP_EVENT, onHostTap);
      void runOnMainThread(stopOnMain)();
      bridge?.stopAudio();
    };
  }, []);

  const onLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.detail;
    if (width > 0 && height > 0) setViewport(fitViewport(width, height));
  }, []);

  return { rootRef, handleTap, hud, viewport, onLayout };
}
