import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DomainTabs from "../../../components/DomainTabs";
import HSearch from "../../../components/HSearch";
import Reveal from "../../../components/Reveal";
import { hiraReady, getHospital, priceExams } from "../../../lib/medical/hira";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  if (!hiraReady()) return { title: "JEGAP 제값 — 병원비 검진" };
  const d = getHospital(id);
  return { title: d ? `${d.h.name} 비급여 가격 위치 — JEGAP 제값` : "JEGAP 제값 — 병원비 검진" };
}

export default async function HospitalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!hiraReady()) notFound();
  const d = getHospital(id);
  if (!d) notFound();
  const exams = priceExams(d);

  return (
    <>
      <header>
        <div className="wrap">
          <a className="brand" href="/" aria-label="JEGAP 제값 홈">
            <span className="bmark">JE<i>GAP</i></span>
            <span className="bsub">제값</span>
          </a>
          <DomainTabs active="med" />
          <HSearch />
        </div>
      </header>
      <main className="wrap" id="main">
        <section className="hero">
          <p className="eyebrow"><span className="pulse" aria-hidden="true"></span>병원비 검진 결과</p>
          <div className="subject">
            <h2>{d.h.name}</h2>
            <span className="meta">{d.h.sido} {d.h.sigungu} · {d.h.kind}</span>
            <span className="src">건강보험심사평가원 비급여 공개 가격 기준</span>
          </div>
        </section>

        {exams.length === 0 ? (
          <section className="rail"><p className="txt">
            이 병원이 공개한 항목 가운데 비교 표본(같은 시도 · 같은 종별 30곳 이상)이 갖춰진 항목이 없어
            위치를 표시하지 않습니다. 불확실한 값은 만들지 않습니다.
          </p></section>
        ) : (
          <Reveal as="section" className="hexams">
            <h3>공개 항목별 가격 위치 <span className="hnote">— {d.h.sido} · {d.h.kind} 기준</span></h3>
            <div className="htable" role="table" aria-label="비급여 항목별 가격 위치">
              <div className="hrow hhead" role="row">
                <span role="columnheader">항목</span>
                <span role="columnheader">이 병원</span>
                <span role="columnheader">유사 기관 중간값</span>
                <span role="columnheader">위치</span>
              </div>
              {exams.slice(0, 20).map((e) => (
                <div className="hrow" role="row" key={e.code}>
                  <span role="cell" className="hname">{e.name}</span>
                  <span role="cell" className="num">{e.price.toLocaleString()}원</span>
                  <span role="cell" className="num slate">{e.median.toLocaleString()}원 <i>({e.peerCount}곳)</i></span>
                  <span role="cell" className={`num ${e.multiple >= 2 ? "hot" : ""}`}>
                    중간값의 {e.multiple}배 · 상위 {Math.max(1, Math.min(99, e.percentile))}%
                  </span>
                </div>
              ))}
            </div>
            <p className="hfoot">
              공개된 가격만으로 작성했습니다. 진료의 질·범위·구성은 반영되어 있지 않으며,
              이 표는 병원에 대한 평가나 추천이 아닙니다. 유사 기관 기준: 같은 시도 · 같은 종별.
            </p>
          </Reveal>
        )}
        <footer>
          <p className="next"><b>관리비편</b> — 우리 단지 검진도 열려 있습니다.</p>
          <p>계산식 공개 · 데이터 출처 · 정정 요청은 24시간 안에 처리합니다</p>
        </footer>
      </main>
    </>
  );
}
