import type { OrgData, PriceExam } from "../lib/pricedom/core";
import { priceOpinion } from "../lib/pricedom/opinion";
import DomainTabs from "./DomainTabs";
import ExamTable from "./ExamTable";
import Reveal from "./Reveal";
import { CONTACT } from "../lib/site";

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
            <h1>{d.h.name}</h1>
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
            <h2>공개 항목별 가격 위치 <span className="hnote">· {mainLabel}{mixed && " · 표본이 좁은 항목은 행에 기준 별도 표기"}</span></h2>
            <ExamTable exams={exams} mainLabel={mainLabel} maxRows={maxRows} />
            <div className="popinion">
              <p className="lab">종합 소견</p>
              <p className="body">{priceOpinion(exams, mixed ? `${mainLabel} 외 · 항목별 표기 참조` : mainLabel)}</p>
              <p className="fine">공개된 가격만으로 규칙에 따라 작성한 요약입니다. 평가나 추천이 아닙니다.</p>
            </div>
            <p className="hfoot">{unitNote} {footNote}</p>
          </Reveal>
        )}
        {rx}
        <footer>
          <p className="next"><b>관리비편</b>도 같은 방식으로 검진합니다.</p>
          <p><a href="/design/">설계문서</a> · <a href="/method">계산식 공개</a> · <a href="/terms">이용 안내와 개인정보</a> · 틀린 곳은 <a href={CONTACT.href}>{CONTACT.text}</a>로 알려주시면 24시간 안에 처리합니다</p>
        </footer>
      </main>
    </>
  );
}
