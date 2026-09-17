# Docs

Astro static site deployed to GitHub Pages. The site uses Astro 7 with the default Rust-powered Markdown pipeline for wiki Markdown rendering.

## Commands

Run from this directory (`docs/`):

| Command | Action |
|---|---|
| `bun install --frozen-lockfile` | Install dependencies from `bun.lock` |
| `npm run check` | Astro/TypeScript diagnostics |
| `npm run dev` | Start dev server with Node >=22.12 |
| `npm run build` | Build to `./out/` with Node >=22.12 |
| `npm run preview` | Preview production build locally with Node >=22.12 |

Development and production both use `/speedy-bird-lynx/`, so manual links exercise the deployment path locally. The game imports the root `src/game/` simulation. Build synchronizes canonical game assets automatically.

## Environment

Copy `.env.example` to `.env` and fill in local values when needed.

| Variable | Description |
|---|---|
| `PUBLIC_GA_ID` | Optional Google Analytics 4 Measurement ID |
