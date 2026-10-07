# Architecture

## Project Structure

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
├── docs/                         # Astro GitHub Pages site + playable canvas demo
├── web-host/                     # Standalone <lynx-view> host with the bridge module
├── scripts/                      # Asset sync and APK verification
├── lynx.config.ts                # Lynx build configuration
├── rstest.config.ts              # Test runner configuration
├── rsbuild.web-host.config.ts    # Web host build configuration
└── tsconfig.json                 # TypeScript configuration
```

## Component Hierarchy

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

## Dual-Threaded Model

Lynx runs app code on two threads. This game uses each for what it is good at:

| Thread | Responsibility |
|--------|---------------|
| **Main** | Taps (`main-thread:bindtap`), the frame loop (`lynx.requestAnimationFrame`), simulation steps, and per-frame style updates (`setStyleProperties`) |
| **Background** | React rendering of discrete UI (score, overlays, accessibility label), sounds, saved best score, and host events |

The engine module is imported with `with { runtime: 'shared' }` so the same code runs on the main thread. Animated elements have static React props; only the main thread changes their styles, so React never overwrites a frame. Each frame costs no React render and no cross-thread message unless the state, score, or pause flag changes or a sound plays. The loop stops while the game is idle or paused.

## Rendering Approach

Visuals use built-in elements only:

- `<view>` — containers and positioning via CSS transforms
- `<image>` — sprites, embedded in the bundle as data URIs so native hosts need only one file
- `<text>` — score and best score on the game-over panel, and the pause message

## Testing

`bun run test` runs Rstest with the ReactLynx Testing Library, reusing `lynx.config.ts` so main-thread functions and shared modules compile as in the app:

- `tests/engine.test.ts` — state transitions, physics, scoring, collisions, restart lock, determinism, viewport fit
- `tests/preferences.test.ts` — saved-score parsing and screen-reader text
- `tests/app.test.tsx` — the real App with a stubbed frame scheduler and host bridge: taps, sounds, game over with a saved best score, pause and resume

Tests need Node.js (jsdom does not run on Bun).

## Web Rendering Surfaces

| Surface | Source | Purpose |
|---------|--------|---------|
| ReactLynx web preview | `bun run dev` and `http://localhost:3000/__web_preview?casename=main.web.bundle` | Development preview of the compiled `main.web.bundle` |
| Standalone web host | `bun run dev:web-host` with `bun run dev`; or `bun run build && bun run build:web-host` | `<lynx-view>` host on port 4000 that implements `SpeedyBirdModule` (Web Audio, `localStorage`, live-region announcements) and forwards Space/Enter and tab visibility. The production build is self-contained: it ships `main.web.bundle` and the audio files |
| GitHub Pages canvas demo | `docs/src/pages/index.astro` mounting `docs/src/game/` | Public playable browser demo. It imports the app's rules (`src/game/engine.ts`, constants, saved-score format, announcements) and only adds a Canvas renderer, input, Web Audio, and `localStorage`, so gameplay matches the ReactLynx game on the same 400x750 playfield |

The canvas demo is a second renderer for the same engine, not a port. `docs/src/game/controller.ts` runs `step()` in fixed 1/60 s steps from `requestAnimationFrame` via `consumeElapsed`, stops the loop while idle, hidden, or scrolled out of view (a run in progress pauses until the next tap), and announces state changes with `announcementFor` through a live region. `docs/src/game/renderer.ts` draws the full 400x750 playfield with the sizes and layering of `src/components/`, scaled to the landing page's phone frame. Space and Enter flap only while the canvas has focus. The best score uses the `speedy-bird.preferences.v1` key and format shared with the standalone web host.
