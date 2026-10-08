# Assets and sprites

Game sprites are pre-sliced individual PNG files. The ReactLynx renderer uses a separate `<image>` element for each visual rather than slicing a sprite sheet at runtime.

## Directory structure

```
assets/
├── sprites/
│   ├── bird-0.png              # Wings down
│   ├── bird-1.png              # Wings level
│   ├── bird-2.png              # Wings up
│   ├── background.png          # Sky + city background tile (276x228)
│   ├── ground.png              # Ground tile (224x112 source, drawn at 224x129)
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

## How assets are loaded

In the Lynx app, assets are loaded via top-level `import` statements at the module level:

```tsx
import bird0 from '../../assets/sprites/bird-0.png';
import bird1 from '../../assets/sprites/bird-1.png';
import bird2 from '../../assets/sprites/bird-2.png';

const BIRD_SPRITES = [bird0, bird1, bird2, bird1]; // ping-pong cycle
```

`lynx.config.ts` sets an image inline limit of 64 KiB, large enough for every current game sprite. Rspeedy embeds those images as data URLs so native hosts can load the single bundle offline. Audio is not part of the bundle: each host packages `assets/audio/*.wav` and plays it through `SpeedyBirdModule`.

## Pipe rendering

Pipes use a tile-based approach instead of stretching a single image. Each pipe is composed of:

1. **Body tiles** — repeated vertically to fill the pipe height (extends well past the screen edge)
2. **Mouth tile** — placed at the opening where the bird flies through

This avoids visual stretching artifacts and matches the original game's pixel-art style. Each tile is 55px wide and ~53px tall.

## Audio files

The five sound effects are 16-bit mono PCM WAV at 22.05 kHz, with leading and trailing silence trimmed so each sound starts on the triggering frame (the score sound previously began with 123 ms of silence). PCM avoids the decoder delay that compressed formats add to short effects, decodes on every platform, and the full set is about 136 KB.

`assets/` is canonical. `docs/public/assets/` is a copy for the Pages site: run `bun run assets:sync` after changing assets; CI runs `bun run assets:check`.

## Background and ground tiling

Both the background and ground use 5 copies laid out horizontally in a flex row; adjacent tiles overlap by one pixel so fractional scaling never shows a seam. The main-thread loop translates the container left. Background offset wraps at one tile width (276px); ground offset wraps at half its tile width (112px), matching the repeated ground pattern.

- **Background**: 5 tiles at 276px each = 1380px total, scrolls at `0.2 * speedMultiplier` px/frame
- **Ground**: 5 tiles at 224px each = 1120px total, scrolls at `2.7 * speedMultiplier` px/frame

## Score display

The in-game score uses sprite-based digit rendering (`ScoreDisplay.tsx`). Each digit is drawn in an 18x27px `<image>` element with 2px gaps, centered on screen. These are display dimensions, not the source PNG dimensions (for example, `digit-0.png` is 12x18px).

The game-over panel score uses `<text>` elements positioned absolutely over the panel sprite.

## Credits

- Sprites from [The Spriters Resource](https://www.spriters-resource.com/fullview/59894/)
- Sound effects from [The Sounds Resource](https://www.sounds-resource.com/mobile/flappybird/sound/5309/)
- Original Flappy Bird by [Dong Nguyen](https://en.wikipedia.org/wiki/Flappy_Bird)
- Earlier Canvas recreation by [noanonoa](https://github.com/noanonoa/flappy-bird), preserved in this repository's history

## Website copies and social assets

The website's own artwork (the scenery behind the game while it loads, the ground strip, medals, and the 404 scene) uses copies in `docs/public/assets/`. Keep each sprite byte-identical to its canonical counterpart in root `assets/`: run `bun run assets:sync` after changing sprites (CI runs `bun run assets:check`). The game on the home page needs no copies: its sprites are embedded in `main.web.bundle`, and `bun run build:site` ships the sounds from `assets/audio/`. `npm run check:site` fails if a sprite the site references is missing from the output.

The Open Graph image is rendered from `docs/scripts/og-template.html` by headless Chrome (`npm run og:render`), with the real sprites and the site's fonts. The browser icons come from `docs/scripts/generate_icons.py`, which scales the bird sprite by whole numbers onto the sky color. See `docs/README.md` for the commands.
