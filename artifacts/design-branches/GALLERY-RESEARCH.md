continuing existing session: npIoaRyiNeaiRruN
Thinking: The user wants the full report reproduced exactly as written, including the image markdown reference to the local file path, so I'll output it faithfully without summarizing.


# 디자인 갤러리 4곳 리서치 보고서
**대상 테마: 데이터 · 금융 · 시빅테크 · 미니멀 에디토리얼 / 총 15개 사이트**

## 사전 확인 사항 (중요)

수집 과정에서 확인한 각 갤러리의 실제 메타데이터 노출 수준입니다. 사전 가정과 일부 달랐습니다.

| 갤러리 | 팔레트 hex | 폰트명 |
|---|---|---|
| **land-book** | ✅ 상세 페이지에 10개 hex 명시 | ❌ 폰트명 없음, 서체 **분류**(Sans Serif/Serif/Display)만 |
| **awwwards** | ⚠️ **SOTD 수상작에만** "Color Palette" hex 명시 (HM/Nominee는 없음) | ❌ 폰트명 없음 (`Aa` 샘플만) |
| **godly.website** | ❌ (→ **recent.design**으로 리브랜딩됨) 색상은 "Dark/Vibrant" 등 정성 태그만 | ❌ 없음 |
| **lapa.ninja** | ❌ "black, orange" 등 색이름만 | ✅ **Typeface 필드로 폰트명 명시** (단, 실제와 불일치 사례 있음) |

→ 폰트명이 명시되지 않은 곳은 **실제 사이트를 열어 `getComputedStyle`로 실측**했습니다. 아래 표기 기준:
- **[명시]** = 갤러리 상세 페이지에 그대로 적힌 값
- **[실측]** = 라이브 사이트에서 직접 추출한 값

**근거 예시 (awwwards Sharplink 상세 페이지 Color Palette 섹션):**

![awwwards Sharplink 팔레트](/Users/kogyeongseok/.aside/u/0/sessions/2026-09-16_npIoaRyiNeaiRruN/tmp/awwwards-palette.png)

---

## A. land-book.com — Finance 카테고리 최신 등록작 (4건)

### 1. Concourse
- **URL** https://www.concourse.ai/ · [land-book 상세](https://land-book.com/websites/98174-concourse-ai-transformation-for-finance) (Verified Sep 7)
- **폰트** [실측] 제목 `seasonMix` (400) / 본문 `Zalando Sans` — [명시] 서체 분류: Serif
- **팔레트** [명시] `#F9FAFA` `#191615` `#7A7572` `#36312D` `#5A534F` `#84715F` `#655445` `#3F3022` `#734B38` `#986B54`
- **레이아웃·장치** 갤러리 명시 태그가 Background Video·Cards·Big Type in Footer로, 풀블리드 배경 영상 히어로 위에 카드형 기능 블록을 쌓는 전형적 엔터프라이즈 핀테크 구조.
  실측 배경은 화이트(`#FFFFFF`)와 딥네이비(`#0D1018`)를 교차시키고, 명시 팔레트의 브라운 계열이 이미지·그래프 액센트로만 들어가 차분한 대비를 만든다.
- **분위기** 묵직함

### 2. Griffin
- **URL** https://www.griffin.com/ · [land-book 상세](https://land-book.com/websites/97833-griffin-the-bank-you-can-build-on) (Verified Jul 27)
- **폰트** [실측] 제목 `Cambon` (serif, weight 300) / 본문 `Söhne` — [명시] 서체 분류: Sans Serif
- **팔레트** [명시] `#131313` `#353535` `#535353` `#6B6B6B` `#A3A3A3` `#C8C8C8` `#D7D7D7`
- **레이아웃·장치** 갤러리가 Black & White + Visible Borders로 분류할 만큼 무채색 단일 축이며, 라이브 배경도 `#0C0C0B` / `#E6E1D9` 두 톤뿐이다.
  라이트 세리프 대형 헤드라인과 그로테스크 본문을 대비시키고, 눈에 보이는 선(border)으로 섹션을 구획하는 은행 특유의 신뢰감 장치를 쓴다.
- **분위기** 정갈함

### 3. Nominal
- **URL** https://nominal.so/ · [land-book 상세](https://land-book.com/websites/99202-nominal-o-nominal-agentic-ai-platform-that-runs-your-accounting) (Verified Aug 27)
- **폰트** [실측] 제목 `STK Bureau Serif` (300) / 본문 `Retorika` — [명시] 서체 분류: Serif
- **팔레트** [명시] `#EEF0EA` `#C2C3BF` `#A1A39E` `#D8F5E7` `#A7CABA` `#121311` `#668777` `#494946` `#383836` `#1A3729`
- **레이아웃·장치** Parallax + Big Footer + Pastel Colors 조합으로, 회계 SaaS답지 않게 세이지 그린 파스텔을 기조로 스크롤 시차 연출을 넣었다.
  라이트 웨이트 세리프 헤드라인 + 산세리프 본문의 에디토리얼식 이중 서체 전략이 "AI 회계"라는 딱딱한 주제를 부드럽게 중화한다.
- **분위기** 온화함

### 4. Rulebase
- **URL** https://www.rulebase.co/ · [land-book 상세](https://land-book.com/websites/97732-rulebase-revenue-workforce-for-financial-services) (Verified Jul 20)
- **폰트** [실측] 제목 `ABC Diatype` (400) / 본문 `Inter` — [명시] 서체 분류: Sans Serif
- **팔레트** [명시] `#F0EEEC` `#191815` `#CAC3B0` `#C8C5BF` `#A2A09B` `#AAA38F` `#2E2D2B` `#54524A` `#83817C` `#E3DCC9`
- **레이아웃·장치** 웜그레이/베이지 단일 계열에 오렌지 액센트(`#FE4C00`, 실측) 하나만 찍는 극단적 절제형 팔레트 운용.
  Animation 태그대로 스크롤 인터랙션은 있으나 장식 요소는 거의 없고, ABC Diatype의 중립적 그로테스크가 화면 전체의 톤을 잡는다.
- **분위기** 담백함

---

## B. awwwards.com/websites/ — 수상작 (5건)

### 5. Sharplink — by Studio Freight
- **URL** https://www.sharplink.com/ · [awwwards 상세](https://www.awwwards.com/sites/sharplink) · **SOTD 7.38/10**
- **폰트** [실측] 제목 `Archivo` (500) / 본문 `Archivo Narrow`
- **팔레트** [명시] `#0E76FF` `#F3F3F3` (awwwards: "palette of 2 colors")
- **레이아웃·장치** 기관투자용 이더리움 트레저리 플랫폼. 명시 태그가 3D·GSAP·Three.js·Footer Design으로, 블루 단색 위 3D 오브젝트를 축으로 삼는다.
  실측 배경은 순흑(`#000000`)과 오프화이트(`#F7F7F5`) 2톤뿐이라 `#0E76FF` 블루가 유일한 시각적 신호로 작동한다.
- **분위기** 단호함

### 6. Cerebrium
- **URL** https://cerebrium.ai/ · [awwwards 상세](https://www.awwwards.com/sites/cerebrium) · **SOTD 7.39/10**
- **폰트** [실측] 제목 `ABC Favorit` (300) / 본문 `Suisse Int'l`
- **팔레트** [명시] `#172B76` `#902177` — [실측 보강] `#101421` `#FF488B` `#EEF2F5` `#CFD7E7`
- **레이아웃·장치** awwwards 명시 태그에 **Data Visualization**과 App Style이 함께 달린 드문 케이스로, 서버리스 GPU 인프라의 지표를 UI 스크린샷처럼 재현한다.
  Three.js + Cinema 4D 기반 3D와 마이크로인터랙션을 붙였고, 네이비→마젠타 그라디언트가 데이터 레이어의 깊이를 표현하는 장치로 쓰인다.
- **분위기** 역동적

### 7. Aspen Search
- **URL** https://www.aspensearch.com/ · [awwwards 상세](https://www.awwwards.com/sites/aspen-search) · **SOTD 7.48/10**
- **폰트** [실측] 제목·본문 모두 `Suisse Intl` (450) 단일 서체
- **팔레트** [명시] `#FFFFFF` `#232323` — [실측 보강] 민트 액센트 `#A1FFCB`
- **레이아웃·장치** 퀀트 트레이딩·연구 인재 헤드헌팅 회사. 명시 태그가 **Minimal + Typography + Single page**로, 이번 리서치에서 가장 순수한 미니멀 에디토리얼 표본이다.
  단일 서체 + 흑백 2색 + 원페이지 스크롤 구조로 정보 위계를 오직 타입 사이즈와 여백으로만 만들고, 민트 한 색만 인터랙션 신호로 남긴다.
- **분위기** 간결함

### 8. Boulder County Climate Action *(시빅테크)*
- **URL** https://climateguide.bouldercounty.gov/ · [awwwards 상세](https://www.awwwards.com/sites/boulder-county-climate-action) · **Nominee**
- **폰트** [실측] 제목·본문 `Degular` (500)
- **팔레트** 갤러리 미표기(Nominee라 Color Palette 섹션 없음) → [실측] `#000000` `#FFFFFF` `#F6F3EF` `#292722`
- **레이아웃·장치** 미국 카운티 정부의 기후행동 가이드. 명시 태그에 **Institutions·Social responsibility·Data Visualization·Storytelling**이 모두 달려 있고, Astro로 구축됐다.
  실제 화면은 순흑 풀블리드 위에 "We know how this ends." 대형 문장이 스크롤에 따라 한 구절씩 밝아지는 리빌 방식 — 공공 사이트에서 보기 드문 다큐멘터리형 도입부다.
- **분위기** 엄중함

### 9. Obama Presidency Oral History *(시빅테크·아카이브)*
- **URL** https://obamaoralhistory.columbia.edu/ · [awwwards 상세](https://www.awwwards.com/sites/obama-presidency-oral-history) · **Honorable Mention**
- **폰트** [실측] 제목·본문 `Signifier` (serif, 700)
- **팔레트** 갤러리 미표기 → [실측] `#F2F0ED` `#DAD6D3` `#054264` `#202020` `#424242`
- **레이아웃·장치** 컬럼비아대 구술사 아카이브. 명시 태그가 **Typography·Video·Data Visualization·Storytelling** 조합으로, 영상 증언과 통계를 한 흐름에 엮은 에디토리얼 구조.
  아이보리 지면 + 딥네이비(`#054264`) 단일 액센트에 Signifier 세리프를 전면 적용해 인쇄 아카이브의 질감을 웹으로 옮겼다.
- **분위기** 기록적

---

## C. godly.website (→ recent.design) — 3건

> ⚠️ `godly.website` 접속 시 **`recent.design`으로 리다이렉트**됩니다. 리브랜딩된 것으로 보이며, 이 갤러리는 hex·폰트를 일절 명시하지 않고 Category / Style / Color(정성) / Framework 태그만 제공합니다.

### 10. Stripe Press
- **URL** https://press.stripe.com/ · [recent 상세](https://recent.design/i/uf56li6-stripe-press)
- **폰트** 미표기 → [실측] 제목 `Ivar Headline` (600) / 본문 `Ivar Text`
- **팔레트** [명시] "Dark, Vibrant"뿐 → [실측] `#201819` `#303328` `#C1B676` `#DBC895` `#0D121F` `#4D1A28`
- **레이아웃·장치** 명시 태그 Editorial / 3D·Illustrative·Interactive. 어두운 지면 위에 실물 책등(spine)을 3D로 세워 놓고 스크롤로 훑게 하는 서가 은유가 핵심 장치.
  Ivar 세리프 패밀리를 제목·본문 모두에 써서 출판물 지면의 연속성을 유지하고, 금빛(`#DBC895`) 본문 컬러가 종이 인쇄 느낌을 강화한다.
- **분위기** 고전적

### 11. Increase
- **URL** https://increase.com/ · [recent 상세](https://recent.design/i/gum9nh3-increase)
- **폰트** 미표기 → [실측] 제목·본문 `TT Interphases Pro` (600)
- **팔레트** [명시] "Vibrant"뿐 → [실측] `#FFFFFF` `#EDF1F5` `#F5F6F7` `#1D2A36` `#334352` `#657482`
- **레이아웃·장치** 개발자 대상 뱅킹 인프라. 명시 스타일 태그가 **Typographic·Geometric·Minimal·Clean·Large Type**으로, 대형 흑색 타이포 + 밝은 회색 지면이 뼈대다.
  거의 무채색 블루그레이 계조로만 구성하고, 기하학 3D 로고마크 하나만 유일한 채도 포인트로 남기는 절제형 구성.
- **분위기** 명료함

### 12. Topology
- **URL** https://www.topology.vc/ · [recent 상세](https://recent.design/i/4hdoto0-topology)
- **폰트** 미표기 → [실측] 제목 `Magnetik` (300) / 본문 `LazareGrotesk`
- **팔레트** [명시] "Dark, Gradient"뿐 → [실측] `#000000` `#151515` `#FFFFFF` `#E4E2D8` `#9B9B9B`
- **레이아웃·장치** AI·로보틱스·뉴로테크에 투자하는 VC. 명시 태그 Experimental·Minimal·3D·Scrolling Animation대로, 3D 비주얼을 스크롤에 물린 몰입형 단일 흐름.
  블랙 지면에 라이트 웨이트(300) 대형 헤드라인만 띄우는 구성으로, 정보량을 극단적으로 줄이고 분위기로 승부하는 VC 사이트 전형.
- **분위기** 미래적

---

## D. lapa.ninja — 3건

> Lapa Ninja는 **Typeface 필드에 폰트명을 명시**하지만, 실측 결과 **명시값과 실제 폰트가 다른 사례**가 두 건 확인됐습니다(아래 표기).

### 13. Teamwork Graph (Atlassian)
- **URL** https://teamworkgraph.com/ · [lapa 상세](https://www.lapa.ninja/post/teamwork-graph/) (Published 2026)
- **폰트** [명시] `Charlie` — ⚠️ [실측] 실제로는 제목·본문 모두 `Atlassian Sans` (명시값과 불일치)
- **팔레트** [명시] "black"뿐 → [실측] `#111213` `#CECFD2` `#000000` `#B7B9BE`
- **레이아웃·장치** 히어로 자체가 **인터랙티브 노드-엣지 그래프**다. "Project Owner", "Completed Work" 같은 노드를 클릭하면 엣지가 살아 움직이는 문자 그대로의 데이터 시각화.
  그 아래 "46,786,801,222 indexed work items" 식 초대형 카운터 스탯 블록을 배치해 규모를 수치로 증명하는 구성.
- **분위기** 기술적

### 14. Polar
- **URL** https://polar.sh/ · [lapa 상세](https://www.lapa.ninja/post/polar/) (Published 2026)
- **폰트** [명시] `Inter` — ⚠️ [실측] 실제 디스플레이 폰트는 `PP Neue Montreal` (Inter는 폴백 스택에만 존재)
- **팔레트** [명시] "black"뿐 → [실측] `#000000` `#090909` `#757575` `#FFFFFF`
- **레이아웃·장치** 순흑 지면에 수십 개의 `<canvas>`를 깔아 토큰 카운터·마진 차트·정산 카드가 실시간으로 움직이는 라이브 미터링 연출.
  기능 그리드의 각 셀마다 미니 라이브 데이터 카드를 넣어, 설명 대신 "지표가 돌아가는 화면"으로 제품을 증명한다.
- **분위기** 정밀함

### 15. Lift Type
- **URL** https://www.lift-type.fr/ · [lapa 상세](https://www.lapa.ninja/post/lift-type-2/) (Published 2025, Shopify)
- **폰트** [명시] `Dwight` — ✅ [실측] 일치 (`Dwight, serif`)
- **팔레트** [명시] "white, orange, gray" → [실측] 베이스 `#000000`, 스와치 `#FFFFFF` `#F8413E` `#3400B4` `#FF7800` `#158A3E` `#C2F279` `#FFABD7`
- **레이아웃·장치** 프랑스 폰트 파운드리. 내비게이션 바 없이 로고 워드마크와 "All fonts" 토글만 두는 극단적 크롬 제거.
  각 서체를 자기만의 단색 카드 위에 라이브 렌더 샘플로 띄우는 순수 타입 스페시멘 그리드 — 구조는 미니멀, 인상은 컬러 스와치 쇼케이스.
- **분위기** 경쾌함

---

## 전체 경향 요약 (5줄)

1. **팔레트는 "2~3색 원칙"으로 수렴했다.** awwwards가 수상작 팔레트를 아예 "2 colors"로 표기할 정도이며(Sharplink `#0E76FF`+`#F3F3F3`, Aspen Search `#FFFFFF`+`#232323`), land-book 금융권 표본도 웜그레이·세이지·무채색 단일 계열에 액센트 한 색(Rulebase `#FE4C00`)만 찍는 구조가 지배적이다.

2. **금융·데이터 섹터에서 세리프의 복권이 뚜렷하다.** Concourse(seasonMix), Griffin(Cambon 300), Nominal(STK Bureau Serif 300), Stripe Press(Ivar), Obama Oral History(Signifier)까지 — 특히 **라이트 웨이트 대형 세리프 헤드라인 + 중립 그로테스크 본문**이라는 이중 서체 공식이 반복된다. land-book이 이들을 "Serif"로 분류하는 것과 실제 구현이 정확히 맞물린다.

3. **서체는 거의 전부 커스텀/독립 파운드리 라이선스로 이동했다.** Söhne, ABC Diatype, ABC Favorit, Suisse Int'l, Signifier, Ivar, PP Neue Montreal, Degular, Magnetik, Dwight. 15개 중 구글 폰트 계열은 Inter(그마저 폴백)와 Archivo 정도뿐으로, **타이포그래피가 브랜드 차별화의 1차 수단**이 됐다.

4. **"데이터"는 차트가 아니라 인터랙션으로 표현된다.** Teamwork Graph의 클릭 가능한 노드 그래프, Polar의 수십 개 캔버스 라이브 미터, Cerebrium의 3D 데이터 레이어처럼 정적 인포그래픽이 아닌 **작동하는 계기판**을 히어로에 올린다. awwwards의 Data Visualization 태그가 시빅테크(Boulder County, Obama Oral History)에도 동일하게 붙는 점이 이 흐름의 확산을 보여준다.

5. **시빅테크가 가장 실험적인 영역이 됐다.** 정부·비영리 사이트가 오히려 다큐멘터리형 연출을 택해(Boulder County의 순흑 풀블리드 스크롤 리빌, Obama 아카이브의 아이보리+네이비 인쇄 지면) 기존 공공 웹의 정보 나열 문법을 버렸다. 반대로 상업 사이트(Topology, Increase)는 정보량을 줄이고 분위기·여백으로 수렴하는 중이라, **공공은 서사를 얻고 민간은 여백을 얻는 역전**이 관찰된다.

---

**참고 — 수집 방식:** 각 갤러리의 자체 필터(land-book Industry=Finance, awwwards Category=Institutions, recent.design Finance/Editorial, lapa.ninja Finance/Government/Minimal)를 사용해 최신 등록순으로 추렸고, 모든 사이트는 읽기 전용으로만 접근했습니다(좋아요·저장·로그인 없음). 갤러리가 명시하지 않은 폰트·hex는 라이브 사이트에서 `getComputedStyle`로 직접 실측했으며, 추측값은 사용하지 않았습니다.

[exited with code 0]
