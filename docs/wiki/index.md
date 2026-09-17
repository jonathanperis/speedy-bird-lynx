# Speedy Bird Lynx

Flappy Bird clone built with [ReactLynx](https://lynxjs.org/) and TypeScript. The checked-in project runs on Android and Web from a single codebase and includes iOS host source files for Xcode project setup. Lynx uses a native C++ rendering engine and dual-threaded architecture instead of a WebView.

## Wiki Pages

| Page | Description |
|------|-------------|
| [About Lynx](about-lynx.md) | Native rendering, ReactLynx concepts, and platform boundaries |
| [Architecture](architecture.md) | Project structure, component hierarchy, rendering approach, and dual-threaded model |
| [Assets and Sprites](assets-and-sprites.md) | Sprite organization, asset loading, tile-based pipe rendering, and audio |
| [CI/CD Pipeline](ci-cd-pipeline.md) | GitHub Actions workflows for building, signing, deploying, and releasing |
| [Game Engine](game-engine.md) | Physics, collision detection, state machine, scoring, and the game loop |
| [Getting Started](getting-started.md) | Setup, dev server, production builds, and platform-specific instructions |
| [Native Host Apps](native-host-apps.md) | Android host and iOS source scaffold |
| [Dependencies and Upgrades](dependency-updates.md) | Current toolchains, compatibility holds, and upgrade checks |

## Key Features

- Tap/click to flap in the ReactLynx app; the GitHub Pages canvas demo also supports Space
- Speed increases 1% per pipe cleared
- Medal system: Bronze (10+), Silver (25+), Gold (50+), Platinum (100+)
- Element-based ReactLynx rendering with CSS transforms; a separate Canvas demo powers the public website
- Tile-based pipe construction and parallax scrolling
- AABB collision detection with circular hitbox approximation
- Automated CI/CD for type-checking, bundle builds, CodeQL, Pages deployment, and release artifacts

## Platform status

Android has a checked-in buildable Kotlin host. ReactLynx has a development web preview and standalone host. GitHub Pages runs the independent Canvas game and this manual. iOS requires a locally created Xcode project; its CI archive path is conditional and always unsigned. The Canvas demo has sound; ReactLynx native/worker audio requires a bridge implementation.

---

*[GitHub](https://github.com/jonathanperis/speedy-bird-lynx) · [Play →](https://jonathanperis.github.io/speedy-bird-lynx/) · [Jonathan Peris](https://jonathanperis.github.io/)*
