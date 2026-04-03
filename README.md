# speedy-bird-lynx

> Flappy Bird clone built with ReactLynx and TypeScript — runs natively on iOS, Android, and Web from a single codebase

[![Build Check](https://github.com/jonathanperis/speedy-bird-lynx/actions/workflows/ci.yml/badge.svg)](https://github.com/jonathanperis/speedy-bird-lynx/actions/workflows/ci.yml) [![Release](https://github.com/jonathanperis/speedy-bird-lynx/actions/workflows/release.yml/badge.svg)](https://github.com/jonathanperis/speedy-bird-lynx/actions/workflows/release.yml) [![CodeQL](https://github.com/jonathanperis/speedy-bird-lynx/actions/workflows/codeql.yml/badge.svg)](https://github.com/jonathanperis/speedy-bird-lynx/actions/workflows/codeql.yml) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**[Live demo →](https://jonathanperis.github.io/speedy-bird-lynx/)** | **[Documentation →](https://jonathanperis.github.io/speedy-bird-lynx/docs/)**

---

## About

[Lynx](https://lynxjs.org/) is an open-source cross-platform native UI framework created by ByteDance. It uses a native C++ rendering engine (not a WebView) and a dual-threaded architecture where React reconciliation runs on a background thread while the main thread handles native rendering and touch events. This project is a Flappy Bird clone that demonstrates how to build a complete game with ReactLynx, covering element-based rendering, 60 FPS state updates, touch input, asset loading, and automated CI/CD pipelines for all three platforms.

## Tech Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| [ReactLynx](https://lynxjs.org/) | 0.117.0 | Cross-platform native UI framework |
| [React](https://react.dev/) | 18.3.1 | Component model and hooks |
| [TypeScript](https://www.typescriptlang.org/) | 5.6.0 | Type-safe application code |
| [Rspack / rspeedy](https://rspack.dev/) | 0.13.6 | Build toolchain with HMR |
| Android (Kotlin) | Lynx SDK 3.7.0 | Native Android host app |
| iOS (Swift + CocoaPods) | Lynx SDK 3.7.0 | Native iOS host app |
| GitHub Actions | — | CI/CD build, sign, deploy, release |

## Features

- Tap or press Space to flap; fly through pipe gaps to score
- Speed increases 1% per pipe cleared
- Medal system: Bronze (10+), Silver (25+), Gold (50+), Platinum (100+)
- Element-based rendering using `<view>` and `<image>` with CSS transforms (no canvas)
- Tile-based pipe construction to avoid sprite stretching
- Parallax scrolling background and ground layers
- Sprite-based digit rendering for in-game score
- AABB collision detection with circular bird hitbox approximation
- Audio support via web `HTMLAudioElement` with native module stubs
- Standalone canvas-based web version in `docs/` deployed to GitHub Pages

## Getting Started

### Prerequisites

- **Node.js** 18+ and **npm**
- **Java 17** and **Android SDK** (for Android builds)
- **Xcode 15+** and **CocoaPods** (for iOS builds)

### Quick Start

```bash
git clone https://github.com/jonathanperis/speedy-bird-lynx.git
cd speedy-bird-lynx
npm install
npm run dev
```

Open in [Lynx Explorer](https://github.com/lynx-family/lynx) or [Lynx Go](https://apps.apple.com/us/app/lynx-go-dev-explorer/id6743227790) at `http://<your-ip>:3000/main.lynx.bundle`.

```bash
npm run build
```

Outputs `dist/main.lynx.bundle` (native) and `dist/main.web.bundle` (web).

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
docs/                          # GitHub Pages — standalone web version
.github/workflows/             # CI/CD pipelines
```

## CI/CD

| Workflow | File | Trigger | Description |
|----------|------|---------|-------------|
| Build Check | `ci.yml` | Push/PR to `main` | Type-check (`tsc --noEmit`) and build Lynx bundles |
| CodeQL | `codeql.yml` | Push/PR to `main`, weekly | Security and quality analysis |
| Deploy Web | `deploy.yml` | Push to `main` | Deploy `docs/` to GitHub Pages |
| Build Android | `build-android.yml` | Push to `main`, `v*` tags | Build signed APK, create GitHub Release |
| Build iOS | `build-ios.yml` | `v*` tags, manual | Build iOS archive (unsigned without Apple Developer Program) |
| Release | `release.yml` | `v*` tags, manual | Full release pipeline: build + Android + iOS + GitHub Release |

## License

MIT — see [LICENSE](LICENSE)
