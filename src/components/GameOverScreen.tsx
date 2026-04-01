const GAME_OVER_SRC = require('../../assets/sprites/game-over.png');
const MEDAL_BRONZE = require('../../assets/sprites/medals/medal-bronze.png');
const MEDAL_SILVER = require('../../assets/sprites/medals/medal-silver.png');
const MEDAL_GOLD = require('../../assets/sprites/medals/medal-gold.png');
const MEDAL_PLATINUM = require('../../assets/sprites/medals/medal-platinum.png');

const IMG_W = 226;
const IMG_H = 158;
const MEDAL_SIZE = 44;

function getMedalSrc(score: number): string | null {
  if (score >= 4) return MEDAL_PLATINUM;
  if (score >= 3) return MEDAL_GOLD;
  if (score >= 2) return MEDAL_SILVER;
  if (score >= 1) return MEDAL_BRONZE;
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
        {/* Medal badge — wrapped in view for Lynx absolute positioning */}
        {medalSrc ? (
          <view
            style={{
              position: 'absolute',
              top: '62px',
              left: '24px',
              width: `${MEDAL_SIZE}px`,
              height: `${MEDAL_SIZE}px`,
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
