---
name: Speedy Bird Game Architecture
description: ReactLynx game engine patterns, dual-threaded model, component hierarchy, and cross-platform build strategy
type: project
---

## Game Engine Design

The core game logic lives in `useGameEngine` custom hook (`src/hooks/useGameEngine.ts`):
- **useRef for mutable state**: Physics calculations (bird position, velocity, pipe positions) stored in refs to avoid triggering re-renders on every physics tick
- **useState for render snapshots**: Only visual state pushed to React (bird Y, pipe positions, score, game state)
- **17ms interval**: `setInterval` at ~60FPS drives the game loop
- **State machine**: `STATE_READY` → `STATE_PLAY` → `STATE_OVER`, transitions in `handleTap()`

**Why:** ReactLynx runs React on a background thread with rendering on the main thread. Minimizing state changes reduces cross-thread communication.

**How to apply:** When adding new game features, store mutable physics state in refs, only push visual changes to useState.

## Rendering Approach

All entities rendered as positioned `<view>` and `<image>` elements (NOT canvas):
- Movement via CSS `transform: translate(Xpx, Ypx)` — avoids layout recalculation
- Sprites as `<image>` elements, animation via opacity cycling between frames
- Z-index layering: Background(0) → Pipes(1) → Bird(2) → Ground(3) → Score(4) → Overlays(5)

## Cross-Platform Build Strategy

- **Lynx bundle** (`main.lynx.bundle`): Shared TypeScript code compiled by RSpeedy, loaded by native hosts
- **Android host**: Kotlin + Lynx SDK 3.7.0, loads bundle from `assets/`
- **iOS host**: Swift + Lynx SDK 3.7.0 via CocoaPods, loads bundle from app bundle
- **Web standalone**: `docs/index.html` is a self-contained canvas-based version (separate from Lynx)
- **Web preview**: RSpeedy dev server with @lynx-js/web-core for development

## Audio System

Dual implementation auto-detected at runtime:
- **WebAudioModule**: Uses HTMLAudioElement for web
- **NativeAudioModule**: Stubs for native platforms (not yet wired to native audio APIs)
