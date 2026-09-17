# Speedy Bird website and documentation

Astro 7 static site deployed to [GitHub Pages](https://jonathanperis.github.io/speedy-bird-lynx/). It contains the independent Canvas game and a manual generated from `wiki/*.md`. Astro uses its default Rust-powered Markdown pipeline; `src/lib/render-doc.ts` adapts compiled HTML links and heading IDs at build time.

## Run locally

Use **Node.js >=22.12** to execute Astro and **Bun** to install the lockfile. From `docs/`:

```sh
bun install --frozen-lockfile
npm run dev
```

Development normally serves `http://localhost:4321/` and `/docs/`, without the GitHub repository prefix. Production uses `/speedy-bird-lynx/`:

```sh
npm run build
npm run check:site
npm run preview
```

Open the preview URL with `/speedy-bird-lynx/` appended. Build output is `out/`; generated files are not source files to edit.

## Source map

| Path | Responsibility |
|------|----------------|
| `src/pages/index.astro` | Active landing page, styles, and inline Canvas game |
| `wiki/*.md` | Technical guide content |
| `src/pages/docs/[...slug].astro` | Combined manual and individual guide routes |
| `src/lib/docs-sidebar.config.ts` | Navigation groups, route order, page titles, and descriptions |
| `src/lib/render-doc.ts` | Build-time `.md` link resolution and combined-manual ID namespacing |
| `src/layouts/BaseLayout.astro` | Documentation HTML shell, per-route canonical/OG URLs, TechArticle metadata |
| `src/styles/docs.css`, `globals.css` | Manual styles and shared design tokens |
| `public/assets/` | Browser copies of root game sprites and sounds |
| `public/og-image.png`, icons | Social preview and browser icons |
| `scripts/check-site.mjs` | Generated routes, local links/fragments, unique IDs, and canonical/OG validation |
| `astro.config.mjs` | Site URL, development/production base, output directory, sitemap, and Tailwind |

## Add or edit a guide

1. Edit a file in `wiki/`, or create `wiki/your-guide.md` with a descriptive H1.
2. Add a new guide's slug to `SECTION_CATEGORIES` and its title/description to `PAGE_META` in `docs-sidebar.config.ts`.
3. Add it to the table in `wiki/index.md` so both the built manual and GitHub source are discoverable.
4. Link to sibling sources as `[Guide](your-guide.md)` or `[Section](your-guide.md#heading)`. The build converts these to base-aware public URLs. Use `index.md` for the combined manual.
5. Build and run `npm run check:site`. The route checker verifies every wiki file has a generated route.

The public `/docs/` route combines all guides. `/docs/<slug>/` renders a single guide. Section IDs such as `#game-engine` remain stable. On the combined page, generated heading IDs are prefixed with their guide slug to avoid collisions; on individual pages, heading fragments remain unprefixed. A heading matching its section slug uses the enclosing section's ID rather than duplicating it.

Sidebar search filters sections on the combined manual; it is intentionally hidden on individual guides. Page titles and descriptions come from `PAGE_META`; the layout derives canonical and `og:url` from the current route. The landing page has separate VideoGame metadata, which must describe actual platform availability.

## Assets and credits

Root `assets/` is the canonical game artwork/audio source. When active assets change, synchronize the corresponding files under `public/assets/`; archived sprite sheets under `assets/sprites/unused/` are not served. The site build only copies public assets and does not perform synchronization. Preserve the original-game, upstream Canvas recreation, sprite, and sound attribution in the manual and footer.

The landing Canvas has explicit 400×600 dimensions, compared with 400×750 for ReactLynx. Physics and medal values are duplicated between implementations; review both when changing gameplay. The `1.00× Starting Speed` display is a static rule explanation, not live telemetry.

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

Copy `.env.example` to `.env` only when configuring local analytics. `PUBLIC_GA_ID` is an optional public GA4 measurement ID; without it, the site emits no analytics tag. Never place credentials in `PUBLIC_*` variables.

## Deployment and verification

`.github/workflows/deploy.yml` pins the shared `jonathanperis/.github` Pages workflow by full commit SHA. It runs on pushes to `main` or manual dispatch from `main`, installs the frozen Bun lockfile, executes Astro using Node, and publishes `docs/out/`. Only the optional public analytics ID is forwarded.

Build Check independently runs the docs build and `npm run check:site`. The checker is offline and covers generated routes and HTML references; it does not establish browser behavior, external-link availability, gameplay, or accessibility conformance. A successful local build is not a deployed-site update: publication happens through the normal branch/PR workflow.

Current dependencies and compatibility decisions are documented in [Dependencies and Upgrades](wiki/dependency-updates.md). The root [README](../README.md) explains the ReactLynx app, native hosts, and separate web surfaces.
