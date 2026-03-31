import { CANVAS_WIDTH } from '../constants.js';

interface ScoreDisplayProps {
  score: number;
  visible: boolean;
}

export default function ScoreDisplay({ score, visible }: ScoreDisplayProps) {
  if (!visible) return null;

  return (
    <view
      style={{
        position: 'absolute',
        top: 40,
        left: 0,
        width: CANVAS_WIDTH,
        zIndex: 4,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <text
        style={{
          color: '#ffffff',
          fontSize: 36,
          fontWeight: 'bold',
          textAlign: 'center',
          textShadow: '2px 2px 0px rgba(0,0,0,0.3)',
        }}
      >
        {score}
      </text>
    </view>
  );
}
