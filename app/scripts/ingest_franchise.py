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
PART_CODES = {"jng", "edu", "assrnc", "etc"}    # 합계를 뺀 개별 항목

# 비교 조건 판정 (STEP 1 원칙: 조건이 다르면 순위를 내지 않는다)
#  - jng·edu·assrnc : 정의가 명확하고 브랜드 간 조건이 같다 → 비교 가능
#  - etc            : **무엇이 들어가는지 브랜드마다 다르다**(인테리어·장비·시설·물품대금 등).
#                     실제로 배수 상위가 전부 이 항목이었다(최고 47.8배). 순위를 내지 않는다.
#  - smtn           : **4개 항목을 모두 공시한 브랜드만** 비교 가능. 26%(2,999곳)는 일부만
#                     공시해 그 합계가 전체 창업비용이 아니다. 섞으면 0.02배 같은 값이 나온다.
NEVER_RANK = {"etc"}

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
        vals = {}
        for api, code, label in FIELDS:
            try: v = int(float(r.get(api) or 0))
            except (TypeError, ValueError): continue
            if v <= 0: continue                     # 0원 항목은 공시 없음 — 만들지 않는다
            vals[code] = (label, v * AMT_UNIT_WON)
        if not vals: continue
        full = PART_CODES <= set(vals)              # 개별 항목 4종이 모두 공시됐는가
        items = []
        for code, (label, won) in vals.items():
            if code == "smtn": totals.append(won)
            rankable = 0 if code in NEVER_RANK else (1 if code != "smtn" or full else 0)
            items.append([code, label, won, rankable])
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
    nr = sum(1 for o in out for i in o["items"] if i[3] == 0)
    print(f"브랜드 {len(out)}곳, 항목 {sum(len(x['items']) for x in out)} (순위 제외 {nr})", flush=True)
    with gzip.open(OUT, "wt", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, separators=(",", ":"))
    print(f"wrote {OUT}: {os.path.getsize(OUT)/1e6:.2f}MB")

main()
