#!/usr/bin/env python3
"""NEIS 학원·교습소 교습비 전국 인제스트 → app/data/academy.json.gz

필드 확정: 2026-09-16 실호출, 2026-09-20 재확인 (acaInsTiInfo).
  ACA_ASNUM(등록번호) ACA_NM(명칭) ADMST_ZONE_NM(시군구) REALM_SC_NM(분야)
  LE_ORD_NM(교습계열) LE_CRSE_NM(교습과정명) PSNBY_THCC_CNTNT("과목:금액,과목:금액")
  THCC_OTHBC_YN(공개여부) REG_STTUS_NM(개원)

비교 단위 보존(2026-09-20):
  1) **파서 버그**: 과목명에 쉼표가 들어가면(`초등수학(주3회, 60분):200000`) `,` split이 조각을 내
     `회60분)` 같은 쓰레기 코드가 생겼다. 서울 송파구에서만 124건이 그 코드 하나로 비교되고 있었다.
     → 쉼표 split 폐기, `이름:금액` 쌍을 정규식으로 추출.
  2) **키워드 병합 폐기**: 피아노·바이올린→음악, 태권도·수영→체육으로 묶어 배수를 계산하고 있었다.
     → 과목 표기 원문을 그대로 코드로 쓴다. 표본이 안 되는 표기는 런타임에서 순위 미산출로 빠진다.
  3) **교습계열(LE_ORD_NM) 분리**: 같은 '기초' 라도 보통교과와 예능은 다른 것이다.
  ⚠ 교습 시간·횟수·기간은 NEIS 공시에 **별도 필드가 없다**. 과목 표기에 적힌 곳만 자연히 구분된다.
     없는 값을 추정하지 않는다 — 화면과 /method에 이 한계를 명시할 것.
  출력 items = [code, label, price, rankable(1|0)].
용법: NEIS_KEY=... SSL_CERT_FILE=/etc/ssl/cert.pem python3 ingest_neis.py <출력.json.gz>
"""
import sys, os, json, gzip, time, re, urllib.request, urllib.parse
from statistics import median

KEY = os.environ.get("NEIS_KEY") or sys.exit("NEIS_KEY 필요 (open.neis.go.kr 발급)")
OUT = sys.argv[1] if len(sys.argv) > 1 else "academy.json.gz"
OFFICES = ["B10","C10","D10","E10","F10","G10","H10","I10","J10","K10","M10","N10","P10","Q10","R10","S10","T10"]
SIDO = {"B10":"서울","C10":"부산","D10":"대구","E10":"인천","F10":"광주","G10":"대전","H10":"울산","I10":"세종",
        "J10":"경기","K10":"강원","M10":"충북","N10":"충남","P10":"전북","Q10":"전남","R10":"경북","S10":"경남","T10":"제주"}
PSIZE = 1000

def fetch(office, page, tries=4):
    q = urllib.parse.urlencode({"KEY": KEY, "Type": "json", "pIndex": page, "pSize": PSIZE,
                                "ATPT_OFCDC_SC_CODE": office})
    for t in range(tries):
        try:
            with urllib.request.urlopen(f"https://open.neis.go.kr/hub/acaInsTiInfo?{q}", timeout=60) as r:
                d = json.loads(r.read().decode("utf-8"))
            if "acaInsTiInfo" not in d:
                if d.get("RESULT", {}).get("CODE", "") == "INFO-200": return 0, []
                raise RuntimeError(json.dumps(d, ensure_ascii=False)[:200])
            head, body = d["acaInsTiInfo"][0], d["acaInsTiInfo"][1]
            return head["head"][0]["list_total_count"], body["row"]
        except Exception:
            if t == tries - 1: raise
            time.sleep(2 * (t + 1))

PAIR = re.compile(r"([^:]+):\s*([0-9][0-9,]*)")

def parse_prices(txt):
    """'초등수학(주3회, 60분):200000, 리스닝:192,000' → [(과목원문, 금액)].
    쉼표로 쪼개지 않는다 — 과목명 안의 쉼표가 조각을 내기 때문."""
    out = []
    for m in PAIR.finditer(str(txt or "")):
        name = re.sub(r"\s+", " ", m.group(1)).strip(" ,\t")
        amt = int(re.sub(r"[^\d]", "", m.group(2)) or 0)
        if name and amt > 0: out.append((name, amt))
    return out

def _selftest():
    assert parse_prices("초등수학(주3회, 60분):200000, 중등영어:300,000") == [
        ("초등수학(주3회, 60분)", 200000), ("중등영어", 300000)]
    assert parse_prices(" ") == []
    assert parse_prices("수학:0") == []
_selftest()

def norm(name):
    """비교 키 — 공백·대소문자만 정규화한다. 표기가 다르면 다른 것으로 둔다(추정 금지)."""
    return re.sub(r"\s+", "", name).lower()

t0 = time.time()
orgs = {}
for off in OFFICES:
    page, seen, total = 0, 0, 1
    while seen < total:
        page += 1
        total, rows = fetch(off, page)
        if not rows: break
        seen += len(rows)
        for r in rows:
            if str(r.get("REG_STTUS_NM", "")) != "개원": continue
            if str(r.get("THCC_OTHBC_YN", "")) != "Y": continue
            prices = parse_prices(r.get("PSNBY_THCC_CNTNT"))
            if not prices: continue
            ord_ = str(r.get("LE_ORD_NM") or "").strip() or "기타"
            aid = f'{off}-{r.get("ACA_ASNUM")}'
            o = orgs.setdefault(aid, {
                "id": aid,
                "name": str(r.get("ACA_NM") or "").strip(),
                "sido": SIDO[off],
                "sigungu": str(r.get("ADMST_ZONE_NM") or "").strip(),
                "kind": str(r.get("REALM_SC_NM") or "").strip(),
                "_items": {},
            })
            for name, amt in prices:
                code = f"{ord_}|{norm(name)}"
                label = name if ord_ == "보통교과" else f"{name} · {ord_}"
                o["_items"].setdefault(code, (label, []))[1].append(amt)
    print(f"{SIDO[off]}: {seen} rows, 누적 학원 {len(orgs)} {time.time()-t0:.0f}s", flush=True)

out = []
for o in orgs.values():
    items = [[k, v[0], int(median(v[1])), 1] for k, v in o.pop("_items").items()]
    if items: out.append({**o, "items": items})
print(f"academies {len(out)}, items {sum(len(x['items']) for x in out)}", flush=True)
with gzip.open(OUT, "wt", encoding="utf-8") as f:
    json.dump(out, f, ensure_ascii=False, separators=(",", ":"))
print(f"wrote {OUT}: {os.path.getsize(OUT)/1e6:.1f}MB", flush=True)
