// Sprites for the landing-page Canvas demo, served from public/assets (a copy of the root
// assets/ directory kept in sync by `bun run assets:sync`).

import type { Medal } from '../../../src/types.ts';

const SPRITE_FILES = {
  bird0: 'sprites/bird-0.png',
  bird1: 'sprites/bird-1.png',
  bird2: 'sprites/bird-2.png',
  background: 'sprites/background.png',
  ground: 'sprites/ground.png',
  getReady: 'sprites/get-ready.png',
  gameOver: 'sprites/game-over.png',
  pipeTopBody: 'sprites/pipes/pipe-top.png',
  pipeTopMouth: 'sprites/pipes/pipe-top-mouth.png',
  pipeBottomBody: 'sprites/pipes/pipe-bottom.png',
  pipeBottomMouth: 'sprites/pipes/pipe-bottom-mouth.png',
  bronze: 'sprites/medals/medal-bronze.png',
  silver: 'sprites/medals/medal-silver.png',
  gold: 'sprites/medals/medal-gold.png',
  platinum: 'sprites/medals/medal-platinum.png',
  digit0: 'sprites/digits/digit-0.png',
  digit1: 'sprites/digits/digit-1.png',
  digit2: 'sprites/digits/digit-2.png',
  digit3: 'sprites/digits/digit-3.png',
  digit4: 'sprites/digits/digit-4.png',
  digit5: 'sprites/digits/digit-5.png',
  digit6: 'sprites/digits/digit-6.png',
  digit7: 'sprites/digits/digit-7.png',
  digit8: 'sprites/digits/digit-8.png',
  digit9: 'sprites/digits/digit-9.png',
} as const satisfies Record<string, string> & Record<Medal, string>;

export type SpriteName = keyof typeof SPRITE_FILES;

/** Decoded sprites. A sprite that failed to load is absent; the renderer draws a fallback. */
export type Sprites = Partial<Record<SpriteName, HTMLImageElement>>;

async function loadImage(url: URL): Promise<HTMLImageElement> {
  const image = new Image();
  image.src = url.href;
  // decode() rejects for broken images, so a missing file never reaches drawImage().
  await image.decode();
  return image;
}

/**
 * Load every sprite. Resolves once each file has loaded or failed, so a missing or
 * blocked sprite degrades the picture instead of blocking the game.
 */
export async function loadSprites(assetsUrl: URL): Promise<Sprites> {
  const names = Object.keys(SPRITE_FILES) as SpriteName[];
  const results = await Promise.allSettled(names.map((name) => loadImage(new URL(SPRITE_FILES[name], assetsUrl))));
  const sprites: Sprites = {};
  results.forEach((result, index) => {
    const name = names[index];
    if (name && result.status === 'fulfilled') sprites[name] = result.value;
  });
  return sprites;
}
