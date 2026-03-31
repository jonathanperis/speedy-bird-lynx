import { useRef, useCallback, useEffect, useState } from '@lynx-js/react';

import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  BIRD_X,
  BIRD_Y_START,
  BIRD_W,
  BIRD_H,
  BIRD_RADIUS,
  BIRD_FLAP,
  BIRD_GRAVITY,
  ANIM_GETREADY_INTERVAL,
  ANIM_PLAY_INTERVAL,
  ROTATION_UP,
  ROTATION_NEUTRAL,
  ROTATION_DOWN,
  PIPE_W,
  PIPE_H,
  PIPE_GAP,
  PIPE_DX,
  PIPE_MIN_Y,
  PIPE_MAX_Y,
  PIPE_SPAWN_INTERVAL,
  BG_W,
  BG_DX,
  GROUND_W,
  GROUND_H,
  GROUND_DX,
} from '../constants.js';

import { PipeData, STATE_READY, STATE_PLAY, STATE_OVER } from '../types.js';
import type { GameState } from '../types.js';
import { audioModule } from '../audio/audio.js';

let nextPipeId = 0;

// Render state — everything the UI needs to draw a single frame
export interface RenderState {
  birdY: number;
  birdRotation: number;
  birdFrame: number;
  bgX: number;
  groundX: number;
  pipes: PipeData[];
  gameState: GameState;
  score: number;
  bestScore: number;
}

export function useGameEngine() {
  // All game state lives in a ref to avoid re-render per tick
  const engine = useRef({
    gameState: STATE_READY as GameState,
    frame: 0,
    birdY: BIRD_Y_START,
    birdVelocity: 0,
    birdFrame: 0,
    birdRotation: ROTATION_NEUTRAL,
    pipes: [] as PipeData[],
    score: 0,
    bestScore: 0,
    bgX: 0,
    groundX: 0,
  });

  // Render state — updated via setState to trigger re-renders
  const [renderState, setRenderState] = useState<RenderState>({
    birdY: BIRD_Y_START,
    birdRotation: ROTATION_NEUTRAL,
    birdFrame: 0,
    bgX: 0,
    groundX: 0,
    pipes: [],
    gameState: STATE_READY,
    score: 0,
    bestScore: 0,
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function tick() {
    const e = engine.current;

    // --- Update bird ---
    if (e.gameState === STATE_READY) {
      e.birdY = BIRD_Y_START;
      e.birdRotation = ROTATION_NEUTRAL;
      e.birdVelocity = 0;
      if (e.frame % ANIM_GETREADY_INTERVAL === 0) {
        e.birdFrame = (e.birdFrame + 1) % 4;
      }
    } else {
      if (e.frame % ANIM_PLAY_INTERVAL === 0) {
        e.birdFrame = (e.birdFrame + 1) % 4;
      }
      e.birdVelocity += BIRD_GRAVITY;
      e.birdY += e.birdVelocity;

      if (e.birdVelocity <= BIRD_FLAP) {
        e.birdRotation = ROTATION_UP;
      } else if (e.birdVelocity >= BIRD_FLAP + 2) {
        e.birdRotation = ROTATION_DOWN;
        e.birdFrame = 1;
      } else {
        e.birdRotation = ROTATION_NEUTRAL;
      }

      // Ground collision
      if (e.birdY + BIRD_H / 2 >= CANVAS_HEIGHT - GROUND_H) {
        e.birdY = CANVAS_HEIGHT - GROUND_H - BIRD_H / 2;
        e.birdFrame = 2;
        e.birdRotation = ROTATION_DOWN;
        if (e.gameState === STATE_PLAY) {
          e.gameState = STATE_OVER;
          audioModule.play('fall');
          if (e.score > e.bestScore) e.bestScore = e.score;
        }
      }

      // Ceiling clamp
      if (e.birdY - BIRD_H / 2 <= 0) {
        e.birdY = BIRD_RADIUS;
      }
    }

    // --- Update pipes ---
    if (e.gameState === STATE_PLAY) {
      if (e.frame % PIPE_SPAWN_INTERVAL === 0) {
        e.pipes.push({
          id: nextPipeId++,
          x: CANVAS_WIDTH,
          y: Math.floor(Math.random() * (PIPE_MAX_Y - PIPE_MIN_Y + 1)) + PIPE_MIN_Y,
        });
      }

      for (const pipe of e.pipes) {
        pipe.x -= PIPE_DX;
      }

      // Despawn + score
      const before = e.pipes.length;
      e.pipes = e.pipes.filter((pipe) => {
        if (pipe.x < -PIPE_W) {
          e.score++;
          audioModule.play('score');
          return false;
        }
        return true;
      });

      // --- Collision detection ---
      const b = {
        left: BIRD_X - BIRD_RADIUS,
        right: BIRD_X + BIRD_RADIUS,
        top: e.birdY - BIRD_RADIUS,
        bottom: e.birdY + BIRD_RADIUS,
      };

      for (const pipe of e.pipes) {
        const pLeft = pipe.x;
        const pRight = pipe.x + PIPE_W;
        const topBottom = pipe.y + PIPE_H;
        const botTop = pipe.y + PIPE_H + PIPE_GAP;
        const botBottom = pipe.y + PIPE_H * 2 + PIPE_GAP;

        if (b.left < pRight && b.right > pLeft && b.top < topBottom && b.bottom > pipe.y) {
          e.gameState = STATE_OVER;
          audioModule.play('collision');
          if (e.score > e.bestScore) e.bestScore = e.score;
          break;
        }
        if (b.left < pRight && b.right > pLeft && b.top < botBottom && b.bottom > botTop) {
          e.gameState = STATE_OVER;
          audioModule.play('collision');
          if (e.score > e.bestScore) e.bestScore = e.score;
          break;
        }
      }
    }

    // --- Update scrolling ---
    if (e.gameState === STATE_READY) {
      e.bgX = 0;
      e.groundX = 0;
    } else if (e.gameState === STATE_PLAY) {
      e.bgX = (e.bgX - BG_DX) % BG_W;
      e.groundX = (e.groundX - GROUND_DX) % (GROUND_W / 2);
    }

    e.frame++;

    // Push to React for rendering
    setRenderState({
      birdY: e.birdY,
      birdRotation: e.birdRotation,
      birdFrame: e.birdFrame,
      bgX: e.bgX,
      groundX: e.groundX,
      pipes: [...e.pipes],
      gameState: e.gameState,
      score: e.score,
      bestScore: e.bestScore,
    });
  }

  // --- Input handler ---
  const handleTap = useCallback(() => {
    const e = engine.current;

    if (e.gameState === STATE_READY) {
      e.gameState = STATE_PLAY;
    }

    if (e.gameState === STATE_PLAY) {
      e.birdVelocity = -BIRD_FLAP;
      audioModule.play('flap');
    } else if (e.gameState === STATE_OVER) {
      // Reset
      e.pipes = [];
      e.score = 0;
      e.birdY = BIRD_Y_START;
      e.birdVelocity = 0;
      e.birdFrame = 0;
      e.birdRotation = ROTATION_NEUTRAL;
      e.bgX = 0;
      e.groundX = 0;
      e.frame = 0;
      nextPipeId = 0;
      e.gameState = STATE_READY;
      audioModule.play('swoosh');
    }

    // Immediate render update for responsiveness
    setRenderState({
      birdY: e.birdY,
      birdRotation: e.birdRotation,
      birdFrame: e.birdFrame,
      bgX: e.bgX,
      groundX: e.groundX,
      pipes: [...e.pipes],
      gameState: e.gameState,
      score: e.score,
      bestScore: e.bestScore,
    });
  }, []);

  // Game loop via setInterval (works in web workers, unlike requestAnimationFrame)
  useEffect(() => {
    intervalRef.current = setInterval(tick, 17); // ~60fps
    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    renderState,
    handleTap,
  };
}
