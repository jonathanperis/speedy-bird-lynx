// Draws an engine snapshot into a <canvas>. The whole 400x750 logical playfield is scaled to
// the canvas, mirroring the ReactLynx components in src/components/ (same sizes, positions,
// and layering), so both surfaces show the same frame for the same snapshot.

import {
  BG_COLOR,
  BG_H,
  BG_W,
  BIRD_H,
  BIRD_W,
  BIRD_X,
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  GROUND_H,
  GROUND_W,
  PIPE_GAP,
  PIPE_H,
  PIPE_W,
} from '../../../src/constants.ts';
import type { GameSnapshot } from '../../../src/game/engine.ts';
import { medalForScore } from '../../../src/game/engine.ts';
import { STATE_OVER, STATE_PLAY, STATE_READY } from '../../../src/types.ts';
import type { SpriteName, Sprites } from './assets.ts';

const GROUND_Y = CANVAS_HEIGHT - GROUND_H;
const BG_Y = GROUND_Y - BG_H;
// Pipe tiles are 26x25 sources scaled to the pipe width (see PipeSlot.tsx).
const TILE_H = Math.round(25 * (PIPE_W / 26));
const BIRD_FRAMES: SpriteName[] = ['bird0', 'bird1', 'bird2', 'bird1'];
const DIGIT_W = 18;
const DIGIT_H = 27;
const DIGIT_GAP = 2;
const READY_W = 174;
const READY_H = 160;
const PANEL_W = 226;
const PANEL_H = 158;
const MEDAL_SIZE = 44;
const TEXT_FONT = 'system-ui, -apple-system, "Segoe UI", sans-serif';

export interface Renderer {
  /** Match the backing store to the canvas's displayed size and pixel density. */
  resize(): void;
  draw(state: GameSnapshot, paused: boolean): void;
  setSprites(sprites: Sprites): void;
}

export function createRenderer(canvas: HTMLCanvasElement): Renderer {
  const context = canvas.getContext('2d', { alpha: false });
  let sprites: Sprites = {};

  const configure = () => {
    if (!context) return;
    context.setTransform(canvas.width / CANVAS_WIDTH, 0, 0, canvas.height / CANVAS_HEIGHT, 0, 0);
    // Nearest-neighbour scaling keeps the pixel art crisp.
    context.imageSmoothingEnabled = false;
  };
  configure();

  const sprite = (name: SpriteName, x: number, y: number, width: number, height: number, fallback?: string) => {
    if (!context) return;
    const image = sprites[name];
    if (image) context.drawImage(image, x, y, width, height);
    else if (fallback) {
      context.fillStyle = fallback;
      context.fillRect(x, y, width, height);
    }
  };

  const text = (value: string, x: number, y: number, size: number, color: string, align: CanvasTextAlign = 'left') => {
    if (!context) return;
    context.font = `bold ${size}px ${TEXT_FONT}`;
    context.fillStyle = color;
    context.textAlign = align;
    context.textBaseline = 'top';
    context.fillText(value, x, y);
  };

  const drawPipes = (state: GameSnapshot) => {
    for (const pipe of state.pipes) {
      // Upper pipe: the mouth ends at the gap; body tiles stack upward, only while on screen.
      const gapTop = pipe.y + PIPE_H;
      for (let top = gapTop - 2 * TILE_H; top + TILE_H + 1 > 0; top -= TILE_H) {
        sprite('pipeTopBody', pipe.x, top, PIPE_W, TILE_H + 1, '#5ec43a');
      }
      sprite('pipeTopMouth', pipe.x, gapTop - TILE_H, PIPE_W, TILE_H, '#4aa82e');

      // Lower pipe: the mouth starts below the gap; body tiles stop at the ground.
      const gapBottom = gapTop + PIPE_GAP;
      sprite('pipeBottomMouth', pipe.x, gapBottom, PIPE_W, TILE_H, '#4aa82e');
      for (let top = gapBottom + TILE_H; top < GROUND_Y; top += TILE_H) {
        sprite('pipeBottomBody', pipe.x, top, PIPE_W, TILE_H + 1, '#5ec43a');
      }
    }
  };

  const drawBird = (state: GameSnapshot) => {
    if (!context) return;
    context.save();
    context.translate(BIRD_X, state.birdY);
    context.rotate((state.birdRotation * Math.PI) / 180);
    sprite(BIRD_FRAMES[state.birdFrame] ?? 'bird0', -BIRD_W / 2, -BIRD_H / 2, BIRD_W, BIRD_H, '#f7d046');
    context.restore();
  };

  const drawScore = (score: number) => {
    const digits = String(score).split('');
    const width = digits.length * DIGIT_W + (digits.length - 1) * DIGIT_GAP;
    let x = (CANVAS_WIDTH - width) / 2;
    for (const digit of digits) {
      const name = `digit${digit}` as SpriteName;
      if (sprites[name]) sprite(name, x, 60, DIGIT_W, DIGIT_H);
      else text(digit, x + DIGIT_W / 2, 60, DIGIT_H, '#ffffff', 'center');
      x += DIGIT_W + DIGIT_GAP;
    }
  };

  const drawReady = () => {
    const x = (CANVAS_WIDTH - READY_W) / 2;
    const y = CANVAS_HEIGHT / 2 - READY_H;
    if (sprites.getReady) sprite('getReady', x, y, READY_W, READY_H);
    else text('GET READY', CANVAS_WIDTH / 2, y + READY_H / 2, 28, '#ffffff', 'center');
  };

  const drawGameOver = (state: GameSnapshot) => {
    const x = (CANVAS_WIDTH - PANEL_W) / 2;
    const y = CANVAS_HEIGHT / 2 - PANEL_H;
    sprite('gameOver', x, y, PANEL_W, PANEL_H, '#ded895');
    const medal = medalForScore(state.score);
    if (medal) sprite(medal, x + 24, y + 88, MEDAL_SIZE, MEDAL_SIZE);
    // Values sit where GameOverScreen.tsx places its <text> elements.
    text(String(state.score), x + 138, y + 62, 13, '#ffffff');
    text(String(state.bestScore), x + 138, y + 102, 13, '#ffffff');
    if (state.newBest) text('NEW', x + 168, y + 103, 10, '#fbb025');
  };

  const drawPaused = () => {
    if (!context) return;
    context.fillStyle = 'rgba(4, 17, 30, 0.55)';
    context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    text('PAUSED', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 24, 28, '#ffffff', 'center');
    text('Tap or press Space to resume', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 14, 14, '#ffffff', 'center');
  };

  return {
    resize() {
      const ratio = window.devicePixelRatio || 1;
      const width = Math.max(1, Math.round(canvas.clientWidth * ratio));
      const height = Math.max(1, Math.round(canvas.clientHeight * ratio));
      if (canvas.clientWidth === 0 || (canvas.width === width && canvas.height === height)) return;
      // Resizing clears the canvas and resets the context state.
      canvas.width = width;
      canvas.height = height;
      configure();
    },
    setSprites(next) {
      sprites = next;
    },
    draw(state, paused) {
      if (!context) return;
      context.fillStyle = BG_COLOR;
      context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      // Tiles overlap by one pixel so fractional scaling never shows a seam.
      for (let x = state.bgX; x < CANVAS_WIDTH; x += BG_W) sprite('background', x, BG_Y, BG_W + 1, BG_H);
      drawPipes(state);
      drawBird(state);
      for (let x = state.groundX; x < CANVAS_WIDTH; x += GROUND_W) {
        sprite('ground', x, GROUND_Y, GROUND_W + 1, GROUND_H, '#ded895');
      }
      if (state.gameState === STATE_PLAY) drawScore(state.score);
      else if (state.gameState === STATE_READY) drawReady();
      else if (state.gameState === STATE_OVER) drawGameOver(state);
      if (paused) drawPaused();
    },
  };
}
