#!/usr/bin/env python3
"""Generate the site's browser icons from the bird sprite (DESIGN.md palette).

The real 34x24 sprite is scaled by whole numbers (nearest neighbour) onto the game's sky
color, inside an ink border. The Open Graph image is rendered separately by
scripts/render-og.mjs.

Usage: python3 -I docs/scripts/generate_icons.py   (needs Pillow, see requirements.txt)
"""
from __future__ import annotations

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
PUBLIC = ROOT / "docs" / "public"
BIRD = ROOT / "assets" / "sprites" / "bird-1.png"
SKY = (0, 187, 196, 255)
INK = (83, 56, 71, 255)


def icon(size: int, border: int) -> Image.Image:
    bird = Image.open(BIRD).convert("RGBA")
    canvas = Image.new("RGBA", (size, size), INK)
    canvas.paste(Image.new("RGBA", (size - 2 * border, size - 2 * border), SKY), (border, border))
    # Largest whole-number scale that keeps the bird within about 70% of the icon.
    scale = max(1, int((size - 2 * border) * 0.7 // bird.width))
    sprite = bird.resize((bird.width * scale, bird.height * scale), Image.NEAREST)
    canvas.alpha_composite(sprite, ((size - sprite.width) // 2, (size - sprite.height) // 2))
    return canvas


def main() -> None:
    icon(256, 8).save(PUBLIC / "favicon.png", optimize=True)
    icon(32, 1).save(PUBLIC / "favicon-32x32.png", optimize=True)
    # Apple applies its own rounded mask; the icon must be opaque.
    icon(180, 0).convert("RGB").save(PUBLIC / "apple-touch-icon.png", optimize=True)
    icon(48, 2).save(PUBLIC / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])
    print("Wrote favicon.png, favicon-32x32.png, apple-touch-icon.png, favicon.ico")


if __name__ == "__main__":
    main()
