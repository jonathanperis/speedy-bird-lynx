# Architecture

## Project Structure

```
speedy-bird-lynx/
├── src/                          # Lynx/ReactLynx application
│   ├── index.tsx                 # Entry point
│   ├── App.tsx                   # Root component
│   ├── types.ts                  # TypeScript types (GameState, PipeData)
│   ├── constants.ts              # All game constants
│   ├── hooks/
│   │   └── useGameEngine.ts      # Core game loop and physics
│   ├── components/
│   │   ├── Bird.tsx              # Animated bird sprite
│   │   ├── Pipe.tsx              # Tile-based pipe rendering
│   │   ├── Background.tsx        # Parallax scrolling background
│   │   ├── Ground.tsx            # Scrolling ground layer
│   │   ├── ScoreDisplay.tsx      # Sprite-based digit rendering
│   │   ├── GetReadyScreen.tsx    # Start screen overlay
│   │   └── GameOverScreen.tsx    # Game over panel with medals
│   └── audio/
│       └── audio.ts              # Audio abstraction (web + native)
│
├── android/                      # Native Android host app
├── ios/                          # Native iOS host app (source files)
├── assets/                       # Sprites, audio, medals, digits
├── docs/                         # Astro GitHub Pages site + playable canvas demo
├── web-host/                     # Advanced/dev-only standalone <lynx-view> host
├── .github/workflows/            # CI/CD pipelines
├── lynx.config.ts                # Lynx build configuration
├── rsbuild.web-host.config.ts    # Web host build configuration
└── tsconfig.json                 # TypeScript configuration
```

## Component Hierarchy

```
App
├── Background          (z-index: 0, parallax scroll)
├── Pipe[]              (z-index: 1, tile-based, scroll left)
├── Bird                (z-index: 2, animated sprite + rotation)
├── Ground              (z-index: 3, scroll matches pipe speed)
├── ScoreDisplay        (z-index: 4, visible during play)
├── GetReadyScreen      (z-index: 5, visible on ready)
└── GameOverScreen      (z-index: 5, visible on game over)
```

## Rendering Approach

The ReactLynx renderer in this project composes its visuals from built-in elements:

- `<view>` — containers and positioning via CSS transforms
- `<image>` — sprites loaded as individual PNGs
- `<text>` — score display on the game over panel

Game entities use absolute positioning and CSS transforms for movement. The background and ground have fixed nonzero `top` offsets, while pipes and the bird combine layout offsets with transforms. Transform-based movement limits layout work; animation also updates image opacity and render state.

## Dual-Threaded Model

Lynx runs on two threads:

| Thread | Responsibility |
|--------|---------------|
| **Background** | React reconciliation, game logic, state management |
| **Main** | Native rendering, layout, touch event delivery |

The game loop (`setInterval` at 17ms) runs on the background thread. It updates a React state object (`RenderState`) which triggers reconciliation. Lynx's main thread then applies the resulting native element updates.

## State Management

The `useGameEngine` hook manages all game state:

- **`engine.current`** — mutable ref holding physics state (position, velocity, pipe list). Updated every tick without triggering renders.
- **`renderState`** — React state snapshot pushed to components via `setRenderState()` at the end of each tick and immediately after input handling.

This separation keeps mutable simulation data out of React state. Each tick still allocates a render snapshot and a shallow pipe-array copy; it is not an allocation-free game loop.

## Web Rendering Surfaces

| Surface | Source | Purpose |
|---------|--------|---------|
| ReactLynx web preview | `bun run dev` and `http://localhost:3000/__web_preview?casename=main.web.bundle` | Development preview of the compiled `main.web.bundle` |
| GitHub Pages canvas demo | `docs/src/pages/index.astro` | Public playable browser demo; it ports the game state machine and physics to an inline `<canvas>` script for zero-dependency Pages playback |
| Standalone web host | `bun run dev:web-host`, with `bun run dev` in a second terminal | Development-only `<lynx-view>` host on port 4000, loading the bundle from port 3000 |

The canvas demo intentionally uses a 400x600 viewport to fit the landing-page phone frame. Core physics values such as flap force, gravity, pipe gap, speed ramp, and medal thresholds mirror `src/constants.ts`; the viewport height is adapted from the ReactLynx game's 400x750 canvas height.
