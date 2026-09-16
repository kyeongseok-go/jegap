import type { Metadata } from "next";
import Link from "next/link";
import DomainTabs from "../../components/DomainTabs";
import { livingReady, SIDOS, pairTrends, latestMonth } from "../../lib/living";

export const metadata: Metadata = {
  title: "JEGAP 제값 — 생활물가 검진",
  description: "냉면·삼겹살·이발료… 우리 지역의 생활물가는 전국 어디쯤일까요. 행안부가 매월 조사한 가격으로 확인합니다.",
};

export default function LivingHome() {
  const ready = livingReady();
  const pairs = ready ? pairTrends() : [];
  const ym = ready ? latestMonth() : "";
  return (
    <>
      <header>
        <div className="wrap">
          <a className="brand" href="/" aria-label="JEGAP 제값 홈">
            <span className="bmark">JE<i>GAP</i></span>
            <span className="bsub">제값</span>
          </a>
          <DomainTabs active="liv" />
          <span className="q">내가 내는 값이 정당한가</span>
        </div>
      </header>
      <main className="wrap" id="main">
        <section className="hero">
          <p className="eyebrow"><span className="pulse" aria-hidden="true"></span>생활물가편 — 우리 동네 검진</p>
          <h1 className="head">같은 냉면 한 그릇도<br /><span className="hl">지역마다 값이 다릅니다</span></h1>
          <p className="sub">
            행정안전부가 매월 조사하는 <b>서민밀접 30여 개 품목</b> — 냉면·삼겹살·이발료·목욕료·택시료.
            내가 사는 지역의 값이 전국 어디쯤인지, 3년간 얼마나 올랐는지 보여드립니다.
          </p>
        </section>

        {ready && pairs.length > 0 && (
          <section className="pairband">
            <h2 className="sech">재료값과 밥상값은 같이 움직이지 않습니다 <span className="hnote">— 시도 중간값 기준</span></h2>
            <div className="pairs">
              {pairs.map((p) => (
                <div className="pair" key={p.label}>
                  <p className="pl">{p.label} · 최근 {Math.round(p.months / 12 * 10) / 10}년</p>
                  <p className="pv">
                    <span className={p.cookedRise >= 0 ? "up" : "down"}>{p.cookedName} {p.cookedRise >= 0 ? "+" : ""}{p.cookedRise}%</span>
                    <span className="vs">vs</span>
                    <span className={p.rawRise >= 0 ? "up" : "down"}>{p.rawName} {p.rawRise >= 0 ? "+" : ""}{p.rawRise}%</span>
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {ready ? (
          <section className="sidogrid-wrap">
            <h2 className="sech">지역을 고르면 바로 검진합니다 <span className="hnote">— {ym.slice(0, 4)}년 {ym.slice(4)}월 조사 기준</span></h2>
            <div className="sidogrid">
              {SIDOS.map((s) => (
                <Link key={s.key} href={`/p/${encodeURIComponent(s.key)}`} className="sido">{s.label}</Link>
              ))}
            </div>
            <p className="hfoot">세종은 외식·개인서비스·농축산물 조사에서 충남에 포함됩니다 — 공공요금은 별도 조사 (행정안전부 기준).</p>
          </section>
        ) : (
          <div className="pending">
            <p className="pending-t">실데이터 연동 준비 중</p>
            <p>행정안전부 지방물가 데이터를 연동하는 중입니다.</p>
          </div>
        )}

        <section className="why">
          <h2>다른 편과 같은 원칙으로 검진합니다</h2>
          <div className="grid">
            <div><b>정부 조사 가격만 씁니다</b><span>행정안전부 지방물가 조사 · 착한가격업소 지정 현황. 추정하지 않습니다.</span></div>
            <div><b>판정하지 않습니다</b><span>17개 시도 가운데 위치와 중간값 대비 배수만 보여드립니다.</span></div>
            <div><b>업소를 추천하지 않습니다</b><span>착한가격업소는 정부·지자체가 지정한 제도의 안내입니다.</span></div>
          </div>
        </section>
        <footer>
          <p className="next"><b>관리비편</b> — 우리 단지 검진도 열려 있습니다. 전국 2만 1천 단지.</p>
          <p>계산식 공개 · 데이터 출처 · 정정 요청은 24시간 안에 처리합니다</p>
        </footer>
      </main>
    </>
  );
}
