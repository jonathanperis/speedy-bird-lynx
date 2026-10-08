// Home page game: the ReactLynx app itself (main.web.bundle) in a <lynx-view>, with the same
// SpeedyBirdModule implementation as the standalone web host (web-host/host.ts). This module
// adds only the page around it: the start and mute buttons, the timing panel, and pausing
// while the game is scrolled out of view.

import type { Host, Hud } from '../../../web-host/host.ts';
import { mountSpeedyBird } from '../../../web-host/host.ts';
import { STATE_PLAY } from '../../../src/types.ts';
import { createTimingPanel } from './timing.ts';

const MUTED_KEY = 'speedy-bird.demo.muted';
/** Give up waiting for the runtime and bundle after this long (blocked or very slow network). */
const LOAD_TIMEOUT_MS = 30_000;

type LynxView = Parameters<typeof mountSpeedyBird>[0];

function readStorage(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // The setting lasts for this visit only.
  }
}

export function mountGame() {
  const root = document.getElementById('game');
  const view = document.getElementById('lynx');
  const message = document.getElementById('game-message');
  const startButton = document.getElementById('play-btn') as HTMLButtonElement | null;
  const muteButton = document.getElementById('mute-btn') as HTMLButtonElement | null;
  const panelElement = document.getElementById('timing');
  if (!root || !view || !message) return;
  const panel = panelElement ? createTimingPanel(panelElement) : undefined;

  let host: Host | null = null;
  let ready = false;
  let failed = false;
  let startWhenReady = false;
  let inView = true;

  // A failure shown before the first frame is undone if the game still arrives (for example
  // after a retried chunk request).
  const fail = (text: string) => {
    if (ready) return;
    failed = true;
    root.removeAttribute('aria-busy');
    root.classList.add('is-failed');
    message.textContent = text;
    if (startButton) startButton.hidden = true;
    panel?.fail();
  };

  const start = () => {
    if (!ready) {
      startWhenReady = true;
      if (startButton) {
        startButton.disabled = true;
        startButton.textContent = 'Loading…';
      }
      return;
    }
    view.focus({ preventScroll: true });
    host?.tap();
  };

  const onHud = (hud: Hud) => {
    if (!ready) {
      ready = true;
      window.clearTimeout(timeout);
      root.removeAttribute('aria-busy');
      message.hidden = true;
      if (failed) {
        failed = false;
        root.classList.remove('is-failed');
        if (startButton) startButton.hidden = false;
      }
      if (!inView) host?.pause();
      if (startWhenReady) start();
    }
    // While a run is in progress the game captures touches, so a quick swipe flaps instead
    // of scrolling. Otherwise touches scroll the page as usual.
    root.classList.toggle('is-playing', hud.gameState === STATE_PLAY && !hud.paused);
    if (hud.gameState === STATE_PLAY && startButton) startButton.hidden = true;
    panel?.update(hud);
  };

  if (typeof WebAssembly !== 'object' || !('customElements' in window)) {
    fail('This browser cannot run the Lynx web runtime, which needs WebAssembly and custom elements.');
    return;
  }
  const timeout = window.setTimeout(
    () => fail('The game did not load. Check your connection and reload the page.'),
    LOAD_TIMEOUT_MS,
  );
  view.addEventListener('error', () => fail('The game failed to start in this browser.'));

  startButton?.addEventListener('click', start);

  // Properties set before the element is defined would shadow its accessors, so wait for the
  // runtime script to register <lynx-view>.
  void customElements.whenDefined('lynx-view').then(() => {
    const game = mountSpeedyBird(view as LynxView, {
      baseUrl: root.dataset.play ?? 'play/',
      status: document.getElementById('game-status'),
      onHud,
    });
    host = game;

    if (muteButton) {
      const applyMuted = (muted: boolean) => {
        game.muted = muted;
        muteButton.setAttribute('aria-pressed', String(muted));
      };
      applyMuted(readStorage(MUTED_KEY) === '1');
      muteButton.addEventListener('click', () => {
        const muted = !game.muted;
        applyMuted(muted);
        writeStorage(MUTED_KEY, muted ? '1' : '0');
      });
    }

    // Scrolling the game away pauses a run in progress, like hiding the tab.
    new IntersectionObserver(([entry]) => {
      inView = entry?.isIntersecting ?? true;
      if (!ready) return;
      if (!inView) game.pause();
      else if (!document.hidden) game.resume();
    }).observe(view);
  });
}
