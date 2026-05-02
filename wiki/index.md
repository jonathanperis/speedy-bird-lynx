# Speedy Bird Lynx

Flappy Bird clone built with [ReactLynx](https://lynxjs.org/) and TypeScript. Runs natively on iOS, Android, and Web from a single codebase using Lynx's native C++ rendering engine and dual-threaded architecture.

## Wiki Pages

| Page | Description |
|------|-------------|
| [About LynxL(About-Lynx.md) | What Lynx is, how it differs from React Native and WebViews, and key concepts used in this project |
| [Architecture](Architecture) | Project structure, component hierarchy, rendering approach, and dual-threaded model |
| [Assets and SpritesL(Assets-and-Sprites.md) | Sprite organization, asset loading, tile-based pipe rendering, and audio |
| [CI/CD PipelineL(CI-CD-Pipeline.md) | GitHub Actions workflows for building, signing, deploying, and releasing |
| [Game EngineL(Game-Engine.md) | Physics, collision detection, state machine, scoring, and the game loop |
| [Getting StartedL(Getting-Started.md) | Setup, dev server, production builds, and platform-specific instructions |
| [Native Host AppsL(Native-Host-Apps.md) | Android and iOS native shells that embed the Lynx runtime |

## Key Features

- Tap or press Space to flap; fly through pipe gaps to score
- Speed increases 1% per pipe cleared
- Medal system: Bronze (10+), Silver (25+), Gold (50+), Platinum (100+)
- Element-based rendering with CSS transforms (no canvas)
- Tile-based pipe construction and parallax scrolling
- AABB collision detection with circular hitbox approximation
- Automated CI/CD for all three platforms

---

*[GitHubL(https://github.com/jonathanperis/speedy-bird-lynx.md) · [Play →L(https://jonathanperis.github.io/speedy-bird-lynx/.md) · [Jonathan Peris](https://jonathanperis.github.io/)*
