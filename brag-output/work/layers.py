"""Render overlay layers (captions, cursor, end card) as transparent PNGs in Geist."""
from pathlib import Path
from playwright.sync_api import sync_playwright

HERE = Path(__file__).resolve().parent
import base64
FONT = "data:font/woff2;base64," + base64.b64encode((HERE.parents[1] / "front/node_modules/@fontsource-variable/geist/files/geist-latin-wght-normal.woff2").read_bytes()).decode()
OUT = HERE / "layers"
OUT.mkdir(exist_ok=True)

BASE = f"""<style>
@font-face {{ font-family: Geist; src: url('{FONT}') format('woff2'); font-weight: 100 900; }}
html, body {{ margin: 0; background: transparent; font-family: Geist, sans-serif; -webkit-font-smoothing: antialiased; }}
.pill {{ display: inline-flex; align-items: center; gap: 18px; padding: 20px 34px 20px 26px; margin: 30px 60px 70px;
  border-radius: 999px; background: #0a0a0a; color: #fafafa; font-size: 34px; font-weight: 600; letter-spacing: -0.01em;
  box-shadow: 0 18px 50px -18px rgba(0,0,0,.45); }}
.pill b {{ font-weight: 500; font-size: 22px; color: #0a0a0a; background: #fafafa; border-radius: 999px; padding: 5px 12px;
  font-variant-numeric: tabular-nums; letter-spacing: 0; }}
</style>"""

CAPTIONS = [
    ("01", "A portfolio you can talk to"),
    ("02", "Real GitHub history, rising into a 3D skyline"),
    ("03", "An AI assistant that answers from my CV"),
    ("04", "Reach me in one message"),
]

CURSOR = """<svg xmlns="http://www.w3.org/2000/svg" width="64" height="88" viewBox="0 0 16 22">
<path d="M1.5 1.5v16.2l4.1-3.9 2.6 6.1 2.9-1.3-2.6-5.9h5.7z" fill="#0a0a0a" stroke="#fff" stroke-width="1.3" stroke-linejoin="round"/></svg>"""

END = {
    "end_name": '<div style="font-size:200px;font-weight:900;letter-spacing:-0.045em;line-height:.92;color:#0a0a0a;padding:10px 20px">Iheb Hamdi</div>',
    "end_role": '<div style="font-size:46px;font-weight:600;letter-spacing:-0.015em;color:#0a0a0a;padding:10px 20px">Full-Stack Engineer <span style="color:#a3a3a3">·</span> Barcelona, Spain</div>',
    "end_url": '<div style="display:inline-flex;align-items:center;gap:14px;margin:30px 60px 70px;padding:20px 34px;border-radius:999px;background:#0a0a0a;color:#fafafa;font-size:34px;font-weight:600;box-shadow:0 18px 50px -18px rgba(0,0,0,.45)">hamdiheb.vercel.app <span style="font-size:30px">→</span></div>',
    "end_sub": '<div style="font-size:30px;font-weight:500;color:#737373;padding:10px 20px">Ask the AI assistant · see the skyline · say hello</div>',
}

with sync_playwright() as pw:
    b = pw.chromium.launch()
    p = b.new_page(viewport={"width": 1920, "height": 400})
    def shot(html, name, sel):
        p.set_content(BASE + html)
        p.evaluate("document.fonts.ready")
        p.wait_for_timeout(150)
        p.locator(sel).first.screenshot(path=str(OUT / f"{name}.png"), omit_background=True)
    for i, (n, text) in enumerate(CAPTIONS):
        shot(f'<div id="w" style="display:inline-block"><div class="pill"><b>{n}</b>{text}</div></div>', f"cap{i+1}", "#w")
    for name, html in END.items():
        shot(f'<div id="w" style="display:inline-block">{html}</div>', name, "#w")
    p.set_viewport_size({"width": 200, "height": 200})
    shot(f'<div id="w" style="display:inline-block;padding:6px">{CURSOR}</div>', "cursor", "#w")
    b.close()
print("ok")
