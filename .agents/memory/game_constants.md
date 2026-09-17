---
name: Speedy Bird Game Constants and Mechanics
description: Game physics values, medal thresholds, speed scaling, collision detection parameters
type: reference
---

## Game Mechanics

Source of truth: `src/constants.ts`, `src/game/engine.ts`, and `src/game/session.ts`.

- **Bird impulse**: `BIRD_FLAP = 7.25`
- **Gravity**: `BIRD_GRAVITY = 0.28`
- **Pipe gap**: `PIPE_GAP = 150`
- **Pipe speed**: `PIPE_DX = 2.7`, with 1% speed increase per pipe cleared
- **Pipe spawn cadence**: `PIPE_SPAWN_INTERVAL = 77` frames
- **Background parallax**: `BG_DX = 0.2`
- **Medal thresholds**: Bronze (10+), Silver (25+), Gold (50+), Platinum (100+)
- **Pipe rendering**: Tile-based top/bottom pipe construction; no sprite stretching
- **Collision**: AABB with circular bird hitbox approximation
- **Audio**: 5 sound effects (wing, point, hit, die, swooshing)

## Build Targets

| Target | Command | Output |
|--------|---------|--------|
| Dev server | `bun run dev` | HMR on `:3000` |
| Lynx bundle | `bun run build` | `dist/main.lynx.bundle` |
| Web bundle | `bun run build` | `dist/main.web.bundle` |
| Android debug | `./gradlew assembleDebug` | Debug APK |
| Android release | `./gradlew assembleRelease` | Release APK, signed only when signing env vars exist |
| iOS | `bundle exec ruby ../scripts/generate-ios-project.rb`, `bundle exec pod install --deployment` + Xcode | Generated project/shared scheme and app/archive build |

## Android Signing (CI)

Default CI APKs are debug-signed. Explicit release signing requires `KEYSTORE_BASE64`, `KEYSTORE_PASSWORD`, `KEY_ALIAS`, and `KEY_PASSWORD`. Only `release.yml` publishes releases; manual runs are sandbox prereleases.

Simulation steps are 17 ms. Practice uses gap 190 and clock scale 0.65. Replay records seeded input ticks. Best score/preferences persist through the host adapter.
