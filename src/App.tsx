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
  const { renderState, handleTap } = useGameEngine();
  const { birdY, birdRotation, birdFrame, bgX, groundX, pipes, gameState, score, bestScore } = renderState;

  return (
    <view className="app-container">
      <text className="game-title">FLAPPY BIRD</text>

      <view
        className="game-screen"
        bindtap={handleTap}
        style={{
          width: `${CANVAS_WIDTH}px`,
          height: `${CANVAS_HEIGHT}px`,
          backgroundColor: BG_COLOR,
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '10px',
        }}
      >
        <Background bgX={bgX} />

        {pipes.map((pipe) => (
          <Pipe key={pipe.id} x={pipe.x} y={pipe.y} />
        ))}

        <Bird y={birdY} rotation={birdRotation} frame={birdFrame} />

        <Ground groundX={groundX} />

        <ScoreDisplay score={score} visible={gameState === STATE_PLAY} />

        <GetReadyScreen visible={gameState === STATE_READY} />
        <GameOverScreen
          visible={gameState === STATE_OVER}
          score={score}
          bestScore={bestScore}
        />
      </view>

      <text className="game-description">
        Tap to begin
      </text>
    </view>
  );
}
