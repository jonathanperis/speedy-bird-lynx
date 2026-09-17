# Learning Labs

Speedy Bird is a small game with several deliberately visible platform boundaries. Start with the Canvas cabinet, then compare the ReactLynx host using the same simulation.

## 1. Inspect a collision

**Learn:** AABB geometry and the difference between a rendered sprite and a hitbox.

1. Start a run and open **Learning controls**.
2. Enable **Hitboxes & metrics**, then pause near a pipe.
3. Use **Single step** to inspect movement one 17 ms simulation step at a time.
4. Find `pipeGeometry` and `collidesWithPipe` in `src/game/engine.ts`.

The bottom pipe is an obstruction from its mouth through the ground. A previous implementation ended its hitbox above the native ground; the geometry tests retain that regression case.

**Verify:** `bun test tests/game.test.ts`.

## 2. Reproduce a run

**Learn:** Seeded randomness and input indexed by simulation time.

Choose a seed, play, then press **Replay run**. Replay uses the recorded flap ticks and the same configuration. It pauses at the end of the recording. **New run** exits replay. The class in `src/game/session.ts` exposes `recording()` for headless experiments.

Try feeding the same input sequence through 17 ms and 85 ms rendering intervals. The simulation should end at the same state. Paused time is discarded; a delayed callback processes at most 250 ms to prevent an unbounded catch-up burst.

**Tradeoff:** Bounded catch-up intentionally discards long stalls. Determinism is defined by simulation ticks, not by replaying arbitrary wall-clock stalls.

## 3. Compare renderers

**Learn:** Immediate Canvas drawing versus ReactLynx element snapshots.

- Canvas: `docs/src/game/renderer.ts` and `controller.ts`.
- ReactLynx: `src/App.tsx`, `components/`, and `hooks/useGameEngine.ts`.
- Shared rules: `src/game/engine.ts` and `session.ts`.

The Canvas world is 400×600; native is 400×750. Use the same world configuration when making a strict renderer comparison. The native game scales and letterboxes its logical world into the host viewport.

The debug interval is a scheduler measurement, not proof of GPU frame rate. Profile a fixed replay on the same device before comparing snapshot rendering with a main-thread-script experiment. Static pipe tiles are memoized; pipe translation still updates each frame.

## 4. Follow a native bridge call

**Learn:** Background-thread ownership, asynchronous boundaries, and platform resources.

Follow `getHostBridge()` to `SpeedyBirdModule` in Kotlin or Swift, or to `web-host/native-module.js`. Sound names cross the boundary; sound files are loaded by the host. Preferences use SharedPreferences, UserDefaults, or localStorage.

Pause/background a run and inspect the cleanup path. On return, resume explicitly. ReactLynx 0.126 defers component effect cleanup until after paint, so native lifecycle handling also pauses explicitly.

## 5. Change difficulty accessibly

**Learn:** Configuration versus physics changes.

**Practice** widens the gap to 190 and runs the simulation clock at 0.65×. The standard flap/gravity remain unchanged. **Mute**, practice, debug visibility, and best score persist locally when the host bridge is available. Scores are local sandbox scores, not competitive rankings across modes.

Canvas keyboard actions apply only while the canvas is focused. Space flaps; P toggles pause; held-key repeats are ignored. Game state is announced through a polite status region instead of every physics update.

## 6. Inspect a shipped artifact

**Learn:** A compiled bundle is not automatically a complete application.

```sh
bun run build
bun run assets:check
python3 scripts/verify-apk.py android/app/build/outputs/apk/debug/app-debug.apk
```

All game PNGs are embedded in the native/web bundles; native WAVs have deterministic packaged filenames. `scripts/assets.mjs` synchronizes the same canonical resources into the documentation site.

## Further experiments

- Add property-based generated bird/pipe geometry cases and compare them with the drawn hitboxes.
- Measure main-thread-script input feedback against background-thread React snapshots.
- Add haptics through the existing host interface and document device support.
- Build a seed-based challenge or leaderboard as a separate networking exercise: define validation, offline behavior, and privacy before choosing a backend.
- Add versioned replay import/export, with input validation and a simulation-version compatibility policy.

Each experiment should record its hypothesis, changed boundary, measurement, and verification command. Keep a passing baseline so a platform issue is distinguishable from the lesson itself.
