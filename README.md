# Speedy Bird

A Flappy Bird clone built with [Lynx](https://lynxjs.org/) — ByteDance's cross-platform native UI framework. One TypeScript codebase renders natively on iOS, Android, and Web.

**[Play in your browser](https://jonathanperis.github.io/speedy-bird-lynx/)**

## How to Play

- **Tap** or press **Space** to flap
- Fly through gaps between pipes
- Score 1 point per pipe pair cleared
- Game speeds up 1% with every pipe cleared — hence "Speedy Bird"
- Game ends on collision with a pipe or the ground

## Medals

| Score | Medal |
|-------|-------|
| 10+   | Bronze |
| 25+   | Silver |
| 50+   | Gold |
| 100+  | Platinum |

## What is Lynx?

[Lynx](https://lynxjs.org/) is an open-source **cross-platform native UI framework** created by **ByteDance** (the company behind TikTok). It allows developers to use web technologies — TypeScript, CSS, and React — to build **truly native UIs** for iOS, Android, Web, macOS, Windows, and HarmonyOS from a single codebase.

Key characteristics:

- **Not a WebView** — Lynx has its own native rendering engine written in C++
- **ReactLynx** — React 17+ compatible layer with functional components, hooks, and JSX/TSX
- **Dual-threaded** — background thread for React reconciliation, main thread for rendering
- **200+ CSS properties** — flexbox, grid, animations, transforms, all rendered natively
- **Rspack toolchain** — fast builds with hot module replacement via `@lynx-js/rspeedy`

The purpose of this project is to **learn how to build a Lynx app** from scratch, and to explore how to **automate the build and release pipeline through GitHub Actions** — from a single commit all the way to the app stores.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Lynx](https://lynxjs.org/) (ReactLynx) |
| Language | TypeScript / TSX |
| Build | Rspack via `@lynx-js/rspeedy` |
| Rendering | Element-based (`<view>`, `<image>`) with CSS transforms |
| Game Loop | `setInterval` at 17ms (~60 FPS) |
| Android | Kotlin + Lynx SDK 3.7.0 |
| iOS | Swift + Lynx SDK 3.7.0 (CocoaPods) |
| CI/CD | GitHub Actions — build, test, sign, release |
| Web Version | Pure JavaScript + HTML5 Canvas (in `docs/`) |

## Architecture

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
├── app/src/main/kotlin/       # MainActivity, LynxView setup
└── app/build.gradle.kts       # Lynx SDK 3.7.0 dependencies

ios/                           # Native iOS host app (Swift)
├── SpeedyBird/                # AppDelegate, ViewController, LynxView
└── Podfile                    # Lynx 3.7.0 CocoaPods

assets/
├── sprites/                   # Pre-sliced PNGs from sprite sheets
│   ├── pipes/                 # Tile-based pipe segments
│   ├── medals/                # Bronze, silver, gold, platinum
│   └── digits/                # 0-9 score sprites
└── audio/                     # WAV sound effects

docs/                          # GitHub Pages — playable web version
└── index.html                 # Self-contained canvas game

.github/workflows/
├── ci.yml                     # Build + type-check on every push/PR
├── deploy-web.yml             # Deploy to GitHub Pages
├── build-android.yml          # Build signed APK + create release
├── build-ios.yml              # Build iOS archive (needs Apple Dev Program)
└── release.yml                # Create GitHub Release on version tags
```

## CI/CD Pipeline

Every push to `main` triggers:

| Workflow | What it does |
|----------|-------------|
| **CI** | Install, type-check (`tsc --noEmit`), build Lynx bundles |
| **Deploy Web** | Deploy `docs/` to GitHub Pages |
| **Build Android** | Build signed APK, create GitHub Release with artifact |

Version tags (`v*`) additionally trigger the **Release** workflow with full release notes.

## Running Locally

### Lynx (Dev Server)

```bash
npm install
npm run dev
```

Then open in [Lynx Explorer](https://github.com/lynx-family/lynx) or [Lynx Go](https://apps.apple.com/us/app/lynx-go-dev-explorer/id6743227790):

```
http://<your-ip>:3000/main.lynx.bundle
```

### Android

```bash
npm run build
cp dist/main.lynx.bundle android/app/src/main/assets/
cd android && ./gradlew assembleDebug
```

Install the APK from `android/app/build/outputs/apk/debug/`.

### Web Version

Open `docs/index.html` in any browser. No build step required.

## Game Physics

| Constant | Value | Description |
|----------|-------|-------------|
| Gravity | 0.28 | Added to velocity each frame |
| Flap | 7.25 | Upward velocity on tap |
| Pipe Speed | 2.7 | Base scroll speed (increases 1% per pipe) |
| Pipe Gap | 150 | Pixels between top and bottom pipe |
| Spawn Rate | Every 77 frames | ~1.3 seconds between pipe pairs |

## Credits

- Original game concept by [Dong Nguyen](https://en.wikipedia.org/wiki/Flappy_Bird)
- Original canvas implementation by [noanonoa](https://github.com/noanonoa/flappy-bird)
- Sprites from [The Spriters Resource](https://www.spriters-resource.com/fullview/59894/)
- Sound effects from [The Sounds Resource](https://www.sounds-resource.com/mobile/flappybird/sound/5309/)
- Lynx port and CI/CD by [jonathanperis](https://github.com/jonathanperis)
