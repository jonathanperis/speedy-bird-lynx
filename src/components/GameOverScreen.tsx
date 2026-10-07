import gameOverSrc from '../../assets/sprites/game-over.png';
import medalBronze from '../../assets/sprites/medals/medal-bronze.png';
import medalGold from '../../assets/sprites/medals/medal-gold.png';
import medalPlatinum from '../../assets/sprites/medals/medal-platinum.png';
import medalSilver from '../../assets/sprites/medals/medal-silver.png';
import { CANVAS_HEIGHT } from '../constants.js';
import { medalForScore } from '../game/engine.js';
import type { Medal } from '../types.js';

const IMG_W = 226;
const IMG_H = 158;
const MEDAL_SIZE = 44;

const MEDAL_SPRITES: Record<Medal, string> = {
  bronze: medalBronze,
  silver: medalSilver,
  gold: medalGold,
  platinum: medalPlatinum,
};

const valueStyle = (top: number) => ({
  position: 'absolute' as const,
  top: `${top}px`,
  left: '138px',
  color: '#ffffff',
  fontSize: '13px',
  fontWeight: 'bold' as const,
});

interface GameOverScreenProps {
  visible: boolean;
  score: number;
  bestScore: number;
  newBest: boolean;
}

export default function GameOverScreen({ visible, score, bestScore, newBest }: GameOverScreenProps) {
  if (!visible) return null;

  const medal = medalForScore(score);

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
      <view style={{ width: `${IMG_W}px`, height: `${IMG_H}px`, position: 'relative' }}>
        <image
          src={gameOverSrc}
          style={{ position: 'absolute', top: '0px', left: '0px', width: `${IMG_W}px`, height: `${IMG_H}px` }}
        />
        {medal ? (
          <image
            src={MEDAL_SPRITES[medal]}
            style={{
              position: 'absolute',
              top: '88px',
              left: '24px',
              width: `${MEDAL_SIZE}px`,
              height: `${MEDAL_SIZE}px`,
            }}
          />
        ) : null}
        <text style={valueStyle(60)}>{score}</text>
        <text style={valueStyle(100)}>{bestScore}</text>
        {newBest ? (
          <text style={{ ...valueStyle(100), left: '168px', color: '#fbb025', fontSize: '10px' }}>NEW</text>
        ) : null}
      </view>
    </view>
  );
}
