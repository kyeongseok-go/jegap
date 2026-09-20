import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DomainTabs from "../../../components/DomainTabs";
import Reveal from "../../../components/Reveal";
import { livingReady, livingExams, livingOpinion, SIDOS, goodShops } from "../../../lib/living";
import { CONTACT } from "../../../lib/site";

export async function generateMetadata({ params }: { params: Promise<{ sido: string }> }): Promise<Metadata> {
  const { sido } = await params;
  const s = SIDOS.find((x) => x.key === decodeURIComponent(sido));
  return { title: s ? `${s.label} 생활물가 검진 — JEGAP 제값` : "JEGAP 제값 — 생활물가 검진" };
}

export function generateStaticParams() {
  return SIDOS.map((s) => ({ sido: s.key }));
}

const CATS = ["외식", "개인서비스", "농축산물", "공공요금"] as const;

export default async function LivingSidoPage({ params }: { params: Promise<{ sido: string }> }) {
  const { sido } = await params;
  const key = decodeURIComponent(sido);
  const s = SIDOS.find((x) => x.key === key);
  if (!s || !livingReady()) notFound();
  const exams = livingExams(key);
  const shops = goodShops(s.shopPrefix);
  const ym = exams[0]?.latestYm ?? "";

  return (
    <>
      <header>
        <div className="wrap">
          <a className="brand" href="/" aria-label="JEGAP 제값 홈">
            <span className="bmark">JE<i>GAP</i></span>
            <span className="bsub">제값</span>
          </a>
          <DomainTabs active="liv" />
          <span className="q">지금 내는 돈, 제값인지 확인하세요</span>
        </div>
      </header>
      <main className="wrap" id="main">
        <section className="hero">
          <p className="backlink"><a href="/p">← 지역 다시 고르기</a></p>
          <p className="eyebrow"><span className="pulse" aria-hidden="true"></span>생활물가 검진 결과</p>
          <div className="subject">
            <h1>{s.label}</h1>
            <span className="meta">서민밀접 {exams.length}개 품목 · {ym.slice(0, 4)}년 {ym.slice(4)}월 조사</span>
            <span className="src">행정안전부 지방물가 조사 기준</span>
          </div>
        </section>

        {CATS.map((cat) => {
          const rows = exams.filter((e) => e.cat === cat);
          if (rows.length === 0) return null;
          return (
            <Reveal as="section" className="hexams" key={cat}>
              <h2 className="sech">{cat} <span className="hnote">— 시도 비교 기준</span></h2>
              <div className="htable" role="table" aria-label={`${cat} 품목별 가격 위치`}>
                <div className="hrow hhead" role="row">
                  <span role="columnheader">품목</span>
                  <span role="columnheader">{s.label.slice(0, 2)}</span>
                  <span role="columnheader">시도 중간값</span>
                  <span role="columnheader">위치 · 3년 변화</span>
                </div>
                {rows.map((e) => (
                  <div className="hrow" role="row" key={e.code}>
                    <span role="cell" className="hname">{e.name}{e.unit && <i className="unit"> · {e.unit}</i>}</span>
                    <span role="cell" className="num">{e.latest.toLocaleString()}원</span>
                    <span role="cell" className="num slate">{e.median.toLocaleString()}원</span>
                    <span role="cell" className={`num ${e.rank <= 3 && e.multiple > 1 ? "hot" : ""}`}>
                      {e.rank === 1 ? `${e.of}곳 중 가장 높음` : `${e.of}곳 중 ${e.rank}번째로 높음`}
                      {e.rise3y !== null && <> · 3년 {e.rise3y >= 0 ? "+" : ""}{e.rise3y}%</>}
                    </span>
                  </div>
                ))}
              </div>
            </Reveal>
          );
        })}

        <div className="popinion">
          <p className="lab">종합 소견</p>
          <p className="body">{livingOpinion(s.label, exams)}</p>
          <p className="fine">조사 가격만으로 규칙에 따라 작성한 요약입니다. 지역에 대한 평가가 아닙니다.</p>
        </div>

        <Reveal as="section" className="rx">
          <h2 className="sech">이 값이 부담스럽다면</h2>
          <p>
            정부·지자체는 주변보다 낮은 가격을 유지하는 업소를 <b>착한가격업소</b>로 지정해 공개합니다.
            {s.label}에는 <b>{shops.count.toLocaleString()}곳</b>이 지정되어 있습니다
            {shops.kinds.length > 0 && <> ({shops.kinds.map(([k, n]) => `${k} ${n}`).join(" · ")})</>}.
          </p>
          {shops.sample.length > 0 && (
            <div className="shoplist">
              {shops.sample.map((sh) => (
                <div className="shop" key={sh.name + sh.addr}>
                  <span className="sn">{sh.name}</span>
                  <span className="sk">{sh.sigungu} · {sh.kind}</span>
                  {sh.addr && <span className="sk">{sh.addr}</span>}
                  <span className="sm">{sh.menus.slice(0, 2).map(([m, p]) => `${m} ${p.toLocaleString()}원`).join(" · ")}</span>
                </div>
              ))}
            </div>
          )}
          <p className="rx-mode">행정안전부 착한가격업소 현황(2026.6) 기준. 표시된 메뉴 가격은 지정 당시 등록값이며
            현재 최저가를 뜻하지 않습니다. 주소 · 영업 여부 · 최신 지정 현황은 방문 전에 업소나 관할 지자체에 확인하세요.
            특정 업소의 추천이 아니라 정부 지정 제도의 안내입니다.</p>
        </Reveal>

        <p className="hfoot">
          조사 단위는 품목명 옆에 표기했습니다(행정안전부 조사 기준). 시도 간에는 조사 대상 업소와
          상품 품질이 동일하지 않아 비교가 정확하지 않을 수 있다는 것이 조사기관의 공식 안내입니다.
          세종은 외식·개인서비스·농축산물 조사에서 충남에 포함되며, 지방 공공요금은 별도로 조사됩니다.
        </p>
        <footer>
          <p className="next"><b>관리비편</b> — 우리 단지 검진도 열려 있습니다.</p>
          <p><a href="/method">계산식 공개</a> · <a href="/terms">이용 안내와 개인정보</a> · 틀린 곳은 <a href={CONTACT.href}>{CONTACT.text}</a>로 알려주시면 24시간 안에 처리합니다</p>
        </footer>
      </main>
    </>
  );
}
