---
name: Code Health and Quality Gaps
description: Source-backed quality gates and remaining gaps, reviewed 2026-10-07
type: project
---

## Focused Checks, No Gameplay Test Suite

Generated-site checks validate routes, internal links/fragments, unique IDs, and canonical/OG metadata. APK verification checks that the current bundle is packaged. Android API lint is enabled in CI. Game logic and state transitions still lack a unit-test suite; browser/device behavior is not established by compilation.

**Why:** Early-stage project focused on shipping features first.

**How to apply:** If adding tests, Vitest is the natural fit (Rspack ecosystem). Priority targets: useGameEngine tick logic, collision detection, state transitions.

## Lint and Format

Biome 2 (`biome.json`) lints and format-checks app code, the web host, tests, and scripts; CI runs `bun run lint` (`biome ci .`). Use `bun run format` to apply fixes.

## Minor Code Issues (non-blocking)

- `audio.ts`: optional `__lynx_requireModule` lookup is a placeholder, not a supported bridge implementation. Future audio work needs the documented background-thread `NativeModules` API.
- `useGameEngine.ts`: `let nextPipeId = 0` is module-scoped (safe for single instance, but won't reset on remount)
- `tsconfig.json`: `@/*` path alias defined but never used in imports (all relative)
