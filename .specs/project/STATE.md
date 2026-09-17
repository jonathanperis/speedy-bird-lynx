# State

> Historical decision snapshot (March 2026). These lessons do not describe the current rendering implementation or verification state. See [Architecture](../../docs/wiki/architecture.md) and [Dependencies and Upgrades](../../docs/wiki/dependency-updates.md).

## Decisions
- 2026-03-31: Chose Lynx as target framework for cross-platform port
- 2026-03-31: Will use element-based rendering (no canvas) with CSS transforms
- 2026-03-31: Audio will use native module stubs initially (no built-in audio API in Lynx)
- 2026-03-31: Sprites must be pre-sliced from og-theme.png and og-theme-2.png into individual PNGs

## Blockers
- None currently

## Lessons
- Lynx has no Canvas API, no audio API, no sprite sheet slicing
- setNativeProps() is critical for 60fps — avoid React state updates per frame
- main-thread:bindtap provides low-latency touch handling

## Preferences
- (none yet)
