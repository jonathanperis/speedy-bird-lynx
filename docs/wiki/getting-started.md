# Getting started

This page takes you from a fresh clone to the game running in the dev server, the website, and the native apps.

## Prerequisites

- **Bun** for dependency installation and root scripts
- **Node.js** >=22.12 for the build toolchains; use npm scripts to run Astro
- **Java 21**, Android SDK **Platform 37.2**, and current Android command-line tools (minimum supported device API remains 21)
- **Xcode**, **Ruby >=3.2**, and Bundler (for iOS)

See [Dependencies and upgrades](dependency-updates.md) for exact versions and compatibility holds.

## Quick start

```bash
git clone https://github.com/jonathanperis/speedy-bird-lynx.git
cd speedy-bird-lynx
bun install --frozen-lockfile
bun run dev
```

This starts the Rspeedy dev server with hot module replacement. The game is accessible at:

- **Web preview**: `http://localhost:3000/__web_preview?casename=main.web.bundle`
- **Lynx bundle**: `http://localhost:3000/main.lynx.bundle`

To view on a mobile device, open the Lynx bundle URL in [Lynx Explorer](https://github.com/lynx-family/lynx) or [Lynx Go](https://apps.apple.com/us/app/lynx-go-dev-explorer/id6743227790) (replace `localhost` with your machine's IP).

## Building for production

```bash
bun run build
```

This outputs:

- `dist/main.lynx.bundle` — native bundle for Android/iOS
- `dist/main.web.bundle` — web bundle

## Android

```bash
bun run build
cd android && ./gradlew assembleDebug
```

The APK is at `android/app/build/outputs/apk/debug/app-debug.apk`. Gradle stages the current root bundle and sound effects into generated assets; no manual copy is needed. Install via `adb install` or transfer to your device. Run `./gradlew lintDebug` for Android API checks, or `./gradlew assembleRelease` for a release APK.

For release builds with signing, see [CI/CD pipeline](ci-cd-pipeline.md).

## iOS

```bash
bun run build
cd ios
bundle install
bundle exec pod install
open SpeedyBird.xcworkspace
```

Pick a simulator or device and run. The project packages the current `dist/main.lynx.bundle` and the sounds directly; no copy step is needed. Running on a device requires selecting your own signing team in Xcode; CI always builds unsigned. See [Native host apps](native-host-apps.md) for the UI tests and project generator.

## Web / GitHub Pages

The public web surface is the Astro site in `docs/`. It renders the landing page, plays the real ReactLynx build on it, and generates wiki pages from `docs/wiki/*.md`. Astro 7 requires Node.js >=22.12, so use the npm scripts for the docs dev server/build even though dependencies are installed from `bun.lock`.

The home page loads `main.web.bundle` and the Lynx web runtime from `docs/public/play/`, so build them at the repository root first (and again after changing the app):

```bash
bun run build:site
cd docs
bun install --frozen-lockfile
npm run dev
```

For a production build:

```bash
npm run build
npm run check:site
npm run preview
```

The static output is written to `docs/out/`. Development, preview, and production all serve `/speedy-bird-lynx/` and `/speedy-bird-lynx/docs/` (set `SITE_BASE` to change the base). The Deploy Web workflow runs `bun run build:site` and then deploys that production output. Content authoring and asset maintenance are documented in `docs/README.md`.

## Web surfaces

| Surface | How to use it | Notes |
|---------|---------------|-------|
| ReactLynx web preview | `bun run dev`, then open `http://localhost:3000/__web_preview?casename=main.web.bundle` | Uses the compiled `main.web.bundle` from Rspeedy for development |
| GitHub Pages home page | `bun run build:site`, then `cd docs && npm run dev` and open `http://localhost:4321/speedy-bird-lynx/` | The ReactLynx build in a `<lynx-view>` with the shared bridge from `web-host/host.ts`; click, tap, or Space/Enter while the game has focus |
| Standalone web host | `bun run dev:web-host` at `http://localhost:4000` | Also run `bun run dev` at port 3000; the host loads `http://localhost:3000/main.web.bundle`. Implements sound, the saved best score, Space/Enter, and pause on tab switch |

In development the host needs two terminals. Pass `?bundle=<url>` to load a bundle from elsewhere. For a self-contained build, run `bun run build` and then `bun run build:web-host`: `dist-web-host/` then contains the host, `main.web.bundle`, the audio, and the bridge module, and `bunx rsbuild preview --config rsbuild.web-host.config.ts` serves it. The dev and preview servers send cross-origin isolation headers, but the Lynx web runtime does not need them: any static server works, including GitHub Pages under a project path.

## Project commands

| Command | Description |
|---------|-------------|
| `bun run dev` | Start Rspeedy dev server with HMR |
| `bun run build` | Production build (Lynx + Web bundles) |
| `bun run check` | Type-check the app, tests, web host, and configs |
| `bun run test` | Rstest unit and component tests (needs Node.js on `PATH`) |
| `bun run lint` / `bun run format` | Biome check / apply fixes |
| `bun run assets:sync` / `assets:check` | Copy the sprites in `assets/` to `docs/public/assets/` / verify the copies |
| `bun run dev:web-host` | Serve the Lynx web host on port 4000 (with `bun run dev`) |
| `bun run build:web-host` | Build the self-contained standalone host (after `bun run build`) |
| `bun run build:site` | Build `main.web.bundle` and the Lynx web runtime into `docs/public/play/` for the website |
| `cd docs && npm run dev` | Start Astro docs/dev site with Node >=22.12 |
| `cd docs && npm run build` | Build Astro GitHub Pages output to `docs/out/` with Node >=22.12 |
| `cd docs && npm run preview` | Preview the production docs build with Node >=22.12 |
| `cd docs && npm run check:site` | Validate generated routes, links, IDs, and metadata after building |
| `cd android && ./gradlew assembleDebug` | Build debug Android APK |
| `cd android && ./gradlew assembleRelease` | Build release Android APK |
| `cd android && ./gradlew lintDebug` | Check native Android API and resource usage |
