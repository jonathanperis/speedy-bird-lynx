const GET_READY_SRC = require('../../assets/sprites/get-ready.png');

const IMG_W = 174;
const IMG_H = 160;

interface GetReadyScreenProps {
  visible: boolean;
}

export default function GetReadyScreen({ visible }: GetReadyScreenProps) {
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
      <image
        src={GET_READY_SRC}
        style={{
          width: `${IMG_W}px`,
          height: `${IMG_H}px`,
        }}
      />
    </view>
  );
}
