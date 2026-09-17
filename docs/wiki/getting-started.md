# Getting Started

## Prerequisites

- **Bun** for dependency installation and root scripts
- **Node.js** >=22.12 for the build toolchains; use npm scripts to run Astro
- **Java 21**, Android SDK **Platform 37.2**, and current Android command-line tools (minimum supported device API remains 21)
- **Xcode**, **Ruby >=3.2**, and Bundler (for iOS after creating a project from the source scaffold)

See [Dependencies and Upgrades](dependency-updates.md) for exact versions and compatibility holds.

## Quick Start

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

## Building for Production

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

The APK is at `android/app/build/outputs/apk/debug/app-debug.apk`. Gradle stages the current root bundle into generated assets; no manual copy is needed. Install via `adb install` or transfer to your device. Run `./gradlew lintDebug` for Android API checks, or `./gradlew assembleRelease` for a release APK.

For release builds with signing, see [CI/CD Pipeline](ci-cd-pipeline.md).

## iOS

> Requires Xcode and an Xcode project (`.xcodeproj`). The repository includes the Swift/CocoaPods source scaffold, but the Xcode project/workspace must be created locally before building. See [Native Host Apps](native-host-apps.md) for setup instructions.

```bash
bun run build
cp dist/main.lynx.bundle ios/SpeedyBird/Resources/
cd ios
bundle install
bundle exec pod install
open SpeedyBird.xcworkspace
```

Configure the project, scheme, resources, and deployment target in Xcode, then build for your selected simulator or device. Device distribution requires signing configuration; the checked-in CI commands always produce unsigned archives when a project exists.

## Web / GitHub Pages

The public web surface is the Astro site in `docs/`. It renders the landing page, embeds the playable canvas demo, and generates wiki pages from `docs/wiki/*.md`. Astro 7 requires Node.js >=22.12, so use the npm scripts for the docs dev server/build even though dependencies are installed from `bun.lock`.

```bash
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

The static output is written to `docs/out/`. Development serves `/` and `/docs/`; production/preview uses `/speedy-bird-lynx/` and `/speedy-bird-lynx/docs/`. The shared Pages workflow deploys that production output. Content authoring and asset maintenance are documented in `docs/README.md`.

## Web Surfaces

| Surface | How to use it | Notes |
|---------|---------------|-------|
| ReactLynx web preview | `bun run dev`, then open `http://localhost:3000/__web_preview?casename=main.web.bundle` | Uses the compiled `main.web.bundle` from Rspeedy for development |
| GitHub Pages canvas demo | `cd docs && npm run dev`, then open the local Astro URL | Browser-only playable demo in `docs/src/pages/index.astro`; physics mirror the ReactLynx game, while the 400x600 viewport is adapted to the landing-page phone frame |
| Standalone web host | `bun run dev:web-host` at `http://localhost:4000` | Also run `bun run dev` at port 3000; the host loads `http://localhost:3000/main.web.bundle` |

The standalone host is development-only and needs two terminals. Both servers configure cross-origin isolation headers. Use the listed `localhost` URLs consistently; if you change the bundle server's port, update `web-host/index.html` too. `bun run build:web-host` compiles the host but does not turn it into a self-contained Pages deployment.

## Project Commands

| Command | Description |
|---------|-------------|
| `bun run dev` | Start Rspeedy dev server with HMR |
| `bun run build` | Production build (Lynx + Web bundles) |
| `bun run check` | Type-check the ReactLynx app |
| `bun run dev:web-host` | Serve the development-only Lynx web host on port 4000 |
| `bun run build:web-host` | Compile the standalone host |
| `cd docs && npm run dev` | Start Astro docs/dev site with Node >=22.12 |
| `cd docs && npm run build` | Build Astro GitHub Pages output to `docs/out/` with Node >=22.12 |
| `cd docs && npm run preview` | Preview the production docs build with Node >=22.12 |
| `cd docs && npm run check:site` | Validate generated routes, links, IDs, and metadata after building |
| `cd android && ./gradlew assembleDebug` | Build debug Android APK |
| `cd android && ./gradlew assembleRelease` | Build release Android APK |
| `cd android && ./gradlew lintDebug` | Check native Android API and resource usage |
