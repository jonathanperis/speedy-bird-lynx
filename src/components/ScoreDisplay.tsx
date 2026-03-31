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
        top: '60px',
        left: '0px',
        width: '100%',
        zIndex: 4,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <text
        style={{
          color: '#ffffff',
          fontSize: '48px',
          fontWeight: 'bold',
          textAlign: 'center',
        }}
      >
        {score}
      </text>
    </view>
  );
}
