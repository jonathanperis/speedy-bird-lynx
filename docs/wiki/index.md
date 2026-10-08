# Speedy Bird manual

Speedy Bird is Flappy Bird with one change: every pipe you clear makes the game 1% faster. I built it to learn [Lynx](https://lynxjs.org/), ByteDance's cross-platform UI framework, so the same ReactLynx code runs as a native Android app, a native iOS app, and in the browser. This manual explains how it is put together, with links to the source for every claim.

## Start here

1. **Play it.** The [home page](../) runs the game in your browser. It is a Canvas build that uses the app's own rules module, so it plays exactly like the native apps.
2. **Run it locally.** [Getting started](getting-started.md) installs the toolchain and starts the dev server, the website, and the native hosts.
3. **Read the engine.** [Game engine](game-engine.md) covers the rules, the main-thread frame loop, and the bridge to each host.
4. **Build a host.** [Native host apps](native-host-apps.md) builds the Android and iOS apps and runs their tests.

## What is in the box

| Part | What it is | Where |
|------|-----------|-------|
| Game | ReactLynx components, a pure rules engine, a main-thread frame loop | `src/` |
| Android host | Kotlin app that loads the bundle and plays sound with SoundPool | `android/` |
| iOS host | Swift app with a generated Xcode project and UI tests | `ios/` |
| Web host | A `<lynx-view>` page that runs the real bundle in a browser | `web-host/` |
| Website and manual | This Astro site, with the Canvas build on the home page | `docs/` |

## Status

Android and iOS build in CI; Android is linted and its APK checked for the current bundle and every sound, and the iOS app runs UI tests on a simulator. iOS archives are unsigned, so the iOS app is not distributed through the App Store. The web build plays in any modern browser.

> **Note:** The rules have one source, `src/game/engine.ts`. The ReactLynx app, the Canvas build on the home page, and the unit tests all import it, so a rule change shows up everywhere at once.
