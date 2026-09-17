---
name: Speedy Bird Game Architecture
description: Shared deterministic simulation and renderer/host boundaries
type: project
---

`src/game/engine.ts` owns pure fixed-step physics, seeded RNG, geometry, score and immutable snapshots. `session.ts` adds clock accumulation, pause, and tick-indexed replay.

ReactLynx consumes snapshots through `useGameEngine`; Canvas uses `docs/src/game/controller.ts` and `renderer.ts`. Native world is 400×750; Canvas is explicitly 400×600. Collision bounds derive from configuration. Native logical coordinates scale to the measured host viewport.

Sound/preferences use background-only `NativeModules.SpeedyBirdModule`: Kotlin SoundPool/SharedPreferences, Swift AVAudioPlayer/UserDefaults, or a web worker-to-host adapter. Generic Explorer lacks this custom bridge and shows a capability notice.

SDK/types are 4.1.0, PrimJS 4.1.1, bundle engineVersion 3.9. Root build embeds game PNGs and packages WAVs. iOS project/scheme are generated from checked-in Ruby configuration. ReactLynx 0.126 cleanup runs after paint, so lifecycle pausing is explicit.
