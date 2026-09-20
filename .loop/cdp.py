"""CDP로 실제 디바이스 에뮬레이션 후 전체 페이지 캡처 + 가로 넘침 측정.
용법: python3.14 cdp.py <url> <width> <out.png>
헤드리스 --window-size 는 미디어쿼리를 제대로 안 잡는다(과거 오진 원인). Emulation.setDeviceMetricsOverride 를 쓴다."""
import json, subprocess, time, sys, base64, urllib.request, websocket

URL, W, OUT = sys.argv[1], int(sys.argv[2]), sys.argv[3]
MOBILE = W < 768
PORT = 9333
proc = subprocess.Popen(["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "--headless=new", f"--remote-debugging-port={PORT}", "--disable-gpu", "--hide-scrollbars",
    "--no-first-run", "--remote-allow-origins=*", "--user-data-dir=/tmp/cdp-profile", "about:blank"],
    stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
try:
    for _ in range(80):
        try:
            tabs = json.load(urllib.request.urlopen(f"http://127.0.0.1:{PORT}/json")); break
        except Exception: time.sleep(.25)
    else: sys.exit("devtools 미기동")
    ws = websocket.create_connection([t for t in tabs if t["type"] == "page"][0]["webSocketDebuggerUrl"],
                                     timeout=40, max_size=200*1024*1024)
    n = [0]
    def cmd(method, **params):
        n[0] += 1
        ws.send(json.dumps({"id": n[0], "method": method, "params": params}))
        while True:
            m = json.loads(ws.recv())
            if m.get("id") == n[0]:
                if "error" in m: raise RuntimeError(m["error"])
                return m.get("result", {})
    cmd("Emulation.setDeviceMetricsOverride", width=W, height=900, deviceScaleFactor=1, mobile=MOBILE)
    cmd("Page.enable"); cmd("Page.navigate", url=URL)
    time.sleep(4)
    def ev(expr):
        r = cmd("Runtime.evaluate", expression=expr, returnByValue=True, awaitPromise=True)
        return r["result"].get("value")
    ev("document.querySelectorAll('details.pnotes').forEach(d=>d.open=true)")
    time.sleep(1)
    info = ev("JSON.stringify({iw:innerWidth,sw:document.documentElement.scrollWidth,"
              "over:[...document.querySelectorAll('body *')].filter(e=>e.getBoundingClientRect().right>innerWidth+1)"
              ".slice(0,6).map(e=>(e.className||e.tagName)+'@'+Math.round(e.getBoundingClientRect().right)),"
              "mq:matchMedia('(max-width:600px)').matches})")
    print(info)
    m = cmd("Page.getLayoutMetrics")["cssContentSize"]
    cmd("Emulation.setDeviceMetricsOverride", width=W, height=min(int(m["height"]), 16000),
        deviceScaleFactor=1, mobile=MOBILE)
    time.sleep(1)
    data = cmd("Page.captureScreenshot", format="png", captureBeyondViewport=True)["data"]
    open(OUT, "wb").write(base64.b64decode(data))
    print("wrote", OUT)
finally:
    proc.terminate()
