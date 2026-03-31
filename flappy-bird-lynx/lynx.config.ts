import { defineConfig } from '@lynx-js/rspeedy';
import { pluginReactLynx } from '@lynx-js/react-rsbuild-plugin';

export default defineConfig({
  plugins: [pluginReactLynx()],
  source: {
    entry: {
      main: './src/index.tsx',
    },
  },
  html: {
    title: 'Flappy Bird',
  },
});
