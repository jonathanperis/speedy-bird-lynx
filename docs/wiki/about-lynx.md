# About Lynx

[Lynx](https://lynxjs.org/) is an open-source cross-platform native UI framework created by [ByteDance](https://www.bytedance.com/) (the company behind TikTok). Open-sourced in early 2025, it allows developers to write apps in TypeScript/TSX using React-like APIs and render them as truly native UIs — not WebViews.

## Why Lynx for This Project

This project exists to learn Lynx by building something real. A Flappy Bird clone is a good fit because it exercises:

- Element-based rendering — no canvas, all positioning via `<view>` + CSS transforms
- Frequent state updates — 60 FPS game loop pushing React state
- Touch input — tap events for gameplay
- Asset loading — images, sprites, audio
- Cross-platform builds — same code on web, Android, iOS
- CI/CD — automated build and release pipeline

## How Lynx Differs from Other Frameworks

| Feature | Lynx | React Native | WebView (Cordova) |
|---------|------|-------------|-------------------|
| Rendering | Native C++ engine | Native bridge | Browser engine |
| UI elements | `<view>`, `<image>`, `<text>` etc. | `<View>`, `<Image>`, `<Text>` | HTML elements |
| Styling | CSS (200+ properties) | StyleSheet (CSS subset) | Full CSS |
| Threading | Dual (background + main) | Bridge-based | Single |
| JS engine | QuickJS (PrimJS) | Hermes/JSC | V8/JSC |
| React compat | React 17+ (ReactLynx) | React Native | React DOM |
| Build tool | Rspack (`@lynx-js/rspeedy`) | Metro | Webpack/Vite |

## Key Lynx Concepts Used in Speedy Bird

### Built-in Elements

Lynx only has ~10 built-in elements. This game uses:

- `<view>` — every container, positioned absolutely with transforms
- `<image>` — bird sprites, pipe tiles, background, ground, medals, digits
- `<text>` — score numbers on the game-over panel

There is no `<canvas>`, `<svg>`, `<audio>`, or `<video>`.

### CSS Differences

- Default `box-sizing: border-box` and `position: relative`
- No margin collapsing, no inline elements
- `display` values: `linear` (default), `flex`, `grid`, `none`
- `overflow` only supports `visible` and `hidden`
- Units: `px`, `%`, `vh` — no `em`, `rem`, `vw`

### Dual-Threaded Architecture

React reconciliation (diffing, state updates) runs on a background thread. The main thread handles native rendering and touch events. This means:

- The game loop and React state live on the background thread
- Touch events (`bindtap`) are serialized from main to background thread
- Native element updates are applied on the main thread after reconciliation

### Native Modules

Lynx does not have built-in audio. The `audio.ts` module detects the environment:

- **Web**: uses `HTMLAudioElement` (works immediately)
- **Native**: calls a native module via `requireModule('AudioModule')` (requires per-platform implementation)

## Resources

- [Lynx Documentation](https://lynxjs.org/)
- [Lynx GitHub](https://github.com/lynx-family/lynx)
- [ReactLynx API Reference](https://lynxjs.org/api/index.html)
- [Lynx Integration Guide (Android)](https://lynxjs.org/guide/start/integrate-with-existing-apps?platform=android)
- [Lynx Integration Guide (iOS)](https://lynxjs.org/guide/start/integrate-with-existing-apps?platform=ios)
