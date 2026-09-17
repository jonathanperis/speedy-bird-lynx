"""Verify an installable APK's offline game payload without executing the app."""
import pathlib
import sys
import zipfile

apk = pathlib.Path(sys.argv[1])
root = pathlib.Path(__file__).resolve().parent.parent
with zipfile.ZipFile(apk) as archive:
    bundle = archive.read('assets/main.lynx.bundle')
    assert bundle == (root / 'dist/main.lynx.bundle').read_bytes(), 'APK contains a stale game bundle'
    for sprite in (root / 'assets/sprites').rglob('*.png'):
        if 'unused' in sprite.parts:
            continue
        import base64
        assert base64.b64encode(sprite.read_bytes()) in bundle, f'Missing embedded sprite: {sprite.name}'
    for audio in (root / 'assets/audio').glob('*.wav'):
        assert archive.read(f'assets/audio/{audio.name}') == audio.read_bytes(), f'Missing sound: {audio.name}'
    v1 = any(name.startswith('META-INF/') and name.endswith(('.RSA', '.DSA', '.EC')) for name in archive.namelist())
    assert v1 or b'APK Sig Block 42' in apk.read_bytes(), 'APK is unsigned'
print(f'Verified signed APK with complete offline game assets: {apk.name}')
