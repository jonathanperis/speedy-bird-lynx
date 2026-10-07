import Background from './components/Background.js';
import Bird from './components/Bird.js';
import GameOverScreen from './components/GameOverScreen.js';
import GetReadyScreen from './components/GetReadyScreen.js';
import Ground from './components/Ground.js';
import PausedOverlay from './components/PausedOverlay.js';
import PipeSlot from './components/PipeSlot.js';
import ScoreDisplay from './components/ScoreDisplay.js';
import { BG_COLOR, CANVAS_HEIGHT, CANVAS_WIDTH, LETTERBOX_COLOR, PIPE_POOL_SIZE } from './constants.js';
import { describeHud } from './game/announcements.js';
import { useGame } from './hooks/useGame.js';
import { STATE_OVER, STATE_PLAY, STATE_READY } from './types.js';

const PIPE_SLOTS = Array.from({ length: PIPE_POOL_SIZE }, (_, index) => index);

export default function App() {
  const { rootRef, handleTap, hud, viewport, onLayout } = useGame();
  const { gameState, score, bestScore, newBest, paused } = hud;
  const sidePanelWidth = Math.max(0, Math.ceil(viewport.x));

  return (
    <view
      main-thread:ref={rootRef}
      main-thread:bindtap={handleTap}
      bindlayoutchange={onLayout}
      accessibility-element={true}
      accessibility-label={describeHud(hud)}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: BG_COLOR,
      }}
    >
      {/* Logical 400x750 playfield, scaled to fit and anchored to the bottom edge. */}
      <view
        style={{
          position: 'absolute',
          top: '0px',
          left: '0px',
          width: `${CANVAS_WIDTH}px`,
          height: `${CANVAS_HEIGHT}px`,
          transformOrigin: '0 0',
          transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.scale})`,
        }}
      >
        <Background />
        {PIPE_SLOTS.map((index) => (
          <PipeSlot key={index} index={index} />
        ))}
        <Bird />
        <Ground />
        <ScoreDisplay score={score} visible={gameState === STATE_PLAY} />
        <GetReadyScreen visible={gameState === STATE_READY} />
        <GameOverScreen visible={gameState === STATE_OVER} score={score} bestScore={bestScore} newBest={newBest} />
      </view>

      {/* Screens wider than the playfield: cover the sides so pipes never pop in. */}
      {sidePanelWidth > 0 ? (
        <>
          <view
            style={{
              position: 'absolute',
              top: '0px',
              left: '0px',
              width: `${sidePanelWidth}px`,
              height: '100%',
              backgroundColor: LETTERBOX_COLOR,
            }}
          />
          <view
            style={{
              position: 'absolute',
              top: '0px',
              right: '0px',
              width: `${sidePanelWidth}px`,
              height: '100%',
              backgroundColor: LETTERBOX_COLOR,
            }}
          />
        </>
      ) : null}

      {/* Dims the whole screen, including the sky above the playfield. */}
      <PausedOverlay visible={paused} />
    </view>
  );
}
