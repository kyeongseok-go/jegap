import type { Metadata } from "next";
import DomainTabs from "../../components/DomainTabs";
import HSearch from "../../components/HSearch";
import { hiraReady } from "../../lib/medical/hira";

export const metadata: Metadata = {
  title: "JEGAP 제값 — 병원비 검진",
  description: "같은 진료, 병원마다 가격이 다릅니다. 심평원이 공개한 비급여 가격으로 우리 동네 병원의 위치를 확인하세요.",
};

export default function HospitalHome() {
  const ready = hiraReady();
  return (
    <>
      <header>
        <div className="wrap">
          <a className="brand" href="/" aria-label="JEGAP 제값 홈">
            <span className="bmark">JE<i>GAP</i></span>
            <span className="bsub">제값</span>
          </a>
          <DomainTabs active="med" />
          <span className="q">내가 내는 값이 정당한가</span>
        </div>
      </header>
      <main className="wrap" id="main">
        <section className="hero">
          <p className="eyebrow"><span className="pulse" aria-hidden="true"></span>병원비편 — 비급여 진료비</p>
          <h1 className="head">같은 진료인데<br /><span className="hl">가격은 병원이 정합니다</span></h1>
          <p className="sub">
            비급여 진료는 병원이 가격을 자율로 정합니다. 심사평가원이 매년 <b>전체 의료기관의 비급여 가격</b>을
            공개하지만, 아는 사람만 찾아봅니다. 병원 이름을 넣으면 우리 동네 기준 어디쯤인지 보여드립니다.
          </p>
          {ready ? (
            <div className="hero-cta">
              <HSearch wide />
              <p className="cta-note">심평원 공개 가격 기준 · 로그인 없음 · 30초</p>
            </div>
          ) : (
            <div className="pending">
              <p className="pending-t">실데이터 연동 준비 중</p>
              <p>
                건강보험심사평가원 비급여 공개 데이터(전 의료기관 693개 항목)를 연동하는 중입니다.
                데이터 출처: <a href="https://www.hira.or.kr/npay/index.do">심평원 비급여 진료비 정보</a>.
              </p>
            </div>
          )}
        </section>
        <section className="why">
          <h2>관리비편과 같은 원칙으로 검진합니다</h2>
          <div className="grid">
            <div><b>공개된 가격만 씁니다</b><span>심평원 공개 자료. 추정하거나 지어내지 않습니다.</span></div>
            <div><b>판정하지 않습니다</b><span>같은 시도 · 같은 종별 병원들 가운데 위치와 중간값 대비 배수만 보여드립니다.</span></div>
            <div><b>병원을 추천하지 않습니다</b><span>광고와 환자 유인이 없습니다. 가격의 위치라는 사실만 전합니다.</span></div>
          </div>
        </section>
        <footer>
          <p className="next"><b>1호 검진</b> — 관리비편이 먼저 열려 있습니다. 전국 2만 1천 단지.</p>
          <p>계산식 공개 · 데이터 출처 · 정정 요청은 24시간 안에 처리합니다</p>
        </footer>
      </main>
    </>
  );
}
