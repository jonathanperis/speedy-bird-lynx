# Getting Started

## Prerequisites

- **Bun** for the root ReactLynx/Rspeedy app (`bun install`, `bun run dev`, `bun run build`)
- **Node.js** >=22.12 for the Astro 6.4+ documentation site in `docs/` (`npm run dev/build/preview`)
- **Java 17** and **Android SDK** (for Android builds)
- **Xcode 15+** and **CocoaPods** (for iOS builds after creating the Xcode project from the included source scaffold)

## Quick Start

```bash
git clone https://github.com/jonathanperis/speedy-bird-lynx.git
cd speedy-bird-lynx
bun install
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
cp dist/main.lynx.bundle android/app/src/main/assets/
cd android && ./gradlew assembleDebug
```

The APK is at `android/app/build/outputs/apk/debug/app-debug.apk`. Install via `adb install` or transfer to your device.

For release builds with signing, see [CI/CD Pipeline](/speedy-bird-lynx/docs/ci-cd-pipeline/).

## iOS

> Requires Xcode and an Xcode project (`.xcodeproj`). The repository includes the Swift/CocoaPods source scaffold, but the Xcode project/workspace must be created locally before building. See [Native Host Apps](/speedy-bird-lynx/docs/native-host-apps/) for setup instructions.

```bash
bun run build
cp dist/main.lynx.bundle ios/SpeedyBird/Resources/
cd ios && pod install
open SpeedyBird.xcworkspace
```

Build and run from Xcode on a simulator or device.

## Web / GitHub Pages

The public web surface is the Astro site in `docs/`. It renders the landing page, embeds the playable canvas demo, and generates wiki pages from `docs/wiki/*.md`. Astro 6.4+ requires Node.js >=22.12, so use the npm scripts for the docs dev server/build even though dependencies are installed from `bun.lock`.

```bash
cd docs
bun install
npm run dev
```

For a production build:

```bash
npm run build
npm run preview
```

The static output is written to `docs/out/` and is deployed to GitHub Pages by the shared Pages workflow.

## Web Surfaces

| Surface | How to use it | Notes |
|---------|---------------|-------|
| ReactLynx web preview | `bun run dev`, then open `http://localhost:3000/__web_preview?casename=main.web.bundle` | Uses the compiled `main.web.bundle` from Rspeedy for development |
| GitHub Pages canvas demo | `cd docs && npm run dev`, then open the local Astro URL | Browser-only playable demo in `docs/src/pages/index.astro`; physics mirror the ReactLynx game, while the 400x600 viewport is adapted to the landing-page phone frame |
| Standalone web host | Advanced/dev-only `web-host/` + `rsbuild.web-host.config.ts` path | Renders `main.web.bundle` inside `<lynx-view>` and currently expects the bundle URL configured in `web-host/index.html` |

## Project Commands

| Command | Description |
|---------|-------------|
| `bun run dev` | Start Rspeedy dev server with HMR |
| `bun run build` | Production build (Lynx + Web bundles) |
| `cd docs && npm run dev` | Start Astro docs/dev site with Node >=22.12 |
| `cd docs && npm run build` | Build Astro GitHub Pages output to `docs/out/` with Node >=22.12 |
| `cd docs && npm run preview` | Preview the production docs build with Node >=22.12 |
| `cd android && ./gradlew assembleDebug` | Build debug Android APK |
| `cd android && ./gradlew assembleRelease` | Build release Android APK |
