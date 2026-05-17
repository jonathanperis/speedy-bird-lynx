---
name: Speedy Bird Game Architecture
description: ReactLynx game engine patterns, dual-threaded model, component hierarchy, and cross-platform build strategy
type: project
---

## Game Engine Design

The core game logic lives in `useGameEngine` (`src/hooks/useGameEngine.ts`):

- **useRef for mutable state**: Physics calculations (bird position, velocity, pipe positions) stay in refs to avoid every-frame React re-renders.
- **useState for render snapshots**: Only visual state is pushed to React (bird Y, pipe positions, score, game state).
- **Game loop**: Interval-driven loop targeting roughly 60 FPS.
- **State machine**: `STATE_READY` → `STATE_PLAY` → `STATE_OVER`, with transitions in the tap/click handler.

ReactLynx runs React work separately from native rendering. Minimize cross-thread render churn for per-frame gameplay.

## Rendering Approach

All ReactLynx game entities render as positioned `<view>` and `<image>` elements, not canvas:

- Movement via CSS `transform: translate(Xpx, Ypx)` to avoid layout recalculation.
- Sprites as `<image>` elements with frame cycling and rotation.
- Z-index layering: Background(0) → Pipes(1) → Bird(2) → Ground(3) → Score(4) → Overlays(5).

## Cross-Platform Build Strategy

- **Lynx bundle** (`main.lynx.bundle`): Shared TypeScript compiled by RSpeedy and loaded by native hosts.
- **Android host**: Kotlin + Lynx SDK 3.7.0, loading the bundle from `assets/`.
- **iOS host**: Swift/CocoaPods scaffold + Lynx SDK 3.7.0, loading the bundle from app resources when an Xcode project is present.
- **GitHub Pages site**: Astro site under `docs/`, including a playable canvas demo and generated wiki pages.
- **Web preview tooling**: RSpeedy dev server with `@lynx-js/web-core` for development.

## Audio System

Runtime-detected dual implementation:

- **WebAudioModule**: Uses `HTMLAudioElement` for web.
- **NativeAudioModule**: Stubs for native platforms until native audio APIs are wired.
