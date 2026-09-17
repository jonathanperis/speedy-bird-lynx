# Game Engine

`src/game/engine.ts` is shared by Canvas and ReactLynx. It has no framework, browser, clock, audio, or storage dependency. Every update returns a new snapshot and sound events. Published pipe objects are never mutated by later steps.

## State and timing

`Ready → tap → Play → collision → Over → tap → Ready`.

`GameSession` in `src/game/session.ts` owns the clock, pause state, and recording. Simulation advances in **17 ms** steps. Render callbacks accumulate elapsed time, processing at most 250 ms per callback. Paused time is discarded; a landed game-over state stops scheduling. Single step advances exactly one simulation step while paused.

Canvas schedules through requestAnimationFrame. ReactLynx uses a background timer feeding the same accumulator. Native hosts and browser visibility changes pause explicitly; players resume themselves.

## Standard configuration

| Parameter | Value |
|---|---|
| Flap velocity | −7.25 px/step |
| Gravity | 0.28 px/step² |
| Bird center X / radius | 80 / 12 |
| Pipe width / initial speed | 55 / 2.7 px/step |
| Gap | 150 |
| Spawn interval | `max(20, round(77 / multiplier))` steps |
| Speed multiplier | `1 + score × 0.01` |
| Pipe Y | Seeded integer from −200 through −80 |
| Ground height | 129 |

Native uses a 400×750 world; the browser cabinet uses 400×600. `GameConfig` makes that distinction explicit. Practice changes the gap to 190 and the clock scale to 0.65, without changing flap/gravity.

## Geometry

The bird uses an AABB: center ± radius. A pipe horizontally overlaps when its range intersects that box. Its top body extends to `pipe.y + PIPE_H`, and the lower body starts after the configured gap and continues through the ground. Rendering and collision both use `pipeGeometry`.

Touching the ground ends a run. At the ceiling the bird is clamped and upward velocity stops. Rotation is −15° below −2 velocity, neutral between −2 and +2, and 70° above +2. These thresholds intentionally describe rising/falling, rather than comparing descent against the positive flap magnitude.

## Score and replay

Score increments when a pipe leaves the left edge. Best score updates on game over and is persisted by platform adapters. Medal thresholds are 10, 25, 50, and 100; practice scores are local sandbox scores, not competitive rankings.

Randomness uses xorshift32 state carried in the snapshot. Recordings contain the seed, initial best score, configuration, frame count, and flap tick indices. Replay applies the same actions before the corresponding steps and pauses at its recorded endpoint. Pause and wall-clock delays do not need recording because they do not advance simulation time.

Run `bun test tests/game.test.ts` for geometry, state/scoring/reset, snapshot independence, cadence/replay, viewport mapping, and persisted-data boundaries.
