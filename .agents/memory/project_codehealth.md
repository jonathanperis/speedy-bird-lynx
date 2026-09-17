---
name: Code Health and Quality Gaps
description: Source-backed quality gates and remaining gaps, reviewed 2026-09-17
type: project
---

## Focused Checks, No Gameplay Test Suite

Generated-site checks validate routes, internal links/fragments, unique IDs, and canonical/OG metadata. APK verification checks that the current bundle is packaged. Android API lint is enabled in CI. Game logic and state transitions still lack a unit-test suite; browser/device behavior is not established by compilation.

**Why:** Early-stage project focused on shipping features first.

**How to apply:** If adding tests, Vitest is the natural fit (Rspack ecosystem). Priority targets: useGameEngine tick logic, collision detection, state transitions.

## No Linting or Formatting Config

No ESLint, Prettier, or Biome configuration. Existing gates include strict app TypeScript, builds, dependency audits, generated-site checks, Android compilation/API lint, APK verification, and CodeQL.

**Why:** Not yet set up.

**How to apply:** If the user asks to add linting, Biome is a good fit (fast, TypeScript-native, replaces both ESLint and Prettier).

## Minor Code Issues (non-blocking)

- `audio.ts`: optional `__lynx_requireModule` lookup is a placeholder, not a supported bridge implementation. Future audio work needs the documented background-thread `NativeModules` API.
- `useGameEngine.ts`: `let nextPipeId = 0` is module-scoped (safe for single instance, but won't reset on remount)
- `tsconfig.json`: `@/*` path alias defined but never used in imports (all relative)
- `ci.yml`: still monitors `lynx-migration` branch (may be stale)
