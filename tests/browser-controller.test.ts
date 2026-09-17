import { expect, mock, test } from 'bun:test';
import { Window, HTMLButtonElement as TestButton } from 'happy-dom';
import { mountGame } from '../docs/src/game/controller.js';
import type { Sprites } from '../docs/src/game/renderer.js';
import { loadImage } from '../src/platform/browser.js';
import { STATE_OVER, STATE_PLAY, STATE_READY } from '../src/types.js';

test('required image loading rejects failure rather than reporting a ready scene', async () => {
  const image = { onload: null, onerror: null, src: '' } as unknown as HTMLImageElement;
  const loading = loadImage('/missing.png', () => image);
  image.onerror!(new Event('error'));
  await expect(loading).rejects.toThrow('/missing.png');
});

test('Canvas retries failed images, starts without audio readiness, scopes input and owns pause/cleanup', async () => {
  const win = new Window({ url: 'http://localhost/' });
  win.document.body.innerHTML = `<div id="game"><canvas height="600" tabindex="0"></canvas>
    <button data-game-action="start">Start</button><button data-game-action="pause">Pause</button>
    <button data-game-action="step">Step</button><button data-game-action="practice">Practice</button>
    <button data-game-action="mute">Mute</button><button data-game-action="debug">Debug</button>
    <button data-game-action="replay">Replay</button><input data-game-seed value="1" />
    <p data-game-status></p><p data-game-score></p><p data-game-metrics></p></div><input id="outside" />`;
  const root = win.document.getElementById('game')!;
  const canvas = root.querySelector('canvas')!;
  const ctx = new Proxy({}, { get: () => () => {} });
  canvas.getContext = (() => ctx) as unknown as typeof canvas.getContext;
  const pending = new Map<number, FrameRequestCallback>();
  let nextId = 0;
  const browserWindow = win as unknown as globalThis.Window;
  browserWindow.requestAnimationFrame = callback => { pending.set(++nextId, callback); return nextId; };
  browserWindow.cancelAnimationFrame = id => { pending.delete(id); };
  const stopAudio = mock(() => {}), savePreferences = mock((_value: string) => {});
  const load = mock(async () => ({} as Sprites));
  load.mockRejectedValueOnce(new Error('missing image'));
  const game = mountGame(root as unknown as HTMLElement, '/', {
    load, bridge: { play: () => {}, stopAudio, savePreferences,
      loadPreferences: callback => callback('{"version":1,"bestScore":12}') },
  });
  await game.start();
  expect(root.querySelector('[data-game-status]')!.textContent).toContain('retry');
  expect(pending.size).toBe(0);
  await game.start();
  expect(game.session.state.bestScore).toBe(12);
  expect(game.session.state.gameState).toBe(STATE_READY);
  expect(pending.size).toBe(1);
  const outside = new win.KeyboardEvent('keydown', { code: 'Space', bubbles: true, cancelable: true });
  win.document.getElementById('outside')!.dispatchEvent(outside);
  expect(outside.defaultPrevented).toBe(false);
  expect(game.session.state.gameState).toBe(STATE_READY);
  canvas.dispatchEvent(new win.KeyboardEvent('keydown', { code: 'Space', repeat: true }));
  expect(game.session.state.gameState).toBe(STATE_READY);
  canvas.dispatchEvent(new win.KeyboardEvent('keydown', { code: 'Space', cancelable: true }));
  expect(game.session.state.gameState).toBe(STATE_PLAY);
  root.querySelector<TestButton>('[data-game-action="pause"]')!.click();
  expect(game.session.paused).toBe(true);
  expect(pending.size).toBe(0);
  root.querySelector<TestButton>('[data-game-action="step"]')!.click();
  expect(game.session.state.frame).toBe(1);
  root.querySelector<TestButton>('[data-game-action="practice"]')!.click();
  expect(game.session.config.gap).toBe(190);
  expect(savePreferences).toHaveBeenCalled();
  root.querySelector<TestButton>('[data-game-action="debug"]')!.click();
  canvas.dispatchEvent(new win.KeyboardEvent('keydown', { code: 'Space' }));
  let now = browserWindow.performance.now();
  for (let tick = 0; tick < 200 && pending.size; tick++) {
    const [id, callback] = pending.entries().next().value!;
    pending.delete(id);
    now += 19; // End the run between the debug panel's throttled refreshes.
    callback(now);
  }
  expect(game.session.state.gameState).toBe(STATE_OVER);
  expect(root.querySelector('[data-game-metrics]')!.textContent).toContain('y 459.0 · v 0.00');
  expect(root.querySelector('[data-game-metrics]')!.textContent).toContain(`tick ${game.session.state.frame}`);
  game.dispose();
  expect(pending.size).toBe(0);
  expect(stopAudio).toHaveBeenCalled();
  await win.happyDOM.close();
});
