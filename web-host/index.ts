/// <reference types="@rsbuild/core/types" />

import './runtime.js';
import type { LynxViewElement } from '@lynx-js/web-core/client';
import { mountSpeedyBird } from './host.js';

const view = document.querySelector<LynxViewElement>('lynx-view');
if (!view) throw new Error('Missing <lynx-view> element');

// Development serves the bundle from Rspeedy; the built host ships its own copy.
// Override with ?bundle=<url>.
const bundleUrl =
  new URLSearchParams(location.search).get('bundle') ??
  (import.meta.env.DEV ? 'http://localhost:3000/main.web.bundle' : undefined);

mountSpeedyBird(view, {
  baseUrl: document.baseURI,
  bundleUrl,
  status: document.querySelector<HTMLElement>('#game-status'),
});
view.focus();
