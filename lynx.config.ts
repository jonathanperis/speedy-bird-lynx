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
  output: {
    // Native hosts copy one bundle, so its sprite images must work offline.
    dataUriLimit: { image: 64 * 1024 },
  },
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'credentialless',
      'Cross-Origin-Resource-Policy': 'cross-origin',
    },
  },
});
