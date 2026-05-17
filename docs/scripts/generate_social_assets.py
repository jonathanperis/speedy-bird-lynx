#!/usr/bin/env python3
"""Generate Speedy Bird social preview and icon fallback assets.

The source favicon remains the visual anchor; this script emits a 1200x630
Open Graph image and PNG/apple-touch favicon fallbacks for GitHub Pages.
"""
from __future__ import annotations

import math
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = Path(__file__).resolve().parents[2]
PUBLIC = ROOT / "docs" / "public"
SPRITES = PUBLIC / "assets" / "sprites"
OUT_OG = PUBLIC / "og-image.png"
OUT_FAVICON = PUBLIC / "favicon.png"
OUT_FAVICON_32 = PUBLIC / "favicon-32x32.png"
OUT_APPLE = PUBLIC / "apple-touch-icon.png"

W, H = 1200, 630
FONT_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FONT_MONO_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf"


def font(path: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(path, size)


def draw_pixel_text(draw: ImageDraw.ImageDraw, xy: tuple[int, int], text: str, fnt, fill, shadow=(4, 4), shadow_fill=(3, 13, 28)):
    x, y = xy
    if shadow:
        draw.text((x + shadow[0], y + shadow[1]), text, font=fnt, fill=shadow_fill)
    draw.text((x, y), text, font=fnt, fill=fill)


def load_sprite(name: str) -> Image.Image:
    return Image.open(SPRITES / name).convert("RGBA")


def paste_pixel(base: Image.Image, sprite: Image.Image, xy: tuple[int, int], scale: int) -> None:
    if scale != 1:
        sprite = sprite.resize((sprite.width * scale, sprite.height * scale), Image.Resampling.NEAREST)
    base.alpha_composite(sprite, xy)


def make_og() -> Image.Image:
    img = Image.new("RGBA", (W, H), "#04111e")
    px = img.load()

    # Dark arcade sky gradient with subtle pixel columns.
    top = (4, 17, 30)
    mid = (10, 42, 74)
    low = (13, 74, 122)
    for y in range(H):
        t = y / H
        if t < 0.65:
            k = t / 0.65
            c = tuple(int(top[i] * (1 - k) + mid[i] * k) for i in range(3))
        else:
            k = (t - 0.65) / 0.35
            c = tuple(int(mid[i] * (1 - k) + low[i] * k) for i in range(3))
        for x in range(W):
            px[x, y] = (*c, 255)

    draw = ImageDraw.Draw(img)

    # Large rounded arcade-card border, matching favicon gold/cabinet feel.
    card = (38, 34, W - 38, H - 34)
    draw.rounded_rectangle(card, radius=42, fill=(5, 20, 36, 210), outline=(255, 209, 102, 255), width=8)
    draw.rounded_rectangle((52, 48, W - 52, H - 48), radius=34, outline=(70, 168, 220, 180), width=3)
    draw.rounded_rectangle((67, 63, W - 67, H - 63), radius=26, outline=(232, 248, 255, 120), width=2)

    # Pixel stars / particles.
    star_colors = [(255, 209, 102, 210), (232, 248, 255, 200), (74, 158, 111, 180)]
    for i in range(90):
        x = 80 + ((i * 73) % (W - 160))
        y = 78 + ((i * 41) % 250)
        size = 2 if i % 5 else 4
        draw.rectangle((x, y, x + size, y + size), fill=star_colors[i % len(star_colors)])

    # Pixel speed lines behind the bird.
    for i, y in enumerate(range(180, 470, 34)):
        x0 = 570 + (i % 3) * 30
        draw.rectangle((x0, y, x0 + 270, y + 5), fill=(255, 107, 53, 125))
        draw.rectangle((x0 + 45, y + 10, x0 + 210, y + 14), fill=(232, 248, 255, 105))

    # Parallax grass/ground platform.
    ground = load_sprite("ground.png")
    for x in range(48, W - 48, ground.width * 2):
        paste_pixel(img, ground, (x, H - 150), 2)
    draw.rectangle((52, H - 80, W - 52, H - 52), fill=(45, 106, 79, 230))
    for x in range(70, W - 70, 28):
        draw.rectangle((x, H - 86, x + 16, H - 80), fill=(74, 158, 111, 240))

    # Pipes: use source sprites as motif.
    pipe_bottom = load_sprite("pipes/pipe-bottom.png")
    pipe_mouth = load_sprite("pipes/pipe-bottom-mouth.png")
    paste_pixel(img, pipe_bottom, (900, 205), 8)
    paste_pixel(img, pipe_mouth, (872, 155), 8)
    top_pipe = load_sprite("pipes/pipe-top.png")
    top_mouth = load_sprite("pipes/pipe-top-mouth.png")
    paste_pixel(img, top_pipe, (165, 65), 8)
    paste_pixel(img, top_mouth, (137, 314), 8)

    # Bird hero. Upscale source sprite, then add glow and foreground.
    bird = load_sprite("bird-1.png").resize((34 * 10, 24 * 10), Image.Resampling.NEAREST)
    glow = Image.new("RGBA", img.size, (0, 0, 0, 0))
    glow.alpha_composite(bird, (650, 250))
    glow = glow.filter(ImageFilter.GaussianBlur(18))
    tint = Image.new("RGBA", img.size, (255, 107, 53, 0))
    tint.alpha_composite(glow)
    img.alpha_composite(glow)
    img.alpha_composite(bird, (650, 250))

    # Tiny score glyph panel.
    draw.rounded_rectangle((735, 108, 870, 153), radius=10, fill=(8, 31, 54, 230), outline=(255, 209, 102, 255), width=4)
    draw_pixel_text(draw, (756, 113), "SCORE 42", font(FONT_MONO_BOLD, 22), (255, 209, 102, 255), shadow=(2, 2))

    # Text lockup.
    draw_pixel_text(draw, (112, 110), "SPEEDY", font(FONT_BOLD, 82), (255, 209, 102, 255), shadow=(6, 6))
    draw_pixel_text(draw, (112, 188), "BIRD", font(FONT_BOLD, 104), (232, 248, 255, 255), shadow=(6, 6))
    draw_pixel_text(draw, (118, 306), "ReactLynx pixel arcade", font(FONT_MONO_BOLD, 30), (74, 168, 220, 255), shadow=(3, 3))
    draw_pixel_text(draw, (118, 350), "iOS • Android • Web", font(FONT_MONO_BOLD, 28), (255, 107, 53, 255), shadow=(3, 3))

    # Repo / URL chip.
    chip = (112, 426, 492, 480)
    draw.rounded_rectangle(chip, radius=14, fill=(255, 209, 102, 230), outline=(255, 236, 170, 255), width=2)
    draw.text((134, 439), "Play on GitHub Pages", font=font(FONT_MONO_BOLD, 22), fill=(4, 17, 30, 255))

    # Pixel scanlines / vignette.
    overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    for y in range(72, H - 72, 8):
        od.line((72, y, W - 72, y), fill=(255, 255, 255, 14), width=1)
    img.alpha_composite(overlay)

    return img.convert("RGB")


def make_icon_fallbacks() -> None:
    ico = Image.open(PUBLIC / "favicon.ico")
    ico.seek(0)
    icon = ico.convert("RGBA")
    icon.resize((256, 256), Image.Resampling.LANCZOS).save(OUT_FAVICON)
    icon.resize((32, 32), Image.Resampling.LANCZOS).save(OUT_FAVICON_32)
    icon.resize((180, 180), Image.Resampling.LANCZOS).save(OUT_APPLE)


def main() -> None:
    OUT_OG.parent.mkdir(parents=True, exist_ok=True)
    make_og().save(OUT_OG, optimize=True)
    make_icon_fallbacks()
    print(f"wrote {OUT_OG}")
    print(f"wrote {OUT_FAVICON}, {OUT_FAVICON_32}, {OUT_APPLE}")


if __name__ == "__main__":
    main()
