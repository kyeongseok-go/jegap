# GATE — 검토·배포 결정 문서

작성: 2026-09-20 09:25 · 브랜치 `feat/domains-6-9` · **push·배포 안 함**
루프는 마감 시각(08:30) 경과로 정지했다. 사이클 5/20 사용, 태스크 5/8 완료.

---

## 0. 먼저 알아야 할 것

**현재 라이브 서비스(https://jegap-one.vercel.app)는 손대지 않았다.** 모든 작업이
`feat/domains-6-9` 브랜치에만 있고 `main` 은 그대로다. 아무것도 배포되지 않았다.

**새 도메인 3개는 아직 데이터가 없다.** 화면·엔진·테스트·인제스트 스크립트까지 다 만들었지만
실제 수집(T7)을 못 돌렸다. 지금 이 브랜치를 배포하면 `/fr /oil /gr` 는 "준비 중"으로만 뜨고,
탭에는 **아예 나타나지 않는다**(데이터가 있을 때만 노출하도록 만들었다). 즉 배포해도 안전하지만
사용자가 볼 수 있는 새 기능은 없다.

---

## 1. 완료한 것과 증거

| 태스크 | 내용 | 검증 |
|---|---|---|
| T1 | 도메인 뼈대 — 라우트 `/fr /oil /gr`, 검색 API 3종, lib 3종, 조건부 탭, sitemap 게이트 | tsc 0 · vitest 37 · build · 신규 6경로 200 · 회귀 0 · CDP 6건 over:[] |
| T2 | 히어로 배경 3종 webp(78~96KB) + CSS 3줄 추가 | CDP 6건 over:[] · 1280px 실물 확인 · CSS 삭제 0줄 |
| T3 | 데이터 계약 확정 + 어댑터·상세화면·OG·테스트 | tsc 0 · **vitest 48** · 돌연변이 2건 검증 · 회귀 0 |
| T4 | 인제스트 3종 (드라이런까지) | 3종 드라이런 통과 · 키 하드코딩 없음 |
| T5 | CSP 승격 준비 + `/terms` 출처표 | CSP 위반 114→0 · 강제모드 폰트 3종 로드 확인 |

**커밋 15개 · 52파일 · +3,470 / −18줄.** 전체 목록은 `git log --oneline main..feat/domains-6-9`.

### 루프가 실제로 잡은 사고 3건

1. **테스트 픽스처가 프로덕션 데이터로 유출**됐다. 초기 테스트가 실파일명
   `data/franchise.json.gz` 로 합성 데이터 121행을 쓰고 로드 실패로 죽어 정리가 안 됐다.
   `ready()` 가 참이 되어 "창업비용" 탭이 **살아 있는 5개 화면 전부에** 떴고 빌드에도 섞였다.
   회귀 관문이 diff 로 잡았다. → 제거 + `__fixture_` 접두사 구조로 교체 + 영구 가드 테스트 추가.
2. **CSP 를 그대로 승격했으면 전 페이지 폰트가 깨졌다.** Report-Only 위반 114건이 전부
   `cdn.jsdelivr.net`(Pretendard)이었다. 정책에 없던 호스트다. → 보강 후 0건.
3. **테스트가 표본 오염을 못 잡고 있었다.** 돌연변이(가드 제거)를 주입했는데 전부 통과했다.
   픽스처의 rankable=0 행이 다른 code 를 써서 애초에 섞일 수 없었다. → 같은 code 로 수정.

---

## 2. 당신이 결정할 것

### (a) 지금 배포할 것인가 — **권고: 아니오**

오늘 23:59 이 제출 마감이고 심사는 09.21~10.17 이다. 헌법 6조(가용성 > 기능)를 생각하면
**데이터 없는 새 탭을 위해 마감일에 배포할 이유가 없다.** 두 갈래 중 하나를 고르면 된다.

- **A안 (안전)**: 오늘은 배포하지 않는다. 브랜치는 그대로 두고 마감 후에 T7~T9 를 마저 한다.
  제출본은 현재 라이브 그대로. **잃는 것 없음.**
- **B안 (적극)**: 지금 T7(실데이터 수집)을 돌린다. 키 3종이 다 있으니 30~40분이면 된다.
  그 뒤 T6(고강도 검증) 통과를 확인하고 배포 + 제출 설명서 갱신.
  **조건: T6 의 9개 항목이 전부 통과할 때만.** 하나라도 미흡하면 A안으로 돌아간다.

### (b) CSP 승격 — 한 줄 변경, 검증 완료

`app/next.config.ts` 의 헤더 이름만 바꾸면 된다. 강제 모드로 직접 돌려 위반 0건과
폰트 3종 로드를 확인했다.

```
- { key: "Content-Security-Policy-Report-Only", value: CSP_REPORT_ONLY },
+ { key: "Content-Security-Policy", value: CSP_REPORT_ONLY },
```

다만 **로컬에서만 확인했다.** 프로덕션에는 로컬에 없는 외부 리소스가 있을 수 있으니,
배포 후 Report-Only 로 한 번 더 관측하고 승격하는 쪽이 안전하다. 급하지 않은 항목이다.

### (c) 공정위 금액 단위 — **확인 필요, 미해결**

`getBrandFntnStats` 의 금액 단위가 **Swagger 명세에도 없다**(확인 완료). 샘플이
가맹 5000 / 교육 2000 / 보증 1000 / 기타 30500 / 합계 38500 이라 천원 단위로 보이지만
이건 범위 타당성 추론이지 확인이 아니다. `ingest_franchise.py` 에 `AMT_UNIT_WON=1000`
가정과 **합계 중앙값이 1천만~3억원 밖이면 파일을 쓰지 않고 거부**하는 게이트를 넣어뒀다.
게이트가 통과해도 단위가 틀릴 수 있다. 공정위 가맹사업거래 사이트(franchise.ftc.go.kr)의
같은 브랜드 공시액과 대조하면 5분이면 확정된다.

---

## 3. 남은 태스크

| | 상태 | 막는 것 |
|---|---|---|
| T6 고강도 검증(9항목 전수) | todo | T7 선행 — 데이터가 있어야 의미 있는 항목이 있다 |
| T7 실데이터 수집 | todo | **아무것도 막지 않는다. 키 3종 다 있다.** |
| T9 Codex 교차검증 브리프 | todo | T6 선행 |
| T8 법령 조항 대조 | blocked | 법제처 OC 미발급 |
| T10 KAMIS 농수축산 | blocked | 승인 결재 대기 |

**T7 은 지금 바로 돌릴 수 있다.** 세 스크립트 모두 실패 시 파일을 쓰지 않고 중단하도록 만들었다.

```bash
cd /Users/kogyeongseok/workspace/jegap/app && set -a && . ./.env.local && set +a
SSL_CERT_FILE=/etc/ssl/cert.pem python3.14 scripts/ingest_oil.py data/oil.json.gz
SSL_CERT_FILE=/etc/ssl/cert.pem python3.14 scripts/ingest_franchise.py data/franchise.json.gz
SSL_CERT_FILE=/etc/ssl/cert.pem python3.14 scripts/ingest_goodsprice.py data/goods.json.gz
```

⚠ 오피넷은 **등록한 IP 에서만** 호출된다. 이 맥에서 돌려야 한다(Vercel 런타임 불가).
⚠ 참가격은 상품 수만큼 호출한다(600여 콜, 개발계정 한도 2,000). 20~30분 걸린다.

---

## 4. 배포 절차 (결정이 서면)

```bash
cd /Users/kogyeongseok/workspace/jegap
git checkout main && git merge --no-ff feat/domains-6-9
npm --prefix app run build && python3.14 .loop/regress.py --check   # exit 0 확인
git push origin main        # ← 이 순간 Vercel 자동 배포가 시작된다
```

배포 후 https://jegap-one.vercel.app 의 기존 5개 도메인이 정상인지 먼저 확인할 것.

---

## 5. 루프가 못 한 것 — 솔직하게

- **실데이터를 한 건도 수집하지 못했다.** API 명세 확정(Swagger 추출·실호출)에 예상보다
  시간이 들었고, 키가 밤중에 순차적으로 들어와 T7 이 뒤로 밀렸다.
- T6 의 9개 검증 항목을 **전수 수행하지 않았다.** 태스크마다 부분적으로만 돌렸다
  (tsc·vitest·build·회귀·CDP 넘침은 매번, a11y·링크 전수·헌법 감사는 미실시).
- 참가격의 지역 코드표(`getStandardInfoSvc.do`)를 쓰지 않고 **주소 문자열을 공백으로 잘라**
  시도·시군구를 얻는다. 주소 형식이 다른 점포에서 틀릴 수 있다. T7 에서 실데이터를 보고
  검증해야 한다.
- 오피넷 시군구 평균은 **개별 주유소가 아니다.** "주유소편"이라는 이름과 실제 해상도가
  어긋날 수 있다. 화면 문구에는 명시했지만 탭 이름은 재고 여지가 있다.

## 6. 루프 재개 방법

```bash
python3.14 -c "import json;p='.loop/state.json';d=json.load(open(p));d['stopAtLocal']='2026-09-20T23:00:00+09:00';json.dump(d,open(p,'w'),ensure_ascii=False,indent=2)"
```
마감 시각을 늘린 뒤 다시 크론을 걸거나, 세션에서 직접 이어서 진행하면 된다.
멈추려면 `echo stop > .loop/STOP`.
