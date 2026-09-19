#!/usr/bin/env python3
"""장례비편 인제스트 — 한국장례문화진흥원 개방 파일(공공누리 1유형) → app/data/funeral.json.gz

출처: data.go.kr 15021763 (e하늘 등록 장사시설 시설·가격, 2023-06 공시 — 최신 개방본).
      가격 CSV(장례식장명·항목·품종·품명·세부내용·금액) + 현황 XLSX(시설명→시도·시군구).

비교 단위 보존(2026-09-20):
  세부내용은 자유 텍스트라 품명 하나에 200개 넘는 변형이 있다. 전부 코드로 쓰면 표본이 흩어지고,
  전부 버리면 '안치료 1일'과 '안치료 시간당'이 한 표본에 섞인다(배수 24배 오염).
  → **기간 단위(일/시간/회)만 코드로 분리**하고, **수량이 2 이상 명시된 행은 순위 산출에서 제외**한다.
    재질·산지(인견/본견/오동나무)는 단위가 같으므로 표본 분산으로 흡수한다.
  출력 items = [code, label, price, rankable(1|0)].
용법: python3 ingest_funeral.py <funeral2023.zip> <출력.json.gz>
"""
import sys, io, json, gzip, zipfile, warnings, re, os
from collections import defaultdict
from statistics import median
import openpyxl

warnings.filterwarnings("ignore")
ZIP, OUT = sys.argv[1], sys.argv[2]
z = zipfile.ZipFile(ZIP)

def norm(s): return re.sub(r"\s+", " ", str(s or "")).strip()

# 세부내용에서 비교 단위만 추출. 기간 단위가 먼저다("1일/24시간 기준"은 일).
PERIOD = [("일", r"(\d+)?\s*(?:일|박)(?![\w가-힣])"), ("일", r"24\s*시간"),
          ("시간", r"(\d+)?\s*시간|시간\s*당"), ("회", r"(\d+)?\s*회")]
COUNT = r"(\d+)\s*(?:개|장|권|봉|통|조|벌|쌍|매|병|박스|묶음|켤레|자루|셋트|세트)"

def unit_of(detail):
    """(기간단위 or '', 수량). 수량은 명시된 값만, 없으면 1."""
    t = norm(detail)
    for label, pat in PERIOD:
        m = re.search(pat, t)
        if m:
            n = next((g for g in m.groups() if g), None)
            return label, int(n) if n else 1
    m = re.search(COUNT, t)
    return "", int(m.group(1)) if m else 1

def _selftest():
    assert unit_of("1일") == ("일", 1)
    assert unit_of("시간당") == ("시간", 1)
    assert unit_of("1시간") == ("시간", 1)
    assert unit_of("1일/24시간 기준") == ("일", 1)
    assert unit_of("3일") == ("일", 3)
    assert unit_of("3개") == ("", 3)
    assert unit_of("1개") == ("", 1)
    assert unit_of("오동나무") == ("", 1)
    assert unit_of("") == ("", 1)
_selftest()

# 1) 현황: 시설명 → (시도, 시군구)
meta = {}
xlsx = [n for n in z.namelist() if n.endswith(".xlsx")][0]
wb = openpyxl.load_workbook(io.BytesIO(z.read(xlsx)), read_only=True)
ws = wb["장례식장"]; ws.reset_dimensions()
it = ws.iter_rows(values_only=True); next(it)
for r in it:
    name = norm(r[2])
    if name: meta[name] = (norm(r[0]), norm(r[1]))

# 2) 가격 CSV
csvn = [n for n in z.namelist() if "2." in n and n.endswith(".csv")][0]
txt = z.read(csvn).decode("cp949")
import csv as csvmod
rows = list(csvmod.reader(io.StringIO(txt)))
hdr, rows = rows[0], rows[1:]
# 시설종류,순번,장례식장명,항목,품종,품명,세부내용,금액
prices = defaultdict(lambda: defaultdict(list))
for r in rows:
    if len(r) < 8: continue
    fac, item_cat, pname = norm(r[2]), norm(r[3]), norm(r[5])
    amt = re.sub(r"[^\d]", "", r[7])
    if not fac or not pname or not amt or int(amt) <= 0: continue
    per, qty = unit_of(r[6])
    code = f"{pname.lower()}|{per}"
    prices[fac][code].append((pname, int(amt), item_cat, per, qty))

UNIT_TXT = {"일": " (1일)", "시간": " (시간당)", "회": " (1회)"}
out, miss = [], 0
for fac, m in prices.items():
    if fac not in meta: miss += 1; continue
    sido, sigungu = meta[fac]
    items = []
    for code, arr in m.items():
        pname, cat, per = arr[0][0], arr[0][2], arr[0][3]
        label = f"{cat} · {pname}" if cat and cat not in pname else pname
        label += UNIT_TXT.get(per, "")
        # 수량이 2 이상 명시된 행이 섞이면 1단위 가격이 아니다 → 순위 산출 제외, 가격만 표시
        rankable = 1 if all(a[4] == 1 for a in arr) else 0
        items.append([code, label, int(median(a[1] for a in arr)), rankable])
    out.append({
        "id": re.sub(r"[^0-9A-Za-z가-힣]", "", fac)[:40] or fac,
        "name": fac, "sido": sido, "sigungu": sigungu, "kind": "장례식장",
        "items": items,
    })
nr = sum(1 for o in out for i in o["items"] if i[3] == 0)
print(f"facilities {len(out)} (메타 미일치 {miss}), items {sum(len(o['items']) for o in out)} (순위 제외 {nr})")
with gzip.open(OUT, "wt", encoding="utf-8") as f:
    json.dump(out, f, ensure_ascii=False, separators=(",", ":"))
print(f"wrote {OUT}: {os.path.getsize(OUT)/1e6:.2f}MB")
