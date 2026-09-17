# speedy-bird-lynx

> Flappy Bird clone built with ReactLynx and TypeScript — runs on Android and Web from a single codebase, with iOS host source included for Xcode project setup

[![Build Check](https://github.com/jonathanperis/speedy-bird-lynx/actions/workflows/ci.yml/badge.svg)](https://github.com/jonathanperis/speedy-bird-lynx/actions/workflows/ci.yml) [![Release](https://github.com/jonathanperis/speedy-bird-lynx/actions/workflows/release.yml/badge.svg)](https://github.com/jonathanperis/speedy-bird-lynx/actions/workflows/release.yml) [![CodeQL](https://github.com/jonathanperis/speedy-bird-lynx/actions/workflows/codeql.yml/badge.svg)](https://github.com/jonathanperis/speedy-bird-lynx/actions/workflows/codeql.yml) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**[Live demo →](https://jonathanperis.github.io/speedy-bird-lynx/)** | **[Documentation →](https://jonathanperis.github.io/speedy-bird-lynx/docs/)**

---

## About

[Lynx](https://lynxjs.org/) is an open-source cross-platform native UI framework created by ByteDance. It uses a native rendering engine rather than a WebView on mobile. ReactLynx reconciliation and game logic run on the background thread; native rendering and touch delivery run on the main thread. Speedy Bird demonstrates element-based rendering, a 17ms game timer, touch input, assets, and automated builds. The public website contains a separate HTML Canvas implementation of the game.

| Surface | Current status |
|---------|----------------|
| Android | Kotlin host with Lynx 4.1.0; debug and release build paths |
| ReactLynx web | Rspeedy preview and standalone development host |
| GitHub Pages | Playable Canvas demo and Astro documentation |
| iOS | Swift/CocoaPods source scaffold; create an Xcode project locally |
| Audio | Canvas sound effects; ReactLynx uses browser audio only where available and otherwise has a native-module placeholder |

## Tech Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| [ReactLynx](https://lynxjs.org/) | 0.126.1 | Game component model and hooks |
| [React](https://react.dev/) / React DOM | 19.3.0 | Compatibility dependencies |
| [TypeScript](https://www.typescriptlang.org/) | 6.0.3 app / 7.0.2 docs | Separate toolchains |
| Rspeedy / ReactLynx plugin | 0.17.2 / 0.20.2 | Coordinated native/web compiler toolchain |
| Rsbuild | 2.2.7 | Standalone web host |
| Astro / Tailwind CSS | 7.3.3 / 4.3.3 | Static documentation and Canvas demo |
| Android (Kotlin) | Lynx SDK 4.1.0 | Native Android host app |
| iOS (Swift + CocoaPods) | Lynx SDK 4.1.0 | Native iOS source scaffold |
| GitHub Actions | SHA-pinned | CI/CD build, sign, deploy, release |

Versions reviewed **2026-09-17**. See [Dependencies and Upgrades](https://jonathanperis.github.io/speedy-bird-lynx/docs/dependency-updates/) for native toolchains, supported-version holds, and upgrade evidence. Root TypeScript stays on 6.0.3 because Rspeedy does not yet support TypeScript 7; iOS image libraries follow Lynx's exact pod constraints.

## Features

- Tap/click to flap in the ReactLynx app; the GitHub Pages canvas demo also supports Space
- Speed increases 1% per pipe cleared
- Medal system: Bronze (10+), Silver (25+), Gold (50+), Platinum (100+)
- ReactLynx rendering using `<view>` and `<image>` with CSS transforms; the public browser demo uses Canvas
- Tile-based pipe construction to avoid sprite stretching
- Parallax scrolling background and ground layers
- Sprite-based digit rendering for in-game score
- AABB collision detection with circular bird hitbox approximation
- Five sound effects in the Canvas demo; ReactLynx audio needs a bridge on native and worker-based runtimes
- Astro-powered GitHub Pages site in `docs/`, including a playable canvas demo and generated wiki pages

## Getting Started

### Prerequisites

- **Bun** for dependency installation and root scripts; use the checked-in lockfiles
- **Node.js** >=22.12 for the build toolchains; run Astro through `npm run dev/build/preview`
- **Java 21** and **Android SDK Platform 37.2** (for Android; minimum device API remains 21)
- **Xcode**, **Ruby >=3.2**, and the CocoaPods/Bundler dependencies in `ios/Gemfile` (after creating an Xcode project)

### Quick Start

```bash
git clone https://github.com/jonathanperis/speedy-bird-lynx.git
cd speedy-bird-lynx
bun install --frozen-lockfile
bun run dev
```

Open in [Lynx Explorer](https://github.com/lynx-family/lynx) or [Lynx Go](https://apps.apple.com/us/app/lynx-go-dev-explorer/id6743227790) at `http://<your-ip>:3000/main.lynx.bundle`.

```bash
bun run build
```

Outputs `dist/main.lynx.bundle` (native) and `dist/main.web.bundle` (web).

### Documentation Site

The public GitHub Pages site lives in `docs/`. It uses Astro 7, so run it with Node.js >=22.12:

```bash
cd docs
bun install --frozen-lockfile
npm run dev
npm run build
npm run check:site
npm run preview
```

The docs build writes static output to `docs/out/`; the `deploy.yml` workflow publishes that output to GitHub Pages through the shared reusable Pages workflow.

See [docs/README.md](docs/README.md) for content authoring, route metadata, asset maintenance, and local/production base paths.

### Web Surfaces

There are three web-related surfaces in the repository:

| Surface | Location | Purpose |
|---------|----------|---------|
| ReactLynx web preview | `bun run dev`, then `http://localhost:3000/__web_preview?casename=main.web.bundle` | Development preview of the compiled `main.web.bundle` |
| GitHub Pages canvas demo | `docs/src/pages/index.astro` | Public playable browser demo; it mirrors the game physics but uses a 400x600 viewport to fit the phone frame |
| Standalone web host | `bun run dev:web-host` at `http://localhost:4000` | Development-only `<lynx-view>` host; also run `bun run dev` on port 3000 to supply the bundle |

### Android build

```bash
bun run build
cd android
./gradlew assembleDebug assembleRelease lintDebug
```

Gradle stages the current `dist/main.lynx.bundle` into generated APK assets. Images are embedded in the bundle; manually copied assets are not used. APKs are under `android/app/build/outputs/apk/`. Release signing remains optional and requires the documented keystore environment variables.

## Project Structure

```
src/
├── App.tsx                    # Root component, fullscreen game
├── hooks/useGameEngine.ts     # Game loop, physics, collision, scoring
├── components/
│   ├── Bird.tsx               # Animated bird with rotation
│   ├── Pipe.tsx               # Tile-based pipes (no stretching)
│   ├── Background.tsx         # Parallax scrolling background
│   ├── Ground.tsx             # Scrolling ground layer
│   ├── ScoreDisplay.tsx       # Sprite-based digit rendering
│   ├── GetReadyScreen.tsx     # Start screen overlay
│   └── GameOverScreen.tsx     # Game over with medals
├── audio/audio.ts             # Audio adapter (browser where available + native placeholder)
├── constants.ts               # All game constants
└── types.ts                   # TypeScript types

android/                       # Native Android host app (Kotlin)
ios/                           # Native iOS host app (Swift)
assets/                        # Sprites, audio, medals, digits
docs/                          # Astro GitHub Pages site + playable canvas demo
.github/workflows/             # CI/CD pipelines
```

## CI/CD

| Workflow | File | Trigger | Description |
|----------|------|---------|-------------|
| Build Check | `ci.yml` | Manual, push to `main`/`lynx-migration`, PR to `main` | Audits, type-check, bundles/web host, docs/link checks, Android compilation/lint and bundle verification |
| CodeQL | `codeql.yml` | Push/PR to `main`, weekly, manual | JavaScript/TypeScript and Actions security-and-quality analysis |
| Deploy Web | `deploy.yml` | Push to `main`, manual | Build and deploy the Astro `docs/` site to GitHub Pages via the shared Pages workflow |
| Build Android | `build-android.yml` | Push to `main`, manual from `main` | Read-only build/signing job followed by separate immutable build-release publication |
| Build iOS | `build-ios.yml` | `v*` tags, manual | Skip without a tracked Xcode project; otherwise build an unsigned archive |
| Release | `release.yml` | `v*` tags, manual | Full release pipeline: build + Android + iOS + GitHub Release |

### Release Artifact Matrix

| Artifact | How it is produced | Signing/status |
|----------|--------------------|----------------|
| Local Android debug APK | `bun run build`, then `cd android && ./gradlew assembleDebug` | Debug-signed by Android tooling; intended for local install/testing |
| CI Android build APK | `build-android.yml` on `main` or manual dispatch from `main` | Release build; signed only when keystore secrets are configured |
| Tagged Android release APK | `release.yml` on `v*` tags | Attached to the immutable GitHub Release; signed when `KEYSTORE_BASE64`, `KEYSTORE_PASSWORD`, `KEY_ALIAS`, and `KEY_PASSWORD` are configured |
| iOS archive | `build-ios.yml` or `release.yml` | Requires a tracked Xcode project. Current workflows always disable signing; providing Apple secrets alone does not enable it |

Quality gates include dependency audits, TypeScript checks, bundle/web-host/docs builds, generated-site validation, Android compilation/API lint, APK bundle verification, and CodeQL. Gameplay unit tests, browser UI tests, and JavaScript lint/format checks are not configured.

## Credits

Original Flappy Bird by Dong Nguyen. This project's history includes the [Canvas recreation by noanonoa](https://github.com/noanonoa/flappy-bird). Sprite and sound sources are recorded in [Assets and Sprites](docs/wiki/assets-and-sprites.md).

## License

MIT — see [LICENSE](LICENSE)
