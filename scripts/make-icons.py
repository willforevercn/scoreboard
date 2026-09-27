#!/usr/bin/env python3
"""Regenerates assets/icon-{180,192,512}.png (top-down table, red/blue halves,
white net with posts, orange ball). Requires Pillow:  pip install pillow
Run from anywhere:  python3 scripts/make-icons.py
"""
from pathlib import Path
from PIL import Image, ImageDraw

DARK = (11, 11, 11, 255)
RED = (185, 28, 28, 255)
BLUE = (37, 99, 235, 255)
ORANGE = (249, 115, 22, 255)
WHITE = (255, 255, 255, 255)
OUT = Path(__file__).resolve().parent.parent / 'assets'


def render(size, ss=4):
    n, k = size * ss, size / 512.0
    img = Image.new('RGBA', (n, n), DARK)
    d = ImageDraw.Draw(img)
    rect = lambda box, fill: d.rectangle([v * k * ss for v in box], fill=fill)
    circ = lambda cx, cy, r, fill: d.ellipse([(cx - r) * k * ss, (cy - r) * k * ss, (cx + r) * k * ss, (cy + r) * k * ss], fill=fill)

    x0, y0, x1, y1, b, mid = -20, 118, 532, 394, 16, 256   # table runs off both sides
    rect((x0, y0, x1, y1), WHITE)                            # boundary lines
    rect((x0 + b, y0 + b, mid, y1 - b), RED)
    rect((mid, y0 + b, x1 - b, y1 - b), BLUE)
    cy = (y0 + y1) // 2
    rect((x0 + b, cy - 6, x1 - b, cy + 6), WHITE)            # centre line
    rect((mid - 13, y0 - 30, mid + 13, y1 + 30), WHITE)      # net + posts
    circ(380, 192, 52, ORANGE)                               # ball
    return img.resize((size, size), Image.LANCZOS)


if __name__ == '__main__':
    OUT.mkdir(exist_ok=True)
    for s in (180, 192, 512):
        render(s).save(OUT / f'icon-{s}.png', optimize=True)
        print('wrote', OUT / f'icon-{s}.png')
