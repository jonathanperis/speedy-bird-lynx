import { useState } from '@lynx-js/react';
import type { LayoutChangeEvent } from '@lynx-js/types';
import { useGameEngine } from './hooks/useGameEngine.js';
import { BG_COLOR, BIRD_RADIUS, BIRD_X, PIPE_W } from './constants.js';
import { fitViewport, pipeGeometry } from './game/engine.js';
import { STATE_READY, STATE_PLAY, STATE_OVER } from './types.js';
import Bird from './components/Bird.js';
import Pipe from './components/Pipe.js';
import Background from './components/Background.js';
import Ground from './components/Ground.js';
import ScoreDisplay from './components/ScoreDisplay.js';
import GetReadyScreen from './components/GetReadyScreen.js';
import GameOverScreen from './components/GameOverScreen.js';
import LearningControls from './components/LearningControls.js';

export default function App() {
  const game = useGameEngine();
  const { renderState: state, config, command, preferences } = game;
  const [viewport, setViewport] = useState({ width: config.width, height: config.height });
  const layout = (event: LayoutChangeEvent) => {
    'background only';
    const { width, height } = event.detail;
    if (width > 0 && height > 0) setViewport({ width, height });
  };
  const fit = fitViewport(viewport.width, viewport.height, config);

  return (
    <view bindlayoutchange={layout} style={{ width: '100%', height: '100%', backgroundColor: '#04111e', position: 'relative' }}>
      <view bindtap={() => command('tap')} accessibility-label="Speedy Bird. Tap to flap."
        style={{ width: `${config.width}px`, height: `${config.height}px`, backgroundColor: BG_COLOR,
          position: 'absolute', overflow: 'hidden', transformOrigin: '0 0',
          transform: `translate(${fit.x}px, ${fit.y}px) scale(${fit.scale})` }}>
        <Background bgX={state.bgX} />
        {state.pipes.map(pipe => <Pipe key={pipe.id} x={pipe.x} y={pipe.y} gap={config.gap} height={config.height} />)}
        <Bird y={state.birdY} rotation={state.birdRotation} frame={state.birdFrame} />
        <Ground groundX={state.groundX} />
        <ScoreDisplay score={state.score} visible={state.gameState === STATE_PLAY} />
        <GetReadyScreen visible={state.gameState === STATE_READY} />
        <GameOverScreen visible={state.gameState === STATE_OVER} score={state.score} bestScore={state.bestScore} />
        {preferences.debug && <view style={{ position: 'absolute', width: '100%', height: '100%', zIndex: 6, pointerEvents: 'none' }}>
          <view style={{ position: 'absolute', left: `${BIRD_X - BIRD_RADIUS}px`, top: `${state.birdY - BIRD_RADIUS}px`,
            width: `${BIRD_RADIUS * 2}px`, height: `${BIRD_RADIUS * 2}px`, border: '2px solid #ff0055' }} />
          {state.pipes.map(pipe => {
            const bounds = pipeGeometry(pipe.y, config);
            return <view key={pipe.id} style={{ position: 'absolute', left: `${pipe.x}px`, top: '0px', width: `${PIPE_W}px`, height: '100%' }}>
              <view style={{ position: 'absolute', left: '0px', top: '0px', width: `${PIPE_W}px`, height: `${bounds.top}px`, border: '2px solid #ff0055' }} />
              <view style={{ position: 'absolute', left: '0px', top: `${bounds.bottom}px`, width: `${PIPE_W}px`, height: `${bounds.ground - bounds.bottom}px`, border: '2px solid #ff0055' }} />
            </view>;
          })}
        </view>}
        <background-only fallback={<text style={{ position: 'absolute', bottom: '8px', color: '#fff' }}>Loading controls…</text>}>
          <LearningControls game={game} />
        </background-only>
      </view>
    </view>
  );
}
