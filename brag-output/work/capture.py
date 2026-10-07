"""Drive the real portfolio (Vite dev server) frame by frame on a frozen clock.

Every frame: advance the page's fake clock by one frame, apply the scripted
scroll / mouse / keyboard state for that time, sync CSS animations to the fake
clock, screenshot at 2x. Cursor positions are logged for compositing.

usage: python3 capture.py [--only t1,t2,...] [--out DIR]
"""
import json, math, sys, os, time
from pathlib import Path
from playwright.sync_api import sync_playwright

HERE = Path(__file__).resolve().parent
URL = "http://127.0.0.1:5199/"
FPS = 30
DUR = 30.0
N = int(DUR * FPS)
W, H = 1920, 1080

args = sys.argv[1:]
only = None
out = HERE / "frames"
if "--only" in args:
    only = [float(x) for x in args[args.index("--only") + 1].split(",")]
if "--out" in args:
    out = Path(args[args.index("--out") + 1])
out.mkdir(parents=True, exist_ok=True)
only_frames = None if only is None else {round(t * FPS) for t in only}

contrib = (HERE / "data/contrib.json").read_text()
profile = (HERE / "data/profile.json").read_text()

# The answer the mocked /api/chat streams. Content is taken from the CV.
ANSWER = (
    "Mostly JavaScript and SQL — React on the front end, Node.js and Express on the "
    "back end, and PostgreSQL for data. At university I also worked with Python, Java and C/C++."
)

INIT = r"""
(() => {
  // framer-motion uses WAAPI when it exists; WAAPI runs on the real clock. Force its JS path.
  delete Element.prototype.animate;
  const CONTRIB = __CONTRIB__;
  const PROFILE = __PROFILE__;
  const ANSWER = __ANSWER__;
  const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { 'Content-Type': 'application/json' } });
  const realFetch = window.fetch.bind(window);
  window.fetch = async (input, init) => {
    const u = String(input && input.url ? input.url : input);
    if (u.includes('/api/health')) return json({ ok: true });
    if (u.includes('github-contributions-api')) return json(CONTRIB);
    if (u.includes('api.github.com/users')) return json(PROFILE);
    if (u.includes('/api/contact')) { await new Promise(r => setTimeout(r, 650)); return json({ ok: true }); }
    if (u.includes('/api/chat')) {
      const words = ANSWER.match(/\S+\s*/g);
      const enc = new TextEncoder();
      let i = 0;
      const body = new ReadableStream({ start(c) {
        const step = () => { if (i >= words.length) { c.close(); return } c.enqueue(enc.encode(words[i++])); setTimeout(step, 55) };
        setTimeout(step, 750);
      }});
      return new Response(body, { status: 200, headers: { 'Content-Type': 'text/plain' } });
    }
    return realFetch(input, init);
  };
  // CSS animations/transitions run on the real clock: pin them to the fake one.
  window.__sync = () => {
    const now = performance.now();
    for (const a of document.getAnimations()) {
      if (a.__v === undefined) a.__v = now;
      const t = now - a.__v;
      const end = a.effect ? a.effect.getComputedTiming().endTime : Infinity;
      if (end !== Infinity && t >= end) { try { a.finish() } catch (e) {} }
      else { a.pause(); a.currentTime = t; }
    }
  };
})();
"""
INIT = (INIT.replace("__CONTRIB__", contrib).replace("__PROFILE__", profile)
        .replace("__ANSWER__", json.dumps(ANSWER)))


def ease(x):
    x = max(0.0, min(1.0, x))
    return 4 * x ** 3 if x < 0.5 else 1 - (-2 * x + 2) ** 3 / 2


def ease_out(x):
    x = max(0.0, min(1.0, x))
    return 1 - (1 - x) ** 3


# ---- timeline ---------------------------------------------------------------
# targets are resolved lazily (at the event's start time) from the live DOM
JS_RECT = """(sel) => { let el;
  if (sel.startsWith('text=')) { const t = sel.slice(5); el = [...document.querySelectorAll('button')].find(b => b.textContent.includes(t)); }
  else el = document.querySelector(sel);
  if (!el) return null; const r = el.getBoundingClientRect();
  return { x: r.x, y: r.y, w: r.width, h: r.height, top: r.top + scrollY }; }"""

SKY_HOT = json.loads((HERE / "data/skyhot.json").read_text()) if (HERE / "data/skyhot.json").exists() else None

scrolls = [  # (t0, t1, target fn) target = document scrollY
    (4.1, 5.7, lambda p: p.evaluate(JS_RECT, "#github")["top"] - 70),
    (21.5, 22.8, lambda p: p.evaluate(JS_RECT, "#contact")["top"] + 80),
]
# cursor moves: (t0, t1, target) target -> (x, y) viewport px
def center(sel, dx=0.5, dy=0.5):
    def f(p):
        r = p.evaluate(JS_RECT, sel)
        return (r["x"] + r["w"] * dx, r["y"] + r["h"] * dy)
    return f

def sky_hot(p):
    r = p.evaluate(JS_RECT, "#github canvas")
    if SKY_HOT:
        return (r["x"] + SKY_HOT["fx"] * r["w"], r["y"] + SKY_HOT["fy"] * r["h"])
    return (r["x"] + r["w"] * 0.8, r["y"] + r["h"] * 0.5)

moves = [
    (3.6, 4.0, lambda p: (1240, 980)),
    (6.9, 7.8, sky_hot),
    (9.0, 9.6, center('button[aria-label="Flat heat map"]')),
    (10.7, 11.0, center('button[aria-label="3D skyline"]')),
    (12.5, 13.3, center('button[title="Ask my AI assistant"]')),
    (14.7, 15.4, center("text=What programming languages", 0.4, 0.55)),
    (15.9, 16.6, lambda p: (1450, 880)),
    (20.4, 20.9, center('button[aria-label="Close chat"]')),
    (21.3, 22.6, lambda p: (1180, 900)),
    (22.9, 23.3, center("#contact-name", 0.25)),
    (23.75, 24.05, center("#contact-email", 0.25)),
    (24.6, 24.9, center("#contact-message", 0.3, 0.3)),
    (25.95, 26.3, center('form[aria-label="Contact form"] button[type=submit]')),
]
clicks = [9.75, 11.1, 13.4, 15.55, 21.0, 23.4, 24.1, 24.95, 26.4]
typing = [  # (t0, t1, text)
    (23.45, 23.75, "Sara"),
    (24.15, 24.6, "sara@studio.dev"),
    (25.0, 25.9, "Loved the skyline. Free for a chat?"),
]


def main():
    with sync_playwright() as pw:
        browser = pw.chromium.launch(args=["--force-color-profile=srgb", "--hide-scrollbars"])
        ctx = browser.new_context(viewport={"width": W, "height": H}, device_scale_factor=2,
                                  reduced_motion="no-preference", color_scheme="light")
        ctx.add_init_script(INIT)
        page = ctx.new_page()
        page.clock.install(time=1791369000000)  # 2026-10-07, mid-morning
        page.clock.pause_at(1791369001000)
        page.goto(URL, wait_until="load")
        page.evaluate("document.fonts.ready")
        page.wait_for_function("[...document.images].every(i => i.complete)")
        page.add_style_tag(content="html{scroll-behavior:auto!important} ::-webkit-scrollbar{display:none}")
        page.mouse.move(1240, 980)

        cursor = [1240.0, 980.0]
        log = []
        active_move = {}
        active_scroll = {}
        typed = {}
        elapsed_ms = 0
        t_start = time.time()
        for f in range(N):
            t = f / FPS
            # advance the fake clock to this frame's time
            target_ms = round(t * 1000)
            if target_ms > elapsed_ms:
                page.clock.run_for(target_ms - elapsed_ms)
                elapsed_ms = target_ms

            for i, (t0, t1, fn) in enumerate(scrolls):
                if t0 <= t <= t1 + 1 / FPS:
                    if i not in active_scroll:
                        active_scroll[i] = (page.evaluate("scrollY"), fn(page))
                    y0, y1 = active_scroll[i]
                    page.evaluate("y => window.scrollTo(0, y)", y0 + (y1 - y0) * ease((t - t0) / (t1 - t0)))

            for i, (t0, t1, fn) in enumerate(moves):
                if t0 <= t <= t1 + 1 / FPS:
                    if i not in active_move:
                        active_move[i] = (tuple(cursor), fn(page))
                        if i == 1:
                            print("sky target", active_move[i][1])
                    (x0, y0), (x1, y1) = active_move[i]
                    k = ease((t - t0) / (t1 - t0))
                    # a slight arc reads as a hand, not a robot
                    arc = math.sin(k * math.pi) * min(60, 0.12 * math.hypot(x1 - x0, y1 - y0))
                    cursor[:] = [x0 + (x1 - x0) * k, y0 + (y1 - y0) * k - arc]
                    page.mouse.move(*cursor)

            for c in clicks:
                if f == round(c * FPS):
                    page.mouse.down(); page.mouse.up()

            for i, (t0, t1, text) in enumerate(typing):
                if t0 <= t <= t1 + 1 / FPS:
                    due = min(len(text), int(len(text) * min(1, (t - t0) / (t1 - t0))) + 1)
                    done = typed.get(i, 0)
                    if due > done:
                        page.keyboard.type(text[done:due])
                        typed[i] = due

            page.evaluate("window.__sync()")
            log.append({"t": t, "cx": cursor[0], "cy": cursor[1]})
            if only_frames is None or f in only_frames:
                page.screenshot(path=str(out / f"f{f:04d}.jpg"), type="jpeg", quality=92)
            if f % 60 == 0:
                print(f"frame {f}/{N}  {time.time() - t_start:.0f}s", flush=True)

        (out / "cursor.json").write_text(json.dumps(log))
        browser.close()


if __name__ == "__main__":
    main()
