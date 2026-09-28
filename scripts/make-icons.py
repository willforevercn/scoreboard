#!/usr/bin/env python3
"""Regenerates assets/icon-{180,192,512}.png.

A top-down ITTF table drawn to scale (274 x 152.5 cm, 2 cm side/end lines, 3 mm
centre line along the length, net overhanging 15.25 cm each side), line weights
boosted ~3x so they survive at home-screen size, with one score digit per half
in the app's player colours (orange / white).

Requires Pillow (pip install pillow).  Run from anywhere: python3 scripts/make-icons.py
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

DARK = (11, 11, 11, 255)
WHITE = (255, 255, 255, 255)
TABLE_BLUE = (29, 78, 216, 255)      # matches .half.serving in the app
ORANGE = (249, 115, 22, 255)         # player 1 digit colour
FONT = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'   # any bold sans works
OUT = Path(__file__).resolve().parent.parent / 'assets'


def render(size, ss=4, boost=3.0, digit_size=200, digits=('7', '5')):
    n, k = size * ss, size / 512.0
    img = Image.new('RGBA', (n, n), DARK)
    d = ImageDraw.Draw(img)
    rect = lambda box, fill: d.rectangle([v * k * ss for v in box], fill=fill)

    cm = 512 / 274.0                                  # table spans the icon width
    tw, th = 512, 152.5 * cm
    x0, y0 = 0, 256 - th / 2
    x1, y1 = x0 + tw, y0 + th
    line, centre, post = 2.0 * cm * boost, 0.3 * cm * boost, 15.25 * cm

    rect((x0, y0, x1, y1), WHITE)                                  # side / end lines
    rect((x0 + line, y0 + line, x1 - line, y1 - line), TABLE_BLUE)
    cy = (y0 + y1) / 2
    rect((x0 + line, cy - centre / 2, x1 - line, cy + centre / 2), WHITE)   # centre line
    cx = (x0 + x1) / 2
    netw = 1.0 * cm * boost
    rect((cx - netw / 2, y0 - post, cx + netw / 2, y1 + post), WHITE)       # net + posts

    font = ImageFont.truetype(FONT, int(digit_size * k * ss))
    stroke = int(7 * k * ss)                                        # keeps the centre line from running through the digits
    for txt, dx, col in ((digits[0], (x0 + cx) / 2, ORANGE), (digits[1], (cx + x1) / 2, WHITE)):
        d.text((dx * k * ss, cy * k * ss), txt, font=font, fill=col, anchor='mm', stroke_width=stroke, stroke_fill=TABLE_BLUE)
    return img.resize((size, size), Image.LANCZOS)


if __name__ == '__main__':
    OUT.mkdir(exist_ok=True)
    for s in (180, 192, 512):
        render(s).save(OUT / f'icon-{s}.png', optimize=True)
        print('wrote', OUT / f'icon-{s}.png')
