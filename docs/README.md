# Speedy Bird website and documentation

Astro 7 static site deployed to [GitHub Pages](https://jonathanperis.github.io/speedy-bird-lynx/). It contains a playable Canvas build of the game, which runs the app's own rules engine, and a manual generated from `wiki/*.md`. The visual system is described in the root `DESIGN.md`.

## Run locally

Use **Node.js >=22.12** to execute Astro and **Bun** to install the lockfile. From `docs/`:

```sh
bun install --frozen-lockfile
npm run dev
```

Every command uses the GitHub Pages base path, so development serves `http://localhost:4321/speedy-bird-lynx/` and `/speedy-bird-lynx/docs/`, exactly like production. Set `SITE_BASE` (for example `SITE_BASE=/ npm run dev`) to use another base. To build, check, and preview:

```sh
npm run build
npm run check:site
npm run preview
```

Open the preview URL with `/speedy-bird-lynx/` appended. Build output is `out/`; generated files are not source files to edit.

## Source map

| Path | Responsibility |
|------|----------------|
| `src/pages/index.astro` | Home page: game band with the live timing panel, Sheets 1–3, manual contents; mounts the Canvas demo |
| `src/game/*.ts` | Canvas demo: controller (frame loop, input, pause, storage, announcements), renderer, sprite loader, Web Audio, and the timing panel (`timing.ts`). Gameplay is imported from the app's `src/game/engine.ts` |
| `src/lib/game-facts.ts` | Speed table computed from the engine at build time (Sheet 1) |
| `src/lib/bridge.ts` | `SpeedyBirdModule` table (Sheet 2); the build fails if a host stops implementing a method |
| `src/lib/repo-files.ts` | Reads repository files at build time and extracts `// #region` excerpts (Sheet 3) |
| `src/lib/versions.ts` | Colophon versions read from `package.json`, `libs.versions.toml`, and `Podfile.lock` |
| `src/lib/code-theme.mjs` | Shiki theme for code on paper; every token color passes AA |
| `wiki/*.md` | Guide content |
| `src/pages/docs/[...slug].astro` | Manual routes: `/docs/` (start here) and `/docs/<slug>/`, with contents, search, and previous/next |
| `src/lib/docs-sidebar.config.ts` | Parts, route order, titles, descriptions, article numbers, and the source files each guide documents |
| `src/lib/render-doc.ts` | Lifts the guide's H1 into the page header, collects headings, resolves `.md` links, builds typed callouts, wraps tables |
| `src/layouts/BaseLayout.astro` | HTML shell, per-route canonical/OG URLs, structured data |
| `src/components/SiteHeader.astro`, `SiteFooter.astro` | Top bar and colophon shared by every page |
| `src/styles/tokens.css`, `fonts.css`, `base.css` | Palette, self-hosted fonts, and shared rules (see `DESIGN.md`) |
| `src/styles/home.css`, `docs.css` | Home page and manual styles |
| `public/assets/` | Browser copies of root game sprites and sounds |
| `public/og-image.png`, icons | Social preview and browser icons |
| `scripts/check-site.mjs` | Offline build checks: wiki routes, local links/fragments, unique IDs, canonical/OG URLs, that every local asset exists, that JSON-LD parses, and that no page has inline event handlers or script URLs and no guide has scripts |
| `astro.config.mjs` | Site URL, base path (`SITE_BASE`, default `/speedy-bird-lynx`), output directory, sitemap, Markdown code theme, and the dev server's file access |

The build reads files outside `docs/` (the engine, host sources, manifests), so run it from `docs/`.

## Add or edit a guide

1. Edit a file in `wiki/`, or create `wiki/your-guide.md` with a sentence-case H1 (the page header shows it).
2. Add a new guide's slug to `SECTION_CATEGORIES`, its title/description to `PAGE_META`, and the files it documents to `PAGE_SOURCES` in `docs-sidebar.config.ts`. Article numbers follow from the order.
3. Link to sibling guides as `[Guide](your-guide.md)` or `[Section](your-guide.md#heading)`; the build converts these to base-aware URLs.
4. For callouts, start a blockquote with `**Note:**`, `**Hold:**` (a dependency held back, with the reason), or `**Verified:**` (what was run, on what).
5. Build and run `npm run check:site`.

`/docs/` renders `wiki/index.md` as "Start here"; every other guide has its own route. Search runs over an index built with the site and finds titles, headings, and text; `/` focuses it.

The site ships no `robots.txt`: crawlers only read it from the host root (`jonathanperis.github.io/robots.txt`), which this project does not control. Pages link the sitemap with `<link rel="sitemap">` instead.

Page titles and descriptions come from `PAGE_META`; the layout derives canonical and `og:url` from the current route. The landing page has its own JSON-LD graph: a VideoGame, which must describe actual platform availability, and a SoftwareSourceCode entry that carries the repository URL.

## Assets and credits

Root `assets/` is the canonical game artwork/audio source. When active assets change, synchronize the corresponding files under `public/assets/`; archived sprite sheets under `assets/sprites/unused/` are not served. The site build only copies public assets and does not perform synchronization. Preserve the original-game, upstream Canvas recreation, sprite, and sound attribution in the manual and footer.

The Canvas demo imports `src/game/engine.ts`, `src/constants.ts`, `src/game/preferences.ts`, and `src/game/announcements.ts` from the app, so gameplay changes reach both surfaces automatically; only rendering lives in `src/game/renderer.ts`, which mirrors the sizes and layering of `src/components/`. `astro.config.mjs` allows the dev server to read the app's `src/` directory. The demo draws the full 400×750 playfield and stores the best score under `speedy-bird.preferences.v1` in the same format as the standalone web host. The `1.00× Starting Speed` display is a static rule explanation, not live telemetry.

### Regenerate social images and icons

Requires **Python >=3.10**, the pinned Pillow dependency, and two installed TTF fonts. Create an isolated environment inside the repository, then run from the root:

```sh
python3 -m venv .specs/docs-assets-venv
.specs/docs-assets-venv/bin/python -m pip install -r docs/scripts/requirements.txt
.specs/docs-assets-venv/bin/python docs/scripts/generate_social_assets.py
```

Defaults use Linux DejaVu font paths. On macOS, pass installed font paths explicitly:

```sh
.specs/docs-assets-venv/bin/python docs/scripts/generate_social_assets.py \
  --font-bold "/System/Library/Fonts/Supplemental/Arial Bold.ttf" \
  --font-mono-bold "/System/Library/Fonts/Supplemental/Courier New Bold.ttf"
```

Outputs are `public/og-image.png` (1200×630), `favicon.png` (256×256), `favicon-32x32.png`, and `apple-touch-icon.png` (180×180). `favicon.ico` remains the icon source. Review generated images after changing fonts or text and keep both layout metadata and the landing page's image dimensions aligned.

## Optional analytics

Copy `.env.example` to `.env` only when configuring local analytics. `PUBLIC_GA_ID` is an optional public GA4 measurement ID; without it (or with a malformed value), the site emits no analytics markup or script at all. Never place credentials in `PUBLIC_*` variables.

With an ID, `src/components/Analytics.astro` (rendered at the end of every page's `<body>`) implements Google Consent Mode v2: every consent type defaults to `denied`, and `gtag.js` is not requested until the visitor accepts in a small banner. Accepting grants only `analytics_storage`; declining is remembered and clears any `_ga` cookies. The choice is stored in `localStorage` (`speedy-bird.analytics-consent`), and an "Analytics settings" button in the landing footer and manual sidebar reopens the banner.

## Deployment and verification

`.github/workflows/deploy.yml` pins the shared `jonathanperis/.github` Pages workflow by full commit SHA. It runs on pushes to `main` or manual dispatch from `main`, installs the frozen Bun lockfile, executes Astro using Node, and publishes `docs/out/`. Only the optional public analytics ID is forwarded.

Build Check independently runs the docs build and `npm run check:site`. The checker is offline and covers generated routes, HTML and asset references, structured data, and unsafe markup; it does not establish browser behavior, external-link availability, gameplay, or accessibility conformance. A successful local build is not a deployed-site update: publication happens through the normal branch/PR workflow.

Current dependencies and compatibility decisions are documented in [Dependencies and Upgrades](wiki/dependency-updates.md). The root [README](../README.md) explains the ReactLynx app, native hosts, and separate web surfaces.
