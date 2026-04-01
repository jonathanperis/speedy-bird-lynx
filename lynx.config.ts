import { defineConfig } from '@lynx-js/rspeedy';
import { pluginReactLynx } from '@lynx-js/react-rsbuild-plugin';

export default defineConfig({
  plugins: [pluginReactLynx()],
  environments: {
    web: {},
    lynx: {},
  },
  source: {
    entry: {
      main: './src/index.tsx',
    },
    assetsInclude: [/\.wav$/],
  },
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'credentialless',
      'Cross-Origin-Resource-Policy': 'cross-origin',
    },
  },
});
