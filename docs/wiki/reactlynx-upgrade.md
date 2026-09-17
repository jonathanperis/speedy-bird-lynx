# ReactLynx Upgrade Notes

Checked against official releases and package metadata on **2026-09-16**.

## Compatible matrix

| Component | Previous manifest | Updated |
|---|---|---|
| ReactLynx | 0.119.0 | **0.126.1** |
| ReactLynx Rsbuild plugin | 0.16.1 | **0.20.2** |
| Rspeedy | 0.14.3 | **0.17.2** |
| Standalone Rsbuild | 2.0.0 | **2.2.7** |
| Lynx for Web | 0.20.1 | **0.26.1** |
| Web elements | 0.12.0 | **0.12.11** |
| Native SDK / types | 3.7.0 | **4.1.0** |
| PrimJS native | 3.7.0 | **4.1.1**, as required by SDK metadata |
| TypeScript | 6.0.3 | **6.0.3**, supported by Rspeedy |
| Astro | 7.0.0 | **7.3.3** |

TypeScript 7 was available at inspection time, but is outside Rspeedy's published `5.1.6 - 6.0.x` peer range. Dependency upgrades follow the compatible toolchain, not independent latest-version numbers.

## Changes applied

- **Explicit bundle engineVersion 3.9.** The current compiler rejects 4.1: its supported encoding range ends at 3.9. SDK 4.1 can run that bundle. Framework, bundle-format, and native engine versions are different contracts.
- **New `<background-only>` boundary.** Learning controls render after the background thread takes ownership; the first frame gets a small fallback. Game scenery remains available for first-frame rendering.
- **Background-only side effects.** Host audio/storage calls use the documented `NativeModules` interface and explicit background-only functions.
- **Preact 11 cleanup timing.** ReactLynx 0.126 moves component effect cleanup after paint. Timers and native host events have explicit pause/stop/teardown ownership; cleanup does not assume immediate component unmount.
- **SlotV2/keyed-child improvements.** Adopted through the coordinated runtime/compiler upgrade. Pipe IDs belong to a session, and snapshots do not mutate after publication.
- **Current JSX typing.** `jsxImportSource` points to `@lynx-js/react`.
- **Rspeedy 0.17 tooling changes.** Ignore `.lynx` intermediates. No deprecated `dev.client` configuration remains.
- **Web entry points.** The standalone host imports `@lynx-js/web-core/client`, installs the required `@lynx-js/lynx-core` peer, and registers a worker-to-host audio/storage bridge.

## Reviewed, with application guidance

| New or improved capability | Applicability here |
|---|---|
| Callback-ref cleanup fixes | Runtime correctness benefit; no custom ref compatibility workaround needed. |
| `createElement`, `Children`, `createPortal` | Useful for dynamic UI/plugin exercises. Current static component composition needs no portal or element factory. |
| `use`, context typing, React 19 type support | Useful for context/resource experiments. The game has local state and a small session model; it retains its existing React 18-facing type contract. |
| Rstest/testing-library improvements | Useful for a later component-level lab. Current independent simulation and DOM controller tests run with Bun, while both real renderers receive build/browser verification. |
| Lazy bundles through `lynx.fetchBundle` | Supported at engineVersion 3.9+. This small game has no demonstrated splitting benefit; add only after measuring load costs. |
| Manual first-screen handoff | Intended for explicit IFR/hydration coordination; no demonstrated need in this game. |
| Experimental attribute-name transforms / Element Template backend | Useful comparison exercises, not defaults for a reference sandbox. |
| Web intersection observers and mouse-drag scroll plugin | Available for document/feed experiments; not needed by the fixed game surface. |
| Animax opt-in integration | Potential animation lab; would add a separate runtime beyond the current sprite renderer. |

## Sources

- [ReactLynx changelog](https://github.com/lynx-family/lynx-stack/blob/main/packages/react/CHANGELOG.md)
- [ReactLynx 0.126.0](https://github.com/lynx-family/lynx-stack/releases/tag/%40lynx-js/react%400.126.0)
- [ReactLynx 0.126.1](https://github.com/lynx-family/lynx-stack/releases/tag/%40lynx-js/react%400.126.1)
- [Rspeedy 0.17.0](https://github.com/lynx-family/lynx-stack/releases/tag/%40lynx-js/rspeedy%400.17.0)
- [Engine compatibility](https://lynxjs.org/guide/compatibility.html)
- [Native modules](https://lynxjs.org/guide/use-native-modules.html)
- [Lynx 4.1 Maven dependency metadata](https://repo1.maven.org/maven2/org/lynxsdk/lynx/lynx/4.1.0/lynx-4.1.0.pom)
