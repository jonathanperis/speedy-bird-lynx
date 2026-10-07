---
name: Speedy Bird Game Architecture
description: ReactLynx game engine patterns, dual-threaded model, component hierarchy, and cross-platform build strategy
type: project
---

## Game Engine Design

- **Pure rules** in `src/game/engine.ts`: `createGame`, `step`, `tap`, collisions, pass-scoring, restart lock, `consumeElapsed`, `fitViewport`. Deterministic (mixed seed + xorshift32 in the snapshot), never mutates input, unit-tested in `tests/engine.test.ts`.
- **Main-thread loop** in `src/hooks/useGame.ts`: a `'main thread'` `start()` builds a controller (stored in a `useMainThreadRef`) that steps fixed 1/60 s steps from `lynx.requestAnimationFrame` and writes styles with `setStyleProperties` to elements found by id under the root `main-thread:ref`. The engine is imported `with { runtime: 'shared' }`.
- **React only for discrete state**: `runOnBackground(onGameEvent)` when state/score/best/pause change or sounds play; React renders the score, overlays, and accessibility label. Animated elements keep static React props so React never overwrites a frame.
- **Host bridge**: `NativeModules.SpeedyBirdModule` (`play`, `stopAudio`, `loadPreferences`, `savePreferences`, optional `announce`); host events `SpeedyBirdPause`, `SpeedyBirdResume`, `SpeedyBirdTap` via GlobalEventEmitter (subscribed in an effect, not `useLynxGlobalEventListener`, which runs during the main-thread render in tests).
- **State machine**: `STATE_READY` → `STATE_PLAY` → `STATE_OVER`; restart only after landing + `RESTART_DELAY_STEPS`.

## Rendering Approach

All ReactLynx game entities render as positioned `<view>` and `<image>` elements, not canvas:

- Movement via CSS `transform: translate(Xpx, Ypx)` to avoid layout recalculation.
- Sprites as `<image>` elements with frame cycling and rotation.
- Z-index layering: Background(0) → Pipes(1) → Bird(2) → Ground(3) → Score(4) → Overlays(5) → Paused(6).
- The 400x750 playfield is scaled by `fitViewport` and anchored to the bottom; extra height is sky, wide screens get side panels.
- Five reusable `PipeSlot`s (`id % 5`); hidden with `display: none`.

## Cross-Platform Build Strategy

- **Lynx bundle** (`main.lynx.bundle`): Shared TypeScript compiled by RSpeedy and loaded by native hosts.
- **Android host**: Kotlin + Lynx SDK 4.1.0; Gradle stages the current bundle into generated APK assets.
- **iOS host**: Swift/CocoaPods scaffold + Lynx SDK 4.1.0, loading the bundle from app resources when an Xcode project is present. Current CI always disables signing.
- **GitHub Pages site**: Astro site under `docs/`, including a playable canvas demo and generated wiki pages.
- **Web preview tooling**: RSpeedy dev server; `web-host/` is a self-contained `<lynx-view>` host implementing the bridge.

## Audio System

Engine steps emit sound names; the background thread forwards them to `SpeedyBirdModule.play`. WAVs are mono 22.05 kHz PCM with silence trimmed; hosts package `assets/audio/` (not the bundle). The standalone web host plays them with Web Audio.
