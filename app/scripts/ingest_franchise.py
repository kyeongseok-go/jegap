#!/usr/bin/env python3
"""창업비용편 인제스트 — 공정거래위원회 가맹사업 정보공개 → app/data/franchise.json.gz

필드 확정: 2026-09-20 실호출 + data.go.kr Swagger.
  GET apis.data.go.kr/1130000/FftcBrandFntnStatsService/getBrandFntnStats
  파라미터: serviceKey pageNo numOfRows resultType yr(필수)
  응답: yr indutyLclasNm indutyMlsfcNm brandNm corpNm
        jngBzmnJngAmt(가맹금) jngBzmnEduAmt(교육) jngBzmnAssrncAmt(보증) jngBzmnEtcAmt(기타) smtnAmt(합계)

⚠⚠ 금액 단위가 명세에 없다. Swagger 설명에도 '가맹금액' 이라고만 적혀 있고 단위 표기가 없다.
   샘플(고은결김밥): 가맹 5000 / 교육 2000 / 보증 1000 / 기타 30500 / 합계 38500.
   천원이면 3,850만원(그럴듯), 원이면 3.85만원(불가능), 만원이면 3.85억원(과다).
   → 아래 AMT_UNIT_WON 을 1000 으로 두되, **결과 합계의 중앙값이 상식 범위를 벗어나면 거부**한다.
   이것은 명세 확인이 아니라 범위 타당성 추론이다. 사용자 확인 전에는 배포하지 말 것.

용법: DATA_GO_KR_KEY=... python3.14 ingest_franchise.py <출력.json.gz> [--yr 2024] [--dry-run]
"""
import sys, os, re, json, gzip, time, urllib.request, urllib.parse
from statistics import median

OUT = next((a for a in sys.argv[1:] if not a.startswith("-")), "franchise.json.gz")
DRY = "--dry-run" in sys.argv
YR = sys.argv[sys.argv.index("--yr") + 1] if "--yr" in sys.argv else "2024"
KEY = os.environ.get("DATA_GO_KR_KEY")
if not KEY and not DRY: sys.exit("DATA_GO_KR_KEY 필요 (data.go.kr 15110265 활용신청)")

BASE = "https://apis.data.go.kr/1130000/FftcBrandFntnStatsService/getBrandFntnStats"
AMT_UNIT_WON = 1000          # ⚠ 미검증 — 위 주석 참조
# 합계가 이 범위를 벗어나면 단위 해석이 틀린 것으로 보고 거부한다 (1천만원 ~ 3억원)
SANE_TOTAL = (10_000_000, 300_000_000)

FIELDS = [("jngBzmnJngAmt", "jng", "가맹금"), ("jngBzmnEduAmt", "edu", "교육비"),
          ("jngBzmnAssrncAmt", "assrnc", "보증금"), ("jngBzmnEtcAmt", "etc", "기타비용"),
          ("smtnAmt", "smtn", "합계")]

def call(page, rows=1000):
    q = urllib.parse.urlencode({"serviceKey": KEY or "", "pageNo": page, "numOfRows": rows,
                                "resultType": "json", "yr": YR})
    url = f"{BASE}?{q}"
    if DRY:
        print(f"  [dry] {url.replace(KEY, '<KEY>') if KEY else url}")
        return {"items": [], "totalCount": 0}
    for t in range(3):
        try:
            with urllib.request.urlopen(url, timeout=60) as r:
                return json.loads(r.read().decode("utf-8"))
        except Exception:
            if t == 2: raise
            time.sleep(2 * (t + 1))

def slug(corp, brand, seen):
    s = re.sub(r"[^0-9A-Za-z가-힣]", "", f"{brand}")[:40] or "brand"
    if s in seen:                                   # 동명 브랜드는 법인명을 덧붙여 구분한다
        s = f"{s}-{re.sub(r'[^0-9A-Za-z가-힣]', '', corp)[:16]}"
    n, base = 2, s
    while s in seen: s = f"{base}-{n}"; n += 1
    seen.add(s); return s

def main():
    rows, page = [], 1
    while True:
        d = call(page)
        got = d.get("items") or []
        rows += got
        total = int(d.get("totalCount") or 0)
        if DRY or not got or len(rows) >= total: break
        page += 1
        time.sleep(0.3)
    print(f"브랜드 원본 {len(rows)}건 (yr={YR})", flush=True)
    if DRY:
        print("드라이런 — 파일을 쓰지 않는다"); return

    out, seen, totals = [], set(), []
    for r in rows:
        brand = str(r.get("brandNm") or "").strip()
        lclas = str(r.get("indutyLclasNm") or "").strip()
        mlsfc = str(r.get("indutyMlsfcNm") or "").strip()
        if not brand or not mlsfc: continue
        items = []
        for api, code, label in FIELDS:
            try: v = int(float(r.get(api) or 0))
            except (TypeError, ValueError): continue
            if v <= 0: continue                     # 0원 항목은 공시 없음 — 만들지 않는다
            won = v * AMT_UNIT_WON
            if code == "smtn": totals.append(won)
            # 브랜드가 정한 고정액이라 점포 규모와 무관 → 같은 업종 안에서 비교 조건이 같다
            items.append([code, label, won, 1])
        if not items: continue
        out.append({"id": slug(str(r.get("corpNm") or ""), brand, seen), "name": brand,
                    "sido": lclas, "sigungu": "", "kind": mlsfc, "items": items})

    if not totals: sys.exit("합계 항목이 하나도 없다 — 응답 구조가 바뀐 것으로 보고 중단한다.")
    med = median(totals)
    lo, hi = SANE_TOTAL
    print(f"합계 중앙값 {med:,.0f}원 (단위 가정 x{AMT_UNIT_WON})", flush=True)
    if not (lo <= med <= hi):
        sys.exit(f"합계 중앙값이 상식 범위({lo:,}~{hi:,}원) 밖이다. "
                 f"AMT_UNIT_WON={AMT_UNIT_WON} 가정이 틀렸을 가능성이 높다. "
                 f"공정위 명세로 단위를 확정하기 전에는 쓰지 않는다.")
    print(f"브랜드 {len(out)}곳, 항목 {sum(len(x['items']) for x in out)}", flush=True)
    with gzip.open(OUT, "wt", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, separators=(",", ":"))
    print(f"wrote {OUT}: {os.path.getsize(OUT)/1e6:.2f}MB")

main()
