# speedy-bird-lynx

> Flappy Bird clone built with ReactLynx and TypeScript — runs on Android, iOS, and the Web from a single codebase

[![Build Check](https://github.com/jonathanperis/speedy-bird-lynx/actions/workflows/ci.yml/badge.svg)](https://github.com/jonathanperis/speedy-bird-lynx/actions/workflows/ci.yml) [![Release](https://github.com/jonathanperis/speedy-bird-lynx/actions/workflows/release.yml/badge.svg)](https://github.com/jonathanperis/speedy-bird-lynx/actions/workflows/release.yml) [![CodeQL](https://github.com/jonathanperis/speedy-bird-lynx/actions/workflows/codeql.yml/badge.svg)](https://github.com/jonathanperis/speedy-bird-lynx/actions/workflows/codeql.yml) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**[Live demo →](https://jonathanperis.github.io/speedy-bird-lynx/)** | **[Documentation →](https://jonathanperis.github.io/speedy-bird-lynx/docs/)**

---

## About

[Lynx](https://lynxjs.org/) is an open-source cross-platform native UI framework created by ByteDance. It uses a native rendering engine rather than a WebView on mobile. Speedy Bird runs its frame loop, taps, and simulation on the Lynx main thread with Main Thread Script, and uses React on the background thread only for discrete UI such as the score and overlays. It demonstrates element-based rendering, frame-rate-independent physics, native modules, assets, and automated builds. The public website contains a separate HTML Canvas implementation of the game.

| Surface | Current status |
|---------|----------------|
| Android | Kotlin host with Lynx 4.1.0; debug and release build paths |
| ReactLynx web | Rspeedy preview and a self-contained standalone host with sound, saved best score, and keyboard input |
| GitHub Pages | Playable Canvas demo and Astro documentation |
| iOS | Swift host with a generated Xcode project, CocoaPods lockfile, and XCUITest smoke tests; unsigned builds in CI |
| Audio and saved score | Android (SoundPool), iOS (AVAudioPlayer), and the standalone web host (Web Audio) through `SpeedyBirdModule`; the Canvas demo has its own audio |

## Tech Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| [ReactLynx](https://lynxjs.org/) | 0.126.2 | Game component model and hooks |
| React types | 19.3.0 | JSX typings consumed by ReactLynx |
| [TypeScript](https://www.typescriptlang.org/) | 6.0.3 app / 7.0.2 docs | Separate toolchains |
| Rspeedy / ReactLynx plugin | 0.18.0 / 0.20.3 | Coordinated native/web compiler toolchain |
| Rsbuild | 2.2.12 | Standalone web host |
| Biome | 2.5.15 | Lint and format checks |
| Astro / Tailwind CSS | 7.3.6 / 4.3.3 | Static documentation and Canvas demo |
| Android (Kotlin) | Lynx SDK 4.1.0 | Native Android host app |
| iOS (Swift + CocoaPods) | Lynx SDK 4.1.0 | Native iOS host app |
| GitHub Actions | SHA-pinned | CI/CD build, sign, deploy, release |

Versions reviewed **2026-10-07**. See [Dependencies and Upgrades](https://jonathanperis.github.io/speedy-bird-lynx/docs/dependency-updates/) for native toolchains, supported-version holds, and upgrade evidence. Root TypeScript stays on 6.0.3 because Rspeedy does not yet support TypeScript 7; Fresco (Android) and the iOS image libraries follow the exact versions Lynx's image services are built against.

## Features

- Tap/click to flap; the standalone web host and the GitHub Pages canvas demo also support Space
- Speed increases 1% per pipe cleared; points score the moment the bird clears a pipe
- Frame-rate-independent physics (fixed 1/60 s steps) on a main-thread frame loop
- Scales to any screen: extra height becomes sky, wide screens are letterboxed
- Best score saved by the host; restart is locked briefly after a crash so the results stay visible
- Pauses when the app is backgrounded mid-run; screen-reader announcements for game state
- Medal system: Bronze (10+), Silver (25+), Gold (50+), Platinum (100+)
- ReactLynx rendering using `<view>` and `<image>` with CSS transforms; the public browser demo uses Canvas
- Tile-based pipe construction to avoid sprite stretching
- Parallax scrolling background and ground layers
- Sprite-based digit rendering for in-game score
- AABB collision detection with circular bird hitbox approximation
- Five sound effects through the `SpeedyBirdModule` host bridge
- Astro-powered GitHub Pages site in `docs/`, including a playable canvas demo and generated wiki pages

## Getting Started

### Prerequisites

- **Bun** for dependency installation and root scripts; use the checked-in lockfiles
- **Node.js** >=22.12 for the build toolchains and tests; run Astro through `npm run dev/build/preview`
- **Java 21** and **Android SDK Platform 37.2** (for Android; minimum device API remains 21)
- **Xcode**, **Ruby >=3.2**, and the CocoaPods/Bundler dependencies in `ios/Gemfile` (for iOS)

### Quick Start

```bash
git clone https://github.com/jonathanperis/speedy-bird-lynx.git
cd speedy-bird-lynx
bun install --frozen-lockfile
bun run dev
```

```bash
bun run lint && bun run check && bun run test   # Biome, TypeScript, Rstest
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

Gradle stages the current `dist/main.lynx.bundle` and the sound effects into generated APK assets. Images are embedded in the bundle; manually copied assets are not used. For iOS: `cd ios && bundle install && bundle exec pod install`, then open `SpeedyBird.xcworkspace` or run `xcodebuild test` (see [Native Host Apps](docs/wiki/native-host-apps.md)). APKs are under `android/app/build/outputs/apk/`. Release signing remains optional and requires the documented keystore environment variables.

## Project Structure

```
src/
├── App.tsx                    # Root view, viewport fit, main-thread tap
├── game/engine.ts             # Pure rules: physics, collisions, scoring, restart
├── game/announcements.ts      # Screen-reader labels and announcements
├── game/preferences.ts        # Saved best-score format
├── hooks/useGame.ts           # Main-thread frame loop and renderer; HUD state
├── platform/host.ts           # SpeedyBirdModule bridge and host events
├── components/
│   ├── Bird.tsx               # Animated bird with rotation
│   ├── PipeSlot.tsx           # Reusable tile-based pipe pair
│   ├── Background.tsx         # Parallax scrolling background
│   ├── Ground.tsx             # Scrolling ground layer
│   ├── ScoreDisplay.tsx       # Sprite-based digit rendering
│   ├── GetReadyScreen.tsx     # Start screen overlay
│   ├── GameOverScreen.tsx     # Game over with medals
│   └── PausedOverlay.tsx      # Paused mid-run
├── constants.ts               # All game constants
└── types.ts                   # TypeScript types
tests/                         # Rstest unit and component tests

android/                       # Native Android host app (Kotlin)
ios/                           # Native iOS host app (Swift, generated Xcode project, UI tests)
assets/                        # Sprites, audio, medals, digits
docs/                          # Astro GitHub Pages site + playable canvas demo
.github/workflows/             # CI/CD pipelines
```

## CI/CD

| Workflow | File | Trigger | Description |
|----------|------|---------|-------------|
| Build Check | `ci.yml` | Manual, push to `main`, every PR, weekly | Audit, Biome lint/format, type-check, tests, bundles/web host, docs/link checks, Android compilation/lint and APK verification, iOS build + UI tests; on `main` pushes, then calls Build Android |
| CodeQL | `codeql.yml` | Push/PR to `main`, weekly, manual | JavaScript/TypeScript, Actions, Python, and Kotlin security-and-quality analysis; Swift on `main` and weekly |
| Deploy Web | `deploy.yml` | Push to `main`, manual | Build and deploy the Astro `docs/` site to GitHub Pages via the shared Pages workflow |
| Build Android | `build-android.yml` | Called by Build Check after a `main` push passes; manual from `main` | Read-only APK build followed by an immutable `build/*` prerelease that never becomes "Latest" |
| Build iOS | `build-ios.yml` | Manual | Unsigned archive through the shared iOS build |
| Release | `release.yml` | `v*` tags on `main`, manual from `main` | Sole versioned-release publisher: verify, build Android/iOS through the shared builds, upload all assets, then publish |

### Release Artifact Matrix

| Artifact | How it is produced | Signing/status |
|----------|--------------------|----------------|
| Local Android debug APK | `bun run build`, then `cd android && ./gradlew assembleDebug` | Debug-signed by Android tooling; intended for local install/testing |
| CI Android build APK | `build-android.yml` after Build Check passes on `main`, or manual dispatch from `main` | Release build published as a prerelease; signed only when keystore secrets are configured |
| Tagged Android release APK | `release.yml` on `v*` tags | Attached to the immutable GitHub Release; signed when `KEYSTORE_BASE64`, `KEYSTORE_PASSWORD`, `KEY_ALIAS`, and `KEY_PASSWORD` are configured |
| iOS archive | `build-ios.yml` (manual) or `release.yml` | Unsigned; the workflows always disable signing, so providing Apple secrets alone does not enable it |

Quality gates include dependency audits, Biome lint/format checks, TypeScript checks, Rstest unit and component tests, docs asset parity, bundle/web-host/docs builds, generated-site validation, Android compilation/API lint, APK bundle and sound verification, iOS XCUITest smoke tests on a simulator, and CodeQL.

## Credits

Original Flappy Bird by Dong Nguyen. This project's history includes the [Canvas recreation by noanonoa](https://github.com/noanonoa/flappy-bird). Sprite and sound sources are recorded in [Assets and Sprites](docs/wiki/assets-and-sprites.md).

## License

MIT — see [LICENSE](LICENSE)
