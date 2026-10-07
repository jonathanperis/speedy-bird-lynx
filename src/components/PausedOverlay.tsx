interface PausedOverlayProps {
  visible: boolean;
}

/** Shown when the host app is backgrounded mid-run; the next tap resumes. */
export default function PausedOverlay({ visible }: PausedOverlayProps) {
  if (!visible) return null;

  return (
    <view
      style={{
        position: 'absolute',
        top: '0px',
        left: '0px',
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(4, 17, 30, 0.55)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <text style={{ color: '#ffffff', fontSize: '28px', fontWeight: 'bold', letterSpacing: '3px' }}>PAUSED</text>
      <text style={{ color: '#ffffff', fontSize: '14px', marginTop: '8px' }}>Tap to resume</text>
    </view>
  );
}
