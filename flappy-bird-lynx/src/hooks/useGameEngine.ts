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

export function useGameEngine() {
  // --- React state (only for mount/unmount of pipes and overlays) ---
  const [pipes, setPipes] = useState<PipeData[]>([]);
  const [gameStateView, setGameStateView] = useState<GameState>(STATE_READY);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);

  // --- Mutable refs (updated every frame, never trigger re-render) ---
  const gameState = useRef<GameState>(STATE_READY);
  const frame = useRef(0);
  const birdY = useRef(BIRD_Y_START);
  const birdVelocity = useRef(0);
  const birdFrame = useRef(0);
  const birdRotation = useRef(ROTATION_NEUTRAL);
  const pipesRef = useRef<PipeData[]>([]);
  const scoreRef = useRef(0);
  const bestScoreRef = useRef(0);
  const bgX = useRef(0);
  const groundX = useRef(0);
  const rafId = useRef<number | null>(null);

  // --- Element refs (for setNativeProps / direct style manipulation) ---
  const birdElRef = useRef<any>(null);
  const birdFrameElRefs = [useRef<any>(null), useRef<any>(null), useRef<any>(null), useRef<any>(null)];
  const bgElRef = useRef<any>(null);
  const groundElRef = useRef<any>(null);
  const pipeElRefs = useRef<Map<number, { top: any; bottom: any; container: any }>>(new Map());

  // --- Register/unregister pipe refs ---
  const registerPipeRef = useCallback((id: number, refs: { top: any; bottom: any; container: any }) => {
    pipeElRefs.current.set(id, refs);
  }, []);

  const unregisterPipeRef = useCallback((id: number) => {
    pipeElRefs.current.delete(id);
  }, []);

  // --- Physics ---
  function updateBird() {
    if (gameState.current === STATE_READY) {
      birdY.current = BIRD_Y_START;
      birdRotation.current = ROTATION_NEUTRAL;
      birdVelocity.current = 0;

      // Slow wing animation
      if (frame.current % ANIM_GETREADY_INTERVAL === 0) {
        birdFrame.current = (birdFrame.current + 1) % 4;
      }
    } else {
      // Fast wing animation
      if (frame.current % ANIM_PLAY_INTERVAL === 0) {
        birdFrame.current = (birdFrame.current + 1) % 4;
      }

      // Gravity
      birdVelocity.current += BIRD_GRAVITY;
      birdY.current += birdVelocity.current;

      // Rotation
      if (birdVelocity.current <= BIRD_FLAP) {
        birdRotation.current = ROTATION_UP;
      } else if (birdVelocity.current >= BIRD_FLAP + 2) {
        birdRotation.current = ROTATION_DOWN;
        birdFrame.current = 1; // Wings mid when diving
      } else {
        birdRotation.current = ROTATION_NEUTRAL;
      }

      // Ground collision
      if (birdY.current + BIRD_H / 2 >= CANVAS_HEIGHT - GROUND_H) {
        birdY.current = CANVAS_HEIGHT - GROUND_H - BIRD_H / 2;
        birdFrame.current = 2;
        birdRotation.current = ROTATION_DOWN;

        if (gameState.current === STATE_PLAY) {
          gameState.current = STATE_OVER;
          audioModule.play('fall');
          if (scoreRef.current > bestScoreRef.current) {
            bestScoreRef.current = scoreRef.current;
          }
          syncViewState();
        }
      }

      // Ceiling clamp
      if (birdY.current - BIRD_H / 2 <= 0) {
        birdY.current = BIRD_RADIUS;
      }
    }
  }

  function updatePipes() {
    if (gameState.current !== STATE_PLAY) return;

    // Spawn
    if (frame.current % PIPE_SPAWN_INTERVAL === 0) {
      const newPipe: PipeData = {
        id: nextPipeId++,
        x: CANVAS_WIDTH,
        y: Math.floor(Math.random() * (PIPE_MAX_Y - PIPE_MIN_Y + 1)) + PIPE_MIN_Y,
      };
      pipesRef.current.push(newPipe);
      setPipes([...pipesRef.current]);
    }

    // Move and despawn
    let scored = false;
    const remaining: PipeData[] = [];
    for (const pipe of pipesRef.current) {
      pipe.x -= PIPE_DX;

      if (pipe.x < -PIPE_W) {
        // Pipe exited — score!
        scoreRef.current++;
        scored = true;
        unregisterPipeRef(pipe.id);
      } else {
        remaining.push(pipe);
      }
    }

    if (scored) {
      audioModule.play('score');
      setScore(scoreRef.current);
    }

    if (remaining.length !== pipesRef.current.length) {
      pipesRef.current = remaining;
      setPipes([...remaining]);
    }
  }

  function checkCollisions() {
    if (gameState.current !== STATE_PLAY) return;

    const b = {
      left: BIRD_X - BIRD_RADIUS,
      right: BIRD_X + BIRD_RADIUS,
      top: birdY.current - BIRD_RADIUS,
      bottom: birdY.current + BIRD_RADIUS,
    };

    for (const pipe of pipesRef.current) {
      const p = {
        left: pipe.x,
        right: pipe.x + PIPE_W,
        topBottom: pipe.y + PIPE_H,
        botTop: pipe.y + PIPE_H + PIPE_GAP,
        botBottom: pipe.y + PIPE_H * 2 + PIPE_GAP,
      };

      // Top pipe collision
      if (b.left < p.right && b.right > p.left && b.top < p.topBottom && b.bottom > pipe.y) {
        triggerGameOver();
        return;
      }

      // Bottom pipe collision
      if (b.left < p.right && b.right > p.left && b.top < p.botBottom && b.bottom > p.botTop) {
        triggerGameOver();
        return;
      }
    }
  }

  function triggerGameOver() {
    gameState.current = STATE_OVER;
    audioModule.play('collision');
    if (scoreRef.current > bestScoreRef.current) {
      bestScoreRef.current = scoreRef.current;
    }
    syncViewState();
  }

  function updateScrolling() {
    if (gameState.current === STATE_READY) {
      bgX.current = 0;
      groundX.current = 0;
    } else if (gameState.current === STATE_PLAY) {
      bgX.current = (bgX.current - BG_DX) % BG_W;
      groundX.current = (groundX.current - GROUND_DX) % (GROUND_W / 2);
    }
  }

  // --- Render to elements via style updates ---
  function renderToElements() {
    // Bird position + rotation
    if (birdElRef.current) {
      const style = {
        transform: `translate(${BIRD_X - BIRD_W / 2}px, ${birdY.current - BIRD_H / 2}px) rotate(${birdRotation.current}deg)`,
      };
      if (birdElRef.current.setNativeProps) {
        birdElRef.current.setNativeProps({ style });
      } else if (birdElRef.current.style) {
        birdElRef.current.style.transform = style.transform;
      }
    }

    // Bird animation frames (show active, hide others)
    for (let i = 0; i < 4; i++) {
      const ref = birdFrameElRefs[i];
      if (ref.current) {
        const opacity = i === birdFrame.current ? 1 : 0;
        if (ref.current.setNativeProps) {
          ref.current.setNativeProps({ style: { opacity } });
        } else if (ref.current.style) {
          ref.current.style.opacity = String(opacity);
        }
      }
    }

    // Background scroll
    if (bgElRef.current) {
      const style = { transform: `translateX(${bgX.current}px)` };
      if (bgElRef.current.setNativeProps) {
        bgElRef.current.setNativeProps({ style });
      } else if (bgElRef.current.style) {
        bgElRef.current.style.transform = style.transform;
      }
    }

    // Ground scroll
    if (groundElRef.current) {
      const style = { transform: `translateX(${groundX.current}px)` };
      if (groundElRef.current.setNativeProps) {
        groundElRef.current.setNativeProps({ style });
      } else if (groundElRef.current.style) {
        groundElRef.current.style.transform = style.transform;
      }
    }

    // Pipe positions
    for (const pipe of pipesRef.current) {
      const refs = pipeElRefs.current.get(pipe.id);
      if (refs?.container) {
        const style = { transform: `translateX(${pipe.x}px)` };
        if (refs.container.setNativeProps) {
          refs.container.setNativeProps({ style });
        } else if (refs.container.style) {
          refs.container.style.transform = style.transform;
        }
      }
    }
  }

  // --- Sync mutable state to React state (only on state changes) ---
  function syncViewState() {
    setGameStateView(gameState.current);
    setScore(scoreRef.current);
    setBestScore(bestScoreRef.current);
  }

  // --- Game loop ---
  function tick() {
    updateBird();
    updatePipes();
    checkCollisions();
    updateScrolling();
    renderToElements();
    frame.current++;
    rafId.current = requestAnimationFrame(tick);
  }

  const start = useCallback(() => {
    if (rafId.current !== null) return;
    rafId.current = requestAnimationFrame(tick);
  }, []);

  const stop = useCallback(() => {
    if (rafId.current !== null) {
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
    }
  }, []);

  // --- Input handler ---
  const handleTap = useCallback(() => {
    if (gameState.current === STATE_READY) {
      gameState.current = STATE_PLAY;
      syncViewState();
    }

    if (gameState.current === STATE_PLAY) {
      birdVelocity.current = -BIRD_FLAP;
      audioModule.play('flap');
    } else if (gameState.current === STATE_OVER) {
      // Reset
      pipesRef.current = [];
      setPipes([]);
      scoreRef.current = 0;
      birdY.current = BIRD_Y_START;
      birdVelocity.current = 0;
      birdFrame.current = 0;
      birdRotation.current = ROTATION_NEUTRAL;
      bgX.current = 0;
      groundX.current = 0;
      frame.current = 0;
      nextPipeId = 0;
      pipeElRefs.current.clear();

      gameState.current = STATE_READY;
      audioModule.play('swoosh');
      syncViewState();
    }
  }, []);

  // Start loop on mount
  useEffect(() => {
    start();
    return stop;
  }, [start, stop]);

  return {
    // React state (for rendering)
    pipes,
    gameStateView,
    score,
    bestScore,

    // Element refs
    birdElRef,
    birdFrameElRefs,
    bgElRef,
    groundElRef,

    // Pipe ref management
    registerPipeRef,
    unregisterPipeRef,

    // Input
    handleTap,
  };
}
