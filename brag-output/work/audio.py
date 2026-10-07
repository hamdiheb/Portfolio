"""Soft D-major soundtrack + in-key UI sounds, mixed through one shared room. Writes work/audio.wav."""
import numpy as np
from scipy.signal import fftconvolve, butter, sosfilt
from scipy.io import wavfile
from pathlib import Path

SR = 48000
DUR = 30.0
N = int(SR * DUR)
rng = np.random.default_rng(7)
BPM = 92
BEAT = 60 / BPM
BAR = 4 * BEAT


def hz(m):
    return 440 * 2 ** ((m - 69) / 12)


def env(n, a, r, sus=1.0):
    t = np.arange(n) / SR
    e = np.minimum(1, t / max(a, 1e-4)) * sus
    rel = np.clip((n / SR - t) / max(r, 1e-4), 0, 1)
    return e * rel


def lp(x, fc, order=2):
    return sosfilt(butter(order, fc, "low", fs=SR, output="sos"), x)


def hp(x, fc, order=2):
    return sosfilt(butter(order, fc, "high", fs=SR, output="sos"), x)


def add(buf, sig, t, gain=1.0, pan=0.0):
    i = int(t * SR)
    if i >= N:
        return
    sig = sig[: N - i] * gain
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    buf[0, i:i + len(sig)] += sig * l * 1.41
    buf[1, i:i + len(sig)] += sig * r * 1.41


music = np.zeros((2, N))
sfx = np.zeros((2, N))

# Dmaj9 – Bm7 – Gmaj7 – Asus/A, one bar each (MIDI notes)
CHORDS = [
    [50, 57, 61, 64, 66],   # D A C# E F#
    [47, 54, 57, 62, 66],   # B F# A D F#
    [43, 50, 54, 57, 62],   # G D F# A D
    [45, 52, 57, 62, 64],   # A E A D E
]
ROOTS = [38, 35, 31, 33]

def pad_note(m, dur):
    n = int(dur * SR)
    t = np.arange(n) / SR
    s = sum(np.sin(2 * np.pi * hz(m) * (1 + d) * t + p) for d, p in [(-0.003, 0), (0, 1.3), (0.0035, 2.1)])
    s += 0.25 * np.sin(2 * np.pi * hz(m) * 2 * t)
    return lp(s, 1800) * env(n, 0.9, 1.2) * 0.06


def ep_note(m, vel=1.0, dur=1.4):
    n = int(dur * SR)
    t = np.arange(n) / SR
    mod = np.sin(2 * np.pi * hz(m) * t) * 1.2 * np.exp(-t * 6)
    s = np.sin(2 * np.pi * hz(m) * t + mod) + 0.15 * np.sin(2 * np.pi * hz(m) * 2 * t)
    return s * np.exp(-t * 2.6) * env(n, 0.004, 0.3) * 0.11 * vel


def bass_note(m, dur):
    n = int(dur * SR)
    t = np.arange(n) / SR
    s = np.sin(2 * np.pi * hz(m) * t) + 0.2 * np.sin(2 * np.pi * hz(m) * 2 * t)
    return s * env(n, 0.02, 0.25) * np.exp(-t * 0.6) * 0.16


def shaker():
    n = int(0.09 * SR)
    s = hp(rng.standard_normal(n), 6000) * np.exp(-np.arange(n) / SR * 45)
    return s * 0.018


bars = int(DUR / BAR) + 1
END_T = 27.8  # outro: everything resolves to D
for b in range(bars):
    t0 = b * BAR
    if t0 >= END_T:
        break
    ch = CHORDS[b % 4]
    for m in ch:
        add(music, pad_note(m, BAR + 0.8), t0, 1.0, rng.uniform(-0.4, 0.4))
    # electric piano: gentle eighth-note arpeggio, thinner in the intro
    pattern = [0, 2, 4, 3, 1, 3, 2, 4]
    for k, idx in enumerate(pattern):
        tt = t0 + k * BEAT / 2
        if tt >= END_T or (t0 < 4.0 and k % 2):
            continue
        vel = (0.9 if k % 2 == 0 else 0.6) * rng.uniform(0.85, 1.0)
        add(music, ep_note(ch[idx] + 12, vel), tt, 1.0, -0.3 + 0.6 * (k % 2))
    # bass and shaker come in with the GitHub scene
    if t0 + BAR > 4.1:
        for beat in (0, 2):
            tt = t0 + beat * BEAT
            if 4.1 <= tt < END_T:
                add(music, bass_note(ROOTS[b % 4], BEAT * 1.8), tt)
        for k in range(8):
            tt = t0 + k * BEAT / 2 + BEAT / 4
            if 5.0 <= tt < END_T:
                add(music, shaker(), tt, 1.0 if k % 2 else 0.6, 0.35)

# outro: a held D add9 that rings out
for m in [38, 50, 57, 62, 64, 66, 69]:
    add(music, pad_note(m, 2.6) * 1.2, END_T)
for k, m in enumerate([74, 78, 81, 86]):
    add(music, ep_note(m, 0.8, 2.5), END_T + 0.25 + k * 0.12, 1.0, -0.3 + 0.2 * k)
add(music, bass_note(38, 2.2), END_T)

# ---- UI sounds, all in D major -------------------------------------------
def tick(m, gain):
    n = int(0.25 * SR)
    t = np.arange(n) / SR
    s = np.sin(2 * np.pi * hz(m) * t) * np.exp(-t * 28) + 0.3 * np.sin(2 * np.pi * hz(m) * 3 * t) * np.exp(-t * 60)
    return s * gain


def bell(m, gain, dur=1.6):
    n = int(dur * SR)
    t = np.arange(n) / SR
    s = np.sin(2 * np.pi * hz(m) * t + 0.8 * np.sin(2 * np.pi * hz(m) * 3.5 * t) * np.exp(-t * 4))
    return s * np.exp(-t * 3.2) * env(n, 0.003, 0.2) * gain


def whoosh(dur, gain):
    n = int(dur * SR)
    x = lp(hp(rng.standard_normal(n), 300), 2200)
    shape = np.sin(np.linspace(0, np.pi, n)) ** 2
    return x * shape * gain


CLICKS = [9.75, 11.1, 13.4, 15.55, 21.0, 23.4, 24.1, 24.95, 26.4]
for i, c in enumerate(CLICKS):
    add(sfx, tick([81, 78][i % 2], 0.05), c, 1.0, 0.2)

TYPING = [(23.45, 23.75, "Sara"), (24.15, 24.6, "sara@studio.dev"), (25.0, 25.9, "Loved the skyline. Free for a chat?")]
for t0, t1, text in TYPING:
    for k in range(len(text)):
        n = int(0.03 * SR)
        s = hp(rng.standard_normal(n), 3500) * np.exp(-np.arange(n) / SR * 160) * 0.012
        add(sfx, s, t0 + (t1 - t0) * k / len(text), rng.uniform(0.7, 1.0), rng.uniform(-0.2, 0.3))

for t0, t1 in [(4.1, 5.7), (21.5, 22.8)]:
    add(sfx, whoosh(t1 - t0, 0.02), t0)

# skyline rising: a soft upward D-major run (twice: on arrival and on the 3D toggle)
for start in (5.5, 11.15):
    for k, m in enumerate([74, 78, 81, 85, 86]):
        add(sfx, bell(m, 0.035, 1.2), start + k * 0.09, 1.0, -0.4 + 0.2 * k)

add(sfx, bell(81, 0.05), 13.45)               # chat opens
add(sfx, bell(78, 0.035), 15.6)               # question sent
add(sfx, bell(86, 0.03), 16.35)               # answer starts
for k, m in enumerate([74, 78, 81, 86]):      # message sent
    add(sfx, bell(m, 0.05, 2.0), 27.05 + k * 0.07, 1.0, -0.2 + 0.15 * k)

# ---- one room for everything -----------------------------------------------
def room(sec=2.2):
    n = int(sec * SR)
    t = np.arange(n) / SR
    ir = np.stack([lp(rng.standard_normal(n), 5000) * np.exp(-t * 3.0) for _ in range(2)])
    ir[:, : int(0.012 * SR)] *= np.linspace(0, 1, int(0.012 * SR))
    return ir / np.abs(ir).sum(axis=1, keepdims=True) * 18

ir = room()
def verb(x):
    return np.stack([fftconvolve(x[c], ir[c])[:N] for c in range(2)])

mix = music + sfx
wet = verb(music * 0.22 + sfx * 0.45)
out = mix + wet
out = np.stack([hp(out[c], 30) for c in range(2)])

# fades and gentle bus compression (soft knee)
t = np.arange(N) / SR
out *= np.minimum(1, t / 0.4) * np.clip((DUR - t) / 0.9, 0, 1)
out = np.tanh(out * 1.3) / 1.3
out *= 0.89 / np.abs(out).max()
wavfile.write(Path(__file__).with_name("audio.wav"), SR, (out.T * 32767).astype(np.int16))
print("peak ok, rms dBFS:", 20 * np.log10(np.sqrt((out ** 2).mean())))
