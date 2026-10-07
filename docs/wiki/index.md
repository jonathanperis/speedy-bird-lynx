# Speedy Bird Lynx

Flappy Bird clone built with [ReactLynx](https://lynxjs.org/) and TypeScript. One codebase runs on Android, iOS, and the Web. Lynx uses a native C++ rendering engine and dual-threaded architecture instead of a WebView.

## Wiki Pages

| Page | Description |
|------|-------------|
| [About Lynx](about-lynx.md) | Native rendering, ReactLynx concepts, and platform boundaries |
| [Architecture](architecture.md) | Project structure, component hierarchy, rendering approach, and dual-threaded model |
| [Assets and Sprites](assets-and-sprites.md) | Sprite organization, asset loading, tile-based pipe rendering, and audio |
| [CI/CD Pipeline](ci-cd-pipeline.md) | GitHub Actions workflows for building, signing, deploying, and releasing |
| [Game Engine](game-engine.md) | Pure rules engine, main-thread frame loop, physics, scoring, and host bridge |
| [Getting Started](getting-started.md) | Setup, dev server, production builds, and platform-specific instructions |
| [Native Host Apps](native-host-apps.md) | Android and iOS hosts, native bridge, lifecycle, and UI tests |
| [Dependencies and Upgrades](dependency-updates.md) | Current toolchains, compatibility holds, and upgrade checks |

## Key Features

- Tap/click to flap; the standalone web host and the GitHub Pages canvas demo also support Space
- Speed increases 1% per pipe cleared; frame-rate-independent physics on a main-thread loop
- Best score saved on every platform; pause when the app is backgrounded; screen-reader announcements
- Medal system: Bronze (10+), Silver (25+), Gold (50+), Platinum (100+)
- Element-based ReactLynx rendering with CSS transforms; a separate Canvas demo powers the public website
- Tile-based pipe construction and parallax scrolling
- AABB collision detection with circular hitbox approximation
- Automated CI/CD for type-checking, bundle builds, CodeQL, Pages deployment, and release artifacts

## Platform status

Android and iOS have buildable native hosts with sound and saved scores; CI compiles both, lints Android, and runs iOS UI tests on a simulator (iOS archives are unsigned). ReactLynx also has a development web preview and a self-contained standalone web host. GitHub Pages runs the Canvas game and this manual.

---

*[GitHub](https://github.com/jonathanperis/speedy-bird-lynx) · [Play →](https://jonathanperis.github.io/speedy-bird-lynx/) · [Jonathan Peris](https://jonathanperis.github.io/)*
