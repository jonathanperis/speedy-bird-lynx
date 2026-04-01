# Design: Lynx Port

## Architecture Overview

```
App.tsx (root)
├── GameContainer (300x500 view, overflow:hidden)
│   ├── Background (scrolling image layer, z-index:0)
│   ├── PipeManager (spawns/removes Pipe components, z-index:1)
│   │   └── Pipe (top + bottom image pair, absolute positioned)
│   ├── Ground (scrolling image layer, z-index:3)
│   ├── Bird (animated sprite, absolute positioned, z-index:2)
│   ├── ScoreDisplay (digit images or text, z-index:4)
│   ├── GetReadyScreen (overlay image, z-index:5)
│   └── GameOverScreen (overlay with scores, z-index:5)
└── Title ("SPEEDY BIRD" text above game)
```

## Component Design

### App.tsx
- Root component, mounts GameContainer
- Title text above game area
- Description text below

### useGameEngine.ts (core hook)
The central game engine hook. Owns ALL mutable game state via refs (not React state). Runs the RAF loop.

```typescript
// Mutable refs (not React state — never triggers re-render per frame)
gameState: ref<0|1|2>        // getReady, play, gameOver
frame: ref<number>           // global frame counter
birdY: ref<number>           // bird vertical position
birdVelocity: ref<number>    // bird vertical velocity
birdFrame: ref<number>       // animation frame index (0-3)
birdRotation: ref<number>    // rotation in degrees
pipes: ref<PipeData[]>       // array of {x, y} for each pipe pair
score: ref<number>           // current score
bestScore: ref<number>       // session best
bgX: ref<number>             // background scroll offset
groundX: ref<number>         // ground scroll offset

// The loop
function tick() {
  updatePhysics()
  updatePipes()
  checkCollisions()
  updateAnimations()
  renderToElements()     // setNativeProps on all element refs
  frame.current++
  rafId = requestAnimationFrame(tick)
}
```

### Rendering Strategy: setNativeProps()

Each visible element has a `useRef()`. On every frame, the engine calls `setNativeProps()` to update transforms directly — bypassing React reconciliation entirely.

```typescript
// Bird ref example
birdRef.current.setNativeProps({
  style: {
    transform: `translate(${BIRD_X}px, ${birdY.current}px) rotate(${birdRotation.current}deg)`
  }
});
```

### Bird.tsx
- Renders 4 `<image>` elements (one per animation frame), only one visible at a time via opacity
- Absolute positioned at fixed x=50
- Parent applies transform for y-position and rotation
- Animation frame toggled by engine via setNativeProps (opacity: 1 on active, 0 on others)

### Pipe.tsx
- Renders two `<image>` elements: top pipe (flipped) and bottom pipe
- Absolute positioned, full height
- Engine updates transform: translateX() per frame
- Props: initial y-offset for gap position

### PipeManager
- NOT a component — just data in the engine
- Engine maintains pipes[] array
- On spawn: push new pipe data, React renders new Pipe via minimal state update
- On despawn: remove from array
- **Hybrid approach**: pipes array IS React state (for mount/unmount), but per-frame X position updates use setNativeProps on refs

### Background.tsx
- Three tiled `<image>` elements side by side (276px each to cover 300px + overflow)
- Engine scrolls via transform: translateX(bgX)
- Wraps at -276px

### Ground.tsx
- Two tiled `<image>` elements
- Scrolls at pipe speed (2px/frame)
- Wraps at -112px (half ground width)

### ScoreDisplay.tsx
- During play: centered digits near top
- Uses `<text>` element with score number (simpler than sprite digits for Lynx)
- Styled to match original aesthetic (white, large, with shadow)

### GetReadyScreen.tsx / GameOverScreen.tsx
- `<image>` overlays, shown/hidden based on gameState
- GameOver shows current + best score via `<text>`

## Input Handling

```typescript
// On the game container:
<view
  bindtap={handleTap}
  style={{ width: 300, height: 500 }}
>
```

Spacebar: Lynx doesn't have native keyboard events on mobile. For web target, we can use a global key listener if available, or document this as web-only.

handleTap logic (same as current main.js):
- getReady → play
- play → bird.flap() + play SFX
- gameOver → reset + getReady

## Audio Architecture

```typescript
// audio.ts — interface
interface AudioModule {
  play(sound: 'flap'|'score'|'collision'|'fall'|'swoosh'): void;
}

// Web fallback (works in Lynx web target)
class WebAudioModule implements AudioModule {
  private sounds: Record<string, HTMLAudioElement>;
  play(sound) { this.sounds[sound].play(); }
}

// Native stub (requires platform code)
class NativeAudioModule implements AudioModule {
  private module = requireModule('AudioModule');
  play(sound) { this.module.play(sound); }
}
```

## Data Flow

```
tap event → handleTap() → mutate refs directly
                              ↓
              requestAnimationFrame loop
                              ↓
              updatePhysics() — gravity, velocity, position
              updatePipes() — spawn, scroll, despawn
              checkCollisions() — AABB math
              updateAnimations() — bird frame, bg/ground scroll
                              ↓
              setNativeProps() on all element refs
                              ↓
              Native render (no React reconciliation)
```

## File Structure

```
speedy-bird-lynx/
├── src/
│   ├── App.tsx
│   ├── App.css
│   ├── components/
│   │   ├── GameContainer.tsx
│   │   ├── Bird.tsx
│   │   ├── Pipe.tsx
│   │   ├── Background.tsx
│   │   ├── Ground.tsx
│   │   ├── ScoreDisplay.tsx
│   │   ├── GetReadyScreen.tsx
│   │   └── GameOverScreen.tsx
│   ├── hooks/
│   │   └── useGameEngine.ts
│   ├── audio/
│   │   └── audio.ts
│   ├── constants.ts          # All magic numbers from main.js
│   └── types.ts              # PipeData, GameState types
├── assets/
│   ├── sprites/              # Pre-sliced PNGs
│   │   ├── bird-0.png
│   │   ├── bird-1.png
│   │   ├── bird-2.png
│   │   ├── bird-3.png
│   │   ├── pipe-top.png
│   │   ├── pipe-bottom.png
│   │   ├── background.png
│   │   ├── ground.png
│   │   ├── get-ready.png
│   │   └── game-over.png
│   └── audio/
│       ├── sfx_wing.wav
│       ├── sfx_point.wav
│       ├── sfx_hit.wav
│       ├── sfx_die.wav
│       └── sfx_swooshing.wav
├── lynx.config.ts
├── package.json
└── tsconfig.json
```

## Key Decisions

1. **Text score vs sprite digits**: Use `<text>` for score — simpler, adequate for Lynx, avoids 10 extra sprite images
2. **Pipe lifecycle**: Hybrid React state (mount/unmount) + setNativeProps (per-frame movement)
3. **Bird animation**: 4 pre-loaded images toggled via opacity rather than swapping src (avoids flicker)
4. **Single engine hook**: All game logic in one hook to avoid cross-ref synchronization issues
5. **No sprite sheets**: Every visual element is a separate PNG file
