# Speedy Bird Lynx

Flappy Bird clone built with [ReactLynx](https://lynxjs.org/) and TypeScript. The checked-in project runs on Android and Web from a single codebase and includes iOS host source files for Xcode project setup. Lynx uses a native C++ rendering engine and dual-threaded architecture instead of a WebView.

## Wiki Pages

| Page | Description |
|------|-------------|
| [About Lynx](about-lynx) | What Lynx is, how it differs from React Native and WebViews, and key concepts used in this project |
| [Architecture](architecture) | Project structure, component hierarchy, rendering approach, and dual-threaded model |
| [Assets and Sprites](assets-and-sprites) | Sprite organization, asset loading, tile-based pipe rendering, and audio |
| [CI/CD Pipeline](ci-cd-pipeline) | GitHub Actions workflows for building, signing, deploying, and releasing |
| [Game Engine](game-engine) | Physics, collision detection, state machine, scoring, and the game loop |
| [Getting Started](getting-started) | Setup, dev server, production builds, and platform-specific instructions |
| [Native Host Apps](native-host-apps) | Android and iOS native shells that embed the Lynx runtime |

## Key Features

- Tap/click to flap in the ReactLynx app; the GitHub Pages canvas demo also supports Space
- Speed increases 1% per pipe cleared
- Medal system: Bronze (10+), Silver (25+), Gold (50+), Platinum (100+)
- Element-based rendering with CSS transforms (no canvas)
- Tile-based pipe construction and parallax scrolling
- AABB collision detection with circular hitbox approximation
- Automated CI/CD for type-checking, bundle builds, CodeQL, Pages deployment, and release artifacts

---

*[GitHub](https://github.com/jonathanperis/speedy-bird-lynx) · [Play →](https://jonathanperis.github.io/speedy-bird-lynx/) · [Jonathan Peris](https://jonathanperis.github.io/)*
