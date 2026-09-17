# Getting Started

Use Node from `.node-version` and Bun 1.3.12. Native builds additionally need Java 17+/Android SDK 34 or Xcode/Ruby 3.3+.

## Core checks and bundle build

```sh
bun install --frozen-lockfile
bun run check
bun run test
bun run build
bun run assets:check
```

The build creates native/web bundles with embedded sprites and prepares each native host's audio resources. Do not manually copy only the bundle and assume the host is complete.

## Play the Canvas cabinet

From `docs/`:

```sh
bun install --frozen-lockfile
npm run dev
```

Use **Start run**, then tap/click the game or press Space while it is focused. P pauses. Learning controls expose single-step, replay, practice, hitboxes, metrics, and a seed. Keyboard actions outside the game keep their normal behavior.

For production verification, run `npm run check`, `npm run build`, and `npm run preview`. The production base path is `/speedy-bird-lynx/`.

## Play the ReactLynx web host

From the root, run `bun run build`, then `bun run dev:web`. Open localhost:4000. This host provides browser audio/storage through the same interface used by native modules. The semantic toolbar supports keyboard interaction; Space/P work with the game focused.

`bun run build:web-host` produces a self-contained static directory at `dist-web-host/`. Serve it over HTTP rather than opening its HTML as a file.

## Native development and Explorer

`bun run dev` serves `main.lynx.bundle` on port 3000. Explorer must support Lynx engine 3.9 or newer. A generic Explorer lacks the app's `SpeedyBirdModule`; gameplay remains available, with a visible audio/storage capability notice.

For the full native bridge, follow the [native host guide](/speedy-bird-lynx/docs/native-host-apps/). The native logical world is 400×750; Canvas uses 400×600. Each renderer derives its bounds from its own configuration.

## Next experiments

Read [Learning Labs](/speedy-bird-lynx/docs/learning-labs/) and [ReactLynx Upgrade Notes](/speedy-bird-lynx/docs/reactlynx-upgrade/). Start by reproducing a seed/input sequence, then change one rule and explain the result.
