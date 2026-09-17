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
  },
  output: {
    copy: [
      { from: './assets/audio', to: 'assets/audio' },
      { from: './dist/main.web.bundle', to: 'main.web.bundle' },
    ],
    distPath: {
      root: 'dist-web-host',
    },
  },
});
