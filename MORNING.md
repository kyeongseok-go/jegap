# 아침 보고 — 야간 자율 빌드 완료 (P1~P8)

## 지금 상태: 로컬 완동. 키 3개만 넣으면 배포 가능.

`npm --prefix app run dev` → http://localhost:3000 에서 전 기능 실동작.

## 밤새 한 일
- **P1~P6**: Next.js 스캐폴드 → 검진 엔진 TDD(25 tests) → 데이터 어댑터(fixture/kapt) → 검진표 UI 전체 → 질의서·안건 스트리밍 → /method 산식 공개 + OG 이미지
- **P7 통합 검증에서 잡아 고친 결함**:
  1. 픽스처 분포 결함 — "하위 0%"·"1.9배 양호"로 렌더되던 것 → 삼각분포 재캘리브레이션으로 **하위 5% 주의 / 2.1배 관찰** (확정 카피 정합)
  2. 양호 단지에 워스트용 경고 서사("목돈을 내야")가 그대로 출력 → 신호 연동 분기
  3. **OG 이미지 500 크래시** — 폰트 CDN 경로 404 → Pretendard 로컬 번들 + Vercel 트레이싱 설정
  4. OG에서 양호 단지도 빨간 "하위 40%" 강조 → 신호 게이트
- **P8 검증 최종치**: vitest 25 green · tsc 0 err · next build 7 routes · 브라우저 실동작(검색 자동완성→상세→질의서/안건 스트리밍·복사→모바일 375px 가로스크롤 0·콘솔 에러 0) · impeccable detect 정적 0건 (렌더 스캔 잔여 2건은 오탐 확인: 로고 서브픽셀 가장자리 median 5.4:1 통과 / 애니메이션 시작 전 프레임)

## 아침 활성화 절차 (모두 선택적 — 없어도 데모는 완동)
| 키 | 넣는 곳 | 켜지는 것 |
|---|---|---|
| 공공데이터포털 키 | `.env.local`의 `DATA_GO_KR_KEY=` | 실데이터 (절차: `app/scripts/ingest.md` D1 게이트 — 필드 실호출 검증 후 kapt.ts 구현) |
| `ANTHROPIC_API_KEY` | `.env.local` | 질의서 LLM 다듬기 (없으면 템플릿 모드 — 이미 완동) |
| `vercel login` | 터미널 | `vercel --prod` 배포 (Root Directory=app 설정) |

키는 `.env.local`에 직접 입력 (커밋 금지 — .gitignore 처리됨).

## 배포 후 확인 목록
1. 배포 URL 홈이 워스트 검진표로 뜨는지
2. `/d/S0001/opengraph-image` 가 PNG로 응답하는지 (카톡 공유 미리보기)
3. cron-job.org 에 5분 uptime 핑 등록 (심사기간 상시 가용)
4. 실데이터 인제스트 후엔 홈 Static 프리렌더에 `revalidate` 추가 검토 (지금 fixture는 무관)

## 알려진 한계 (의도된 것)
- fixture 90단지는 가상 명칭 + "예시 데이터" 고지 — 실명 단지는 D1 검증 후에만 (법적 안전)
- Codex MCP 교차검증: 미설치 확인 → 지시대로 생략
