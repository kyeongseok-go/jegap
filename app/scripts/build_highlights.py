#!/usr/bin/env python3
"""크로스 도메인 하이라이트 사전계산 → data/highlights.json
각 도메인 엔진과 동일 규칙(같은 유사군, 중앙값 대비 배수, MIN 30)으로
'가장 차이가 큰 사례' 하나씩을 뽑는다. 데이터 갱신 시 재실행."""
import gzip, json, os
from collections import defaultdict
from statistics import median

def med(vals):
    from statistics import median as _m
    return _m(vals)

D = os.path.join(os.path.dirname(__file__), "..", "data")
def load(n): return json.load(gzip.open(os.path.join(D, n), "rt", encoding="utf-8"))
out = []

# 장례 · 병원: 기관×항목 — (code|시도|종별) 유사군, 배수 최대 사례
CORE = {
    "funeral.json.gz": lambda n: n.startswith("시설임대료"),
    "hira.json.gz": lambda n: any(k in n for k in ("MRI", "초음파", "도수치료", "체외충격파")),
}
# 자료 기준일 — 과거 공시를 현재 가격처럼 읽히게 두지 않는다
ASOF = {"funeral.json.gz": "2023.6 공시", "hira.json.gz": "심평원 공개 기준"}
for fname, dom, href, peerkey in [
    ("funeral.json.gz", "장례비", "/f", lambda o, c: f"{c}|{o['sido']}"),
    ("hira.json.gz", "병원비", "/h", lambda o, c: f"{c}|{o['sido']}|{o['kind']}"),
]:
    orgs = load(fname)
    peers = defaultdict(list)
    for o in orgs:
        for it in o["items"]:
            if len(it) > 3 and it[3] == 0: continue   # 조건 상이 — 표본에서 제외
            peers[peerkey(o, it[0])].append(it[2])
    best = None
    core = CORE[fname]
    for o in orgs:
        for c, n, p, *rest in o["items"]:
            if rest and rest[0] == 0: continue
            if not core(n): continue
            arr = peers[peerkey(o, c)]
            if len(arr) < 30: continue
            med_val = round(med(arr))
            if med_val < 1000: continue                  # 엔진과 동일: 저액 항목 제외
            mult = p / med_val
            if mult > 30 or mult < 2: continue       # 오류 의심 상한 + 심심한 사례 하한
            if best is None or mult > best[0]:
                best = (mult, o, c, n, p, med_val, len(arr))
    if best:
        mult, o, c, n, p, medv, cnt = best
        out.append({
            "dom": dom, "href": f"{href}/{o['id']}",
            "fact": f"{o['name']}의 {n} {p:,}원 — 유사 기관 {cnt}곳 중간값({medv:,}원)의 {mult:.1f}배 · {ASOF[fname]}",
        })

# 생활물가: 최근 3년 동월 대비 최다 상승 품목(전국 중간값 기준, 단절 제외)
lv = load("living.json.gz")
SIDO = ["서울","부산","대구","인천","전남광주(광주)","대전","울산","경기","강원","충북","충남","전북","전남광주(전남)","경북","경남","제주"]
months = lv["months"]
names = {i["code"]: i["name"] for i in lv["items"]}
def nat_median(code):
    res = []
    for i in range(len(months)):
        vs = [lv["series"].get(f"{code}|{s}", [None]*len(months))[i] for s in SIDO]
        vs = [v for v in vs if v]
        res.append(med(vs) if len(vs) >= 10 else None)
    return res

best = None
for code in names:
    if code == "BD": continue
    m = nat_median(code)
    last = max((i for i, v in enumerate(m) if v), default=-1)
    if last < 36: continue
    a, b = m[last-36], m[last]
    if not a or not b: continue
    if abs(b/a - 1) > 0.6: continue                  # 단절 의심 제외
    rise = (b - a) / a * 100
    if best is None or rise > best[0]:
        best = (rise, code, a, b, months[last])
if best:
    rise, code, a, b, ym = best
    out.append({
        "dom": "생활물가", "href": "/p",
        "fact": f"전국 {names[code]} 3년 새 {round(a):,}원 → {round(b):,}원 (+{rise:.0f}%, 동월 대비 · {ym[:4]}.{ym[4:]} 조사)",
    })

with open(os.path.join(D, "highlights.json"), "w", encoding="utf-8") as f:
    json.dump(out, f, ensure_ascii=False, indent=1)
for h in out: print(h["dom"], "→", h["fact"])
