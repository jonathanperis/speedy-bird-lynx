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
├── docs/                         # GitHub Pages (standalone canvas version)
├── web-host/                     # Web preview host (dev only)
├── .github/workflows/            # CI/CD pipelines
├── lynx.config.ts                # Lynx build configuration
├── rsbuild.web-host.config.ts    # Web host build configuration
└── tsconfig.json                 # TypeScript configuration
```

## Component Hierarchy

```
App
├── Background          (z-index: 0, parallax scroll)
├── Pipe[L              (z-index: 1, tile-based, scroll left.md)
├── Bird                (z-index: 2, animated sprite + rotation)
├── Ground              (z-index: 3, scroll matches pipe speed)
├── ScoreDisplay        (z-index: 4, visible during play)
├── GetReadyScreen      (z-index: 5, visible on ready)
└── GameOverScreen      (z-index: 5, visible on game over)
```

## Rendering Approach

Lynx has no canvas element. All visuals are composed from built-in elements:

- `<view>` — containers and positioning via CSS transforms
- `<image>` — sprites loaded as individual PNGs
- `<text>` — score display on the game over panel

Every game entity is absolutely positioned at `top: 0, left: 0` and moved using CSS `transform: translate(Xpx, Ypx)`. This avoids layout recalculations — the engine only updates transform strings.

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
- **`renderState`** — React state snapshot pushed to components via `setRenderState()`. Only updated at the end of each tick.

This separation means physics calculations do not allocate React objects — only the final render snapshot does.
