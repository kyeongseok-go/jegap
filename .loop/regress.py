#!/usr/bin/env python3
"""기존 도메인 회귀 감시 — 새 도메인을 붙이다 살아 있는 5개를 깨뜨리지 않기 위한 것.

  python3.14 .loop/regress.py --save    # 현재 화면을 기준선으로 저장
  python3.14 .loop/regress.py --check   # 기준선과 대조. 다르면 diff 출력 + exit 1

기준선은 .loop/baseline/ 에 '보이는 텍스트'로 저장한다. 바이트 해시가 아니라 텍스트라
무엇이 어떻게 달라졌는지 사람이 바로 읽을 수 있다. 의도한 변경이면 --save 로 갱신하고
그 이유를 커밋 메시지에 남긴다. 말없이 갱신하지 말 것.
"""
import os, re, sys, json, html, time, subprocess, urllib.request, urllib.parse, difflib, signal

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
APP = os.path.join(ROOT, "app")
BASE = os.path.join(ROOT, ".loop", "baseline")
MAN = os.path.join(BASE, "_manifest.json")
PORT = 4000
ORIGIN = f"http://localhost:{PORT}"

STATIC = ["/", "/h", "/a", "/f", "/p", "/method", "/terms", "/p/서울",
          "/fr", "/oil", "/gr"]   # 신규 3종도 이제 감시 대상
# 도메인별 상세 1건 — 검색 API로 대표 id를 뽑아 manifest에 고정한다
PROBES = [("/h", "/api/hsearch", "서울"), ("/a", "/api/asearch", "수학"), ("/f", "/api/fsearch", "서울")]

def slug(path): return re.sub(r"[^0-9A-Za-z가-힣]+", "_", path).strip("_") or "root"

def get(path, tries=3):
    url = ORIGIN + urllib.parse.quote(path, safe="/?=&%")
    for i in range(tries):
        try:
            with urllib.request.urlopen(url, timeout=30) as r:
                return r.status, r.read().decode("utf-8", "replace")
        except Exception as e:
            if i == tries - 1: return 0, f"ERROR {e}"
            time.sleep(1.5)

def visible(h):
    h = re.sub(r"(?is)<(script|style|svg)\b.*?</\1>", " ", h)
    t = html.unescape(re.sub(r"<[^>]+>", "\n", h))
    lines = [re.sub(r"\s+", " ", x).strip() for x in t.split("\n")]
    return "\n".join(x for x in lines if x)

def serve():
    env = dict(os.environ, PATH=os.path.expanduser("~/.local/node/bin") + ":" + os.environ.get("PATH", ""))
    subprocess.run(["bash", "-lc", f"lsof -ti:{PORT} | xargs kill -9 2>/dev/null || true"], cwd=APP)
    p = subprocess.Popen(["npx", "next", "start", "-p", str(PORT)], cwd=APP, env=env,
                         stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, start_new_session=True)
    for _ in range(60):
        s, _b = get("/", tries=1)
        if s == 200: return p
        time.sleep(1)
    p.terminate(); sys.exit("서버 기동 실패 — npm run build 부터 확인할 것")

def routes(save):
    man = {} if save else json.load(open(MAN, encoding="utf-8"))
    out = list(STATIC)
    if save:
        picked = {}
        for base, api, q in PROBES:
            s, body = get(f"{api}?q={q}")   # get()이 한 번만 인코딩한다 — 여기서 미리 quote하면 %가 이중 인코딩된다
            items = json.loads(body).get("items", []) if s == 200 else []
            if items: picked[base] = f"{base}/{items[0]['id']}"
        man = {"details": picked}
        json.dump(man, open(MAN, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    out += list(man["details"].values())
    return out

def main():
    save = "--save" in sys.argv
    os.makedirs(BASE, exist_ok=True)
    if not save and not os.path.exists(MAN):
        sys.exit("기준선 없음 — 먼저 --save 로 만들 것")
    p = serve()
    try:
        bad, changed = [], []
        for r in routes(save):
            st, body = get(r)
            if st != 200:
                bad.append(f"{r} → HTTP {st}"); continue
            txt = visible(body)
            f = os.path.join(BASE, slug(r) + ".txt")
            if save:
                open(f, "w", encoding="utf-8").write(txt)
            else:
                if not os.path.exists(f):
                    changed.append(f"{r} → 기준선에 없는 경로(신규). --save 로 편입할 것"); continue
                old = open(f, encoding="utf-8").read()
                if old != txt:
                    d = list(difflib.unified_diff(old.split("\n"), txt.split("\n"),
                                                  "기준선", "현재", lineterm="", n=1))
                    changed.append(f"{r}\n" + "\n".join(d[:40]))
        if save:
            print(f"기준선 저장 완료: {len(routes(False))}개 경로 → .loop/baseline/")
            if bad: print("⚠ 200이 아닌 경로:", *bad, sep="\n  ")
            return 0 if not bad else 1
        if bad or changed:
            print("회귀 감지")
            for x in bad: print(" [상태]", x)
            for x in changed: print(" [변경]", x)
            return 1
        print(f"회귀 없음 — {len(routes(False))}개 경로 기준선 일치")
        return 0
    finally:
        try: os.killpg(os.getpgid(p.pid), signal.SIGKILL)
        except Exception: p.kill()

sys.exit(main())
