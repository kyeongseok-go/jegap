# 야간 자율 빌드 루프 차터 — JEGAP v1 (2026-09-16 밤)

> 목표: 40-DESIGN.md v4 + design/03-refined.html(확정 디자인)을 **실제 동작하는 Next.js 앱**으로.
> 품질 바: "더 이상 수정할 게 없는 수준" — 아래 종료 조건 전부 green이 될 때까지 루프.

## 환경 사실 (2026-09-16 확인)
- Codex MCP **미설치** → 교차검증 스킵 (사용자 지시: 세팅돼 있을 때만)
- Vercel CLI **로그아웃** → 배포는 아침 사용자 로그인 후 (로컬 프로덕션 빌드까지 완성)
- 공공데이터 API 키 **없음** → 데이터 어댑터 패턴으로 차단 격리 (아래 §차단 항목)
- 사용 스킬: superpowers(TDD·writing-plans·verification-before-completion) · webapp-testing(공식, Playwright) · impeccable detect · web-design-guidelines · ponytail(상시)

## 루프 구조 (매 페이즈 반복)
```
계획(어떤 파일, 어떤 검증) → 구현 → 3층 검증 → 결함 0까지 수정 → 커밋 → 다음 페이즈
```
**3층 검증** (superpowers verification-before-completion: 증거 없인 완료 주장 금지)
1. **논리층**: vitest 단위 테스트 (엔진·어댑터·산식) + `tsc --noEmit`
2. **품질층**: `next build` 성공 + impeccable detect 0건 + Web Interface Guidelines 대조
3. **실동작층**: dev 서버 기동 → Playwright/브라우저로 실제 흐름 테스트 (검색→검진표→질의서 생성→공유), 콘솔 에러 0, 모바일 375px 무결

## 페이즈
| # | 페이즈 | 완료 기준 |
|---|---|---|
| P1 | Next.js 스캐폴드 + 저장소 구조 | `next build` 성공 |
| P2 | 검진 엔진 (순수 TS, TDD) | 백분위·신호 규칙·유사군 필터·상승률 테스트 전부 green |
| P3 | 데이터 계층 (어댑터 패턴) | fixture 어댑터로 전 기능 동작 + kapt 어댑터 스텁(키 주입 시 활성) |
| P4 | UI (03-refined 이식) | 홈=워스트 검진표 · /d/[code] · 검색 · 인터랙션 4종 |
| P5 | 처방전 | 결정론 템플릿(법 조항+수치) 즉시 동작, ANTHROPIC_API_KEY 있으면 LLM 다듬기 활성 |
| P6 | OG 이미지 + 공유 | /d/[code] OG 동적 생성 |
| P7 | 통합 검증 루프 | 3층 전부 green, 결함 0 |
| P8 | 아침 인계 | LATEST.md·보고서·활성화 절차 1페이지 |

## 헌법 준수 체크 (매 페이즈)
무로그인 1클릭 / "등급" 표현 금지·신호+백분위만 / 무소음(불확실=미표시) / LLM에 산수 금지 / 도메인 어댑터(확장계약)

## 차단 항목과 아침 활성화 경로 (여기만 사람 필요)
| 차단 | 아침에 할 일 | 소요 |
|---|---|---|
| 공공데이터 API 키 | `.env.local`에 `DATA_GO_KR_KEY=` 추가 → 인제스트 스크립트 실행 | 발급 10분+적재 |
| ANTHROPIC_API_KEY (앱용) | `.env.local`에 추가 → 소견·질의서 LLM 다듬기 자동 활성 | 2분 |
| Vercel 배포 | `vercel login` → `vercel --prod` (설정 파일 준비됨) | 5분 |
- 키가 없어도 앱은 **fixture(예시 데이터 명시)로 완전 동작** — 시연·개발·테스트 가능 상태 유지

## 종료 조건 (전부 충족 시에만 "완료" 보고)
- [ ] vitest 전체 green · tsc 0 에러 · next build 성공
- [ ] impeccable detect 0건
- [ ] Playwright 시나리오 (홈 로드→인터랙션→검색→상세→질의서) 통과, 콘솔 에러 0
- [ ] 모바일 375px 가로 스크롤 0 · 터치 타깃 기준 유지
- [ ] git 페이즈별 커밋 + AI_TOOLS.md 갱신 + LATEST.md 인계
