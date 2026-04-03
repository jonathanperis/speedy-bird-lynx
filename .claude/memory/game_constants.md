---
name: Speedy Bird Game Constants and Mechanics
description: Game physics values, medal thresholds, speed scaling, collision detection parameters
type: reference
---

## Game Mechanics

All constants defined in `src/constants.ts`:

- **Speed increase**: 1% per pipe cleared (progressive difficulty)
- **Medal thresholds**: Bronze (10+), Silver (25+), Gold (50+), Platinum (100+)
- **Pipe rendering**: Tile-based (top mouth + body tiles + bottom mouth) — no sprite stretching
- **Collision**: AABB with circular bird hitbox approximation
- **Audio**: 5 sound effects (wing, point, hit, die, swooshing)

## Build Targets

| Target | Command | Output |
|--------|---------|--------|
| Dev server | `npm run dev` | HMR on :3000 |
| Lynx bundle | `npm run build` | `dist/main.lynx.bundle` |
| Web bundle | `npm run build` | `dist/main.web.bundle` |
| Android debug | `./gradlew assembleDebug` | APK |
| Android release | `./gradlew assembleRelease` | Signed APK |
| iOS | `pod install` + Xcode | IPA |

## Android Signing (CI)

Secrets: `KEYSTORE_BASE64`, `KEYSTORE_PASSWORD`, `KEY_ALIAS`, `KEY_PASSWORD`
Version from tag (v1.2.3) or commit SHA (0.0.0-<sha>)
