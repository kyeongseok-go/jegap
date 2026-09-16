import Link from "next/link";
import DomainTabs from "../components/DomainTabs";

export default function NotFound() {
  return (
    <>
      <header>
        <div className="wrap">
          <a className="brand" href="/" aria-label="JEGAP 제값 홈">
            <span className="bmark">JE<i>GAP</i></span>
            <span className="bsub">제값</span>
          </a>
          <DomainTabs active="apt" />
          <span className="q">지금 내는 돈, 제값인지 확인하세요</span>
        </div>
      </header>
      <main className="wrap" id="main">
        <section className="hero">
          <p className="eyebrow"><span className="pulse" aria-hidden="true"></span>페이지를 찾을 수 없습니다</p>
          <h1 className="head">이 주소에는<br /><span className="hl">검진 결과가 없습니다</span></h1>
          <p className="sub">
            주소가 바뀌었거나 데이터가 갱신되며 사라졌을 수 있습니다.
            아래에서 다시 검진을 시작하세요.
          </p>
          <div className="sidogrid" style={{ marginTop: 26, maxWidth: 560 }}>
            <Link className="sido" href="/">관리비 검진</Link>
            <Link className="sido" href="/h">병원비 검진</Link>
            <Link className="sido" href="/a">학원비 검진</Link>
            <Link className="sido" href="/f">장례비 검진</Link>
            <Link className="sido" href="/p">생활물가 검진</Link>
          </div>
        </section>
        <footer>
          <p>계산식 공개 · 데이터 출처 · 정정 요청은 24시간 안에 처리합니다</p>
        </footer>
      </main>
    </>
  );
}
