import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "계산 방법 — JEGAP 제값" };

export default function MethodPage() {
  return (
    <main className="wrap" id="main" style={{ maxWidth: 780 }}>
      <section className="hero" style={{ paddingBottom: 40 }}>
        <p className="eyebrow"><Link href="/" style={{ color: "inherit" }}>← 검진으로 돌아가기</Link></p>
        <h1 className="head" style={{ fontSize: "clamp(26px,4.5vw,40px)" }}>어떻게 계산하나</h1>
        <p className="sub">
          JEGAP의 신호는 의견이 아니라 <b>데이터에서의 위치</b>입니다.
          아래가 계산의 전부이며, 숨긴 것이 없습니다.
        </p>
      </section>

      <section className="opinion" style={{ marginTop: 0 }}>
        <p className="lab">1 · 비슷한 단지 고르기</p>
        <p>
          같은 시도 · 준공연도 ±5년 · 세대수 구간(300 미만 / 300~699 / 700~1,499 / 1,500 이상) ·
          난방방식이 같은 단지를 비교 대상으로 삼습니다. 30곳이 안 되면 난방방식 → 세대수 →
          연식(±10년) 순으로 조건을 한 단계씩 넓히고, 넓혔다는 사실을 검진표에 표시합니다.
        </p>
      </section>
      <section className="opinion">
        <p className="lab">2 · 위치 계산</p>
        <p>
          장기수선충당금(㎡당 월 적립액)이 비슷한 단지들 가운데 하위 몇 %인지 셉니다.
          같은 값은 중간 순위로 처리합니다. 관리비 흐름은 최근 공시 구간의 난방비 상승률을
          비슷한 단지들의 평균 상승률과 나누어 배수로 표시합니다.
        </p>
      </section>
      <section className="opinion">
        <p className="lab">3 · 신호 기준</p>
        <p>
          미래 수리비 저금 — 하위 10% 미만이면 <b>주의</b>, 30% 미만이면 <b>관찰</b>, 그 외 <b>양호</b>.
          관리비 상승 — 평균의 3배 이상 <b>주의</b>, 2배 이상 <b>관찰</b>.
          수선 이력 — 등록 건수가 평균의 3분의 1 미만이면 <b>관찰</b>.
          기록이 적다는 것만으로 <b>주의</b>를 표시하지 않습니다. 기록 부재는 잘못의 증거가 아니기 때문입니다.
        </p>
      </section>
      <section className="opinion">
        <p className="lab">4 · 표시하지 않는 것</p>
        <p>
          비교 대상이 없거나 계산할 수 없으면 그 검사는 표시하지 않습니다.
          불확실한 값을 만들어내지 않는 것이 이 서비스의 원칙입니다.
        </p>
        <p className="fine">
          데이터 출처: 국토교통부 공동주택관리정보시스템(K-apt) 공시.
          정정 요청은 24시간 안에 처리합니다.
        </p>
      </section>
      <footer><p>JEGAP 제값 — 내가 내는 값이 정당한가</p></footer>
    </main>
  );
}
