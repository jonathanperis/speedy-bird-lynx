---
name: Code Health and Quality Gaps
description: Known code quality gaps, missing infrastructure, and improvement areas identified 2026-04-02
type: project
---

## No Test Infrastructure

No test files, test runner, or test dependencies exist. Game logic (collision, physics, scoring) and state machine transitions are untested.

**Why:** Early-stage project focused on shipping features first.

**How to apply:** If adding tests, Vitest is the natural fit (Rspack ecosystem). Priority targets: useGameEngine tick logic, collision detection, state transitions.

## No Linting or Formatting Config

No ESLint, Prettier, or Biome configuration. TypeScript strict mode is the only quality gate.

**Why:** Not yet set up.

**How to apply:** If the user asks to add linting, Biome is a good fit (fast, TypeScript-native, replaces both ESLint and Prettier).

## Minor Code Issues (non-blocking)

- `audio.ts:53`: `(globalThis as any).__lynx_requireModule` — unavoidable for Lynx native bridge
- `useGameEngine.ts`: `let nextPipeId = 0` is module-scoped (safe for single instance, but won't reset on remount)
- `tsconfig.json`: `@/*` path alias defined but never used in imports (all relative)
- `ci.yml`: still monitors `lynx-migration` branch (may be stale)
