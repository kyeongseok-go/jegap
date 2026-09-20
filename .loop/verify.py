#!/usr/bin/env python3
"""T6 고강도 검증 — LOOP.md §5 의 항목을 기계가 판정할 수 있는 만큼 전수 수행한다.
서버가 localhost:4000 에 떠 있어야 한다.  사용: python3.14 .loop/verify.py
"""
import re, sys, json, html, urllib.request, urllib.parse
from collections import defaultdict

ORIGIN = "http://localhost:4000"
fails, warns = [], []

def get(path):
    try:
        with urllib.request.urlopen(ORIGIN + urllib.parse.quote(path, safe="/?=&%"), timeout=30) as r:
            return r.status, r.read().decode("utf-8", "replace")
    except urllib.error.HTTPError as e:
        return e.code, ""
    except Exception as e:
        return 0, str(e)

def strip(h):
    h = re.sub(r"(?is)<(script|style|svg)\b.*?</\1>", " ", h)
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", h)))

def pick(api, q, n=1):
    s, b = get(f"{api}?q={q}")
    try: return [x["id"] for x in json.loads(b).get("items", [])][:n]
    except Exception: return []

# ── 검사 대상 경로 ──
ROUTES = ["/", "/h", "/a", "/f", "/p", "/fr", "/oil", "/gr", "/method", "/terms", "/p/서울"]
for base, api, q in (("/h", "/api/hsearch", "서울"), ("/a", "/api/asearch", "수학"),
                     ("/f", "/api/fsearch", "서울"), ("/fr", "/api/frsearch", "치킨"),
                     ("/oil", "/api/oilsearch", "종로"), ("/gr", "/api/grsearch", "이마트")):
    for i in pick(api, q):
        ROUTES.append(f"{base}/{i}")

print(f"검사 경로 {len(ROUTES)}개\n")

# 1) 전 경로 200
bodies = {}
for r in ROUTES:
    st, b = get(r)
    if st != 200: fails.append(f"[상태] {r} → HTTP {st}")
    else: bodies[r] = b
print(f"1. HTTP 200 : {len(bodies)}/{len(ROUTES)}")

# 2) 내부 링크 전수 200
seen, broken = set(), []
for r, b in bodies.items():
    for href in set(re.findall(r'href="(/[^"#?]*)"', b)):
        if href in seen: continue
        seen.add(href)
        # 2026-09-20: 여기서 /design 을 "로컬 오탐"이라며 제외했다가 E2E 에서 실제 404 로 걸렸다.
        # 프로덕션에서 되더라도 로컬에서 404 면 그건 버그다. 예외를 두지 않는다.
        st, _ = get(href)
        if st != 200: broken.append(f"{href} (from {r}) → {st}")
if broken: fails += [f"[링크] {x}" for x in broken]
print(f"2. 내부 링크 : {len(seen)}개 검사, 깨짐 {len(broken)}")

# 3) a11y — h1 하나, 헤딩 건너뛰기 없음, input 에 label, img 에 alt
for r, b in bodies.items():
    h1 = re.findall(r"<h1\b", b)
    if len(h1) != 1: fails.append(f"[a11y] {r} → h1 {len(h1)}개 (1개여야 함)")
    levels = [int(m) for m in re.findall(r"<h([1-6])\b", b)]
    for a, c in zip(levels, levels[1:]):
        if c > a + 1: fails.append(f"[a11y] {r} → 헤딩 h{a}→h{c} 건너뜀"); break
    for m in re.finditer(r"<input\b[^>]*>", b):
        tag = m.group(0)
        if 'type="hidden"' in tag or "type='hidden'" in tag: continue
        if not re.search(r'aria-label=|aria-labelledby=|id="', tag):
            fails.append(f"[a11y] {r} → label 없는 input: {tag[:80]}")
    for m in re.finditer(r"<img\b[^>]*>", b):
        if "alt=" not in m.group(0): fails.append(f"[a11y] {r} → alt 없는 img")
print(f"3. a11y      : 위반 {len([x for x in fails if x.startswith('[a11y]')])}")

# 4) 헌법 감사 — 판정·등급·추천 표현
BAN = ["좋은 단지", "나쁜 단지", "추천합니다", "추천 드립니다", "A등급", "B등급", "등급을",
       "저렴합니다", "비쌉니다", "바가지", "최고의", "최악", "훌륭한", "형편없"]
for r, b in bodies.items():
    t = strip(b)
    for w in BAN:
        if w in t: fails.append(f"[헌법] {r} → 금지 표현 '{w}'")
print(f"4. 헌법 감사 : 위반 {len([x for x in fails if x.startswith('[헌법]')])}")

# 5) 기준 시점 표기 — 검진 상세 화면에 출처/기준이 드러나야 한다
for r, b in bodies.items():
    if r.count("/") < 2: continue
    t = strip(b)
    if not re.search(r"기준|공시|조사|공개", t):
        fails.append(f"[출처] {r} → 기준 시점/출처 표기 없음")
print(f"5. 출처 표기 : 위반 {len([x for x in fails if x.startswith('[출처]')])}")

# 6) 보안 헤더 — 값이 아니라 **모드**를 눈에 보이게 찍는다.
#    2026-09-20: CSP 를 강제 모드로 임시 전환해 시험한 뒤 복원했다고 믿고 커밋했는데
#    실제로는 강제 모드가 그대로 남아 있었다(grep 출력을 오독). 사용자가 승인하지 않은
#    설정이 배포될 뻔했다. 임시 전환은 반드시 여기 찍히게 한다.
import urllib.request as _u
try:
    with _u.urlopen(ORIGIN + "/", timeout=20) as r:
        h = {k.lower(): v for k, v in r.headers.items()}
except Exception:
    h = {}
csp_enforce = "content-security-policy" in h
csp_report = "content-security-policy-report-only" in h
mode = "강제(Content-Security-Policy)" if csp_enforce else ("Report-Only" if csp_report else "없음")
print(f"6. 보안 헤더  : CSP {mode}"
      f" · X-Frame-Options {h.get('x-frame-options','없음')}"
      f" · nosniff {'O' if h.get('x-content-type-options')=='nosniff' else 'X'}")
if not (csp_enforce or csp_report): fails.append("[헤더] CSP 헤더가 없다")
if not h.get("x-frame-options"): fails.append("[헤더] X-Frame-Options 가 없다")

# 7) 픽스처 유출
import os
ALLOWED = {"kapt.json.gz","hira.json.gz","academy.json.gz","funeral.json.gz","living.json.gz",
           "goodprice.json.gz","highlights.json","franchise.json.gz","oil.json.gz","goods.json.gz"}
stray = [f for f in os.listdir("app/data") if f not in ALLOWED]
if stray: fails.append(f"[데이터] app/data 에 허용 목록 밖 파일: {stray}")
print(f"7. 데이터 격리: 이상 {len(stray)}")

print()
if fails:
    print(f"❌ 실패 {len(fails)}건")
    for f in fails[:40]: print("  ", f)
    sys.exit(1)
print("✅ 전 항목 통과")
