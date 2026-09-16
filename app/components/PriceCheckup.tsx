import type { OrgData, PriceExam } from "../lib/pricedom/core";
import { priceOpinion } from "../lib/pricedom/opinion";
import DomainTabs from "./DomainTabs";
import Reveal from "./Reveal";

/** 가격 도메인 공용 검진표 — 병원비·학원비·장례비·원비가 공유 */
export default function PriceCheckup({
  d, exams, active, eyebrow, srcLine, unitNote, footNote, search, rx, maxRows = 20,
}: {
  d: OrgData; exams: PriceExam[];
  active: "med" | "aca" | "fun" | "liv";
  eyebrow: string; srcLine: string; unitNote: string; footNote: string;
  search: React.ReactNode; rx?: React.ReactNode; maxRows?: number;
}) {
  const labelCounts = new Map<string, number>();
  for (const e of exams) labelCounts.set(e.peerLabel, (labelCounts.get(e.peerLabel) ?? 0) + 1);
  const mainLabel = [...labelCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "";
  const mixed = labelCounts.size > 1;
  return (
    <>
      <header>
        <div className="wrap">
          <a className="brand" href="/" aria-label="JEGAP 제값 홈">
            <span className="bmark">JE<i>GAP</i></span>
            <span className="bsub">제값</span>
          </a>
          <DomainTabs active={active} />
          {search}
        </div>
      </header>
      <main className="wrap" id="main">
        <section className="hero">
          <p className="eyebrow"><span className="pulse" aria-hidden="true"></span>{eyebrow}</p>
          <div className="subject">
            <h2>{d.h.name}</h2>
            <span className="meta">{d.h.sido} {d.h.sigungu} · {d.h.kind}</span>
            <span className="src">{srcLine}</span>
          </div>
        </section>

        {exams.length === 0 ? (
          <section className="rail"><p className="txt">
            공개된 항목 가운데 비교 표본(30곳 이상)이 갖춰진 항목이 없어 위치를 표시하지 않습니다.
            불확실한 값은 만들지 않습니다.
          </p></section>
        ) : (
          <Reveal as="section" className="hexams">
            <h3>공개 항목별 가격 위치 <span className="hnote">— {mainLabel}{mixed && " · 표본이 좁은 항목은 행에 기준 별도 표기"}</span></h3>
            <div className="htable" role="table" aria-label="항목별 가격 위치">
              <div className="hrow hhead" role="row">
                <span role="columnheader">항목</span>
                <span role="columnheader">이곳</span>
                <span role="columnheader">유사 기관 중간값</span>
                <span role="columnheader">위치</span>
              </div>
              {exams.slice(0, maxRows).map((e) => (
                <div className="hrow" role="row" key={e.code}>
                  <span role="cell" className="hname">{e.name}{e.peerLabel !== mainLabel && <i className="unit"> · {e.peerLabel}</i>}</span>
                  <span role="cell" className="num">{e.price.toLocaleString()}원</span>
                  <span role="cell" className="num slate">{e.median.toLocaleString()}원 <i>({e.peerCount}곳)</i></span>
                  <span role="cell" className={`num ${e.multiple >= 2 ? "hot" : ""}`}>
                    중간값의 {e.multiple}배 · 상위 {Math.max(1, Math.min(99, e.percentile))}%
                  </span>
                </div>
              ))}
            </div>
            {exams.length > maxRows && (
              <p className="hmore">배수가 큰 순으로 {maxRows}개를 표시했습니다. 공개 항목은 모두 {exams.length}개입니다.</p>
            )}
            <div className="popinion">
              <p className="lab">종합 소견</p>
              <p className="body">{priceOpinion(exams, mixed ? `${mainLabel} 외 — 항목별 표기 참조` : mainLabel)}</p>
              <p className="fine">공개된 가격만으로 규칙에 따라 작성한 요약입니다. 평가나 추천이 아닙니다.</p>
            </div>
            <p className="hfoot">{unitNote} {footNote}</p>
          </Reveal>
        )}
        {rx}
        <footer>
          <p className="next"><b>관리비편</b> — 우리 단지 검진도 열려 있습니다.</p>
          <p>계산식 공개 · 데이터 출처 · 정정 요청은 24시간 안에 처리합니다</p>
        </footer>
      </main>
    </>
  );
}
