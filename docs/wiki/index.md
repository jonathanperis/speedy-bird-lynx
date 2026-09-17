# Speedy Bird Lynx

An arcade game and learning sandbox built with [ReactLynx](https://lynxjs.org/) and TypeScript. Canvas and native-element renderers share deterministic physics, geometry, and replay. Android and iOS hosts implement audio, storage, and lifecycle integration; the iOS project is generated from checked-in configuration.

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
| [Learning Labs](learning-labs) | Inspect collisions, replay a seed, compare renderers, and trace native calls |
| [ReactLynx Upgrade](reactlynx-upgrade) | Compatible versions and applicability of new features |

## Key Features

- Tap/click to flap; browser surfaces support scoped keyboard input and semantic controls
- Speed increases 1% per pipe cleared
- Medal system: Bronze (10+), Silver (25+), Gold (50+), Platinum (100+)
- Compare native-element transforms with Canvas drawing over the same simulation
- Tile-based pipe construction and parallax scrolling
- AABB collision detection with circular hitbox approximation
- Pause, single-step, deterministic replay, practice mode, hitboxes, and local preferences
- Automated behavior/type/build/asset checks and single-owner release publishing

---

*[GitHub](https://github.com/jonathanperis/speedy-bird-lynx) · [Play →](https://jonathanperis.github.io/speedy-bird-lynx/) · [Jonathan Peris](https://jonathanperis.github.io/)*
