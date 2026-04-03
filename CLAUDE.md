# Speedy Bird Lynx — Claude Code Guide

Cross-platform Flappy Bird clone built with ReactLynx + TypeScript. Runs natively on iOS, Android, and Web from a single codebase.

**Play online:** https://jonathanperis.github.io/speedy-bird-lynx/

---

## Tech Stack

| Technology | Purpose |
|-----------|---------|
| ReactLynx 0.117 | Cross-platform native UI framework |
| React 18 | Component model and hooks |
| TypeScript 5.6 | Type-safe source code |
| RSpeedy/Rspack | Lynx bundler with HMR |
| Rsbuild | Web build target |
| Lynx SDK 3.7.0 | Native runtime (Android/iOS) |

---

## Build Commands

```sh
npm run dev                    # Dev server with HMR on :3000
npm run build                  # Production build (dist/main.lynx.bundle + main.web.bundle)
npx tsc --noEmit               # Type check only
```

### Android
```sh
npm run build
cp dist/main.lynx.bundle android/app/src/main/assets/
cd android && ./gradlew assembleDebug    # Debug APK
cd android && ./gradlew assembleRelease  # Signed release APK
```

### iOS
```sh
npm run build
cp dist/main.lynx.bundle ios/SpeedyBird/Resources/
cd ios && pod install
# Open SpeedyBird.xcworkspace in Xcode
```

---

## Architecture

```
App (root, fullscreen, tap listener)
├── Background (z:0, parallax @ 0.2px/frame, 5x tiled)
├── Pipe[] (z:1, tile-based, scroll @ 2.7px/frame + speed scaling)
├── Bird (z:2, animated 4-frame sprite with rotation)
├── Ground (z:3, scroll matches pipe speed)
├── ScoreDisplay (z:4, sprite-based digits)
├── GetReadyScreen (z:5, overlay on STATE_READY)
└── GameOverScreen (z:5, overlay on STATE_OVER with medals)
```

**Dual-threaded:** React on background thread, rendering on main thread.

---

## Key Patterns

- **`useGameEngine` hook**: Core game loop (17ms interval ~60FPS), physics, collision, scoring
- **`useRef` for mutable state**: Physics engine state never triggers re-renders
- **`useState` for render snapshots**: Minimal state pushed to React
- **CSS transforms**: Movement via `transform: translate()`, no layout recalc
- **State machine**: `STATE_READY` → `STATE_PLAY` → `STATE_OVER`
- **AABB collision**: Circular bird hitbox approximation
- **Audio abstraction**: WebAudioModule (web) + NativeAudioModule stubs (native)

---

## Project Structure

```
speedy-bird-lynx/
├── src/
│   ├── index.tsx                    # Entry point
│   ├── App.tsx                      # Root component + tap handler
│   ├── types.ts                     # GameState enum, PipeData, SoundName
│   ├── constants.ts                 # Physics, dimensions, colors
│   ├── hooks/useGameEngine.ts       # Core game loop + physics
│   ├── components/                  # Bird, Pipe, Background, Ground, etc.
│   └── audio/audio.ts              # Audio abstraction layer
├── android/                         # Native Android host (Kotlin)
├── ios/                             # Native iOS host (Swift, CocoaPods)
├── assets/sprites/                  # PNG sprites (bird, pipes, medals, digits)
├── assets/audio/                    # WAV sound effects
├── docs/                            # GitHub Pages (standalone canvas version)
├── web-host/                        # Web preview host (dev only)
├── lynx.config.ts                   # Lynx build config
├── rsbuild.web-host.config.ts       # Web host build config
├── tsconfig.json                    # strict: true, react-jsx, @/* paths
└── .github/workflows/               # CI/CD (build, deploy, Android, iOS, release)
```

---

## Game Constants

| Constant | Value | Purpose |
|---------|-------|---------|
| Speed increase | 1% per pipe | Progressive difficulty |
| Medal thresholds | 10/25/50/100 | Bronze/Silver/Gold/Platinum |
| Pipe gap | Defined in constants.ts | Space between top/bottom pipes |

---

## CI/CD

| Workflow | File | Trigger | Actions |
|----------|------|---------|---------|
| Build Check | ci.yml | Push/PR to main | `tsc --noEmit` + `npm run build` |
| CodeQL | codeql.yml | Push/PR to main, weekly | Security & quality analysis |
| Deploy Web | deploy.yml | Push to main | Deploy `docs/` to GitHub Pages |
| Build Android | build-android.yml | Push to main, v* tags | Build signed APK + GitHub Release |
| Build iOS | build-ios.yml | v* tags, manual | Xcode build (unsigned) |
| Release | release.yml | v* tags | Full pipeline: Lynx → Android → iOS → Release |

---

## Git & GitHub Conventions

- **Branch + PR workflow**: All changes go through a branch and PR. Never push directly to main.
- **Rebase-only merges**: Linear history enforced. No merge commits or squash.
- **Use `gh` CLI**: All GitHub operations (PRs, issues, releases, checks) via `gh` commands.
- **Repo-wide files**: SECURITY.md, CODE_OF_CONDUCT.md, CONTRIBUTING.md, issue/PR templates, CODEOWNERS, and FUNDING.yml live in the centralized `.github` repo — do NOT create them here.
- **Branch protection**: main has `required_linear_history` enabled, force pushes disabled.
- **Release tags**: Semver `v*` tags (e.g., `v1.1.0`) trigger the full release pipeline.
- **Build tags**: `build/0.0.0-{sha}` auto-created on every main push by Android CI.

---

## Code Quality Notes

- **TypeScript strict mode**: Enabled — all code must pass `tsc --noEmit`
- **No test framework yet**: Vitest recommended if adding tests (Rspack ecosystem)
- **No linter/formatter yet**: Biome recommended if adding (fast, replaces ESLint + Prettier)
- **CodeQL**: Runs on every push/PR + weekly schedule for security analysis
- **Dependabot**: Weekly updates for npm packages and GitHub Actions
