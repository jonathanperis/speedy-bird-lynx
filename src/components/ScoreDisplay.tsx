const DIGIT_SPRITES = [
  require('../../assets/sprites/digits/digit-0.png'),
  require('../../assets/sprites/digits/digit-1.png'),
  require('../../assets/sprites/digits/digit-2.png'),
  require('../../assets/sprites/digits/digit-3.png'),
  require('../../assets/sprites/digits/digit-4.png'),
  require('../../assets/sprites/digits/digit-5.png'),
  require('../../assets/sprites/digits/digit-6.png'),
  require('../../assets/sprites/digits/digit-7.png'),
  require('../../assets/sprites/digits/digit-8.png'),
  require('../../assets/sprites/digits/digit-9.png'),
];

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
