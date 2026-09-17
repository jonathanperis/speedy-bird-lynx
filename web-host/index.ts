import '@lynx-js/web-core/client';
import '@lynx-js/web-elements/all';
import type { LynxViewElement } from '@lynx-js/web-core/client';
import { createBrowserBridge } from '../src/platform/browser.js';
import type { SoundName } from '../src/types.js';

const view = document.querySelector<LynxViewElement>('lynx-view')!;
const bridge = createBrowserBridge(new URL('./', location.href).href);
view.nativeModulesMap = { SpeedyBirdModule: new URL('./native-module.js', import.meta.url).href };
view.onNativeModulesCall = (name, data) => {
  if (name === 'play') bridge.play(data as SoundName);
  if (name === 'stopAudio') bridge.stopAudio();
  if (name === 'savePreferences') bridge.savePreferences(data as string);
  if (name === 'loadPreferences') return new Promise<string>(resolve => bridge.loadPreferences(resolve));
  return null;
};
view.url = new URLSearchParams(location.search).get('bundle') ?? './main.web.bundle';
view.addEventListener('keydown', event => {
  if (event.repeat || event.target !== view || !['Space', 'KeyP'].includes(event.code)) return;
  event.preventDefault();
  view.sendGlobalEvent('SpeedyBirdCommand', [event.code === 'Space' ? 'tap' : 'pause']);
});
document.querySelectorAll<HTMLButtonElement>('[data-command]').forEach(button => {
  button.addEventListener('click', () => view.sendGlobalEvent('SpeedyBirdCommand', [button.dataset.command!]));
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { bridge.stopAudio(); view.sendGlobalEvent('SpeedyBirdPause', []); }
});
window.addEventListener('pagehide', () => bridge.stopAudio());
