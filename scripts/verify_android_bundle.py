#!/usr/bin/env python3
"""Verify that each APK packages the current Lynx bundle and the canonical sound effects."""
import sys
from pathlib import Path
from zipfile import ZIP_STORED, BadZipFile, ZipFile

ROOT = Path(__file__).resolve().parents[1]
BUNDLE = ROOT / "dist/main.lynx.bundle"
AUDIO = ROOT / "assets/audio"
# Files SpeedyBirdModule.kt loads by name; keep in sync with its SOUND_FILES.
REQUIRED_SOUNDS = ("sfx_wing.wav", "sfx_point.wav", "sfx_hit.wav", "sfx_die.wav", "sfx_swooshing.wav")


def fail(message: str) -> None:
    raise SystemExit(f"error: {message}")


def main(apks: list[str]) -> None:
    if not apks:
        fail("usage: python3 scripts/verify_android_bundle.py <apk> [<apk> ...]")
    if not BUNDLE.is_file():
        fail(f"{BUNDLE.relative_to(ROOT)} not found; run `bun run build` first.")
    expected = {"assets/main.lynx.bundle": BUNDLE.read_bytes()}
    for name in REQUIRED_SOUNDS:
        sound = AUDIO / name
        if not sound.is_file():
            fail(f"{sound.relative_to(ROOT)} is missing; SpeedyBirdModule loads it at launch.")
        expected[f"assets/audio/{name}"] = sound.read_bytes()

    for name in apks:
        try:
            with ZipFile(name) as apk:
                packaged = set(apk.namelist())
                for entry, content in expected.items():
                    if entry not in packaged:
                        fail(f"{name} is missing {entry}; rebuild the APK.")
                    if apk.read(entry) != content:
                        fail(f"{name} has a stale {entry}; rebuild the APK after `bun run build`.")
                    # AssetManager.openFd, which SoundPool uses, only works on uncompressed entries.
                    if entry.endswith(".wav") and apk.getinfo(entry).compress_type != ZIP_STORED:
                        fail(f"{name} stores {entry} compressed; SoundPool cannot open it.")
        except FileNotFoundError:
            fail(f"{name} does not exist.")
        except BadZipFile:
            fail(f"{name} is not a valid APK.")
        print(f"Verified current Lynx bundle and {len(expected) - 1} sounds: {name}")


if __name__ == "__main__":
    main(sys.argv[1:])
