import { act, fireEvent, render } from '@lynx-js/react/testing-library';
import { afterEach, beforeEach, describe, expect, rs, test } from '@rstest/core';

import App from '../src/App.js';

interface TestingEnv {
  mainThread: { globalThis: { lynx: Record<string, unknown> } };
  backgroundThread: { globalThis: Record<string, unknown> };
  switchToMainThread(): void;
  switchToBackgroundThread(): void;
}

const env = (globalThis as unknown as { lynxTestingEnv: TestingEnv }).lynxTestingEnv;

let frames: Array<() => void> = [];
let now = 1_000;
const bridge = {
  played: [] as string[],
  saved: [] as string[],
  announced: [] as string[],
  stored: '',
  play(sound: string) {
    this.played.push(sound);
  },
  stopAudio() {},
  loadPreferences(callback: (value: string) => void) {
    callback(this.stored);
  },
  savePreferences(value: string) {
    this.saved.push(value);
  },
  announce(message: string) {
    this.announced.push(message);
  },
};

/** Run queued main-thread animation frames, advancing the clock by `ms` before each. */
async function advance(ms: number, count = 1) {
  for (let index = 0; index < count; index++) {
    now += ms;
    const pending = frames;
    frames = [];
    await act(async () => {
      env.switchToMainThread();
      for (const frame of pending) frame();
      env.switchToBackgroundThread();
    });
  }
}

function label(container: Element) {
  return container.querySelector('[accessibility-label]')?.getAttribute('accessibility-label');
}

function root(container: Element) {
  return container.querySelector('[accessibility-label]') as Element;
}

beforeEach(() => {
  frames = [];
  now = 1_000;
  Object.assign(bridge, { played: [], saved: [], announced: [], stored: '' });
  rs.spyOn(Date, 'now').mockImplementation(() => now);
  env.mainThread.globalThis.lynx.requestAnimationFrame = (callback: () => void) => frames.push(callback);
  env.mainThread.globalThis.lynx.cancelAnimationFrame = () => {};
  env.backgroundThread.globalThis.NativeModules = { SpeedyBirdModule: bridge };
});

afterEach(() => {
  rs.restoreAllMocks();
});

describe('App', () => {
  test('starts on the Get Ready screen with every pipe slot hidden', async () => {
    const { container } = render(<App />);
    await advance(16);
    expect(label(container)).toBe('Speedy Bird. Tap to start flapping.');
    const slots = [...container.querySelectorAll('[id^="pipe-"]')].filter((el) => /^pipe-\d$/.test(el.id));
    expect(slots).toHaveLength(5);
    for (const slot of slots) expect(slot.getAttribute('style')).toMatch(/display: ?none/);
  });

  test('a tap starts the run, plays the flap, and moves the bird on the main thread', async () => {
    const { container } = render(<App />);
    await advance(16);
    const bird = container.querySelector('#bird') as Element;
    const before = bird.getAttribute('style');
    fireEvent.tap(root(container));
    await advance(16, 10);
    expect(label(container)).toBe('Speedy Bird. Score 0. Tap to flap.');
    expect(bridge.played).toContain('flap');
    expect(bridge.announced).toContain('Game started.');
    expect(bird.getAttribute('style')).not.toBe(before);
  });

  test('falling to the ground ends the run and shows the saved best score', async () => {
    bridge.stored = JSON.stringify({ version: 1, bestScore: 7 });
    const { container } = render(<App />);
    await advance(16);
    fireEvent.tap(root(container));
    // Without more taps the bird lands within a few seconds of simulated time.
    await advance(100, 60);
    expect(label(container)).toBe('Game over. Score 0. Best 7. Tap to play again.');
    expect(bridge.played).toContain('fall');
    expect(bridge.saved).toEqual([]);
    // Once settled the loop stops requesting frames until the next tap.
    expect(frames).toHaveLength(0);
  });

  test('the host pause event freezes a run until the next tap', async () => {
    const { container } = render(<App />);
    await advance(16);
    fireEvent.tap(root(container));
    await advance(16, 3);
    await act(async () => {
      (env.backgroundThread.globalThis.lynx as { getJSModule(name: string): { emit(event: string): void } })
        .getJSModule('GlobalEventEmitter')
        .emit('SpeedyBirdPause');
    });
    await advance(16);
    expect(label(container)).toBe('Speedy Bird paused. Score 0. Tap to resume.');
    expect(frames).toHaveLength(0);
    fireEvent.tap(root(container));
    await advance(16, 2);
    expect(label(container)).toBe('Speedy Bird. Score 0. Tap to flap.');
  });
});
