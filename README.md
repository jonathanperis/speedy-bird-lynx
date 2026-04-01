# Flappy Bird

A pixel art Flappy Bird clone built with [Lynx](https://lynxjs.org/) — ByteDance's cross-platform native UI framework. One TypeScript codebase renders natively on iOS, Android, and Web.

**[Play in your browser](https://jonathanperis.github.io/flappy-bird/)**

## How to Play

- **Tap** or press **Space** to flap
- Fly through gaps between pipes
- Score 1 point per pipe pair cleared
- Game speeds up 1% every 10 pipes
- Game ends on collision with a pipe or the ground

## Medals

| Score | Medal |
|-------|-------|
| 10+   | Bronze |
| 25+   | Silver |
| 50+   | Gold |
| 100+  | Platinum |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Lynx](https://lynxjs.org/) (ReactLynx) |
| Language | TypeScript / TSX |
| Build | Rspack via `@lynx-js/rspeedy` |
| Rendering | Element-based (`<view>`, `<image>`) with CSS transforms |
| Game Loop | `setInterval` at 17ms (~60 FPS) |
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
├── audio/audio.ts             # Audio module (web fallback + native stubs)
├── constants.ts               # All game constants
└── types.ts                   # TypeScript types

assets/
├── sprites/                   # Pre-sliced PNGs from sprite sheets
│   ├── pipes/                 # Tile-based pipe segments (26x25 each)
│   └── medals/                # Bronze, silver, gold, platinum
└── audio/                     # WAV sound effects

docs/                          # GitHub Pages — playable web version
└── index.html                 # Self-contained canvas game + site
```

## Running Locally

### Lynx Native (iOS/Android)

```bash
npm install
npm run dev
```

Then open in [Lynx Explorer](https://github.com/lynx-family/lynx) or [Lynx Go](https://apps.apple.com/us/app/lynx-go-dev-explorer/id6743227790):

```
http://<your-ip>:3000/main.lynx.bundle
```

### Web Version

Open `docs/index.html` in any browser. No build step required.

## Game Physics

| Constant | Value | Description |
|----------|-------|-------------|
| Gravity | 0.28 | Added to velocity each frame |
| Flap | 7.25 | Upward velocity on tap |
| Pipe Speed | 2.7 | Base scroll speed (increases 1%/10 pipes) |
| Pipe Gap | 150 | Pixels between top and bottom pipe |
| Spawn Rate | Every 77 frames | ~1.3 seconds between pipe pairs |

## Credits

- Original game concept by [Dong Nguyen](https://en.wikipedia.org/wiki/Flappy_Bird)
- Original canvas implementation by [noanonoa](https://github.com/noanonoa/flappy-bird)
- Sprites from [The Spriters Resource](https://www.spriters-resource.com/fullview/59894/)
- Sound effects from [The Sounds Resource](https://www.sounds-resource.com/mobile/flappybird/sound/5309/)
- Lynx port by [jonathanperis](https://github.com/jonathanperis)
