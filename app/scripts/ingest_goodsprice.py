#!/usr/bin/env python3
"""생필품편 인제스트 — 한국소비자원 참가격 → app/data/goods.json.gz

필드 확정: 2026-09-20 실호출 + data.go.kr Swagger (15158701).
  host apis.data.go.kr/B551919/ProductPriceInfoService
  /getProductPriceInfoSvc   serviceKey(소문자 s) + goodInspectDay(필수) + entpId|goodId(택1)
      → goodInspectDay entpId goodId goodPrice goodDcYn plusoneYn goodDcStartDay goodDcEndDay inputDttm
  /getStoreInfoSvc.do       ServiceKey(대문자 S) [+ entpId]
      → entpId entpName entpTypeCode entpAreaCode areaDetailCode entpTelno postNo plmkAddrBasic
  /getProductInfoSvc.do     ServiceKey [+ goodId]
      → goodId goodName productEntpCode goodUnitDivCode goodBaseCnt goodSmlclsCode goodTotalCnt goodTotalDivCode
  /getStandardInfoSvc.do    ServiceKey + classCode   (단위·용량·상품분류·업태·지역 코드표)
  ⚠ 오퍼레이션마다 인증키 파라미터 대소문자가 다르다(serviceKey vs ServiceKey). 실호출로 확인한 그대로 쓴다.

조사 주기: 문서는 '매주 금요일'이라 하나 **실측은 격주**였다(20260911 있음 / 20260918·20260904 없음).
  → 최근 금요일부터 거슬러 올라가며 데이터가 있는 첫 날짜를 조사일로 삼는다.

비교 단위 보존(STEP 1 교훈 적용):
  할인 중(goodDcYn=Y)이거나 1+1(plusoneYn=Y)인 가격은 평상시 단가가 아니다 → rankable=0.
  순위를 내지 않고 공시가격만 보여준다.

용법: DATA_GO_KR_KEY=... python3.14 ingest_goodsprice.py <출력.json.gz> [--dry-run]
"""
import sys, os, re, json, gzip, time, urllib.request, urllib.parse
import xml.etree.ElementTree as ET
from datetime import date, timedelta

OUT = next((a for a in sys.argv[1:] if not a.startswith("-")), "goods.json.gz")
DRY = "--dry-run" in sys.argv
KEY = os.environ.get("DATA_GO_KR_KEY")
if not KEY and not DRY: sys.exit("DATA_GO_KR_KEY 필요 (data.go.kr 15158701 활용신청)")
BASE = "https://apis.data.go.kr/B551919/ProductPriceInfoService"

def call(op, keyparam="ServiceKey", **params):
    q = urllib.parse.urlencode({keyparam: KEY or "", **params})
    url = f"{BASE}/{op}?{q}"
    if DRY:
        print(f"  [dry] {url.replace(KEY, '<KEY>') if KEY else url}")
        return ET.fromstring("<response><result/><resultCode>00</resultCode></response>")
    for t in range(3):
        try:
            with urllib.request.urlopen(url, timeout=60) as r:
                return ET.fromstring(r.read())
        except Exception:
            if t == 2: raise
            time.sleep(2 * (t + 1))

def rows(root):
    res = root.find("result")
    if res is None: return []
    return [{c.tag: (c.text or "").strip() for c in item} for item in list(res)]

def fridays(n=8):
    d = date.today()
    d -= timedelta(days=(d.weekday() - 4) % 7)      # 가장 최근(또는 오늘) 금요일
    for _ in range(n):
        yield d.strftime("%Y%m%d")
        d -= timedelta(days=7)

def main():
    stores = rows(call("getStoreInfoSvc.do"))
    goods = rows(call("getProductInfoSvc.do", ))
    print(f"점포 {len(stores)}곳 · 상품 {len(goods)}종", flush=True)
    if DRY:
        for d in list(fridays(3)):
            call("getProductPriceInfoSvc", keyparam="serviceKey", goodInspectDay=d, goodId="35")
        print("드라이런 — 파일을 쓰지 않는다"); return
    if not stores or not goods: sys.exit("점포/상품 목록이 비었다 — 응답 구조 변경으로 보고 중단한다.")

    # 유효 조사일 탐색 — 대표 상품 하나로 거슬러 올라간다
    probe = goods[0]["goodId"]
    day = next((d for d in fridays()
                if rows(call("getProductPriceInfoSvc", keyparam="serviceKey",
                             goodInspectDay=d, goodId=probe))), None)
    if not day: sys.exit("최근 8주 안에 조사 데이터가 없다 — 중단한다.")
    print(f"조사일 {day}", flush=True)

    gmap = {g["goodId"]: g.get("goodName", "") for g in goods}
    smap = {s["entpId"]: s for s in stores}
    orgs, calls = {}, 2
    for g in goods:
        gid = g["goodId"]
        for r in rows(call("getProductPriceInfoSvc", keyparam="serviceKey",
                           goodInspectDay=day, goodId=gid)):
            calls += 1
            eid, price = r.get("entpId"), r.get("goodPrice")
            if not eid or not price or eid not in smap: continue
            try: p = int(float(price))
            except ValueError: continue
            if p <= 0: continue
            s = smap[eid]
            addr = s.get("plmkAddrBasic", "")
            parts = addr.split()
            sido = parts[0] if parts else ""
            sigungu = parts[1] if len(parts) > 1 else ""
            o = orgs.setdefault(eid, {"id": eid, "name": s.get("entpName", eid), "sido": sido,
                                      "sigungu": sigungu, "kind": s.get("entpTypeCode", ""),
                                      "_items": {}})
            # 할인/1+1 은 평상시 단가가 아니다 → 순위 산출에서 제외(가격만 표시)
            rankable = 0 if (r.get("goodDcYn") == "Y" or r.get("plusoneYn") == "Y") else 1
            o["_items"][gid] = [gid, gmap.get(gid, gid), p, rankable]
        time.sleep(0.15)

    out = []
    for o in orgs.values():
        items = list(o.pop("_items").values())
        if items: out.append({**o, "items": items})
    nr = sum(1 for o in out for i in o["items"] if i[3] == 0)
    print(f"점포 {len(out)}곳, 항목 {sum(len(x['items']) for x in out)} (할인·1+1 순위 제외 {nr}), 호출 {calls}회")
    if len(out) < 50: sys.exit(f"점포가 {len(out)}곳뿐이다 — 전국 500여 곳이어야 한다. 수집 실패로 보고 중단한다.")
    with gzip.open(OUT, "wt", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, separators=(",", ":"))
    print(f"wrote {OUT}: {os.path.getsize(OUT)/1e6:.2f}MB")

main()
