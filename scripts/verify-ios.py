"""Check a built .app's executable and complete offline game payload."""
import base64
from pathlib import Path
import plistlib
import sys

app = Path(sys.argv[1])
root = Path(__file__).resolve().parent.parent
with (app / 'Info.plist').open('rb') as stream:
    info = plistlib.load(stream)
executable = app / info['CFBundleExecutable']
with executable.open('rb') as stream:
    assert stream.read(4) in (b'\xcf\xfa\xed\xfe', b'\xca\xfe\xba\xbe'), 'Missing Mach-O executable'
bundle = (app / 'main.lynx.bundle').read_bytes()
assert (app / 'LynxResources.bundle' / 'lynx_core.js').is_file(), 'Missing native Lynx runtime resource'
assert bundle == (root / 'dist/main.lynx.bundle').read_bytes(), 'App contains a stale game bundle'
for sprite in (root / 'assets/sprites').rglob('*.png'):
    if 'unused' not in sprite.parts:
        assert base64.b64encode(sprite.read_bytes()) in bundle, f'Missing sprite: {sprite.name}'
for audio in (root / 'assets/audio').glob('*.wav'):
    assert (app / 'audio' / audio.name).read_bytes() == audio.read_bytes(), f'Missing sound: {audio.name}'
print(f'Verified executable and offline game assets: {app.name}')
