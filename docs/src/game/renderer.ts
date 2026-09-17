import { BG_COLOR, BG_H, BG_W, BIRD_H, BIRD_RADIUS, BIRD_W, BIRD_X, GROUND_H, GROUND_W, PIPE_W } from '../../../src/constants.js';
import { medalForScore, pipeGeometry } from '../../../src/game/engine.js';
import type { GameConfig, GameSnapshot } from '../../../src/game/engine.js';
import { SPRITE_FILES } from '../../../src/game/assets.js';
import { STATE_OVER, STATE_PLAY, STATE_READY } from '../../../src/types.js';
import { loadImage } from '../../../src/platform/browser.js';

export type Sprites = Record<keyof typeof SPRITE_FILES | `digit${number}`, HTMLImageElement>;
export async function loadSprites(baseUrl: string): Promise<Sprites> {
  const entries = [...Object.entries(SPRITE_FILES), ...Array.from({ length: 10 }, (_, n) => [`digit${n}`, `digits/digit-${n}.png`])];
  return Object.fromEntries(await Promise.all(entries.map(async ([name, file]) =>
    [name, await loadImage(`${baseUrl}assets/sprites/${file}`)]))) as Sprites;
}

export function drawGame(ctx: CanvasRenderingContext2D, sprites: Sprites, state: GameSnapshot, config: GameConfig, debug: boolean) {
  const ground = config.height - GROUND_H;
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, config.width, config.height);
  for (let x = state.bgX; x < config.width; x += BG_W) ctx.drawImage(sprites.background, x, ground - BG_H, BG_W, BG_H);
  const tile = Math.round(25 * PIPE_W / 26);
  for (const pipe of state.pipes) {
    const { top, bottom } = pipeGeometry(pipe.y, config);
    for (let y = top - 2 * tile; y > -tile; y -= tile) ctx.drawImage(sprites.top, pipe.x, y, PIPE_W, tile + 1);
    ctx.drawImage(sprites.topMouth, pipe.x, top - tile, PIPE_W, tile);
    ctx.drawImage(sprites.bottomMouth, pipe.x, bottom, PIPE_W, tile);
    for (let y = bottom + tile; y < ground; y += tile) ctx.drawImage(sprites.bottom, pipe.x, y, PIPE_W, tile + 1);
  }
  ctx.save();
  ctx.translate(BIRD_X, state.birdY);
  ctx.rotate(state.birdRotation * Math.PI / 180);
  ctx.drawImage([sprites.bird0, sprites.bird1, sprites.bird2, sprites.bird1][state.birdFrame]!, -BIRD_W / 2, -BIRD_H / 2, BIRD_W, BIRD_H);
  ctx.restore();
  for (let x = state.groundX; x < config.width; x += GROUND_W) ctx.drawImage(sprites.ground, x, ground, GROUND_W, GROUND_H);
  if (state.gameState === STATE_PLAY) {
    const digits = String(state.score).split('');
    digits.forEach((digit, i) => ctx.drawImage(sprites[`digit${Number(digit)}`]!, (config.width - (digits.length * 20 - 2)) / 2 + i * 20, 60, 18, 27));
  }
  if (state.gameState === STATE_READY) ctx.drawImage(sprites.ready, (config.width - 174) / 2, config.height / 2 - 160, 174, 160);
  if (state.gameState === STATE_OVER) {
    const x = (config.width - 226) / 2, y = config.height / 2 - 158;
    ctx.drawImage(sprites.over, x, y, 226, 158);
    const medal = medalForScore(state.score);
    if (medal) ctx.drawImage(sprites[medal], x + 24, y + 88, 44, 44);
    ctx.fillStyle = '#fff'; ctx.font = 'bold 13px monospace';
    ctx.fillText(String(state.score), x + 138, y + 73);
    ctx.fillText(String(state.bestScore), x + 138, y + 113);
  }
  if (debug) {
    ctx.strokeStyle = '#ff0055'; ctx.lineWidth = 2;
    ctx.strokeRect(BIRD_X - BIRD_RADIUS, state.birdY - BIRD_RADIUS, BIRD_RADIUS * 2, BIRD_RADIUS * 2);
    for (const pipe of state.pipes) {
      const { top, bottom } = pipeGeometry(pipe.y, config);
      ctx.strokeRect(pipe.x, 0, PIPE_W, top);
      ctx.strokeRect(pipe.x, bottom, PIPE_W, ground - bottom);
    }
  }
}
