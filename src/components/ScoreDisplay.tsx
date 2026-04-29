import digit0 from '../../assets/sprites/digits/digit-0.png';
import digit1 from '../../assets/sprites/digits/digit-1.png';
import digit2 from '../../assets/sprites/digits/digit-2.png';
import digit3 from '../../assets/sprites/digits/digit-3.png';
import digit4 from '../../assets/sprites/digits/digit-4.png';
import digit5 from '../../assets/sprites/digits/digit-5.png';
import digit6 from '../../assets/sprites/digits/digit-6.png';
import digit7 from '../../assets/sprites/digits/digit-7.png';
import digit8 from '../../assets/sprites/digits/digit-8.png';
import digit9 from '../../assets/sprites/digits/digit-9.png';

const DIGIT_SPRITES = [digit0, digit1, digit2, digit3, digit4, digit5, digit6, digit7, digit8, digit9];

const DIGIT_W = 18;
const DIGIT_H = 27;
const DIGIT_GAP = 2;

interface ScoreDisplayProps {
  score: number;
  visible: boolean;
}

export default function ScoreDisplay({ score, visible }: ScoreDisplayProps) {
  if (!visible) return null;

  const digits = score.toString().split('');
  const totalWidth = digits.length * DIGIT_W + (digits.length - 1) * DIGIT_GAP;

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
      <view
        style={{
          width: `${totalWidth}px`,
          height: `${DIGIT_H}px`,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        {digits.map((d, i) => (
          <image
            key={i}
            src={DIGIT_SPRITES[parseInt(d)]}
            style={{
              width: `${DIGIT_W}px`,
              height: `${DIGIT_H}px`,
              marginLeft: i > 0 ? `${DIGIT_GAP}px` : '0px',
            }}
          />
        ))}
      </view>
    </view>
  );
}
