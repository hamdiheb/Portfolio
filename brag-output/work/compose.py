"""Composite captured 4K frames into 1080p: camera crop, cursor, clicks, captions, end card.

usage: python3 compose.py [t1,t2,...]   (no args = all frames into out/)
"""
import json, math, sys
from multiprocessing import Pool
from pathlib import Path
from PIL import Image, ImageDraw

HERE = Path(__file__).resolve().parent
FR = HERE / "frames"
OUT = HERE / "out"
OUT.mkdir(exist_ok=True)
L = HERE / "layers"
FPS, N, W, H, S = 30, 900, 1920, 1080, 2  # S = capture device scale

CURSOR = json.loads((FR / "cursor.json").read_text())
CLICKS = [9.75, 11.1, 13.4, 15.55, 21.0, 23.4, 24.1, 24.95, 26.4]


def ease(x):
    x = max(0.0, min(1.0, x))
    return 4 * x ** 3 if x < 0.5 else 1 - (-2 * x + 2) ** 3 / 2


def ease_out(x):
    x = max(0.0, min(1.0, x))
    return 1 - (1 - x) ** 3


# camera keyframes: (time, center x, center y, zoom) in CSS px; eased between neighbours
CAM = [
    (0.0, 960, 540, 1.0),
    (4.0, 880, 470, 1.07),
    (4.7, 960, 540, 1.0),
    (6.2, 960, 540, 1.0),
    (7.6, 960, 640, 1.22),
    (12.2, 960, 640, 1.22),
    (13.0, 960, 540, 1.0),
    (13.5, 960, 540, 1.0),
    (14.3, 1328, 706, 1.62),
    (20.6, 1328, 706, 1.62),
    (21.4, 960, 540, 1.0),
    (22.6, 960, 540, 1.0),
    (23.4, 1050, 480, 1.25),
    (30.0, 1050, 480, 1.25),
]


def camera(t):
    for (t0, x0, y0, z0), (t1, x1, y1, z1) in zip(CAM, CAM[1:]):
        if t0 <= t <= t1:
            k = ease((t - t0) / (t1 - t0))
            z = z0 + (z1 - z0) * k
            cx, cy = x0 + (x1 - x0) * k, y0 + (y1 - y0) * k
            break
    else:
        cx, cy, z = CAM[-1][1:]
    cw, ch = W / z, H / z
    x = min(max(cx - cw / 2, 0), W - cw)
    y = min(max(cy - ch / 2, 0), H - ch)
    return x, y, z


# captions: (layer, t_in, t_out, anchor) anchor = where the pill sits on the output frame
CAPS = [
    ("cap1", 1.6, 4.0, "tr"),
    ("cap2", 5.9, 12.1, "tc"),
    ("cap3", 13.9, 20.8, "bl"),
    ("cap4", 22.9, 27.75, "bl"),
]

_cache = {}
def layer(name):
    if name not in _cache:
        _cache[name] = Image.open(L / f"{name}.png").convert("RGBA")
    return _cache[name]


def with_alpha(im, a):
    if a >= 1:
        return im
    im = im.copy()
    im.putalpha(im.getchannel("A").point(lambda v: int(v * a)))
    return im


def frame(f):
    t = f / FPS
    src = Image.open(FR / f"f{f:04d}.jpg").convert("RGB")
    x, y, z = camera(t)
    box = (x * S, y * S, (x + W / z) * S, (y + H / z) * S)
    im = src.resize((W, H), Image.LANCZOS, box=box).convert("RGBA")

    # click ripples, in page space so they ride the camera
    d = ImageDraw.Draw(im, "RGBA")
    c = CURSOR[f]
    px, py = (c["cx"] - x) * z, (c["cy"] - y) * z
    press = 0.0
    for ct in CLICKS:
        dt = t - ct
        if 0 <= dt < 0.45:
            k = ease_out(dt / 0.45)
            r = (10 + 30 * k) * z
            a = int(110 * (1 - k))
            d.ellipse((px - r, py - r, px + r, py + r), outline=(10, 10, 10, a), width=max(2, int(3 * z)))
        if -0.08 <= dt < 0.18:
            press = max(press, 1 - abs(dt - 0.03) / 0.12)

    # cursor
    ca = min(1, max(0, (t - 3.6) / 0.3)) * min(1, max(0, (27.75 - t) / 0.25))
    if ca > 0:
        cur = layer("cursor")
        sc = 0.5 * (1 - 0.12 * max(0, press))
        cw, chh = int(cur.width * sc), int(cur.height * sc)
        cur = with_alpha(cur.resize((cw, chh), Image.LANCZOS), ca)
        im.alpha_composite(cur, (int(px - 6 * sc - 3), int(py - 6 * sc - 3)))

    # captions
    for name, t0, t1, anchor in CAPS:
        if t0 <= t <= t1:
            a = ease_out((t - t0) / 0.35) * min(1, (t1 - t) / 0.3)
            rise = (1 - ease_out((t - t0) / 0.45)) * 18
            cap = with_alpha(layer(name), a)
            m = 36
            if anchor == "tr":
                pos = (W - cap.width - m, m + int(rise))
            elif anchor == "tc":
                pos = ((W - cap.width) // 2, m + int(rise))
            else:
                pos = (m, H - cap.height - m + int(rise))
            im.alpha_composite(cap, pos)

    # dip to white and the end card
    if t >= 27.8:
        wa = ease((t - 27.8) / 0.35)
        im.alpha_composite(Image.new("RGBA", (W, H), (255, 255, 255, int(255 * wa))))
    if t >= 28.05:
        items = [("end_name", 28.05, 0), ("end_role", 28.25, 0), ("end_url", 28.45, 0)]
        name, role, url = layer("end_name"), layer("end_role"), layer("end_url")
        total = name.height + role.height + 10 + url.height
        top = (H - total) // 2 - 10
        ys = {"end_name": top, "end_role": top + name.height + 6, "end_url": top + name.height + role.height + 10}
        for key, t0, _ in items:
            ly = layer(key)
            k = ease_out((t - t0) / 0.55)
            if k <= 0:
                continue
            xpos = (W - ly.width) // 2
            ypos = ys[key] + int((1 - k) * 40)
            if key == "end_name":
                # rises out of a mask, like the hero headline
                ypos2 = ys[key] + int((1 - k) * ly.height * 0.9)
                clip = Image.new("RGBA", (W, H), (0, 0, 0, 0))
                clip.alpha_composite(ly, (xpos, ypos2))
                a = clip.getchannel("A")
                a.paste(0, (0, 0, W, ys[key]))
                a.paste(0, (0, ys[key] + ly.height, W, H))
                clip.putalpha(a)
                im.alpha_composite(clip)
            else:
                im.alpha_composite(with_alpha(ly, k), (xpos, ypos))

    im.convert("RGB").save(OUT / f"o{f:04d}.png", compress_level=1)
    return f


if __name__ == "__main__":
    if len(sys.argv) > 1:
        fs = [round(float(v) * FPS) for v in sys.argv[1].split(",")]
    else:
        fs = range(N)
    with Pool(10) as pool:
        for i, _ in enumerate(pool.imap_unordered(frame, fs, chunksize=4)):
            if i % 100 == 0:
                print(i, flush=True)
