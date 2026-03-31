const GAME_OVER_SRC = require('../../assets/sprites/game-over.png');

const IMG_W = 226;
const IMG_H = 158;

interface GameOverScreenProps {
  visible: boolean;
  score: number;
  bestScore: number;
}

export default function GameOverScreen({ visible, score, bestScore }: GameOverScreenProps) {
  if (!visible) return null;

  return (
    <view
      style={{
        position: 'absolute',
        top: '0px',
        left: '0px',
        width: '100%',
        height: '100%',
        zIndex: 5,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <view
        style={{
          width: `${IMG_W}px`,
          height: `${IMG_H}px`,
          position: 'relative',
        }}
      >
        <image
          src={GAME_OVER_SRC}
          style={{ width: `${IMG_W}px`, height: `${IMG_H}px` }}
        />
        {/* Current score — left of "SCORE" label area */}
        <text
          style={{
            position: 'absolute',
            top: '55px',
            left: '138px',
            color: '#ffffff',
            fontSize: '13px',
            fontWeight: 'bold',
          }}
        >
          {score}
        </text>
        {/* Best score — left of "BEST" label area */}
        <text
          style={{
            position: 'absolute',
            top: '95px',
            left: '138px',
            color: '#ffffff',
            fontSize: '13px',
            fontWeight: 'bold',
          }}
        >
          {bestScore}
        </text>
      </view>
    </view>
  );
}
