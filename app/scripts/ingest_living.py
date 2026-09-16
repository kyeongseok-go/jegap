#!/usr/bin/env python3
"""생활물가편 인제스트 — 행안부 하모니(지방물가정보) → app/data/living.json.gz

출처: hamoni.mois.go.kr 지방물가 공개서비스 (매월 조사, 시도별).
구성: 공공요금 11 · 외식 9 · 개인서비스 5 · 농축산물 — 품목별 POST 조회 후 표 파싱.
용법: SSL_CERT_FILE=... python3 ingest_living.py <출력.json.gz>
"""
import sys, os, re, json, gzip, time, urllib.request, urllib.parse
from html.parser import HTMLParser

OUT = sys.argv[1] if len(sys.argv) > 1 else "living.json.gz"
BASE = "https://hamoni.mois.go.kr/portal/lcpr"
ENDPOINTS = {
    "공공요금": "lclPucrgList.do",
    "외식": "indvSrcvEatoutCstList.do",
    "개인서비스": "indvSrcvEtcCstList.do",
    "농축산물": "faprSfprList.do",
}
YEARS = ["2021", "2022", "2023", "2024", "2025", "2026"]

class TableParser(HTMLParser):
    """행 구조: [품목?, 시도, 값...] — prc_th 클래스 셀은 라벨, 일반 td는 값"""
    def __init__(self):
        super().__init__()
        self.rows, self.cur, self.in_td, self.is_th = [], [], False, False
        self.in_thead_th = False
        self.heads = []
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == "tr": self.cur = []
        if tag == "td":
            self.in_td = True
            self.is_th = "prc_th" in (a.get("class") or "")
            self.buf = ""
        if tag == "th":
            self.in_thead_th = True; self.buf = ""
    def handle_endtag(self, tag):
        if tag == "td" and self.in_td:
            self.cur.append(("L" if self.is_th else "V", self.buf.strip()))
            self.in_td = False
        if tag == "th" and self.in_thead_th:
            self.heads.append(self.buf.strip()); self.in_thead_th = False
        if tag == "tr" and self.cur:
            self.rows.append(self.cur)
    def handle_data(self, data):
        if self.in_td or self.in_thead_th: self.buf += data

def fetch(cat, ep, item_cd, year=None, tries=3):
    y = year or "2026"
    body = urllib.parse.urlencode({
        "searchCtpv": "", "searchBgngYr": y, "searchBgngMm": "01",
        "searchEndYr": y, "searchEndMm": "12",
        "searchBgngYm": f"{y}01", "searchEndYm": f"{y}12",
        "searchItemNo": item_cd, "itemNo": item_cd, "menuYn": "Y",
    }).encode()
    req = urllib.request.Request(f"{BASE}/{ep}", data=body,
        headers={"User-Agent": "Mozilla/5.0", "Content-Type": "application/x-www-form-urlencoded"})
    for t in range(tries):
        try:
            with urllib.request.urlopen(req, timeout=60) as r:
                return r.read().decode("utf-8", "ignore")
        except Exception:
            if t == tries - 1: raise
            time.sleep(3)

def items_of(html_text):
    return re.findall(r'itemNo" value="([A-Z]+)"[^>]*>\s*([^<]+)', html_text)

t0 = time.time()
series = {}          # "code|시도" → {ym: 가격}
item_meta = {}       # code → (이름, 카테고리)
months_all = set()

for cat, ep in ENDPOINTS.items():
    first = fetch(cat, ep, "")
    items = [(c, n.strip()) for c, n in dict(items_of(first)).items()]
    print(f"{cat}: {len(items)} items", flush=True)
    for code, name in items:
        for year in YEARS:
            html_text = fetch(cat, ep, code, year)
            p = TableParser(); p.feed(html_text)
            months = [h.replace(".", "") for h in p.heads if re.fullmatch(r"20\d\d\.\d\d", h)]
            if not months: continue
            item_meta[code] = (name, cat)
            months_all.update(months)
            for row in p.rows:
                labels = [v for k, v in row if k == "L"]
                vals = [v for k, v in row if k == "V"]
                if len(labels) >= 1: sido = labels[-1]
                else: continue
                if sido in ("전국", "평균") or not vals: continue
                m = {}
                for ym, v in zip(months, vals):
                    v = re.sub(r"[^\d]", "", v)
                    if v: m[ym] = int(v)
                if m: series[f"{code}|{sido}"] = {**series.get(f"{code}|{sido}", {}), **m}
            time.sleep(0.3)
        print(f"  {name} ok", flush=True)

months_sorted = sorted(months_all)
out = {
    "months": months_sorted,
    "items": [{"code": c, "name": n, "cat": cat} for c, (n, cat) in sorted(item_meta.items())],
    "series": {k: [v.get(m) for m in months_sorted] for k, v in series.items()},
}
n_pts = sum(sum(1 for x in v if x) for v in out["series"].values())
print(f"items {len(item_meta)}, series {len(series)}, points {n_pts}, months {months_sorted[0]}~{months_sorted[-1]} {time.time()-t0:.0f}s", flush=True)
with gzip.open(OUT, "wt", encoding="utf-8") as f:
    json.dump(out, f, ensure_ascii=False, separators=(",", ":"))
print(f"wrote {OUT}: {os.path.getsize(OUT)/1e6:.2f}MB", flush=True)
