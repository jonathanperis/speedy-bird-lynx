---
name: Speedy Bird Game Constants and Mechanics
description: Game physics values, medal thresholds, speed scaling, collision detection parameters
type: reference
---

## Game Mechanics

Source of truth: `src/constants.ts` and `src/hooks/useGameEngine.ts`.

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
| iOS | `pod install` + Xcode | Archive/app build when an Xcode project exists |

## Android Signing (CI)

Secrets are used only when configured: `KEYSTORE_BASE64`, `KEYSTORE_PASSWORD`, `KEY_ALIAS`, `KEY_PASSWORD`.
Version comes from tag (`v1.2.3`) or commit SHA (`0.0.0-<sha>`).
