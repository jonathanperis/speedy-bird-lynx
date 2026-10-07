import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

const isProd = process.env.NODE_ENV === 'production';

export default defineConfig({
  integrations: [sitemap()],
  output: 'static',
  outDir: 'out',
  site: 'https://jonathanperis.github.io',
  base: isProd ? '/speedy-bird-lynx' : '',
  vite: {
    server: {
      fs: {
        // The site itself, plus the app's src/ directory: the Canvas demo imports the game rules.
        allow: [fileURLToPath(new URL('./', import.meta.url)), fileURLToPath(new URL('../src/', import.meta.url))],
      },
    },
  },
});
