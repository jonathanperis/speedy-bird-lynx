# Docs

Astro static site deployed to GitHub Pages. The site uses Astro 6.4's pluggable Markdown processor API with the Rust-based Sätteri processor for wiki Markdown rendering.

## Commands

Run from this directory (`docs/`):

| Command | Action |
|---|---|
| `bun install` | Install dependencies from `bun.lock` |
| `npm run dev` | Start dev server with Node >=22.12 |
| `npm run build` | Build to `./out/` with Node >=22.12 |
| `npm run preview` | Preview production build locally with Node >=22.12 |

## Environment

Copy `.env.example` to `.env` and fill in local values when needed.

| Variable | Description |
|---|---|
| `PUBLIC_GA_ID` | Optional Google Analytics 4 Measurement ID |
