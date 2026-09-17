# About Lynx

[Lynx](https://lynxjs.org/) is an open-source cross-platform native UI framework created by [ByteDance](https://www.bytedance.com/) (the company behind TikTok). Open-sourced in early 2025, it allows developers to write apps in TypeScript/TSX using React-like APIs and render them as truly native UIs — not WebViews.

## Why Lynx for This Project

This project exists to learn Lynx by building something real. A Flappy Bird clone is a good fit because it exercises:

- Element-based rendering — no canvas, all positioning via `<view>` + CSS transforms
- Frequent state updates — a 17ms timer targeting approximately 60 updates per second
- Touch input — tap events for gameplay
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

### Dual-Threaded Architecture

React reconciliation (diffing, state updates) runs on a background thread. The main thread handles native rendering and touch events. This means:

- The game loop and React state live on the background thread
- Touch events (`bindtap`) are serialized from main to background thread
- Native element updates are applied on the main thread after reconciliation

### Native Modules

The current `audio.ts` adapter detects whether the JavaScript environment exposes `Audio`:

- **Browser contexts with `Audio`**: uses `HTMLAudioElement`; playback can be blocked until user interaction
- **Native and worker contexts without `Audio`**: uses a placeholder adapter and continues without sound; a supported native-module bridge is not implemented

The placeholder's optional `__lynx_requireModule` lookup is not a documented integration contract. Future audio work should use Lynx's supported background-thread `NativeModules` API and register the corresponding Android/iOS modules. The only current adapter method is `play(sound)`; there is no native preload method. The standalone Canvas demo runs in the browser document and has its own working audio implementation.

## Resources

- [Lynx Documentation](https://lynxjs.org/)
- [React Native 0.82 and the New Architecture](https://reactnative.dev/blog/2025/10/08/react-native-0.82)
- [Lynx Native Modules](https://lynxjs.org/guide/use-native-modules)
- [Lynx GitHub](https://github.com/lynx-family/lynx)
- [ReactLynx API Reference](https://lynxjs.org/api/index.html)
- [Lynx Integration Guide (Android)](https://lynxjs.org/guide/start/integrate-with-existing-apps?platform=android)
- [Lynx Integration Guide (iOS)](https://lynxjs.org/guide/start/integrate-with-existing-apps?platform=ios)
