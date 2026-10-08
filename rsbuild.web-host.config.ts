import { defineConfig } from '@rsbuild/core';

// <lynx-view> host. `bun run build` must run first: the production host ships
// dist/main.web.bundle alongside the game audio and the native-module shim.
//
// By default this builds the standalone host page into dist-web-host/. `bun run build:site`
// sets WEB_HOST_TARGET=site and builds only the Lynx web runtime into docs/public/play/: the
// website brings its own <lynx-view> and reads the runtime's hashed file names from the
// manifest.
const site = process.env.WEB_HOST_TARGET === 'site';

export default defineConfig({
  source: {
    entry: site ? { runtime: { import: './web-host/runtime.ts', html: false } } : { index: './web-host/index.ts' },
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
    // Resolve chunks, workers, and WebAssembly relative to the script that loads them, so the
    // build works from any directory (such as a GitHub Pages project path) and from any page.
    assetPrefix: 'auto',
    distPath: {
      root: site ? 'docs/public/play' : 'dist-web-host',
    },
    manifest: site,
    // The website loads the runtime with one script tag; its element styles come along.
    injectStyles: site,
    copy: [
      { from: './web-host/native-module.js' },
      { from: './assets/audio', to: 'audio' },
      { from: './dist/main.web.bundle', noErrorOnMissing: process.env.NODE_ENV !== 'production' },
    ],
  },
});
