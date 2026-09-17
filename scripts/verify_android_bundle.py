#!/usr/bin/env python3
"""Verify that each APK packages the exact bundle produced by the current build."""
import sys
from pathlib import Path
from zipfile import ZipFile

root = Path(__file__).resolve().parents[1]
expected = (root / "dist/main.lynx.bundle").read_bytes()
if not sys.argv[1:]:
    raise SystemExit("Usage: python3 scripts/verify_android_bundle.py <apk> [<apk> ...]")

for name in sys.argv[1:]:
    with ZipFile(name) as apk:
        actual = apk.read("assets/main.lynx.bundle")
    if actual != expected:
        raise SystemExit(f"Stale Lynx bundle in {name}; rebuild the APK after bun run build.")
    print(f"Verified current Lynx bundle: {name}")
