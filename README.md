# speedy-bird-lynx

> Flappy Bird clone built with ReactLynx and TypeScript — runs on Android and Web from a single codebase, with iOS host source included for Xcode project setup

[![Build Check](https://github.com/jonathanperis/speedy-bird-lynx/actions/workflows/ci.yml/badge.svg)](https://github.com/jonathanperis/speedy-bird-lynx/actions/workflows/ci.yml) [![Release](https://github.com/jonathanperis/speedy-bird-lynx/actions/workflows/release.yml/badge.svg)](https://github.com/jonathanperis/speedy-bird-lynx/actions/workflows/release.yml) [![CodeQL](https://github.com/jonathanperis/speedy-bird-lynx/actions/workflows/codeql.yml/badge.svg)](https://github.com/jonathanperis/speedy-bird-lynx/actions/workflows/codeql.yml) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**[Live demo →](https://jonathanperis.github.io/speedy-bird-lynx/)** | **[Documentation →](https://jonathanperis.github.io/speedy-bird-lynx/docs/)**

---

## About

[Lynx](https://lynxjs.org/) is an open-source cross-platform native UI framework created by ByteDance. It uses a native C++ rendering engine (not a WebView) and a dual-threaded architecture where React reconciliation runs on a background thread while the main thread handles native rendering and touch events. This project is a Flappy Bird clone that demonstrates how to build a complete game with ReactLynx, covering element-based rendering, 60 FPS state updates, touch input, asset loading, and automated CI/CD pipelines. Android and the web preview are ready to run from the checked-in project; iOS source files are included, but an Xcode project/workspace must be created locally before building.

## Tech Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| [ReactLynx](https://lynxjs.org/) | 0.119.0 | Cross-platform native UI framework |
| [React](https://react.dev/) | 18.3.1 | Component model and hooks |
| [TypeScript](https://www.typescriptlang.org/) | 6.0.3 | Type-safe application code |
| [Rspack / rspeedy](https://rspack.dev/) | 0.14.3 | Build toolchain with HMR |
| Android (Kotlin) | Lynx SDK 3.7.0 | Native Android host app |
| iOS (Swift + CocoaPods) | Lynx SDK 3.7.0 | Native iOS host app |
| GitHub Actions | — | CI/CD build, sign, deploy, release |

## Features

- Tap/click to flap in the ReactLynx app; the GitHub Pages canvas demo also supports Space
- Speed increases 1% per pipe cleared
- Medal system: Bronze (10+), Silver (25+), Gold (50+), Platinum (100+)
- Element-based rendering using `<view>` and `<image>` with CSS transforms (no canvas)
- Tile-based pipe construction to avoid sprite stretching
- Parallax scrolling background and ground layers
- Sprite-based digit rendering for in-game score
- AABB collision detection with circular bird hitbox approximation
- Audio support via web `HTMLAudioElement`; native builds include stubs and continue without sound until an Android/iOS `AudioModule` is implemented and registered
- Astro-powered GitHub Pages site in `docs/`, including a playable canvas demo and generated wiki pages

## Getting Started

### Prerequisites

- **Bun** for the root ReactLynx/Rspeedy app (`bun install`, `bun run dev`, `bun run build`)
- **Node.js** >=22.12 for the Astro 6.4+ documentation site in `docs/` (`npm run dev/build/preview`)
- **Java 17** and **Android SDK** (for Android builds)
- **Xcode 15+** and **CocoaPods** (for iOS builds after creating the Xcode project from the included source scaffold)

### Quick Start

```bash
git clone https://github.com/jonathanperis/speedy-bird-lynx.git
cd speedy-bird-lynx
bun install
bun run dev
```

Open in [Lynx Explorer](https://github.com/lynx-family/lynx) or [Lynx Go](https://apps.apple.com/us/app/lynx-go-dev-explorer/id6743227790) at `http://<your-ip>:3000/main.lynx.bundle`.

```bash
bun run build
```

Outputs `dist/main.lynx.bundle` (native) and `dist/main.web.bundle` (web).

### Documentation Site

The public GitHub Pages site lives in `docs/`. It uses Astro 6.4+, so run it with Node.js >=22.12:

```bash
cd docs
bun install
npm run dev
npm run build
npm run preview
```

The docs build writes static output to `docs/out/`; the `deploy.yml` workflow publishes that output to GitHub Pages through the shared reusable Pages workflow.

### Web Surfaces

There are three web-related surfaces in the repository:

| Surface | Location | Purpose |
|---------|----------|---------|
| ReactLynx web preview | `bun run dev`, then `http://localhost:3000/__web_preview?casename=main.web.bundle` | Development preview of the compiled `main.web.bundle` |
| GitHub Pages canvas demo | `docs/src/pages/index.astro` | Public playable browser demo; it mirrors the game physics but uses a 400x600 viewport to fit the phone frame |
| Standalone web host | `web-host/` + `rsbuild.web-host.config.ts` | Advanced/dev-only host that renders `main.web.bundle` inside `<lynx-view>`; it expects the bundle URL configured in `web-host/index.html` |

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
├── audio/audio.ts             # Audio module (web + native stubs)
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
| Build Check | `ci.yml` | Manual, push to `main`/`lynx-migration`, PR to `main` | Type-check (`tsc --noEmit`) and build Lynx bundles; no unit-test framework is configured yet |
| CodeQL | `codeql.yml` | Push/PR to `main`, weekly | Security and quality analysis |
| Deploy Web | `deploy.yml` | Push to `main`, manual | Build and deploy the Astro `docs/` site to GitHub Pages via the shared Pages workflow |
| Build Android | `build-android.yml` | Push to `main`, `v*` tags, manual | Build release APK, sign when secrets are configured, create GitHub Release |
| Build iOS | `build-ios.yml` | `v*` tags, manual | Build iOS archive (unsigned without Apple Developer Program) |
| Release | `release.yml` | `v*` tags, manual | Full release pipeline: build + Android + iOS + GitHub Release |

### Release Artifact Matrix

| Artifact | How it is produced | Signing/status |
|----------|--------------------|----------------|
| Local Android debug APK | `bun run build`, copy `dist/main.lynx.bundle` into Android assets, then `cd android && ./gradlew assembleDebug` | Debug-signed by Android tooling; intended for local install/testing |
| CI Android build APK | `build-android.yml` on `main`, tags, or manual dispatch | Release build; signed only when keystore secrets are configured |
| Tagged Android release APK | `build-android.yml` or `release.yml` on `v*` tags | Attached to the GitHub Release; signed when `KEYSTORE_BASE64`, `KEYSTORE_PASSWORD`, `KEY_ALIAS`, and `KEY_PASSWORD` are configured |
| iOS archive | `build-ios.yml` or `release.yml` | Source scaffold only until an Xcode project and Apple signing assets are configured; unsigned archives are expected without Apple Developer Program setup |

Current quality gates are TypeScript type-checking, production bundle builds, CodeQL, and Pages deployment. Unit tests, browser smoke tests, and lint/format checks are not configured yet.

## License

MIT — see [LICENSE](LICENSE)
