# JEGAP 리디자인 5방향 브리프 (2026-09-16)

공통 불변 조건 (모든 브랜치):
- 콘텐츠·문구·정보 구조·라우팅은 절대 변경하지 않는다. 스타일만 바꾼다.
- 수정 대상: `app/app/globals.css` (토큰 + 스타일), `app/app/layout.tsx` (폰트 링크·themeColor)만. 필요 시 최소한의 클래스 추가는 가능하나 컴포넌트 마크업 변경 금지.
- 한글 폰트는 Google Fonts 또는 jsdelivr CDN에서 로드 가능한 것만 (Pretendard, Noto Sans/Serif KR, Hahmlet, Gowun Batang, IBM Plex Sans KR, Nanum Myeongjo 등). 숫자/라틴 표시용은 라틴 전용 폰트 병행 가능 (예: IBM Plex Mono, Space Grotesk, Libre Caslon 등) — font-family 폴백 체인으로 한글은 한글 폰트가 받게 한다.
- `font-variant-numeric: tabular-nums` 유지. 접근성(포커스 링, reduced-motion 블록) 유지.
- 44px 터치 타깃, keep-all, 콘트라스트(WCAG AA) 유지.
- 완료 기준: `npm run build` 성공 + 홈(/)과 상세(/d/A10027875) 렌더 확인.

## 1. design/swiss-report — 스위스 인터내셔널 · 정부 보고서
공공 보고서의 권위. 국제주의 타이포그래피 그리드.
- 팔레트: 순백 #FFFFFF 지면, 잉크 #111111, 시그널은 공문서 레드 #D0021B 하나만. 헤어라인 #DDDDDD.
- 폰트: 본문/제목 모두 IBM Plex Sans KR(또는 Noto Sans KR 700/900 대비 강하게), 숫자는 IBM Plex Mono.
- 장치: 모든 radius 0. 두꺼운 상단 룰(3px solid ink) + 얇은 헤어라인의 위계. 대문자+letter-spacing 라벨. 섹션 번호(01, 02…)를 눈썹으로. 여백 넉넉, 좌측 정렬 엄격.

## 2. design/ledger — 영수증·원장(ledger) 모노스페이스
"가격의 기록"이라는 본질을 영수증 미학으로.
- 팔레트: 미색 영수증지 #F7F4EC, 잉크 #1A1A18, 스탬프 레드 #C41E1E, 점선 헤어라인.
- 폰트: 숫자·금액·라벨 전부 IBM Plex Mono(라틴)+Pretendard 폴백, 본문 Pretendard.
- 장치: 항목-점선-금액의 영수증 행(dotted leader), 표는 등폭 숫자 우측 정렬, 절취선(dashed border), "합계" 행의 더블 룰(border-top: 3px double). 카드 대신 지면 위 구획.

## 3. design/broadsheet — 신문 탐사보도 세리프
"가격 탐사보도"의 신뢰. 브로드시트 신문 1면.
- 팔레트: 신문지 #FBF9F4, 잉크 #14120E, 포인트는 딥 버건디 #7A1F1F 또는 남색 #1A2E5A 중 하나만, 헤어라인 #E0DCD2.
- 폰트: 제목 Hahmlet(또는 Noto Serif KR 900), 본문 Noto Serif KR 400/Gowun Batang, 숫자·캡션은 Pretendard/IBM Plex Sans KR로 산세리프 대비.
- 장치: 최상단 마스트헤드(가는 룰 2개 사이 브랜드), 다단 느낌의 컬럼 룰(세로 헤어라인), 드롭캡은 금지(한글 부적합), 기사 데크(부제) 스타일, 날짜·판 표기.

## 4. design/clinical — 검진 리포트 클리니컬
"검진표" 은유를 문자 그대로. 건강검진 결과지의 침착한 신뢰.
- 팔레트: 클린 화이트 #FCFDFD, 잉크 #0E1B25, 메디컬 틸 #0E7C7B(주 액센트), 경고만 앰버 #B45309/레드 #B91C1C, 워시 #EAF4F4.
- 폰트: Pretendard 유지하되 웨이트 위계 재정렬(400/600/800), 숫자 크게.
- 장치: 결과지 카드(round 10px, 아주 옅은 그림자), 정상범위 게이지 바(내 위치 마커), 항목별 상태 pill(관찰/주의/양호), 섹션 아이콘 없이 컬러 코드 탭.

## 5. design/dark-data — 다크 데이터 터미널
데이터 제품의 밀도. 블룸버그 터미널/모던 핀테크 다크.
- 팔레트: 배경 #0C0E12, 서피스 #14171D, 텍스트 #E8EAED/#9AA3AF, 액센트 일렉트릭 그린 #34D399 또는 앰버 #F59E0B(신호), 레드 #F87171(경고), 헤어라인 #232830.
- 폰트: Pretendard + 숫자 IBM Plex Mono. 
- 장치: 차트·스파크라인이 주인공(발광 스트로크), 모노 숫자 그리드, 상단 티커 느낌의 도메인 탭, 카드 경계는 1px 헤어라인. color-scheme: dark, themeColor 갱신. 콘트라스트 주의.
