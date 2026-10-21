import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { paperTheme } from './src/lib/code-theme.mjs';

// The custom domain serves this project at the host root. Set SITE_BASE to build
// under another path.
const base = process.env.SITE_BASE?.trim() || '';

export default defineConfig({
  integrations: [sitemap()],
  output: 'static',
  outDir: 'out',
  site: 'https://speedy-bird-lynx.jonathanperis.tech',
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
