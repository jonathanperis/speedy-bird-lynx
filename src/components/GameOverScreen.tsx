import { CANVAS_HEIGHT } from '../constants.js';
import gameOverSrc from '../../assets/sprites/game-over.png';
import medalBronze from '../../assets/sprites/medals/medal-bronze.png';
import medalSilver from '../../assets/sprites/medals/medal-silver.png';
import medalGold from '../../assets/sprites/medals/medal-gold.png';
import medalPlatinum from '../../assets/sprites/medals/medal-platinum.png';

const IMG_W = 226;
const IMG_H = 158;
const MEDAL_SIZE = 44;

function getMedalSrc(score: number): string | null {
  if (score >= 100) return medalPlatinum;
  if (score >= 50) return medalGold;
  if (score >= 25) return medalSilver;
  if (score >= 10) return medalBronze;
  return null;
}

interface GameOverScreenProps {
  visible: boolean;
  score: number;
  bestScore: number;
}

export default function GameOverScreen({ visible, score, bestScore }: GameOverScreenProps) {
  if (!visible) return null;

  const medalSrc = getMedalSrc(score);

  return (
    <view
      style={{
        position: 'absolute',
        top: `${CANVAS_HEIGHT / 2 - IMG_H}px`,
        left: '0px',
        width: '100%',
        zIndex: 5,
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      {/* Panel container — game-over image as background-like element */}
      <view
        style={{
          width: `${IMG_W}px`,
          height: `${IMG_H}px`,
          position: 'relative',
        }}
      >
        {/* Game over panel sprite */}
        <image
          src={gameOverSrc}
          style={{
            position: 'absolute',
            top: '0px',
            left: '0px',
            width: `${IMG_W}px`,
            height: `${IMG_H}px`,
          }}
        />
        {/* Medal — absolutely positioned in its own view */}
        {medalSrc ? (
          <view
            style={{
              position: 'absolute',
              top: '88px',
              left: '24px',
              width: `${MEDAL_SIZE}px`,
              height: `${MEDAL_SIZE}px`,
              zIndex: 10,
            }}
          >
            <image
              src={medalSrc}
              style={{
                width: `${MEDAL_SIZE}px`,
                height: `${MEDAL_SIZE}px`,
              }}
            />
          </view>
        ) : null}
        {/* Score */}
        <text
          style={{
            position: 'absolute',
            top: '60px',
            left: '138px',
            color: '#ffffff',
            fontSize: '13px',
            fontWeight: 'bold',
          }}
        >
          {score}
        </text>
        {/* Best */}
        <text
          style={{
            position: 'absolute',
            top: '100px',
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
