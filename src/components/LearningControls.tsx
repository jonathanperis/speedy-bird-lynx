import type { useGameEngine, GameCommand } from '../hooks/useGameEngine.js';

export default function LearningControls({ game }: { game: ReturnType<typeof useGameEngine> }) {
  const { command, paused, replaying, preferences, renderState: state, frameMs } = game;
  const buttons: [GameCommand, string][] = [
    ['pause', paused ? 'Resume' : 'Pause'], ['step', 'Step'], ['restart', 'New run'], ['replay', 'Replay'],
    ['practice', preferences.practice ? 'Practice on' : 'Practice off'],
    ['mute', preferences.muted ? 'Unmute' : 'Mute'], ['debug', preferences.debug ? 'Hide debug' : 'Debug'],
  ];
  return <view style={{ position: 'absolute', bottom: '5px', left: '8px', width: '384px', zIndex: 8 }}>
    <text accessibility-element={true} accessibility-label={`Score ${state.score}. Best ${state.bestScore}. ${paused ? 'Paused' : replaying ? 'Replay' : ''}`}
      style={{ color: '#fff', fontSize: '12px', backgroundColor: '#04111e', padding: '4px' }}>
      {`${(1 + state.score * 0.01).toFixed(2)}× · Best ${state.bestScore}${paused ? ' · Paused' : ''}${replaying ? ' · Replay' : ''}`}
    </text>
    {preferences.debug && <text style={{ color: '#fff', fontSize: '11px', backgroundColor: '#04111e' }}>
      {`seed ${state.seed} · tick ${state.frame} · y ${state.birdY.toFixed(1)} · v ${state.birdVelocity.toFixed(2)} · ${frameMs}ms`}
    </text>}
    {!game.bridgeAvailable && <text style={{ fontSize: '10px', color: '#fff', backgroundColor: '#04111e' }}>Explorer: audio/storage bridge unavailable</text>}
    <view style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
      {buttons.map(([action, label]) => <view key={action} catchtap={() => command(action)}
        accessibility-element={true} accessibility-traits="button" accessibility-label={label}
        style={{ padding: '10px', minHeight: '44px', justifyContent: 'center', backgroundColor: '#ffd166', borderRadius: '3px' }}>
        <text style={{ color: '#04111e', fontSize: '13px' }}>{label}</text>
      </view>)}
    </view>
  </view>;
}
