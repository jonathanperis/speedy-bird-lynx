# About Lynx

[Lynx](https://lynxjs.org/) is an open-source cross-platform native UI framework created by [ByteDance](https://www.bytedance.com/) (the company behind TikTok). Open-sourced in early 2025, it allows developers to write apps in TypeScript/TSX using React-like APIs and render them as truly native UIs — not WebViews.

## Why Lynx for This Project

This project exists to learn Lynx by building something real. A Flappy Bird clone is a good fit because it exercises:

- Element-based rendering — no canvas, all positioning via `<view>` + CSS transforms
- Per-frame animation — a main-thread frame loop that updates element styles without React renders
- Touch input — main-thread tap handlers with no cross-thread round trip
- Asset loading — images, sprites, audio
- Cross-platform code — Android host and web preview, with an iOS source scaffold requiring Xcode setup
- CI/CD — automated build and release pipeline

## How Lynx Differs from Other Frameworks

| Feature | Lynx | React Native | WebView (Cordova) |
|---------|------|-------------|-------------------|
| Rendering | Native engine on mobile | Native renderer (Fabric in the New Architecture) | Browser engine |
| UI elements | `<view>`, `<image>`, `<text>` etc. | `<View>`, `<Image>`, `<Text>` | HTML elements |
| Styling | CSS with platform/version-specific support | JavaScript style objects and supported layout/style properties | Web CSS |
| Execution | Main-thread rendering + background JavaScript | New Architecture uses JSI; not the legacy serialized bridge | Browser main thread, with workers available |
| JS engine | PrimJS on these native hosts; platform-dependent runtimes elsewhere | Hermes by default | Browser-dependent (for example V8 or JavaScriptCore) |
| Component APIs | ReactLynx, with its own runtime and compatibility APIs | React Native | React DOM |
| Build tool | Rspack (`@lynx-js/rspeedy`) | Metro | Webpack/Vite |

## Key Lynx Concepts Used in Speedy Bird

React Native 0.82 and newer run only on the New Architecture. Framework behavior evolves; consult the linked official references instead of treating this table as a benchmark or exhaustive feature list.

### Elements Used Here

The ReactLynx game uses three built-in elements:

- `<view>` — every container, positioned absolutely with transforms
- `<image>` — bird sprites, pipe tiles, background, ground, medals, digits
- `<text>` — score numbers on the game-over panel

This application does not use canvas or extended elements for its Lynx renderer. Lynx and its platform extensions offer additional elements such as video, SVG, and canvas integrations; availability depends on the platform and registered components. The Pages demo uses the browser's standard Canvas and Audio APIs.

### CSS Differences

- Layout and styling are interpreted by Lynx on native targets, not by a browser stylesheet engine
- The game uses explicit absolute positioning, flex rows, overflow clipping, and transforms
- Length units include `px`, `ppx`, `rpx`, `em`, `rem`, `vh`, and `vw`; percentages are supported where the property permits them

The project primarily uses pixels and percentages. See the [Lynx length reference](https://lynxjs.org/api/css/data-type/length) for definitions and platform compatibility.

### Dual-Threaded Architecture and Main Thread Script

React reconciliation (diffing, state updates) runs on a background thread. The main thread handles native rendering and touch events. Normally every update crosses between the two, which is fine for UI but too slow for a game updated every frame. [Main Thread Script](https://lynxjs.org/react/main-thread-script.html) lets selected functions run on the main thread instead:

- `'main thread'` functions handle taps (`main-thread:bindtap`) and run the frame loop with `lynx.requestAnimationFrame`
- `useMainThreadRef` binds elements (`main-thread:ref`) and keeps the controller between calls
- `setStyleProperties` moves the bird, pipes, and scenery directly, without React
- `import ... with { runtime: 'shared' }` makes the pure engine module callable from main-thread code
- `runOnBackground` sends discrete changes (score, state, sounds) to React; `runOnMainThread` lets background code start, pause, or resume the loop

See [Game Engine](game-engine.md) for the frame-by-frame flow.

### Native Modules

Sound, saved scores, and screen-reader announcements go through one native module, `SpeedyBirdModule`, read from the background thread's `NativeModules` (`src/platform/host.ts`). Each host implements it: the standalone web host registers an ES module through `<lynx-view>`'s `nativeModulesMap` and handles calls with `onNativeModulesCall`. A host without the module still runs the game silently. The Canvas demo runs in the browser document and has its own audio implementation.

## Resources

- [Lynx Documentation](https://lynxjs.org/)
- [React Native 0.82 and the New Architecture](https://reactnative.dev/blog/2025/10/08/react-native-0.82)
- [Lynx Native Modules](https://lynxjs.org/guide/use-native-modules)
- [Lynx GitHub](https://github.com/lynx-family/lynx)
- [ReactLynx API Reference](https://lynxjs.org/api/index.html)
- [Lynx Integration Guide (Android)](https://lynxjs.org/guide/start/integrate-with-existing-apps?platform=android)
- [Lynx Integration Guide (iOS)](https://lynxjs.org/guide/start/integrate-with-existing-apps?platform=ios)
