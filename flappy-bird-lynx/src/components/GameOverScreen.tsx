import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants.js';

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
        top: 0,
        left: 0,
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
        zIndex: 5,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <view
        style={{
          position: 'absolute',
          top: CANVAS_HEIGHT / 2 - IMG_H,
          left: (CANVAS_WIDTH - IMG_W) / 2,
          width: IMG_W,
          height: IMG_H,
        }}
      >
        <image
          src={GAME_OVER_SRC}
          style={{ width: IMG_W, height: IMG_H }}
        />
        {/* Current score */}
        <text
          style={{
            position: 'absolute',
            top: 60,
            right: 30,
            color: '#ffffff',
            fontSize: 16,
            fontWeight: 'bold',
            textAlign: 'right',
          }}
        >
          {score}
        </text>
        {/* Best score */}
        <text
          style={{
            position: 'absolute',
            top: 100,
            right: 30,
            color: '#ffffff',
            fontSize: 16,
            fontWeight: 'bold',
            textAlign: 'right',
          }}
        >
          {bestScore}
        </text>
      </view>
    </view>
  );
}
