#!/usr/bin/env python3
"""장례비편 인제스트 — 한국장례문화진흥원 개방 파일(공공누리 1유형) → app/data/funeral.json.gz

출처: data.go.kr 15021763 (e하늘 등록 장사시설 시설·가격, 2023-06 공시 — 최신 개방본).
      가격 CSV(장례식장명·항목·품종·품명·세부내용·금액) + 현황 XLSX(시설명→시도·시군구).
대표값: 같은 품명의 세부 변형(특실/일반실 등)은 중앙값 — /method §5와 동일 원칙.
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
    fac, item_cat, kind2, pname, amt = norm(r[2]), norm(r[3]), norm(r[4]), norm(r[5]), re.sub(r"[^\d]", "", r[7])
    if not fac or not pname or not amt or int(amt) <= 0: continue
    code = pname.lower()
    prices[fac][code].append((pname, int(amt), item_cat))

out, miss = [], 0
for fac, m in prices.items():
    if fac not in meta: miss += 1; continue
    sido, sigungu = meta[fac]
    items = []
    for code, arr in m.items():
        pname, cat = arr[0][0], arr[0][2]
        label = f"{cat} · {pname}" if cat and cat not in pname else pname
        items.append([code, label, int(median(a[1] for a in arr))])
    out.append({
        "id": re.sub(r"[^0-9A-Za-z가-힣]", "", fac)[:40] or fac,
        "name": fac, "sido": sido, "sigungu": sigungu, "kind": "장례식장",
        "items": items,
    })
print(f"facilities {len(out)} (메타 미일치 {miss}), items {sum(len(o['items']) for o in out)}")
with gzip.open(OUT, "wt", encoding="utf-8") as f:
    json.dump(out, f, ensure_ascii=False, separators=(",", ":"))
print(f"wrote {OUT}: {os.path.getsize(OUT)/1e6:.2f}MB")
