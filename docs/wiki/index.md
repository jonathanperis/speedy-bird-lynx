# Speedy Bird Lynx

Flappy Bird clone built with [ReactLynx](https://lynxjs.org/) and TypeScript. Runs natively on iOS, Android, and Web from a single codebase using Lynx's native C++ rendering engine and dual-threaded architecture.

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

- Tap or press Space to flap; fly through pipe gaps to score
- Speed increases 1% per pipe cleared
- Medal system: Bronze (10+), Silver (25+), Gold (50+), Platinum (100+)
- Element-based rendering with CSS transforms (no canvas)
- Tile-based pipe construction and parallax scrolling
- AABB collision detection with circular hitbox approximation
- Automated CI/CD for all three platforms

---

*[GitHub](https://github.com/jonathanperis/speedy-bird-lynx) · [Play →](https://jonathanperis.github.io/speedy-bird-lynx/) · [Jonathan Peris](https://jonathanperis.github.io/)*
