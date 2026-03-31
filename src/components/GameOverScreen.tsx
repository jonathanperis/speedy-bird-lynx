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
        top: '0px',
        left: '0px',
        width: `${CANVAS_WIDTH}px`,
        height: `${CANVAS_HEIGHT}px`,
        zIndex: 5,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <view
        style={{
          position: 'absolute',
          top: `${CANVAS_HEIGHT / 2 - IMG_H}px`,
          left: `${(CANVAS_WIDTH - IMG_W) / 2}px`,
          width: `${IMG_W}px`,
          height: `${IMG_H}px`,
        }}
      >
        <image
          src={GAME_OVER_SRC}
          style={{ width: `${IMG_W}px`, height: `${IMG_H}px` }}
        />
        <text
          style={{
            position: 'absolute',
            top: '60px',
            right: '30px',
            color: '#ffffff',
            fontSize: '16px',
            fontWeight: 'bold',
            textAlign: 'right',
          }}
        >
          {score}
        </text>
        <text
          style={{
            position: 'absolute',
            top: '100px',
            right: '30px',
            color: '#ffffff',
            fontSize: '16px',
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
