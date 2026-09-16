#!/usr/bin/env python3
"""NEIS 학원·교습소 교습비 전국 인제스트 → app/data/academy.json.gz

필드 확정: 2026-09-16 실호출 검증 (acaInsTiInfo).
  ACA_ASNUM(등록번호) ACA_NM(명칭) ATPT_OFCDC_SC_NM(교육청) ADMST_ZONE_NM(시군구)
  REALM_SC_NM(분야) PSNBY_THCC_CNTNT("과목:금액,과목:금액") THCC_OTHBC_YN(공개여부) REG_STTUS_NM(개원)
용법: NEIS_KEY=... SSL_CERT_FILE=/etc/ssl/cert.pem python3 ingest_neis.py <출력.json.gz>
"""
import sys, os, json, gzip, time, re, urllib.request, urllib.parse

KEY = os.environ.get("NEIS_KEY") or sys.exit("NEIS_KEY 필요 (open.neis.go.kr 발급)")
OUT = sys.argv[1] if len(sys.argv) > 1 else "academy.json.gz"
# 17개 시도교육청
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
                code = d.get("RESULT", {}).get("CODE", "")
                if code == "INFO-200": return 0, []          # 데이터 없음(마지막 페이지 초과)
                raise RuntimeError(json.dumps(d, ensure_ascii=False)[:200])
            head, body = d["acaInsTiInfo"][0], d["acaInsTiInfo"][1]
            return head["head"][0]["list_total_count"], body["row"]
        except Exception:
            if t == tries - 1: raise
            time.sleep(2 * (t + 1))

def parse_prices(txt):
    """'문법 영어:268000, 리스닝:192000' → [(과목, 금액)]. 금액 0/비정상 제외."""
    out = []
    for part in str(txt or "").split(","):
        if ":" not in part: continue
        name, _, amt = part.rpartition(":")
        name = re.sub(r"\s+", " ", name).strip()
        amt = re.sub(r"[^\d]", "", amt)
        if name and amt and int(amt) > 0:
            out.append((name, int(amt)))
    return out

t0 = time.time()
orgs = {}
for off in OFFICES:
    page, seen = 1, 0
    while True:
        total, rows = fetch(off, page)
        if not rows: break
        for r in rows:
            if str(r.get("REG_STTUS_NM", "")) != "개원": continue
            if str(r.get("THCC_OTHBC_YN", "")) != "Y": continue
            prices = parse_prices(r.get("PSNBY_THCC_CNTNT"))
            if not prices: continue
            aid = f'{off}-{r.get("ACA_ASNUM")}'
            o = orgs.setdefault(aid, {
                "id": aid,
                "name": str(r.get("ACA_NM") or "").strip(),
                "sido": SIDO[off],
                "sigungu": str(r.get("ADMST_ZONE_NM") or "").strip(),
                "kind": str(r.get("REALM_SC_NM") or "").strip(),  # 분야
                "_items": {},
            })
            for name, amt in prices:
                # 같은 과목 중복 공시는 최근/최대가 아닌 중복 무시(첫 값) — 단순·결정론
                o["_items"].setdefault(name.lower(), (name, amt))
        seen += len(rows)
        if seen >= total: break
        page += 1
    print(f"{SIDO[off]}: {seen} rows, 누적 학원 {len(orgs)} {time.time()-t0:.0f}s", flush=True)

out = []
for o in orgs.values():
    items = [[k, v[0], v[1]] for k, v in o.pop("_items").items()]
    if items: out.append({**o, "items": items})
print(f"academies {len(out)}, items {sum(len(x['items']) for x in out)}", flush=True)
with gzip.open(OUT, "wt", encoding="utf-8") as f:
    json.dump(out, f, ensure_ascii=False, separators=(",", ":"))
print(f"wrote {OUT}: {os.path.getsize(OUT)/1e6:.1f}MB", flush=True)
