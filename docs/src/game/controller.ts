import { gameConfig, isSettled } from '../../../src/game/engine.js';
import { GameSession } from '../../../src/game/session.js';
import { DEFAULT_PREFERENCES, parsePreferences } from '../../../src/game/preferences.js';
import { createBrowserBridge } from '../../../src/platform/browser.js';
import type { HostBridge } from '../../../src/audio/audio.js';
import type { SoundName } from '../../../src/types.js';
import { STATE_OVER, STATE_PLAY } from '../../../src/types.js';
import { drawGame, loadSprites } from './renderer.js';
import type { Sprites } from './renderer.js';

export function mountGame(root: HTMLElement, baseUrl: string, options: { load?: () => Promise<Sprites>; bridge?: HostBridge } = {}) {
  const doc = root.ownerDocument, win = doc.defaultView!;
  const canvas = root.querySelector<HTMLCanvasElement>('canvas')!;
  const button = root.querySelector<HTMLButtonElement>('[data-game-action="start"]')!;
  const status = root.querySelector<HTMLElement>('[data-game-status]')!;
  const score = root.querySelector<HTMLElement>('[data-game-score]')!;
  const metrics = root.querySelector<HTMLElement>('[data-game-metrics]')!;
  const seed = root.querySelector<HTMLInputElement>('[data-game-seed]')!;
  const ctx = canvas.getContext('2d')!;
  const session = new GameSession(gameConfig(false, canvas.height));
  let preferences = { ...DEFAULT_PREFERENCES };
  let sprites: Sprites | null = null, loading = false, disposed = false;
  let bridge: HostBridge | null = options.bridge ?? null;
  let frame: number | undefined, last = 0, lastMetrics = 0;
  const save = () => bridge?.savePreferences(JSON.stringify(preferences));

  function publish(sounds: SoundName[] = [], frameMs = 0) {
    if (!sprites) return;
    if (!preferences.muted) sounds.forEach(sound => bridge?.play(sound));
    if (session.state.bestScore > preferences.bestScore) { preferences.bestScore = session.state.bestScore; save(); }
    drawGame(ctx, sprites, session.state, session.config, preferences.debug);
    const stateName = session.paused ? 'Paused' : session.state.gameState === STATE_OVER ? 'Game over' : session.state.gameState === STATE_PLAY ? 'Playing' : 'Ready — tap or press Space';
    const label = `${session.replaying ? 'Replay · ' : ''}${stateName}`;
    if (status.textContent !== label) status.textContent = label;
    score.textContent = `Score ${session.state.score} · Best ${Math.max(preferences.bestScore, session.state.bestScore)} · ${(1 + session.state.score * 0.01).toFixed(2)}×`;
    const multiplier = doc.getElementById('speedNum');
    if (multiplier) multiplier.textContent = (1 + session.state.score * 0.01).toFixed(2);
    metrics.hidden = !preferences.debug;
    if (preferences.debug && (session.paused || isSettled(session.state, session.config) || last - lastMetrics > 200 || frameMs === 0)) {
      metrics.textContent = `seed ${session.state.seed} · tick ${session.state.frame} · y ${session.state.birdY.toFixed(1)} · v ${session.state.birdVelocity.toFixed(2)} · frame ${frameMs.toFixed(1)}ms`;
      lastMetrics = last;
    }
    root.querySelector('[data-game-action="pause"]')!.textContent = session.paused ? 'Resume' : 'Pause';
    for (const [action, enabled] of [['practice', preferences.practice], ['mute', preferences.muted], ['debug', preferences.debug]] as const) {
      root.querySelector(`[data-game-action="${action}"]`)!.setAttribute('aria-pressed', String(enabled));
    }
  }
  function tick(now: number) {
    frame = undefined;
    if (disposed || session.paused) return;
    const elapsed = now - last;
    last = now;
    publish(session.advance(elapsed), elapsed);
    if (!session.paused && !isSettled(session.state, session.config)) frame = win.requestAnimationFrame(tick);
  }
  function wake() {
    if (!sprites || disposed || session.paused || frame !== undefined || isSettled(session.state, session.config)) return;
    last = win.performance.now();
    frame = win.requestAnimationFrame(tick);
  }
  function pause() {
    session.setPaused(true);
    if (frame !== undefined) win.cancelAnimationFrame(frame);
    frame = undefined;
    bridge?.stopAudio();
    publish();
  }
  async function start() {
    if (loading || disposed) return;
    if (!seed.checkValidity()) { seed.reportValidity(); return; }
    if (sprites) { session.restart(undefined, Number(seed.value)); publish(); wake(); canvas.focus(); return; }
    loading = true; button.disabled = true; status.textContent = 'Loading images…';
    bridge ??= createBrowserBridge(baseUrl);
    bridge.loadPreferences(value => {
      preferences = parsePreferences(value);
      session.state = { ...session.state, bestScore: preferences.bestScore };
      session.restart(gameConfig(preferences.practice, canvas.height), Number(seed.value));
    });
    try {
      const loaded = await (options.load?.() ?? loadSprites(baseUrl));
      if (disposed) return;
      sprites = loaded;
      button.textContent = 'New run';
      publish(); wake(); canvas.focus();
    } catch {
      status.textContent = 'An image could not load. Check your connection and retry.';
      button.textContent = 'Retry loading';
    } finally { loading = false; button.disabled = false; }
  }
  const flap = () => { if (sprites) { publish(session.input()); wake(); } };
  const pointer = (event: PointerEvent) => { if (event.isPrimary === false || event.button > 0) return; event.preventDefault(); canvas.focus(); flap(); };
  const keyboard = (event: KeyboardEvent) => {
    if (event.repeat) return;
    if (event.code === 'Space') { event.preventDefault(); flap(); }
    if (event.code === 'KeyP') { event.preventDefault(); if (session.paused) { session.setPaused(false); wake(); publish(); } else pause(); }
  };
  const click = (event: MouseEvent) => {
    const action = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-game-action]')?.dataset.gameAction;
    if (!action) return;
    if (action === 'start') { void start(); return; }
    if (!sprites) return;
    if (action === 'pause') { if (session.paused) session.setPaused(false); else pause(); }
    if (action === 'step') { pause(); publish(session.singleStep()); }
    if (action === 'replay') session.replay();
    if (action === 'practice') { preferences.practice = !preferences.practice; session.restart(gameConfig(preferences.practice, canvas.height)); }
    if (action === 'mute') { preferences.muted = !preferences.muted; bridge?.stopAudio(); }
    if (action === 'debug') preferences.debug = !preferences.debug;
    save(); publish(); wake();
  };
  const changeSeed = () => {
    const value = Number(seed.value);
    const valid = Number.isInteger(value) && value >= 0 && value <= 0xffffffff;
    seed.setCustomValidity(valid ? '' : 'Use an integer between 0 and 4294967295.');
    if (valid && sprites) { session.restart(undefined, value); publish(); wake(); }
  };
  const visibility = () => { if (doc.hidden && sprites) pause(); };
  const dispose = () => {
    disposed = true; pause();
    canvas.removeEventListener('pointerdown', pointer);
    canvas.removeEventListener('keydown', keyboard);
    root.removeEventListener('click', click);
    seed.removeEventListener('change', changeSeed);
    doc.removeEventListener('visibilitychange', visibility);
    win.removeEventListener('pagehide', dispose);
  };
  canvas.addEventListener('pointerdown', pointer);
  canvas.addEventListener('keydown', keyboard);
  root.addEventListener('click', click);
  seed.addEventListener('change', changeSeed);
  doc.addEventListener('visibilitychange', visibility);
  win.addEventListener('pagehide', dispose);
  return { start, dispose, session };
}
