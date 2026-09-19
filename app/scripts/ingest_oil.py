#!/usr/bin/env python3
"""주유소편 인제스트 — 한국석유공사 오피넷 시군구별 평균 판매가격 → app/data/oil.json.gz

왜 시군구 평균인가 (개별 주유소가 아니라):
  개별 주유소를 주는 일반 API 중 `lowTop10`(지역별 최저가 Top20)은 **표본이 최저가로 편향**되어
  중간값 비교가 성립하지 않는다. `aroundAll`(반경 검색)은 전수지만(5km 69곳 실측) TM 좌표 격자가
  필요해 일 300콜 한도로 전국을 덮지 못한다. `avgSigunPrice` 는 17콜 x 유종으로 전국을 무편향으로 덮는다.

필드 확정: 2026-09-20 실호출.
  avgSidoPrice.do  → SIDOCD SIDONM PRODCD PRICE DIFF
  avgSigunPrice.do → SIGUNCD SIGUNNM PRODCD PRICE DIFF   (파라미터는 area= 가 아니라 **sido=**)
호출 한도: 일반 API 300콜/일. 이 스크립트는 1 + 17x유종 = 최대 69콜.
⚠ 오피넷은 **클라이언트 IP를 등록·체크**한다(Key당 3개). Vercel 런타임 호출이 불가하므로
  반드시 로컬 배치로 수집해 리포에 번들한다.

용법: OPINET_KEY=... python3.14 ingest_oil.py <출력.json.gz> [--dry-run]
"""
import sys, os, json, gzip, time, urllib.request, urllib.parse

OUT = next((a for a in sys.argv[1:] if not a.startswith("-")), "oil.json.gz")
DRY = "--dry-run" in sys.argv
KEY = os.environ.get("OPINET_KEY")
if not KEY and not DRY: sys.exit("OPINET_KEY 필요 (opinet.co.kr/user/custapi/custApiNew.do)")

BASE = "http://www.opinet.co.kr/api"
# 유종 코드 — 오피넷 일반 API 문서 및 실호출로 확인된 것만 쓴다
PRODS = [("B027", "휘발유"), ("D047", "경유"), ("B034", "고급휘발유"), ("C004", "실내등유")]

def call(op, **params):
    q = urllib.parse.urlencode({"out": "json", "code": KEY, **params})
    url = f"{BASE}/{op}.do?{q}"
    if DRY:
        print(f"  [dry] {url.replace(KEY, '<KEY>') if KEY else url}")   # 빈 문자열 replace 는 모든 글자 사이에 끼어든다
        return {"RESULT": {"OIL": []}}
    for t in range(3):
        try:
            with urllib.request.urlopen(url, timeout=40) as r:
                return json.loads(r.read().decode("utf-8"))
        except Exception:
            if t == 2: raise
            time.sleep(2 * (t + 1))

def main():
    sidos = call("avgSidoPrice", prodcd=PRODS[0][0])["RESULT"]["OIL"]
    sidos = [(s["SIDOCD"], s["SIDONM"]) for s in sidos if s["SIDOCD"] != "00"]
    if DRY:
        # 드라이런에서는 실제 시도 목록이 없으니 코드 조립만 검증한다
        sidos = [("01", "서울")]
    orgs, calls = {}, 1
    for cd, nm in sidos:
        for prodcd, prodnm in PRODS:
            rows = call("avgSigunPrice", sido=cd, prodcd=prodcd)["RESULT"]["OIL"]
            calls += 1
            for r in rows:
                sgcd, sgnm = str(r["SIGUNCD"]), str(r["SIGUNNM"]).strip()
                price = float(r["PRICE"])
                if price <= 0: continue                      # 조사값 없음 — 만들지 않는다
                # "서울종로구" → 시도명을 접두사로 떼어 시군구만 남긴다
                sigungu = sgnm[len(nm):].strip() if sgnm.startswith(nm) else sgnm
                o = orgs.setdefault(sgcd, {"id": sgcd, "name": sgnm, "sido": nm,
                                           "sigungu": sigungu or sgnm, "kind": "주유소 평균",
                                           "_items": {}})
                # 유종은 단위(원/L)가 같다 → rankable 1. 유종 간 비교는 code 가 달라 애초에 섞이지 않는다.
                o["_items"][prodcd] = [prodcd, prodnm, round(price), 1]
            time.sleep(0.2)
    out = []
    for o in orgs.values():
        items = list(o.pop("_items").values())
        if items: out.append({**o, "items": items})
    print(f"시군구 {len(out)}곳, 항목 {sum(len(x['items']) for x in out)}, 호출 {calls}회", flush=True)
    if DRY:
        print("드라이런 — 파일을 쓰지 않는다"); return
    if len(out) < 100:
        sys.exit(f"시군구가 {len(out)}곳뿐이다 — 전국 250여 곳이어야 한다. 수집 실패로 보고 중단한다.")
    with gzip.open(OUT, "wt", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, separators=(",", ":"))
    print(f"wrote {OUT}: {os.path.getsize(OUT)/1e6:.2f}MB")

main()
