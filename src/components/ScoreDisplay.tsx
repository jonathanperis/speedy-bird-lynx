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
        top: '40px',
        left: '0px',
        width: `${CANVAS_WIDTH}px`,
        zIndex: 4,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <text
        style={{
          color: '#ffffff',
          fontSize: '36px',
          fontWeight: 'bold',
          textAlign: 'center',
        }}
      >
        {score}
      </text>
    </view>
  );
}
