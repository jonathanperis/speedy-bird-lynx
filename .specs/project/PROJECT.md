# Speedy Bird — Lynx Port

## Vision
Port the existing HTML5 Canvas Speedy Bird clone to ByteDance's Lynx framework, creating a cross-platform native app that runs on Android, iOS, Web, macOS, Windows, and HarmonyOS from a single TypeScript/TSX codebase.

## Goals
1. Feature parity with the current canvas-based game
2. Native performance via Lynx's element-based rendering
3. Clean ReactLynx component architecture
4. Cross-platform from day one

## Non-Goals
- Multiplayer or online features
- Stretch goals from original README (night/day mode, responsive design, running timer)
- Publishing to app stores (yet)

## Tech Stack
- **Framework**: Lynx (ReactLynx)
- **Language**: TypeScript/TSX
- **Build**: Rspack via @lynx-js/react-rsbuild-plugin
- **Rendering**: Element-based (<image>, <view>) with CSS transforms
- **Game Loop**: requestAnimationFrame + setNativeProps()
- **Audio**: Native module stubs (platform-specific)
