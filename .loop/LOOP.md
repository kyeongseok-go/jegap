# LOOP — 6~9호 도메인 자동 진행 작업지시서

이 문서는 **크론이 깨울 때마다 읽는 작업지시서**다. 새 세션이 이 대화를 전혀 못 봤다는 전제로 쓰였다.
설계 배경은 `HANDOFF.md`(같은 저장소 루트). 진행 상태는 `.loop/state.json`.

---

## 0. 매 사이클 첫 3줄 — 예외 없이

```bash
cd /Users/kogyeongseok/workspace/jegap
[ -f .loop/STOP ] && { echo "STOP 파일 존재 — 종료"; exit 0; }
python3.14 .loop/tick.py            # 정지조건 판정 + 다음 태스크 출력
```

`tick.py`가 `STOP:` 로 시작하는 줄을 내면 **아무 작업도 하지 말고** 그 이유를 한 줄 보고하고 끝낸다.
`NEXT: <task-id>` 를 내면 그 태스크 하나만 수행한다. **한 사이클에 한 태스크.**

---

## 1. 절대 금지 (위반 시 사용자 신뢰 손상)

1. **`git push` 금지.** `main` push는 Vercel 자동 배포를 트리거한다. 심사기간(~10/17) 링크 상시 가용이 헌법 5조다.
2. **`vercel deploy` 금지.** 배포는 사용자가 검토 후 직접 한다.
3. **브랜치 `feat/domains-6-9` 밖으로 나가지 않는다.** `main` 체크아웃 금지.
4. **API 키·환경변수 값을 출력하거나 커밋하지 않는다.**
5. **없는 데이터를 추정해 채우지 않는다.** 확인 못 한 것은 "확인 불가"로 남긴다.
6. **실호출로 확인하지 않은 API 필드명을 코드에 박지 않는다.** 미검증이면 `// 미검증 — 실호출 전 사용 금지` 주석과 함께 게이트로 막는다.

## 2. 매 사이클 프로토콜

1. `git status --short` 가 깨끗한지 확인. 더럽다면 이전 사이클이 중단된 것 — 먼저 정리하거나 커밋한다.
2. `tick.py` 가 지정한 태스크 **하나**를 수행한다.
3. 검증 3종을 통과해야 한다:
   ```bash
   export PATH="$HOME/.local/node/bin:$PATH"; cd app
   npx tsc --noEmit && npx vitest run && npm run build
   ```
4. **회귀 관문 — 커밋 전 반드시 통과해야 한다.**
   ```bash
   python3.14 .loop/regress.py --check     # exit 0 이어야 커밋 가능
   ```
   살아 있는 5개 도메인(`/ /h /a /f /p /method /terms` + 도메인별 상세 1건, 총 11경로)의
   보이는 텍스트를 기준선과 대조한다. **한 글자라도 다르면 exit 1 과 diff 를 낸다.**
   - 새 도메인을 붙이는 작업이 기존 화면을 건드렸다면 그건 회귀다. 되돌린다.
   - **의도한 변경일 때만** `--save` 로 기준선을 갱신하고, **왜 바뀌어야 했는지를
     커밋 메시지에 쓴다.** 통과시키려고 말없이 `--save` 하는 것은 금지다.
   - 새 라우트(`/fr /oil /gr`)는 기준선에 없으므로 "신규" 로 보고된다. 그 도메인이
     완성된 태스크의 끝에서만 `--save` 로 편입한다.
5. 통과하면 커밋한다(push 안 함). 실패하면 고칠 때까지 같은 태스크에 머문다.
   - 같은 태스크에서 3사이클 연속 실패하면 `state.json` 의 해당 태스크를 `blocked` 로 바꾸고
     `notes` 에 막힌 이유를 적은 뒤 다음 태스크로 넘어간다.
6. `python3.14 .loop/tick.py --done <task-id> --evidence "<검증 결과 한 줄>"` 로 상태를 갱신한다.
7. 편집은 **assert 포함 python 스크립트**로 한다(무음 no-op 사고 3회 이력).

### 지금 돌아가는 서비스를 깨뜨리지 않는 것이 1순위다

새 도메인 3개를 붙이는 것보다 **기존 5개가 계속 정상인 것**이 중요하다. 심사기간에
링크가 깨지면 기능이 아무리 많아도 소용없다(헌법 5·6조). 다음을 반드시 지킨다.

- `lib/pricedom/core.ts` 처럼 **5개 도메인이 공유하는 파일을 고칠 때는** 고치기 전에
  왜 공유 파일을 건드려야 하는지 한 줄로 적고, 고친 뒤 회귀 관문을 돌린다.
  가능하면 공유 파일을 건드리지 말고 **새 파일로 확장**한다.
- `app/data/` 의 기존 `.json.gz` 5개는 **절대 손대지 않는다.** 새 도메인은 새 파일로.
- 픽스처·합성 데이터가 `app/data/` 나 프로덕션 번들에 들어가면 안 된다.
- 전역 CSS는 **새 선택자만 추가**한다. 기존 선택자의 속성을 바꾸면 5개 도메인이 같이 움직인다.
  ⚠ **회귀 관문의 빈틈**: `regress.py` 는 보이는 텍스트만 비교하므로 **CSS만 바뀌는 회귀는 못 잡는다.**
  그래서 `globals.css` 를 건드렸으면 커밋 전에 삭제 줄이 0인지 직접 확인한다.
  ```bash
  git diff --numstat app/app/globals.css     # 두 번째 열(삭제)이 0 이어야 한다
  ```
  0이 아니면 기존 규칙을 바꾼 것이다 — 왜 바꿔야 했는지 커밋 메시지에 쓰고,
  영향받는 도메인 화면을 CDP로 직접 눈으로 확인한 뒤에만 진행한다.
- `next.config.ts`(보안 헤더)·`middleware`·`robots`·`sitemap` 은 기존 항목을 유지한 채 추가만 한다.
- 의심스러우면 **하지 않는다.** 판단이 갈리면 그 항목을 `GATE.md` 에 적어 사용자에게 넘긴다.

## 3. 정지 조건 — 하나라도 걸리면 즉시 중단

| 조건 | 판정 |
|---|---|
| `.loop/STOP` 파일 존재 | tick.py |
| `state.json.stopAtLocal` 시각 경과 | tick.py |
| `cycles >= maxCycles` | tick.py |
| 남은 태스크가 전부 `blocked`/`done` | tick.py |
| **사용량 한도 경고를 보았을 때** | **너 자신** |

마지막 항목이 중요하다. 주간 한도 잔량을 읽는 로컬 API가 없다(확인함). 그래서
**대화 중 "usage limit", "주간 한도", "approaching limit" 류의 시스템 경고를 보면
즉시 `.loop/STOP` 을 쓰고 크론을 지우고 종료한다.** 작업 중이어도 커밋만 하고 끝낸다.

```bash
echo "usage-limit-warning $(date -Iseconds)" > .loop/STOP
```

## 4. 태스크가 전부 끝나면 — 게이트

`.loop/GATE.md` 를 쓴다. 사용자가 아침에 읽고 검토·배포를 결정하는 문서다. 반드시 포함:

- 이번 루프가 만든 커밋 목록 (`git log --oneline main..feat/domains-6-9`)
- 각 태스크의 검증 증거 (명령과 결과)
- **사용자가 직접 해야 하는 일** — API 활용신청/키 발급 목록과 정확한 URL
- 미해결·보류 항목과 그 이유
- 배포 절차 (`git push origin feat/domains-6-9` → PR → 검토 → main 병합)
- 루프가 못 한 것 솔직하게

그 뒤 `.loop/STOP` 을 쓰고 크론을 삭제한다.

## 5. 검증 bar — T-hard-verify 태스크에서 전수 수행

낮은 기준으로 통과 처리하지 않는다. 하나라도 실패하면 태스크 미완료다.

1. `npx tsc --noEmit` 에러 0
2. `npx vitest run` 전부 통과, **새 도메인마다 최소 3개 테스트**
   (표본 오염 없음 / 표본 미달 시 순위 미산출 / 단위·조건 불일치 처리)
3. `npm run build` 성공, 새 라우트가 빌드 목록에 전부 보일 것
4. **가로 넘침 0** — 새 라우트 전부를 390px·1280px 에서 CDP 실측
   ```bash
   python3.14 /tmp/cdp.py "<url>" 390 /tmp/x.png     # 스크립트는 §7 참조
   ```
   `over:[]` 가 아니면 실패. **헤드리스 `--window-size` 만으로는 미디어쿼리가 안 잡힌다 — 반드시 CDP.**
5. 내부 링크 전수 200 (sitemap 항목 + 각 페이지의 `href^="/"` 전부)
6. a11y: 페이지마다 `h1` 하나, 헤딩 건너뛰기 없음, 모든 `input` 에 label,
   모든 `img` 에 alt, `:focus-visible` 가시
7. **헌법 감사** — 새로 쓴 화면 문구 전수 검사:
   - 판정·등급·추천 표현 없음 ("좋은/나쁜", "추천", "A등급", "저렴합니다")
   - 공시에 없는 수치를 만들어 쓰지 않음
   - 표본 미달 항목이 순위·하이라이트에 뜨지 않음
   - 기준 시점이 화면에 표기됨
8. 픽스처(합성) 데이터가 프로덕션 번들·`app/data/` 에 섞이지 않음
9. **기존 5개 도메인 회귀 없음** — `python3.14 .loop/regress.py --check` 가 exit 0.
   이 항목은 다른 8개가 다 통과해도 단독으로 태스크를 실패시킨다.

## 6. Codex 교차검증 (마지막, 여유 있을 때만)

`docs/20-CROSS-EXAM-BRIEF.md` 형식을 따라 `docs/2026-09-20-CROSS-EXAM-6to9.md` 를 쓴다.
검증 요청 항목은 최소 다음을 포함한다:
- 새 도메인의 비교 단위가 실제로 같은 조건인지 (STEP 1에서 잡은 것과 같은 종류의 오염)
- 인용한 법 조항이 실제로 존재하는지
- 이용허락 조건(공공누리 유형·상업적 이용)이 화면 표기와 일치하는지
- 표본 게이트가 우회되는 경로가 있는지

## 7. 환경 메모

- Node: `export PATH="$HOME/.local/node/bin:$PATH"`
- Python: **`python3.14`** (openpyxl·websocket-client 설치돼 있음). `SSL_CERT_FILE=/etc/ssl/cert.pem` 필요.
- 로컬 확인: `cd app && npx next start -p 4000` (점유 시 `lsof -ti:4000 | xargs kill -9`)
- 회귀 관문: `.loop/regress.py --check` (기준선 `.loop/baseline/`, 갱신은 `--save`)
- CDP 캡처·측정 스크립트: `.loop/cdp.py` (인자: url width out.png). 출력의 `over:[]` 와 `mq` 를 본다.
- git author 는 `kugll9606@naver.com` 이어야 한다(Vercel 계정 일치).

## 8. 참조

- 확장 설계: `HANDOFF.md`
- 검토 보고서: `docs/2026-09-17-UX-SECURITY-REVIEW.md` / 대응: `docs/2026-09-17-REVIEW-RESPONSE.md`
- 도메인 공통 엔진: `app/lib/pricedom/core.ts` (STEP 1에서 `split()`·`rankable` 추가됨)
- 히어로 배경 원본: `artifacts/category-backgrounds/*.png` (Codex 생성, 1536×1024)
