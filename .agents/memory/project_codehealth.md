---
name: Code Health and Quality Gaps
description: Source-backed quality gates and remaining gaps, reviewed 2026-10-07
type: project
---

## Tests

Rstest + ReactLynx Testing Library (`rstest.config.ts` reuses `lynx.config.ts`). `tests/engine.test.ts` covers rules; `tests/app.test.tsx` renders the real App with a stubbed main-thread `lynx.requestAnimationFrame`, mocked `Date.now`, and a fake `NativeModules.SpeedyBirdModule`, then drives frames via `lynxTestingEnv.switchToMainThread()`. Tests need real Node.js: jsdom fails under Bun's `node` shim (the config throws a clear error).

**How to apply:** Put new rules in the engine with unit tests; cover host/bridge behavior in the App test.

## Lint and Format

Biome 2 (`biome.json`) lints and format-checks app code, the web host, tests, and scripts; CI runs `bun run lint` (`biome ci .`). Use `bun run format` to apply fixes.

## Known Gaps

- Device-level behavior (native audio latency, rendering on low-end Android) needs manual or emulator verification; CI only compiles.
