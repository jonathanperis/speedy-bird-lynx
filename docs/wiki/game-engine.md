# Game engine

The rules live in `src/game/engine.ts`: a pure, deterministic module with no timers, rendering, storage, audio, or framework APIs. `src/hooks/useGame.ts` runs it on Lynx's main thread, renders each frame there, and sends only discrete changes (state, score, sounds) to React on the background thread. The website plays the same ReactLynx build in a `<lynx-view>` (see [Web rendering surfaces](architecture.md#web-rendering-surfaces)), and its timing panel derives speed values from this module. The engine is covered by unit tests in `tests/engine.test.ts`.

## State machine

```
STATE_READY (0) ──tap──> STATE_PLAY (1) ──collision──> STATE_OVER (2)
      ^                                                      │
      └──────── tap (after the bird lands + 0.5 s) ──────────┘
```

| State | Bird | Pipes | Input |
|-------|------|-------|-------|
| **Ready** | Hovers at Y=280, slow wing animation (every 20 steps) | None | Tap starts the run with a flap |
| **Play** | Falls with gravity, flaps on tap, fast animation (every 4 steps) | Spawn, scroll left, score when cleared | Tap flaps |
| **Over** | After a pipe hit it keeps falling until it lands | Frozen | Ignored until the bird has landed and `RESTART_DELAY_STEPS` (30 steps, ~0.5 s) have passed; then a tap returns to Ready |

The restart delay stops a frantic final tap from skipping the results panel. Once the bird has landed and the delay has passed, `step()` returns the same snapshot and the frame loop stops until the next tap.

## Simulation API

| Function | Purpose |
|----------|---------|
| `createGame(seed, bestScore)` | New Ready-state snapshot. The seed is mixed and drives a xorshift32 generator stored in the snapshot, so runs are reproducible. |
| `step(state)` | Advance one fixed step and return `{ state, sounds }`. Never mutates its input. |
| `tap(state)` | Apply a tap: start, flap, or restart. |
| `consumeElapsed(clock, ms)` | Convert wall time into whole steps; gaps longer than 250 ms are clamped. |
| `fitViewport(width, height)` | Scale and offset that fit the 400x750 playfield on a screen. |
| `collidesWithPipe`, `medalForScore`, `tiltForVelocity`, `speedMultiplier`, `spawnInterval` | Rule helpers shared with tests and renderers. |

## Frame loop

The loop runs on the Lynx main thread with `lynx.requestAnimationFrame`, so it follows the display's refresh. Each frame:

1. Measure elapsed time and convert it into fixed 1/60 s steps (`consumeElapsed`). Speed does not depend on the refresh rate: a 120 Hz display takes a step every other frame, and a slow frame takes several steps.
2. Run `step()` for each pending step and collect sound events.
3. Render by writing `transform`/`opacity`/`display` styles directly to the bird, scenery, and pipe slots with `setStyleProperties`. A value is written only when it changes.
4. If the state, score, best score, or pause flag changed, or sounds were produced, call the background thread once with `runOnBackground`. React then updates the score, overlays, and accessibility label, the host plays the sounds, and a new best score is saved.
5. Request the next frame unless the game is idle.

Taps are handled on the main thread (`main-thread:bindtap`), so a flap takes effect in the same frame without a round trip to the background thread.

## Physics

Values are per fixed step (1/60 s).

| Parameter | Value | Effect |
|-----------|-------|--------|
| Gravity | 0.28 px/step² | Downward acceleration |
| Flap velocity | -7.25 px/step | Upward impulse on tap |
| Pipe base speed | 2.7 px/step | Horizontal scroll speed |
| Speed scaling | +1% per point | `speed = 2.7 * (1 + score * 0.01)` |
| Background scroll | 0.2 px/step base | Same multiplier during play |
| Ground scroll | 2.7 px/step base | Same multiplier as the pipes |

The ceiling stops upward motion (velocity is clamped to zero) instead of pinning the bird to the top edge.

## Bird rotation and animation

Tilt follows vertical velocity: `clamp((velocity - 2) * 7, -15°, 70°)`. The bird points up while rising, levels off at a velocity of 2, and gradually dives as it falls. In a steep dive (velocity >= 9.25) the wings stop flapping (frame 1). On landing the bird shows frame 2 at the full 70° dive.

The wing cycle is `bird-0, bird-1, bird-2, bird-1`. All four frames stay mounted and only their opacity changes, so a frame change never waits for an image decode.

## Collision detection

The bird's circular hitbox is approximated by its bounding square:

```
Bird box:  x 68–92 (BIRD_X ± BIRD_RADIUS), y birdY ± 12

Per pipe pair (x to x + 55):
  Upper pipe: everything above the gap top (y + 300)
  Lower pipe: everything below the gap bottom (y + 300 + 150)
```

The ground ends a run when `birdY + BIRD_H / 2 >= CANVAS_HEIGHT - GROUND_H`.

## Pipes

- **Interval**: 77 steps at base speed, `max(20, round(77 / speedMultiplier))`
- **Gap position**: upper pipe `y` is uniform between -200 and -80 from the seeded generator
- **Gap size**: 150 px
- **Rendering**: five reusable pipe slots. Pipe ids are sequential and at most three pipes are alive, so `id % 5` never collides. Off-screen slots are hidden with `display: none`.

## Scoring and medals

A point is scored as soon as the bird's trailing edge clears a pipe (`pipe.x + 55 < 68`), exactly once per pipe. The best score is saved through the host bridge, so it persists across launches where the host implements storage.

| Score | Medal |
|-------|-------|
| 10+ | Bronze |
| 25+ | Silver |
| 50+ | Gold |
| 100+ | Platinum |

The game-over panel marks a new best score with "NEW".

## Audio and host bridge

The engine emits sound events; the background thread forwards them to the host's `SpeedyBirdModule` native module (`src/platform/host.ts`):

| Method | Purpose |
|--------|---------|
| `play(sound)` | Play `flap`, `score`, `collision`, `fall`, or `swoosh` |
| `stopAudio()` | Stop sounds when the app is paused or closed |
| `loadPreferences(callback)` / `savePreferences(json)` | Persist the best score as `{"version":1,"bestScore":N}` |
| `announce(message)` (optional) | Speak game start, pause, and game-over summaries through the platform screen reader |
| `reportHud(json)` (optional) | Receive the HUD (`gameState`, `score`, `bestScore`, `newBest`, `paused`) whenever it changes. Only the browser hosts implement it; the website uses it for the timing panel |

| Event | File |
|-------|------|
| Flap | `sfx_wing.wav` |
| Point | `sfx_point.wav` |
| Pipe hit | `sfx_hit.wav` |
| Landing / ground hit | `sfx_die.wav` |
| Restart | `sfx_swooshing.wav` |

A pipe hit plays the hit sound, then the landing sound when the bird reaches the ground. Hosts without the module, such as Lynx Explorer, still run the game silently and without saved scores. The browser hosts (the standalone web host and the website) share one implementation, `web-host/host.ts`, with the Web Audio API and `localStorage`; see [Native host apps](native-host-apps.md) for the platform hosts.

## Host events

Hosts send these through Lynx's `GlobalEventEmitter`:

| Event | Effect |
|-------|--------|
| `SpeedyBirdPause` | Stop the frame loop and audio. A run in progress shows "PAUSED" and resumes on the next tap. |
| `SpeedyBirdResume` | Restart the frame loop on the Ready or Game Over screens (a paused run waits for a tap). |
| `SpeedyBirdTap` | Same as a tap; used for keyboard input. |

As a safeguard the main-thread loop also pauses a run by itself when a frame arrives 500 ms or more after the previous one (`STALL_PAUSE_MS`), which means the app was suspended or frozen. A run is never resumed under the player's finger, even if a host's pause event arrives late.
