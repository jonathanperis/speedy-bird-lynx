import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// GitHub Pages serves this project under /speedy-bird-lynx/. Every command (dev, build, preview)
// uses that base, so local URLs match production. Set SITE_BASE (for example SITE_BASE=/) to
// serve or build the site under another path.
const base = process.env.SITE_BASE?.trim() || '/speedy-bird-lynx';

export default defineConfig({
  integrations: [sitemap()],
  output: 'static',
  outDir: 'out',
  site: 'https://jonathanperis.github.io',
  base,
  vite: {
    server: {
      fs: {
        // The site itself, plus the app's src/ directory: the Canvas demo imports the game rules.
        allow: [fileURLToPath(new URL('./', import.meta.url)), fileURLToPath(new URL('../src/', import.meta.url))],
      },
    },
  },
});
