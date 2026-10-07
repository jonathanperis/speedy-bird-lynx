import { defineConfig } from '@rsbuild/core';

// Standalone <lynx-view> host. `bun run build` must run first: the production host
// ships dist/main.web.bundle alongside the game audio and the native-module shim.
export default defineConfig({
  source: {
    entry: {
      index: './web-host/index.ts',
    },
  },
  html: {
    template: './web-host/index.html',
  },
  server: {
    port: 4000,
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'credentialless',
    },
  },
  output: {
    distPath: {
      root: 'dist-web-host',
    },
    copy: [
      { from: './web-host/native-module.js' },
      { from: './assets/audio', to: 'audio' },
      { from: './dist/main.web.bundle', noErrorOnMissing: process.env.NODE_ENV !== 'production' },
    ],
  },
});
