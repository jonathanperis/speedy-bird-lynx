---
name: Code Health and Verification
description: Current checks and remaining validation boundaries after the September 2026 modernization
type: project
---

`bun run test` covers shared engine geometry/state/replay, Canvas media/input/lifecycle behavior, and release ownership. Root `check`, docs `check`, both builds, and asset validation are CI gates. Source snapshots must remain immutable; pipe hitboxes extend through ground.

Native/browser builds are distinct from device playtesting and profiling. Browser UI checks require explicit opt-in. Native sound/background-resume and frame timing need real platform evidence; never infer them from compilation.

Lockfiles are pinned and advisory scans should be rerun after dependency changes. Full Android API lint gates native builds. No JavaScript linter/formatter configuration is currently established. Prefer focused behavior tests over per-branch or exact-constant coverage.
