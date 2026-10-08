# Architecture

This page maps the repository: where each part lives, how the components nest, and what runs on each of Lynx's two threads.

## Project structure

```
speedy-bird-lynx/
├── src/                          # Lynx/ReactLynx application
│   ├── index.tsx                 # Entry point
│   ├── App.tsx                   # Root view, viewport fit, tap handling
│   ├── types.ts                  # GameState, PipeData, SoundName, Medal
│   ├── constants.ts              # Game constants
│   ├── game/
│   │   ├── engine.ts             # Pure rules: step, tap, collisions, scoring, viewport
│   │   ├── announcements.ts      # Screen-reader labels and announcements
│   │   └── preferences.ts        # Saved best-score format
│   ├── hooks/
│   │   └── useGame.ts            # Main-thread frame loop and renderer; HUD state
│   ├── platform/
│   │   └── host.ts               # SpeedyBirdModule bridge and host event names
│   └── components/
│       ├── Bird.tsx              # Bird with four mounted animation frames
│       ├── PipeSlot.tsx          # Reusable tile-based pipe pair
│       ├── Background.tsx        # Parallax skyline tiles
│       ├── Ground.tsx            # Scrolling ground tiles
│       ├── ScoreDisplay.tsx      # Sprite digits
│       ├── GetReadyScreen.tsx    # Start overlay
│       ├── GameOverScreen.tsx    # Results panel with medal and "NEW" best
│       └── PausedOverlay.tsx     # Shown when the app is backgrounded mid-run
├── tests/                        # Rstest unit and component tests
├── android/                      # Native Android host app
├── ios/                          # Native iOS host app (source files)
├── assets/                       # Canonical sprites and audio
├── docs/                         # Astro GitHub Pages site; the home page plays the Lynx build
├── web-host/                     # <lynx-view> runtime and SpeedyBirdModule for browsers
├── scripts/                      # Asset sync and APK verification
├── lynx.config.ts                # Lynx build configuration
├── rstest.config.ts              # Test runner configuration
├── rsbuild.web-host.config.ts    # Web host build configuration
└── tsconfig.json                 # TypeScript configuration
```

## Component hierarchy

```
App (root view: main-thread tap handler, layout listener, accessibility label)
└── Playfield (400x750, scaled to fit and anchored to the bottom edge)
    ├── Background      (z-index: 0, parallax scroll)
    ├── PipeSlot x5     (z-index: 1, reusable pipe pairs)
    ├── Bird            (z-index: 2, animated sprite + rotation)
    ├── Ground          (z-index: 3, scroll matches pipe speed)
    ├── ScoreDisplay    (z-index: 4, visible during play)
    ├── GetReadyScreen  (z-index: 5, visible on ready)
    ├── GameOverScreen  (z-index: 5, visible on game over)
    └── PausedOverlay   (z-index: 6, visible while paused)
```

The playfield keeps its 400x750 aspect ratio. On tall phones it fills the width and the extra height above it shows more sky; pipes extend into it. On wide screens it fills the height and dark side panels cover the area outside it, so pipes never pop in at the edge.

## Dual-threaded model

Lynx runs app code on two threads. This game uses each for what it is good at:

| Thread | Responsibility |
|--------|---------------|
| **Main** | Taps (`main-thread:bindtap`), the frame loop (`lynx.requestAnimationFrame`), simulation steps, and per-frame style updates (`setStyleProperties`) |
| **Background** | React rendering of discrete UI (score, overlays, accessibility label), sounds, saved best score, and host events |

The engine module is imported with `with { runtime: 'shared' }` so the same code runs on the main thread. Animated elements have static React props; only the main thread changes their styles, so React never overwrites a frame. Each frame costs no React render and no cross-thread message unless the state, score, or pause flag changes or a sound plays. The loop stops while the game is idle or paused.

## Rendering approach

Visuals use built-in elements only:

- `<view>` — containers and positioning via CSS transforms
- `<image>` — sprites, embedded in the bundle as data URIs so native hosts need only one file
- `<text>` — score and best score on the game-over panel, and the pause message

## Testing

`bun run test` runs Rstest with the ReactLynx Testing Library, reusing `lynx.config.ts` so main-thread functions and shared modules compile as in the app:

- `tests/engine.test.ts` — state transitions, physics, scoring, collisions, restart lock, determinism, viewport fit
- `tests/preferences.test.ts` — saved-score parsing and screen-reader text
- `tests/app.test.tsx` — the real App with a stubbed frame scheduler and host bridge: taps, sounds, game over with a saved best score, pause and resume

> **Note:** The tests need Node.js: jsdom, which the Lynx testing environment builds on, does not run on Bun. If `node` on your `PATH` is Bun's shim, the test config stops with a clear error.

## Web rendering surfaces

| Surface | Source | Purpose |
|---------|--------|---------|
| ReactLynx web preview | `bun run dev` and `http://localhost:3000/__web_preview?casename=main.web.bundle` | Development preview of the compiled `main.web.bundle` |
| Standalone web host | `bun run dev:web-host` with `bun run dev`; or `bun run build && bun run build:web-host` | Full-window `<lynx-view>` on port 4000 for development. The production build is self-contained: it ships `main.web.bundle`, the audio files, and the bridge module |
| GitHub Pages home page | `bun run build:site`, then the Astro build in `docs/` | The public game: the same `main.web.bundle` in a `<lynx-view>` on the home page, next to a live timing panel |

Both browser surfaces share `web-host/host.ts`, the browser implementation of `SpeedyBirdModule`: Web Audio for sounds, `localStorage` for the best score (key `speedy-bird.preferences.v1`), a live region for announcements, Space/Enter while the game has focus, and pause when the tab is hidden. `web-host/runtime.ts` loads the Lynx web runtime (`@lynx-js/web-core` and `@lynx-js/web-elements`).

For the website, `bun run build:site` builds only that runtime, with `main.web.bundle`, the audio, and `native-module.js`, into `docs/public/play/`. Chunks, workers, and WebAssembly resolve relative to the runtime script (`assetPrefix: 'auto'`), and the runtime needs no cross-origin isolation, so plain GitHub Pages hosting works. At build time the home page reads the runtime's file names from `play/manifest.json` (`docs/src/lib/lynx-runtime.ts`) and adds them as deferred scripts. `docs/src/scripts/game.ts` mounts the shared bridge on the page's `<lynx-view>` and adds the page around it: the start and mute buttons, and pausing while the game is scrolled out of view. The timing panel shows what the app reports through the optional `reportHud` bridge call; speed, scroll, and spawn interval are derived from the score with the engine's own functions.

Until the runtime paints its first frame, the game box shows the skyline and ground in plain HTML, positioned from `src/constants.ts`, so the scene appears immediately and the Lynx frame lands on top of it without a visible change.

> **Note:** The site uses no SSR. `@lynx-js/web-core` can render a bundle on the server, but the server-rendered first frame is drawn before layout, so the playfield is unscaled, and after hydration the app's layout event does not fire again.

> **Note:** Lighthouse lists one deprecation on the home page: web-core loads ReactLynx's main-thread worklet chunk with a synchronous `XMLHttpRequest` (`__LoadLepusChunk`). It comes from the Lynx web runtime, not from this app.
