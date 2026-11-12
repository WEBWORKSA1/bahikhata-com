#!/usr/bin/env python3
"""Draw the social-share image and app icons with Pillow (run by GitHub Actions)."""
import os
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMG = os.path.join(ROOT, "assets", "img")
RED, DEEP, GOLD, INK, RULE = (164, 22, 26), (122, 15, 18), (242, 169, 0), (27, 36, 48), (201, 214, 232)


def font(size, bold=True):
    names = ["DejaVuSans-Bold.ttf" if bold else "DejaVuSans.ttf", "LiberationSans-Bold.ttf" if bold else "LiberationSans-Regular.ttf"]
    for base in ["/usr/share/fonts/truetype/dejavu", "/usr/share/fonts/truetype/liberation", "/usr/share/fonts/dejavu"]:
        for n in names:
            p = os.path.join(base, n)
            if os.path.exists(p):
                return ImageFont.truetype(p, size)
    try:
        return ImageFont.load_default(size=size)
    except TypeError:
        return ImageFont.load_default()


def book(d, x, y, w, h, r):
    d.rounded_rectangle([x, y, x + w, y + h], radius=r, fill=RED)
    d.rounded_rectangle([x, y, x + int(w * .25), y + h], radius=r, fill=DEEP)
    step = h / 6
    for i in range(5):
        cy = y + step * (i + 1)
        rr = max(2, w * .05)
        d.ellipse([x + w * .125 - rr, cy - rr, x + w * .125 + rr, cy + rr], fill=GOLD)
    lw = max(3, int(w * .08))
    for i, frac in enumerate((.32, .5, .68)):
        ly = y + h * frac
        x2 = x + w * (.86 if i < 2 else .66)
        d.line([x + w * .4, ly, x2, ly], fill=(255, 255, 255), width=lw)


def icon(size, path):
    im = Image.new("RGB", (size, size), (255, 255, 255))
    d = ImageDraw.Draw(im)
    d.rounded_rectangle([0, 0, size - 1, size - 1], radius=int(size * .2), fill=(255, 253, 248))
    book(d, size * .2, size * .12, size * .6, size * .76, int(size * .06))
    im.save(path, optimize=True)


def og(path):
    W, H = 1200, 630
    im = Image.new("RGB", (W, H), (255, 255, 255))
    d = ImageDraw.Draw(im)
    for y in range(120, H, 46):
        d.line([0, y, W, y], fill=RULE, width=2)
    d.rectangle([0, 0, 60, H], fill=RED)
    for y in range(30, H, 40):
        d.ellipse([24, y, 36, y + 12], fill=GOLD)
    d.line([150, 0, 150, H], fill=RED, width=3)
    d.line([158, 0, 158, H], fill=RED, width=3)
    book(d, 1020, 150, 130, 165, 12)
    d.text((200, 150), "BahiKhata.com", font=font(80), fill=INK)
    d.text((200, 275), "Free digital khata, GST tools", font=font(48, False), fill=INK)
    d.text((200, 335), "and small business guides", font=font(48, False), fill=INK)
    d.rounded_rectangle([200, 440, 800, 520], radius=14, fill=RED)
    d.text((228, 458), "No signup. Works offline.", font=font(38), fill=(255, 255, 255))
    im.save(path, optimize=True)


if __name__ == "__main__":
    os.makedirs(IMG, exist_ok=True)
    icon(192, os.path.join(IMG, "icon-192.png"))
    icon(512, os.path.join(IMG, "icon-512.png"))
    og(os.path.join(IMG, "og.png"))
    print("Images written")
