#!/usr/bin/env python3
"""심평원 비급여 공개가격 → app/data/hira.json.gz

전제(활성화 절차):
1. 공공데이터포털에서 "건강보험심사평가원_비급여진료비정보조회서비스"(15001700)
   + "건강보험심사평가원_병원정보서비스"(15001698) 활용신청 (자동승인)
2. 같은 인증키 사용 (.env.local의 DATA_GO_KR_KEY)

⚠️ 필드 확정 게이트: 아래 FIELD_MAP은 첫 실행 때 --probe 로 실호출 응답을 보고 확정할 것.
   추측으로 채우지 않는다 (프로젝트 원칙 PC1). --probe가 샘플 응답을 출력한다.

용법:
  python3 ingest_hira.py --probe            # 1회: 응답 구조 확인
  python3 ingest_hira.py <출력.json.gz>     # 본 인제스트 (다빈도 항목 위주)
"""
import sys, os, json, gzip, time, urllib.request, urllib.parse

KEY = os.environ.get("DATA_GO_KR_KEY") or sys.exit("DATA_GO_KR_KEY 필요 (.env.local 참조)")
BASE = "https://apis.data.go.kr/B551182/nonPaymentDamtInfoService"

# 다빈도·체감 큰 항목부터 (심평원 다빈도 조회 항목 + 국민 체감 항목)
# 코드가 확정되면 여기 채운다 — --probe 로 getNonPaymentItemCodeList(항목코드 op)를 먼저 확인.
TARGET_ITEM_KEYWORDS = ["도수치료", "체외충격파", "MRI", "초음파", "임플란트", "크라운", "대상포진", "독감", "추나요법", "제증명"]

def call(op, **params):
    q = urllib.parse.urlencode({"serviceKey": KEY, "numOfRows": 1000, "_type": "json", **params})
    with urllib.request.urlopen(f"{BASE}/{op}?{q}", timeout=60) as r:
        return r.read().decode("utf-8")

if "--probe" in sys.argv:
    for op in ("getNonPaymentItemHospDtlList",):
        print(f"=== {op} (pageNo=1) ===")
        print(call(op, pageNo=1)[:2000])
    sys.exit(0)

sys.exit("본 인제스트는 --probe 로 필드 확정 후 구현을 완성한다 (FIELD_MAP 미확정).")
