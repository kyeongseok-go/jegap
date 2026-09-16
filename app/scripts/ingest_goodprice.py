#!/usr/bin/env python3
"""착한가격업소 → app/data/goodprice.json.gz (행안부, 공공누리)"""
import sys, csv, io, json, gzip, os, re
SRC, OUT = sys.argv[1], sys.argv[2]
data = open(SRC, "rb").read()
txt = data.decode("cp949")
rows = list(csv.reader(io.StringIO(txt)))[1:]
out = []
for r in rows:
    if len(r) < 6: continue
    menus = []
    for i in range(6, min(len(r), 14), 2):
        name = (r[i] or "").strip()
        price = re.sub(r"[^\d]", "", r[i+1] if i+1 < len(r) else "")
        if name and price: menus.append([name, int(price)])
    out.append({"sido": r[0].strip(), "sigungu": r[1].strip(), "kind": r[2].strip(),
                "name": r[3].strip(), "addr": r[5].strip(), "menus": menus})
print(f"shops {len(out)}")
with gzip.open(OUT, "wt", encoding="utf-8") as f:
    json.dump(out, f, ensure_ascii=False, separators=(",", ":"))
print(f"wrote {OUT}: {os.path.getsize(OUT)/1e6:.2f}MB")
