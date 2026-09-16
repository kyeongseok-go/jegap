import type { Checkup, DanjiData } from "../lib/engine/types";
import { peerRuleText } from "../lib/engine/peers";
import HeroCount from "./HeroCount";
import Spark from "./Spark";
import RxBox from "./RxBox";
import Search from "./Search";
import Reveal from "./Reveal";
import DomainTabs from "./DomainTabs";

const SIG_LABEL = { good: "양호", watch: "관찰", warn: "주의" } as const;
const SIG_CLASS = { good: "ok", watch: "watch", warn: "warn" } as const;

/** peer 적립 분포 → SVG 곡선 path (서버 계산 — 장식이 아니라 실데이터) */
function distPath(values: number[], W = 900, H = 190, base = 150): {
  curve: string; x: (v: number) => number;
} {
  const lo = Math.min(...values), hi = Math.max(...values);
  const span = hi - lo || 1;
  const BINS = 18;
  const bins = new Array<number>(BINS).fill(0);
  for (const v of values) {
    const i = Math.min(BINS - 1, Math.floor(((v - lo) / span) * BINS));
    bins[i]++;
  }
  // 이웃 평균 스무딩 2회
  for (let r = 0; r < 2; r++)
    for (let i = 0; i < BINS; i++)
      bins[i] = ((bins[i - 1] ?? bins[i]) + bins[i] + (bins[i + 1] ?? bins[i])) / 3;
  const max = Math.max(...bins);
  const x0 = 40, x1 = W - 40;
  const x = (v: number) => x0 + ((v - lo) / span) * (x1 - x0);
  const pts = bins.map((b, i) => {
    const px = x0 + ((i + 0.5) / BINS) * (x1 - x0);
    const py = base - (b / max) * (base - 24);
    return `${Math.round(px)},${Math.round(py)}`;
  });
  return { curve: `M${x0},${base} L${pts.join(" L")} L${x1},${base} Z`, x };
}

export default function CheckupView({
  checkup: c, data, peerReserves, isHome = false, highlights = [],
}: {
  checkup: Checkup; data: DanjiData; peerReserves: number[]; isHome?: boolean;
  highlights?: Array<{ dom: string; href: string; fact: string }>;
}) {
  const fee = c.exams.find((e) => e.key === "fees");
  const res = c.exams.find((e) => e.key === "reserve");
  const rep = c.exams.find((e) => e.key === "repairs");
  const displayPct = Math.max(1, c.reservePercentile);

  const feeFirst = data.fees[0], feeLast = data.fees[data.fees.length - 1];
  const y0 = feeFirst ? feeFirst.ym.slice(0, 4) : "";
  const y1 = feeLast ? feeLast.ym.slice(0, 4) : "";
  // 표시용 총관리비: 월별 실데이터는 12개월 평균으로 계절성 보정 (엔진 stats와 동일 원칙)
  const avg = (a: number[]) => Math.round(a.reduce((x, y) => x + y, 0) / a.length);
  const totFrom = data.fees.length >= 24 ? avg(data.fees.slice(0, 12).map((f) => f.total)) : feeFirst?.total ?? 0;
  const totTo = data.fees.length >= 24 ? avg(data.fees.slice(-12).map((f) => f.total)) : feeLast?.total ?? 0;
  const age = new Date().getFullYear() - c.danji.builtYear;

  // 분포 차트 (reserve 검사 있을 때만 — 무소음)
  const dist = res && peerReserves.length > 0 ? distPath(peerReserves) : null;
  const meX = dist ? Math.round(dist.x(data.reserve.perM2)) : 0;

  // 스파크라인 (fees 검사 있을 때만)
  const sparkPts = (() => {
    if (!fee || data.fees.length < 2) return null;
    const hs = data.fees.map((f) => f.heating);
    const lo = Math.min(...hs), hi = Math.max(...hs), span = hi - lo || 1;
    const ours = hs.map((h, i) =>
      `${Math.round(4 + (i / (hs.length - 1)) * 272)},${Math.round(46 - ((h - lo) / span) * 40)}`);
    // peer 평균 기울기 선 — 엔진이 계산한 평균 상승률 그대로 (역산 금지: 반올림·0 나눗셈 왜곡)
    const peerRise = fee.facts.peerAvgRise;
    if (typeof peerRise !== "number" || !isFinite(peerRise)) return null;
    const peerEndY = 46 - (((hs[0] * (1 + peerRise / 100)) - lo) / span) * 40;
    return {
      ours: ours.join(" "),
      peer: `4,${Math.round(46 - ((hs[0] - lo) / span) * 40)} 276,${Math.round(Math.max(6, peerEndY))}`,
      end: ours[ours.length - 1],
    };
  })();

  return (
    <>
      <header>
        <div className="wrap">
          <a className="brand" href="/" aria-label="JEGAP 제값 홈">
            <span className="bmark">JE<i>GAP</i></span>
            <span className="bsub">제값</span>
          </a>
          <DomainTabs active="apt" />
          <span className="q">내가 내는 값이 정당한가</span>
          <Search />
        </div>
      </header>

      <main className="wrap" id="main">
        <section className="hero">
          <p className="eyebrow">
            <span className="pulse" aria-hidden="true"></span>
            {isHome ? "이번 주 검진 사례 — 장기수선충당금 적립 하위 단지" : "단지 검진 결과"}
          </p>
          {isHome && (
            <>
              <h1 className="head">관리비가 싼 단지가<br /><span className="hl">좋은 단지는 아닙니다</span></h1>
              <p className="sub">미래를 위해 쌓아둬야 할 돈을 쌓지 않는 단지가 있습니다. 그 청구서는 <b>10년 뒤에 한꺼번에</b> 옵니다.</p>
              <div className="hero-cta">
                <Search wide />
                <p className="cta-note">전국 2만 1천 단지 · 로그인 없음 · 30초</p>
              </div>
            </>
          )}
          <div className="subject">
            <h2>{c.danji.name}</h2>
            <span className="meta">
              {c.danji.sido} {c.danji.sigungu} · {c.danji.builtYear}년 준공 · {c.danji.households.toLocaleString()}세대 · {c.danji.heating}
            </span>
            <span className="src">
              국토교통부 K-apt 기준
              {c.danji.isSample && <span className="sample-tag">예시 데이터 · 실데이터 연동 준비 중</span>}
            </span>
          </div>
        </section>

        {res && dist && (
          <section className="centerpiece">
            <HeroCount
              percentile={Math.max(1, c.reservePercentile)}
              signal={res.signal}
              signalLabel={SIG_LABEL[res.signal]}
              meX={meX}
            >
              <div className="cp-verdict">
                <p className="lab">미래 수리비 저금 <span style={{ color: "var(--hair-2)" }}>|</span> 장기수선충당금</p>
                <p className="big">
                  {res.signal === "good"
                    ? <>비슷한 단지들의 <em>일반적인 범위</em> 안에 있습니다</>
                    : <>비슷한 단지 <em className="num" data-count>{displayPct}</em><em>%</em> 아래에 있습니다</>}
                </p>
                <p className="why">
                  {age >= 25 && res.signal !== "good"
                    ? <>{age}년차 단지가 이 정도만 쌓고 있다면, 배관·승강기 교체가 시작될 때 세대마다 목돈을 내야 할 수 있습니다. </>
                    : <>지금의 적립 속도가 미래 수선 비용을 감당할 수 있는지 확인해 보세요. </>}
                  <a href="/method">어떻게 계산했나</a>
                </p>
              </div>
            </HeroCount>
            <div className="chartbox">
              <svg className="dist" viewBox="0 0 900 190" preserveAspectRatio="none" role="img"
                aria-label={`유사 단지 ${c.peerCount}곳의 장기수선충당금 적립 분포에서 ${c.danji.name}의 위치`}>
                <path className="curve" d={dist.curve} />
                <line className="axis" x1="40" y1="150" x2="860" y2="150" />
                <text className="peer-lab" x="450" y="166" textAnchor="middle">
                  비슷한 단지 {c.peerCount}곳의 적립 수준 →
                </text>
                <text className="tick" x="40" y="166">적게 쌓음</text>
                <text className="tick" x="860" y="166" textAnchor="end">많이 쌓음</text>
                <line className="me-line" data-me-line x1={meX} y1="150" x2={meX} y2="60" />
                <circle className="me-dot" data-me-dot cx={meX} cy="150" r="5.5" />
                <text className="me-lab" data-me-lab
                  x={meX > 700 ? meX - 10 : meX + 10}
                  textAnchor={meX > 700 ? "end" : "start"} y="54" opacity="0">
                  {c.danji.name}
                </text>
              </svg>
            </div>
          </section>
        )}

        <Reveal as="section" className="rail">
          <h3>이 단지가 지나온 시간, 그리고 다가오는 시간</h3>
          <div className="node">
            <span className="yr">{c.danji.builtYear}</span>
            <p className="txt">준공. 배관·승강기의 설계 수명이 여기서 시작됩니다.</p>
          </div>
          {fee && (
            <div className="node now">
              <span className="yr">{y0} — {y1}</span>
              <p className="txt">
                관리비 <b>㎡당 {totFrom.toLocaleString()}원 → {totTo.toLocaleString()}원</b>{data.fees.length >= 24 ? " (연평균)" : ""}.
                난방비가 {fee.facts.risePct}% 올랐습니다. 같은 조건 단지 평균의 <b>{fee.facts.multiple}배</b> 속도입니다.
              </p>
            </div>
          )}
          {age >= 25 && res && res.signal !== "good" && (
            <div className="node future">
              <span className="yr">{age >= 28 ? "지금" : `${c.danji.builtYear + 29} 무렵`}</span>
              <p className="txt">
                {age >= 28
                  ? <>이 단지는 이미 <b>대규모 수선 주기</b>(28~30년차) 안에 있습니다. 배관·승강기 등 큰 공사의 재원이 지금의 적립에서 나옵니다.</>
                  : <>28~30년차는 <b>대규모 수선 주기</b>입니다. 지금 적립 속도로는 필요한 금액에 닿지 못할 수 있습니다.</>}
              </p>
            </div>
          )}
        </Reveal>

        <section className="exams">
          {fee && sparkPts && (
            <Reveal className="row">
              <div className="name">관리비 흐름<span>최근 {data.fees.length}개 공시 · ㎡당</span></div>
              <div className="body">
                난방비가 <b>{fee.facts.risePct}%</b> 올랐습니다. {fee.facts.multiple >= 1.5
                  ? <>같은 조건 단지들의 평균 상승 속도보다 <b>{fee.facts.multiple}배</b> 빠릅니다.</>
                  : <>같은 조건 단지들의 평균 상승 속도의 <b>{fee.facts.multiple}배</b> 수준입니다.</>}
                <Spark ours={sparkPts.ours} peer={sparkPts.peer} end={sparkPts.end} />
              </div>
              <div className="metric">
                <span className="v">+{fee.facts.risePct}%</span>
                <span className="u">난방비 상승</span><br />
                <span className={`sig ${SIG_CLASS[fee.signal]}`}>{SIG_LABEL[fee.signal]}</span>
              </div>
            </Reveal>
          )}
          {res && (
            <Reveal className="row">
              <div className="name">미래 수리비 저금<span>장기수선충당금</span></div>
              <div className="body">
                비슷한 단지 {c.peerCount}곳 가운데 <b>하위 {displayPct}%</b>입니다.
                {age >= 25 && res.signal !== "good" && <> 준공 {age}년차 기준으로는 낮은 수준입니다.</>}
              </div>
              <div className="metric">
                <span className="v">{data.reserve.perM2}<span style={{ fontSize: 15, fontWeight: 600 }}>원</span></span>
                <span className="u">㎡당 월 적립</span><br />
                <span className={`sig ${SIG_CLASS[res.signal]}`}>{SIG_LABEL[res.signal]}</span>
              </div>
            </Reveal>
          )}
          {rep && (
            <Reveal className="row">
              <div className="name">수선 이력<span>최근 5년 등록</span></div>
              <div className="body">
                같은 연차 단지는 평균 <b>{rep.facts.peerAvg}건</b>을 등록했습니다.
                {rep.signal !== "good" && <> 기록이 적다는 것은 고치지 않았거나, 기록하지 않았다는 뜻입니다. 둘 다 확인이 필요합니다.</>}
              </div>
              <div className="metric">
                <span className="v">{rep.facts.count5y}<span style={{ fontSize: 15, fontWeight: 600 }}>건</span></span>
                <span className="u">평균 {rep.facts.peerAvg}건</span><br />
                <span className={`sig ${SIG_CLASS[rep.signal]}`}>{SIG_LABEL[rep.signal]}</span>
              </div>
            </Reveal>
          )}
        </section>

        <Reveal as="section" className="opinion">
          <p className="lab">종합 소견</p>
          <p>{c.opinion}</p>
          <p className="fine">
            공개된 수치만으로 작성했습니다. 이 단지에 대한 평가나 판정이 아닙니다.
            유사 단지 기준: {peerRuleText(c.peerRelaxed)}.
          </p>
        </Reveal>

        {isHome && highlights.length > 0 && (
          <Reveal as="section" className="finds">
            <h2 className="sech">다른 검진에서 나온 이번 주 발견</h2>
            <div className="findgrid">
              {highlights.map((h) => (
                <a key={h.dom} className="findcard" href={h.href}>
                  <span className="fd">{h.dom}</span>
                  <span className="ff">{h.fact}</span>
                  <span className="fa">검진 보기 →</span>
                </a>
              ))}
            </div>
            <p className="fine-note">공개 데이터에서 규칙으로 찾아낸 사실입니다. 기관·지역에 대한 평가가 아닙니다.</p>
          </Reveal>
        )}
        <RxBox code={c.danji.code} refundWon={Math.round(data.reserve.perM2 * 100 * 24 / 100) * 100} />

        <Reveal as="section" className="cta">
          <h2>우리 단지는 어떨까요</h2>
          <p>전국 관리비 공개 아파트 2만 1천 단지. 이름만 넣으면 바로 검진합니다. 로그인 없습니다.</p>
          <Search wide />
        </Reveal>

        <section className="why">
          <h2>이 검진을 믿어도 되는 이유</h2>
          <div className="grid">
            <div><b>정부가 공개한 수치만 씁니다</b><span>국토교통부 K-apt. 추정하거나 지어내지 않습니다.</span></div>
            <div><b>판정하지 않습니다</b><span>신호는 의견이 아니라 데이터에서의 위치입니다. 계산식을 전부 공개합니다.</span></div>
            <div><b>광고를 받지 않습니다</b><span>검진하는 곳이 광고를 받으면, 그건 검진이 아닙니다.</span></div>
            <div><b>AI는 문장만 씁니다</b><span>수치와 신호는 공개된 계산식이 만들고, AI는 질의서의 문장을 다듬습니다. <a href="/method">원칙 보기</a></span></div>
          </div>
          <p className="ctx">
            정부 합동 첫 외부 회계감사에서 전국 아파트 다섯 곳 중 한 곳이 회계 부적합
            판정을 받았습니다(국무조정실, 2016). 2026년에는 회계감사 면제 조항 폐지가
            추진되고 있습니다. 데이터는 열렸습니다. JEGAP은 그것을 누구나 읽을 수 있는 형태로 바꿉니다.
          </p>
        </section>

        <footer>
          <p className="next">검진은 다섯입니다 — <a href="/h"><b>병원비</b></a> · <a href="/a"><b>학원비</b></a> · <a href="/f"><b>장례비</b></a> · <a href="/p"><b>생활물가</b></a>. 내가 내는 값이 정당한지, 한곳에서 물으세요.</p>
          <p>계산식 공개 · 데이터 출처 · 정정 요청은 24시간 안에 처리합니다</p>
        </footer>
      </main>
    </>
  );
}
