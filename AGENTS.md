# Speedy Bird Lynx — Agent Guide

Cross-platform arcade game and learning sandbox. Prioritize readable boundaries, observable experiments, and evidence-backed platform claims.

## Stack and commands

- ReactLynx 0.126.1, plugin 0.20.2, Rspeedy 0.17.2, TypeScript 6.0.3.
- Lynx for Web 0.26.1; native SDK/types 4.1.0 and PrimJS 4.1.1.
- Bundle `engineVersion` is 3.9: the stable encoder does not accept 4.1.
- Bun 1.3.12; Node pinned in `.node-version`. Execute Astro 7.3.3 through Node/npm.

```sh
bun install --frozen-lockfile
bun run check
bun run test
bun run build
bun run assets:check
bun run build:web-host
```

From `docs/`: `bun install --frozen-lockfile`, `npm run check`, `npm run build`.

Android: build root first, then `./gradlew lintDebug assembleDebug` in `android/`; validate with `scripts/verify-apk.py`. Java 17+/SDK 34, minimum API 21. Compilation alone does not prove minimum-API compatibility.

iOS: Ruby 3.3+, `bundle install` in `ios/`, `bundle exec ruby ../scripts/generate-ios-project.rb`, `bundle exec pod install --deployment`, then use the generated workspace/shared scheme. iOS minimum 15. Project/Pods are generated; lockfiles are tracked.

## Architecture and contracts

- `src/game/engine.ts`: pure fixed-step physics, seeded randomness, geometry, scoring, immutable snapshots and sound events.
- `src/game/session.ts`: elapsed-time accumulation, bounded catch-up, pause and tick-indexed replay.
- `src/hooks/useGameEngine.ts`: ReactLynx timer, snapshot publication, host events and background-only side effects.
- `src/components/`: native-element renderer; pipe tiles are memoized separately from translation.
- `docs/src/game/`: Canvas renderer/controller over the same simulation.
- `src/platform/browser.ts`: browser audio/storage and required-image loading.
- Native `SpeedyBirdModule`: sound/preferences; host lifecycle pauses and releases resources.
- `web-host/`: complete Lynx browser host, native-module worker bridge and semantic HTML controls.

Native world: 400×750 with viewport fitting. Canvas cabinet: explicit 400×600 configuration. Compare identical configurations for renderer parity. Every visible pipe body collides through the ground. Score remains awarded on pipe exit; medals remain 10/25/50/100. Standard flap/gravity remain 7.25/0.28 per fixed step.

Use documented `NativeModules` only on the background thread. ReactLynx 0.126 effect cleanup is after-paint; lifecycle pauses are explicit. First-frame scenery stays available; learning controls use `<background-only>`.

## Assets and verification

`assets/` is canonical. Root build embeds all PNGs and prepares named native WAV resources. Docs build synchronizes game assets; `assets:check` verifies bundle inclusion and byte parity. Never distribute only a bundle that references missing resources.

Tests focus on state/geometry/replay, loading/input/lifecycle boundaries, and release ownership. Type-checking and compilation do not prove device gameplay, audio, accessibility, or performance. Record unexecuted checks explicitly. Use measured replays before replacing readable React snapshots with imperative rendering.

The manual in `docs/wiki/` is maintained documentation. Older tracked migration specs carry historical notices; the ignored `.specs/SPEC.md` is the active task plan when present.

## CI and repository conventions

- Build Check validates root/docs and packages complete distributions.
- Android builds are debug-signed by default; release signing is explicit and requires all secrets.
- iOS must build an actual unsigned archive; no successful skip when project setup is missing.
- `release.yml` is the only publisher and depends on all build/check jobs. Manual snapshots are prereleases.
- Pages pins the same toolchain and runs game/docs checks; CodeQL scans JavaScript/TypeScript.
- Branch + PR workflow; never push directly to main. Rebase-only merges, no force pushes. Commit/push only when requested.
- GitHub operations use `gh`.
- Organization-wide policy/templates/CODEOWNERS belong in the central `.github` repository; do not add duplicates here.
