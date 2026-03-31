import { useEffect } from '@lynx-js/react';
import { useGameEngine } from './hooks/useGameEngine.js';
import { CANVAS_WIDTH, CANVAS_HEIGHT, BG_COLOR } from './constants.js';
import { STATE_READY, STATE_PLAY, STATE_OVER } from './types.js';
import Bird from './components/Bird.js';
import Pipe from './components/Pipe.js';
import Background from './components/Background.js';
import Ground from './components/Ground.js';
import ScoreDisplay from './components/ScoreDisplay.js';
import GetReadyScreen from './components/GetReadyScreen.js';
import GameOverScreen from './components/GameOverScreen.js';
import './App.css';

export default function App() {
  const {
    pipes,
    gameStateView,
    score,
    bestScore,
    birdElRef,
    birdFrameElRefs,
    bgElRef,
    groundElRef,
    registerPipeRef,
    unregisterPipeRef,
    handleTap,
  } = useGameEngine();

  // Keyboard input (spacebar) — web target
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.keyCode === 32) {
        e.preventDefault();
        handleTap();
      }
    };
    if (typeof document !== 'undefined') {
      document.addEventListener('keydown', onKeyDown);
      return () => document.removeEventListener('keydown', onKeyDown);
    }
  }, [handleTap]);

  return (
    <view className="app-container">
      {/* Title */}
      <text className="game-title">FLAPPY BIRD</text>

      {/* Game Area */}
      <view
        className="game-screen"
        bindtap={handleTap}
        style={{
          width: CANVAS_WIDTH,
          height: CANVAS_HEIGHT,
          backgroundColor: BG_COLOR,
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 10,
        }}
      >
        {/* Background layer */}
        <Background bgElRef={bgElRef} />

        {/* Pipes */}
        {pipes.map((pipe) => (
          <Pipe
            key={pipe.id}
            id={pipe.id}
            y={pipe.y}
            registerPipeRef={registerPipeRef}
            unregisterPipeRef={unregisterPipeRef}
          />
        ))}

        {/* Bird */}
        <Bird birdElRef={birdElRef} birdFrameElRefs={birdFrameElRefs} />

        {/* Ground layer */}
        <Ground groundElRef={groundElRef} />

        {/* Score */}
        <ScoreDisplay score={score} visible={gameStateView === STATE_PLAY} />

        {/* Overlays */}
        <GetReadyScreen visible={gameStateView === STATE_READY} />
        <GameOverScreen
          visible={gameStateView === STATE_OVER}
          score={score}
          bestScore={bestScore}
        />
      </view>

      {/* Description */}
      <text className="game-description">
        Press 'spacebar' or tap to begin
      </text>
    </view>
  );
}
