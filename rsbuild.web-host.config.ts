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
    distPath: {
      root: 'dist-web-host',
    },
  },
});
