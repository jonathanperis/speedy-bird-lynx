import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { paperTheme } from './src/lib/code-theme.mjs';

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
  markdown: {
    shikiConfig: { theme: paperTheme },
  },
  vite: {
    server: {
      fs: {
        // The site itself, the app's src/ (game rules for the facts and timing panel), and the
        // web host's SpeedyBirdModule implementation, which the home page shares.
        allow: [
          fileURLToPath(new URL('./', import.meta.url)),
          fileURLToPath(new URL('../src/', import.meta.url)),
          fileURLToPath(new URL('../web-host/', import.meta.url)),
        ],
      },
    },
  },
});
