# About Lynx

[Lynx](https://lynxjs.org/) is an open-source cross-platform rendering framework from ByteDance. ReactLynx offers React-like components/hooks backed by a Preact-based runtime. On mobile it describes native UI elements rather than rendering the application in a WebView.

## Why a game?

A small game exposes framework boundaries: frequent state changes, input latency, images, sound, viewport geometry, background/resume, and packaging. Speedy Bird compares native-element rendering with Canvas over the same simulation.

## Runtime model

The main thread can render an initial frame before background JavaScript is ready. Background React work hydrates the scene and sends updates. Native modules belong to the background thread; functions using them are marked `background only`.

Main-thread scripts support direct gesture/animation work. They are a useful profiling experiment, introduced after measuring the snapshot renderer against a fixed replay. Learning controls use the new `<background-only>` element so host-dependent behavior stays outside the first-frame path.

## Elements and styling

This game uses `<view>`, `<image>`, and `<text>`. Text belongs in a text element. Layout/accessibility capabilities vary by engine and platform; consult current compatibility tables instead of assuming every browser DOM/CSS API exists.

The wider ecosystem includes extended elements, SVG, and animation capabilities. That does not mean this project integrates them. Framework support for additional platforms is also distinct from the Android, iOS, and web hosts maintained here.

## Host integration

Each host provides a typed `SpeedyBirdModule` for sound/preferences. Android uses SoundPool/SharedPreferences; iOS uses AVAudioPlayer/UserDefaults. The Lynx browser host forwards worker calls to browser audio/storage. The simulation knows none of those APIs.

## Versions and new features

See [upgrade notes](/speedy-bird-lynx/docs/reactlynx-upgrade/) for the 0.119 → 0.126 migration, Preact 11 cleanup timing, supported TypeScript range, web entry points, and future experiments.

- [Official documentation](https://lynxjs.org/)
- [Lynx runtime source](https://github.com/lynx-family/lynx)
- [ReactLynx/tooling source](https://github.com/lynx-family/lynx-stack)
- [Compatibility](https://lynxjs.org/guide/compatibility.html)
- [Native modules](https://lynxjs.org/guide/use-native-modules.html)
