# Assets and Sprites

All game assets are pre-sliced individual PNG files. Lynx has no canvas or sprite sheet slicing — each visual element is a separate `<image>` element.

## Directory Structure

```
assets/
├── sprites/
│   ├── bird-0.png              # Wings down
│   ├── bird-1.png              # Wings level
│   ├── bird-2.png              # Wings up
│   ├── background.png          # Sky + city background tile (276x228)
│   ├── ground.png              # Ground tile (224x129)
│   ├── get-ready.png           # "Get Ready" overlay (174x160)
│   ├── game-over.png           # Game over panel with score boxes (226x158)
│   ├── pipes/
│   │   ├── pipe-top.png        # Top pipe body tile
│   │   ├── pipe-top-mouth.png  # Top pipe mouth (lip)
│   │   ├── pipe-bottom.png     # Bottom pipe body tile
│   │   └── pipe-bottom-mouth.png # Bottom pipe mouth (lip)
│   ├── digits/
│   │   └── digit-0.png … digit-9.png  # Score display (18x27 each)
│   └── medals/
│       ├── medal-bronze.png
│       ├── medal-silver.png
│       ├── medal-gold.png
│       └── medal-platinum.png
│
└── audio/
    ├── sfx_wing.wav            # Flap
    ├── sfx_point.wav           # Score
    ├── sfx_hit.wav             # Pipe collision
    ├── sfx_die.wav             # Ground collision
    └── sfx_swooshing.wav       # Game reset
```

## How Assets Are Loaded

In the Lynx app, assets are loaded via top-level `import` statements at the module level:

```tsx
import bird0 from '../../assets/sprites/bird-0.png';
import bird1 from '../../assets/sprites/bird-1.png';
import bird2 from '../../assets/sprites/bird-2.png';

const BIRD_SPRITES = [bird0, bird1, bird2, bird1]; // ping-pong cycle
```

The Rspeedy bundler resolves these to URLs (dev server) or embeds them in the bundle (production).

## Pipe Rendering

Pipes use a tile-based approach instead of stretching a single image. Each pipe is composed of:

1. **Body tiles** — repeated vertically to fill the pipe height (extends well past the screen edge)
2. **Mouth tile** — placed at the opening where the bird flies through

This avoids visual stretching artifacts and matches the original game's pixel-art style. Each tile is 55px wide and ~53px tall.

## Background and Ground Tiling

Both the background and ground use 5 copies laid out horizontally in a flex row. The container is translated left via CSS transform to create seamless scrolling. When the offset exceeds one tile width, it wraps back.

- **Background**: 5 tiles at 276px each = 1380px total, scrolls at `0.2 * speedMultiplier` px/frame
- **Ground**: 5 tiles at 224px each = 1120px total, scrolls at `2.7 * speedMultiplier` px/frame

## Score Display

The in-game score uses sprite-based digit rendering (`ScoreDisplay.tsx`). Each digit is a separate `<image>` element (18x27px) laid out horizontally with 2px gaps, centered on screen.

The game-over panel score uses `<text>` elements positioned absolutely over the panel sprite.

## Credits

- Sprites from [The Spriters Resource](https://www.spriters-resource.com/fullview/59894/)
- Sound effects from [The Sounds Resource](https://www.sounds-resource.com/mobile/flappybird/sound/5309/)
- Original game by [Dong Nguyen](https://en.wikipedia.org/wiki/Flappy_Bird)
