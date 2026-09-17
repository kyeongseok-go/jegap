import type { Metadata } from "next";
import DomainTabs from "../../components/DomainTabs";
import PriceSearch from "../../components/PriceSearch";
import HeroReceipt from "../../components/HeroReceipt";
import { hiraReady } from "../../lib/medical/hira";
import { CONTACT } from "../../lib/site";

export const metadata: Metadata = {
  title: "JEGAP 제값 — 병원비 검진",
  description: "진료받기 전, 비급여 가격부터 확인하세요. 심평원이 공개한 병원급 이상 의료기관의 항목별 가격과 같은 시도 · 같은 종별 비교값을 보여드립니다.",
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
          <span className="q">지금 내는 돈, 제값인지 확인하세요</span>
        </div>
      </header>
      <main className="wrap" id="main">
        <section className="hero hero-scene" data-scene="med">
          <HeroReceipt domain="med" />
          <p className="eyebrow"><span className="pulse" aria-hidden="true"></span>병원비편 · 비급여 진료비</p>
          <h1 className="head">진료받기 전,<br /><span className="hl">비급여 가격부터 확인하세요</span></h1>
          <p className="sub">
            같은 MRI인데 병원마다 값이 다릅니다.
            병원 이름을 넣으면 그 병원이 <b>공개한 가격</b>이 비슷한 병원들 중 어디쯤인지 보여드려요.
          </p>
          {ready ? (
            <div className="hero-cta">
              <p className="cta-note">검색 범위 — 심평원에 비급여 가격을 공개한 <b>병원급 이상</b> 의료기관.
                동네 <b>의원급은 포함되지 않습니다</b>.</p>
              <PriceSearch endpoint="/api/hsearch" hrefBase="/h" wide cta="가격 확인하기" placeholder="병원 이름 검색  예: ○○병원" label="병원 이름 검색" />
              <p className="cta-note">심평원 공개 가격 기준 · 같은 시도 · 같은 종별 비교 · 로그인 없음</p>
            </div>
          ) : (
            <div className="pending">
              <p className="pending-t">실데이터 연동 준비 중</p>
              <p>
                건강보험심사평가원 비급여 공개 데이터(병원급 이상 693개 항목)를 연동하는 중입니다.
                데이터 출처: <a href="https://www.hira.or.kr/npay/index.do">심평원 비급여 진료비 정보</a>.
              </p>
            </div>
          )}
        </section>
        <section className="act-hint">
          <p className="ah-lab">검진 다음에 할 수 있는 일</p>
          <p className="ah-body">병원은 비급여 진료비를 미리 알려줄 의무가 있습니다(의료법 제45조).
            검진표 아래에서 <b>진료 전 확인 메모</b>를 만들어 드립니다. 예약 전화할 때 그대로 읽으시면 됩니다.</p>
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
          <p className="next"><b>관리비편</b>도 같은 방식으로 검진합니다. 전국 2만 1천 단지.</p>
          <p><a href="/method">계산식 공개</a> · <a href="/terms">이용 안내와 개인정보</a> · 틀린 곳은 <a href={CONTACT.href}>{CONTACT.text}</a>로 알려주시면 24시간 안에 처리합니다</p>
        </footer>
      </main>
    </>
  );
}
