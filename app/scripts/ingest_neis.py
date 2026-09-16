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

# 과목 표기 정규화 — "초등수학a", "초등수학2", "초등 수학 (심화)"를 같은 비교 단위로 묶는다.
# 학년대 + 과목 키워드가 모두 잡힐 때만 표준 코드를 만들고, 아니면 비교에서 제외(무소음).
GRADES = [("유아", ["유아", "유치"]), ("초등", ["초등", "초교", "초1", "초2", "초3", "초4", "초5", "초6"]),
          ("중등", ["중등", "중학", "중1", "중2", "중3"]), ("고등", ["고등", "고교", "고1", "고2", "고3", "수능"]),
          ("성인", ["성인", "일반"])]
SUBJECTS = [("수학", ["수학", "산수", "math"]), ("영어", ["영어", "english"]), ("국어", ["국어", "문학", "독서"]),
            ("과학", ["과학", "물리", "화학", "생물", "지구과학"]), ("사회", ["사회", "역사", "한국사", "지리"]),
            ("논술", ["논술", "글쓰기", "작문"]), ("코딩", ["코딩", "컴퓨터", "정보", "프로그래밍"]),
            ("미술", ["미술", "그림", "회화"]), ("음악", ["피아노", "바이올린", "음악", "기타"]),
            ("체육", ["태권도", "축구", "수영", "체육", "무용", "발레"]), ("한자", ["한자", "한문"])]

def std_subject(name):
    t = name.lower().replace(" ", "")
    grade = next((g for g, keys in GRADES if any(k in t for k in keys)), None)
    subj = next((s for s, keys in SUBJECTS if any(k in t for k in keys)), None)
    if grade and subj: return f"{grade} {subj}", f"{grade} {subj}"
    if subj: return subj, subj
    return None, None

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
                code, label = std_subject(name)
                if not code: continue            # 표준화 불가 표기는 비교 대상에서 제외(무소음)
                # 같은 표준 과목에 여러 표기가 있으면 값들을 모아 뒤에서 중앙값 대표
                o["_items"].setdefault(code, (label, []))[1].append(amt)
        seen += len(rows)
        if seen >= total: break
        page += 1
    print(f"{SIDO[off]}: {seen} rows, 누적 학원 {len(orgs)} {time.time()-t0:.0f}s", flush=True)

from statistics import median
out = []
for o in orgs.values():
    items = [[k, v[0], int(median(v[1]))] for k, v in o.pop("_items").items()]
    if items: out.append({**o, "items": items})
print(f"academies {len(out)}, items {sum(len(x['items']) for x in out)}", flush=True)
with gzip.open(OUT, "wt", encoding="utf-8") as f:
    json.dump(out, f, ensure_ascii=False, separators=(",", ":"))
print(f"wrote {OUT}: {os.path.getsize(OUT)/1e6:.1f}MB", flush=True)
