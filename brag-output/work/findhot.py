import json, capture as C
from playwright.sync_api import sync_playwright
with sync_playwright() as pw:
    b=pw.chromium.launch(); ctx=b.new_context(viewport={"width":1920,"height":1080})
    ctx.add_init_script(C.INIT); p=ctx.new_page()
    p.clock.install(time=1791369000000); p.clock.pause_at(1791369001000)
    p.goto(C.URL); p.clock.run_for(1500)
    y=p.evaluate(C.JS_RECT,"#github")["top"]-70; p.evaluate("y=>scrollTo(0,y)",y)
    for i in range(90): p.clock.run_for(33); p.evaluate("__sync()")
    r=p.evaluate(C.JS_RECT,"#github canvas"); print(r)
    best=None
    for gx in range(900,1450,6):
        for gy in range(650,960,6):
            p.mouse.move(gx,gy); p.clock.run_for(20)
            txt=p.evaluate("document.querySelector('[role=tooltip]').textContent")
            if txt.startswith('36 '):
                best=(gx,gy,txt); break
        if best: break
    print(best)
    if best:
        json.dump({"fx":(best[0]-r["x"])/r["w"],"fy":(best[1]-r["y"])/r["h"]},open("data/skyhot.json","w"))
