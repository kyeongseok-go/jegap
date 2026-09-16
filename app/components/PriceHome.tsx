import DomainTabs, { type DomainKey } from "./DomainTabs";

/** 가격 도메인 공용 홈 — 활성 시 검색, 비활성 시 연동 안내 */
export default function PriceHome({
  active, eyebrow, headline, hl, sub, ready, search, pendingNote, principles, ctaNote,
}: {
  active: DomainKey; eyebrow: string; headline: string; hl: string;
  sub: React.ReactNode; ready: boolean; search: React.ReactNode;
  pendingNote: React.ReactNode; ctaNote: string;
  principles: Array<{ t: string; d: string }>;
}) {
  return (
    <>
      <header>
        <div className="wrap">
          <a className="brand" href="/" aria-label="JEGAP 제값 홈">
            <span className="bmark">JE<i>GAP</i></span>
            <span className="bsub">제값</span>
          </a>
          <DomainTabs active={active} />
          <span className="q">내가 내는 값이 정당한가</span>
        </div>
      </header>
      <main className="wrap" id="main">
        <section className="hero">
          <p className="eyebrow"><span className="pulse" aria-hidden="true"></span>{eyebrow}</p>
          <h1 className="head">{headline}<br /><span className="hl">{hl}</span></h1>
          <p className="sub">{sub}</p>
          {ready ? (
            <div className="hero-cta">
              {search}
              <p className="cta-note">{ctaNote}</p>
            </div>
          ) : (
            <div className="pending">
              <p className="pending-t">실데이터 연동 준비 중</p>
              <p>{pendingNote}</p>
            </div>
          )}
        </section>
        <section className="why">
          <h2>관리비편과 같은 원칙으로 검진합니다</h2>
          <div className="grid">
            {principles.map((p) => (
              <div key={p.t}><b>{p.t}</b><span>{p.d}</span></div>
            ))}
          </div>
        </section>
        <footer>
          <p className="next"><b>1호 검진</b> — 관리비편이 먼저 열려 있습니다. 전국 2만 1천 단지.</p>
          <p><a href="/design/">설계문서</a> · <a href="/method">계산식 공개</a> · 데이터 출처 · 정정 요청은 24시간 안에 처리합니다</p>
        </footer>
      </main>
    </>
  );
}
