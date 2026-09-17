# Architecture

The simulation is shared; rendering and host effects are adapters.

```text
GameSession: clock, input recording, replay, pause
    └── engine: physics, seeded RNG, collision, score → snapshot + sound events
          ├── ReactLynx App → native view/image/text elements
          └── Canvas renderer → drawImage / shapes / text

Platform boundary: audio, versioned preferences, lifecycle
    ├── Android: SoundPool + SharedPreferences
    ├── iOS: AVAudioPlayer + UserDefaults
    └── Browser: HTMLAudioElement + localStorage
```

## Key files

| Path | Responsibility |
|---|---|
| `src/game/engine.ts` | Fixed-step state transition and shared geometry |
| `src/game/session.ts` | Bounded elapsed-time scheduling and replay |
| `src/game/preferences.ts` | Versioned persisted-data parsing |
| `src/hooks/useGameEngine.ts` | ReactLynx background effects, snapshots, lifecycle events |
| `src/App.tsx` | Logical viewport mapping and scene composition |
| `src/components/Pipe.tsx` | Moving wrapper with memoized static body tiles |
| `src/components/LearningControls.tsx` | Background-only learning panel |
| `docs/src/game/controller.ts` | Browser input, loading/retry, accessibility, scheduling |
| `docs/src/game/renderer.ts` | Canvas drawing over shared state |
| `src/platform/browser.ts` | Browser resources and storage |
| `web-host/native-module.js` | Background-worker factory forwarding host calls |
| `scripts/assets.mjs` | Asset synchronization, native packaging, verification |

## ReactLynx thread boundary

ReactLynx renders a first frame on the main thread and hydrates/updates from the background thread. Native module calls belong on the background thread. The hook's command/effect paths are explicitly background-only. `<background-only>` defers learning controls while providing a lightweight initial fallback.

The renderer deliberately keeps React snapshots as a readable reference implementation. Performance-sensitive changes should compare a recorded run before and after modification. Debug timing is a callback interval, not a GPU performance claim.

## Web surfaces

1. Rspeedy's built-in web preview loads the compiled ReactLynx bundle but does not supply the app-specific native bridge.
2. `web-host/` supplies that bridge, keyboard controls, and a complete distributable runtime.
3. `docs/` contains the Canvas cabinet and manual, using the shared simulation directly.

The Canvas cabinet uses a 400×600 configuration; ReactLynx uses 400×750 and letterboxes into the measured viewport. Strict renderer comparisons must use the same world configuration.

## Resource and lifecycle ownership

Bundle images are embedded. The host owns native audio players and closes/releases them with its lifecycle. A browser or native background event pauses the simulation. Component cleanup cancels timers/listeners, and renderers stop rescheduling settled game-over states.

Audio readiness is optional for gameplay. Required image failure produces a retryable Canvas loading state; it never counts as a successful load.
