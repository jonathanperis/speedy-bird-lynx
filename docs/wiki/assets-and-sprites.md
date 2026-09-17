# Assets and Sprites

`assets/` is canonical: 25 PNG sprites and five WAV effects. Individual sprites are the maintained inputs; the original first sprite sheet is not included.

## Packaging

- `lynx.config.ts` embeds images up to 64 KiB, covering every game sprite. Native bundles need no image server.
- `bun run build` prepares each native host's bundle and named WAV files and emits `dist/assets-manifest.json`.
- `bun run assets:sync` copies canonical resources to `docs/public/assets/`; the docs build also synchronizes them.
- `bun run assets:check` verifies sprite payloads in both bundles and compares native/docs resources byte-for-byte.
- The standalone web distribution includes its sounds and worker-to-host bridge.

## Rendering

The bird cycles through down, mid, up, mid frames. Pipe mouths align with shared gap geometry; body tiles fill toward world edges. Static pipe tiles are memoized independently of scrolling wrappers.

Ground and background tile horizontally. Ground displays at height 129; source and display dimensions are intentionally different. Score digits display at 18×27, while source widths vary. Do not derive crop coordinates from displayed dimensions.

Medal thresholds are shared: bronze 10, silver 25, gold 50, platinum 100.

## Extraction exercise

The ESM extraction tool takes explicit inputs:

```sh
node extract-sprites.js --help
node extract-sprites.js assets/sprites/unused/og-theme-2.png assets/crops.example.json .specs/extracted
```

The example extracts two digit crops into an ignored scratch directory. Each manifest entry has `name`, `x`, `y`, `w`, and `h`; output paths stay inside the selected directory. Supply your own sheet/manifest for an art experiment. The example is not a complete regeneration recipe for all third-party game art.

## Provenance

- Original Flappy Bird: Dong Nguyen.
- Implementation inspiration: [noanonoa](https://github.com/noanonoa).
- Sprites: [The Spriters Resource](https://www.spriters-resource.com/fullview/59894/).
- Sounds: [The Sounds Resource](https://www.sounds-resource.com/mobile/flappybird/sound/5309/).

The repository's MIT license covers application source. These provenance records do not assert an independent MIT license for third-party resources. Replacement-art experiments should record source and license alongside their crop manifest.
