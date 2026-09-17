import { defineConfig } from '@rsbuild/core';

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
  },
});
