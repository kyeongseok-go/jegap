# 디자인 감사 기록 — design/03-refined.html

## 1차: 공식 frontend-design (Anthropic) — 방향 재설정
**적발**: 기존 A안이 "AI 생성 디자인 텔 #1"(크림 #F4F1EA + 고대비 세리프 + 테라코타 #D97757)에 정확히 해당. B안은 텔 #4(동일 라운드 카드 키트).
**조치**: 두 안 폐기 → 03-refined 재설계.
- 색: 오프화이트 #FAFAF8 + 잉크 #0F1115 + 슬레이트 #5A6472 + 신호 #BF2E17(신호 전용, 타 용도 금지) + #1F6F4A
- 타입: Pretendard 단일 가족(Inter/Roboto 금지 준수). 세리프 미사용
- 구조: 주제에서 길어올림 — 이 제품의 소재는 검진표가 아니라 **시간**. 연차 타임라인 레일(1998→2026→2027)이 페이지를 관통, 검사 결과는 카드가 아니라 레일에 매달린 기록 행
- 대담함 한 곳(Chanel 규칙): 풀블리드 분포 차트에 집중, 나머지 침묵
- 제거: ALL CAPS 라벨, 중점(·) 메타 나열, 화살표(→) 버튼 텍스트, 카드 3개 나열, 섹션마다 fade-up

## 2차: web-design-guidelines (Vercel) — 규정 준수
원본 규칙: https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md (확인 2026-09-16)

| 영역 | 조치 |
|---|---|
| 접근성 | 스킵 링크(fixed, focus-visible 노출) · 헤딩 `scroll-margin-top:80px` · 검색 입력 `aria-label` · 브랜드 링크 `aria-label` · SVG `role="img"`+`aria-label` |
| 비동기 알림 | 백분위 카운트업·질의서 출력에 `aria-live="polite"` |
| 폼 | `type="search"` · `name` · `autocomplete="off"` · `spellcheck="false"` · `enterkeyhint` · placeholder 말줄임표(…) 및 예시 패턴 · 버튼 `type="submit"` |
| 애니메이션 | `transition: all` 미사용(속성 명시) · transform/opacity만 · `prefers-reduced-motion` 전면 대응 · **인터럽트 가능**: 타이핑 중 재클릭 시 즉시 완성 |
| 타이포 | `text-wrap: balance`(h1·big·cta) · `tabular-nums` + `font-feature-settings:"tnum"` · 말줄임표 문자 사용 |
| 터치 | `touch-action: manipulation` · `-webkit-tap-highlight-color` 지정 · 터치 타깃 ≥44px(검색 버튼·브랜드·summary) · 모바일 입력 16px(iOS 줌 방지) |
| 안전영역 | `.wrap` 좌우 `env(safe-area-inset-*)` |
| 레이아웃 | `overflow-x: clip`을 html에(body 클리핑으로 fixed 자식 잘리던 문제 해결) |
| 테마 | `color-scheme: light` · `<meta name="theme-color">` = 배경색 |
| 성능 | CDN `preconnect crossorigin` · 폰트 dynamic-subset · 리스트 가상화 불필요(항목 3개) |

## 검증 결과
- impeccable 디텍터: **0 findings** (WCAG 대비 위반 2건 수정 후 — 신호색 #D6371F→#BF2E17)
- 모바일 375/404px: 가로 스크롤 없음, 넘치는 요소 0
- 데스크톱: 가로 스크롤 없음
- 잔여(수용): 인라인 텍스트 링크 2개 35~36px — 본문 흐름 내 링크로 패딩 확대 시 행간 파괴. WCAG 2.5.8(24px) 충족, 주변 여백 확보됨

## 브랜딩
**FAIRSHARE**(주, 영문) + **제값**(서브). 창립 질문 "내가 내는 값이 정당한가" = "정당한 몫". 병원비·학원비 확장에도 그대로 성립. 로고는 상하 2단(FAIR**SHARE** / 제값).
