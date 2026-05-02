# Game Engine

The game engine lives in `src/hooks/useGameEngine.ts`. It handles the game loop, physics, collision detection, scoring, and state transitions.

## State Machine

The game has three states:

```
STATE_READY (0) ──tap──> STATE_PLAY (1) ──collision──> STATE_OVER (2)
      ^                                                      │
      └──────────────────────tap─────────────────────────────┘
```

| State | Bird | Pipes | Input |
|-------|------|-------|-------|
| **Ready** | Hovers at Y=280, wing animation (20-frame interval) | None on screen | Tap starts game |
| **Play** | Falls with gravity, flaps on tap, fast animation (4-frame interval) | Spawn, scroll left, score on pass | Tap = flap |
| **Over** | Falls to ground, no animation | Frozen | Tap resets to Ready |

## Game Loop

The loop runs via `setInterval(tick, 17)` targeting ~60 FPS. Each tick:

1. **Update bird** — apply gravity, update velocity, clamp position, compute rotation, advance animation frame
2. **Update pipes** — spawn new pipes on interval, move all pipes left, despawn off-screen pipes (incrementing score), check collisions
3. **Update scenery** — scroll background and ground at their respective speeds
4. **Push render state** — call `setRenderState()` with the current snapshot for React to render

## Physics

All values are in pixels per frame (at 60 FPS):

| Parameter | Value | Effect |
|-----------|-------|--------|
| Gravity | 0.28 px/frame² | Downward acceleration |
| Flap velocity | -7.25 px/frame | Upward impulse on tap |
| Pipe base speed | 2.7 px/frame | Horizontal scroll speed |
| Speed scaling | +1% per pipe | `speed = 2.7 * (1 + score * 0.01)` |
| Background scroll | 0.2 px/frame | Slower parallax layer |
| Ground scroll | 2.7 px/frame | Matches pipe speed |

## Bird Rotation

Rotation is determined by vertical velocity:

| Velocity | Rotation | Visual |
|----------|----------|--------|
| <= -7.25 (rising fast) | -15 deg | Nose up |
| Between -7.25 and -5.25 | 0 deg | Level |
| >= -5.25 (falling) | 70 deg | Nose dive |

During nose dive, the animation frame is locked to frame 1 (wings level).

## Bird Animation

The bird has a 4-frame cycle: `bird-0, bird-1, bird-2, bird-1` (ping-pong).

- **Ready state**: frame advances every 20 ticks (slow flutter)
- **Play state**: frame advances every 4 ticks (fast flapping)
- **Over state**: locked to frame 2 (wings up) with nose-dive rotation

## Collision Detection

Collision uses AABB (Axis-Aligned Bounding Box) with a circular bird hitbox approximated as a square:

```
Bird bounding box:
  left:   BIRD_X - BIRD_RADIUS (80 - 12 = 68)
  right:  BIRD_X + BIRD_RADIUS (80 + 12 = 92)
  top:    birdY - BIRD_RADIUS
  bottom: birdY + BIRD_RADIUS

Per pipe pair, two checks:
  Top pipe:    x to x+55, y to y+300
  Bottom pipe: x to x+55, y+300+150 to y+600+150
```

Ground collision triggers when `birdY + BIRD_H/2 >= CANVAS_HEIGHT - GROUND_H`.

## Pipe Spawning

- **Interval**: every 77 frames (~1.3s), adjusted by speed: `Math.max(20, Math.round(77 / speedMultiplier))`
- **Y position**: random between -200 and -80 (controls gap vertical placement)
- **Gap size**: 150px fixed
- **Despawn**: when `pipe.x < -55` (fully off-screen left), score increments

## Scoring and Medals

Score increments by 1 each time a pipe scrolls off-screen. Best score persists within the session.

| Score | Medal |
|-------|-------|
| 10+ | Bronze |
| 25+ | Silver |
| 50+ | Gold |
| 100+ | Platinum |

## Audio

Five sound effects, managed by `src/audio/audio.ts`:

| Event | Sound | File |
|-------|-------|------|
| Tap/flap | Wing flap | `sfx_wing.wav` |
| Pipe passed | Score point | `sfx_point.wav` |
| Pipe collision | Hit | `sfx_hit.wav` |
| Ground collision | Fall | `sfx_die.wav` |
| Reset game | Swoosh | `sfx_swooshing.wav` |

On web, audio uses `HTMLAudioElement`. On native platforms, it falls back to a native module stub (`AudioModule`).
