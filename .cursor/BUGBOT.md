# Bugbot review rules

Report real bugs, security issues and regressions. Skip style nitpicks
and preference-only suggestions.

## Generated and vendored files

Do not comment on these paths; they are generated, vendored or lockfiles:

- `**/dist/**`
- `**/build/**`
- `**/out/**`
- `**/*.min.js`

## Path-specific rules

### `src/**/*.{ts,tsx}`

This is ReactLynx (Lynx elements such as view, image and text), not React DOM.
Flag per-frame React state updates, effects without cleanup, missing list keys,
APIs unavailable on the Lynx background or main thread, and missing
accessibility-label/accessibility-element on interactive elements.
Gameplay rules belong in src/game/engine.ts and need unit tests.

### `**/*.kt`

Flag LynxView lifecycle gaps (destroy, onEnterBackground/onEnterForeground),
work on the main thread that can block, leaked contexts, and unnecessary
permissions or exported components.

### `**/*.swift`

Flag LynxView lifecycle and layout gaps (safe areas, trait or size changes),
retain cycles in closures, and work that blocks the main thread.

### `**/*.gradle.kts`

Keep Lynx SDK, PrimJS and Fresco versions coordinated; flag unpinned or
dynamic versions and configuration-cache incompatibilities.

### `**/*.py`

Flag bare except clauses, unchecked file paths, and unclear error messages.

### `.github/**/*.yml`

Flag user-controlled input interpolated directly in run: blocks (use env: and
quoting), actions not pinned to a full commit SHA, missing timeout-minutes,
and permissions broader than the job needs.

### `**/*.lock`

Lockfiles are supply-chain inputs: flag unexpected registries, git or tarball
sources, and packages that do not correspond to a manifest change.
