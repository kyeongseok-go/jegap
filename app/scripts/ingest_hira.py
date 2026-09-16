#!/usr/bin/env python3
"""심평원 비급여 공개가격 전량 인제스트 → app/data/hira.json.gz

필드 확정: 2026-09-16 실호출 검증 완료 (getNonPaymentItemHospDtlList).
  ykiho(암호화 요양기호) yadmNm(기관명) clCdNm(종별) sidoCdNm sgguCdNm
  npayCd(항목코드) npayKorNm(표준 항목명) curAmt(현재 금액) adtFrDd(적용시작일)
용법: DATA_GO_KR_KEY=... python3 ingest_hira.py <출력.json.gz>
"""
import sys, os, json, gzip, time, urllib.request, urllib.parse
from collections import defaultdict
from statistics import median

KEY = os.environ.get("DATA_GO_KR_KEY") or sys.exit("DATA_GO_KR_KEY 필요")
OUT = sys.argv[1] if len(sys.argv) > 1 else "hira.json.gz"
B = "https://apis.data.go.kr/B551182/nonPaymentDamtInfoService/getNonPaymentItemHospDtlList"
ROWS = 1000

def fetch(page, tries=4):
    q = urllib.parse.urlencode({"serviceKey": KEY, "numOfRows": ROWS, "pageNo": page, "_type": "json"})
    for t in range(tries):
        try:
            with urllib.request.urlopen(f"{B}?{q}", timeout=90) as r:
                d = json.loads(r.read().decode("utf-8"))
            body = d["response"]["body"]
            return body["totalCount"], body["items"]["item"] if body["items"] else []
        except Exception as e:
            if t == tries - 1: raise
            time.sleep(3 * (t + 1))

t0 = time.time()
total, first = fetch(1)
pages = -(-total // ROWS)
print(f"total {total} rows, {pages} pages", flush=True)

hosp = {}                                  # ykiho → meta
prices = defaultdict(lambda: defaultdict(list))   # ykiho → npayCd → [amt]
names = {}                                 # npayCd → 표준 항목명

def take(items):
    for it in items:
        y = it.get("ykiho"); amt = it.get("curAmt")
        if not y or not isinstance(amt, (int, float)) or amt <= 0: continue
        if y not in hosp:
            hosp[y] = {
                "name": str(it.get("yadmNm") or "").strip(),
                "sido": str(it.get("sidoCdNm") or "").strip(),
                "sigungu": str(it.get("sgguCdNm") or "").strip(),
                "kind": str(it.get("clCdNm") or "").strip(),
            }
        cd = str(it.get("npayCd") or "")
        if not cd: continue
        names.setdefault(cd, str(it.get("npayKorNm") or "").strip())
        prices[y][cd].append(int(amt))

take(first)
for p in range(2, pages + 1):
    _, items = fetch(p)
    take(items)
    if p % 25 == 0: print(f"page {p}/{pages} {time.time()-t0:.0f}s", flush=True)

out = []
for y, m in hosp.items():
    items = []
    for cd, arr in prices[y].items():
        # 같은 코드의 세부 변형(예: 1인실 일반/특실)은 중앙값으로 대표 — 산식은 /method에 공개
        items.append([cd, names.get(cd, cd), int(median(arr))])
    if items:
        out.append({"id": y, **m, "items": items})

print(f"hospitals {len(out)}, items {sum(len(o['items']) for o in out)} {time.time()-t0:.0f}s", flush=True)
with gzip.open(OUT, "wt", encoding="utf-8") as f:
    json.dump(out, f, ensure_ascii=False, separators=(",", ":"))
print(f"wrote {OUT}: {os.path.getsize(OUT)/1e6:.1f}MB", flush=True)
