import type { Metadata } from "next";
import Link from "next/link";
import { CONTACT } from "../../lib/site";

export const metadata: Metadata = {
  title: "이용 안내와 개인정보 — JEGAP 제값",
  description: "JEGAP이 무엇을 수집하지 않는지, 이 검진을 어떻게 읽어야 하는지, 데이터는 어디서 왔는지.",
};

export default function TermsPage() {
  return (
    <main className="wrap" id="main" style={{ maxWidth: 780 }}>
      <section className="hero" style={{ paddingBottom: 40 }}>
        <p className="eyebrow"><Link href="/" style={{ color: "inherit" }}>← 검진으로 돌아가기</Link></p>
        <h1 className="head" style={{ fontSize: "clamp(26px,4.5vw,40px)" }}>이용 안내와 개인정보</h1>
        <p className="sub">짧게 씁니다. 수집하는 것이 거의 없기 때문입니다.</p>
      </section>

      <section className="opinion" style={{ marginTop: 0 }}>
        <p className="lab">1 · 수집하지 않는 것</p>
        <p>
          회원가입이 없습니다. 이름, 연락처, 주소, 결제 정보를 <b>묻지 않고 받지 않습니다</b>.
          검색창에 입력한 단지·병원·학원·장례식장 이름은 결과를 만드는 데만 쓰이고 저장하지 않습니다.
          접속 기록을 남기는 데이터베이스가 없고, 광고나 분석 목적의 쿠키를 심지 않습니다.
        </p>
      </section>

      <section className="opinion">
        <p className="lab">2 · 잠깐 쓰는 것</p>
        <p>
          질의서 대필 기능은 한 사람이 1분에 다섯 번까지만 쓰도록 제한합니다. 이 횟수를 세기 위해
          <b> 접속 IP 주소를 서버 메모리에서 60초 동안</b> 사용하고, 그 뒤 사라집니다. 디스크에 기록하지 않습니다.
          대필 문장을 다듬는 과정에서 <b>검진 결과의 수치와 대상 기관 이름이 Anthropic의 Claude API로 전송</b>됩니다.
          이용자를 식별할 수 있는 정보는 함께 보내지 않습니다.
        </p>
      </section>

      <section className="opinion">
        <p className="lab">3 · 이 검진을 읽는 법</p>
        <p>
          JEGAP은 정부가 공개한 가격 자료에서 <b>위치와 배수라는 사실</b>만 계산해 보여줍니다.
          좋다·나쁘다를 판정하지 않고, 특정 기관을 추천하거나 배제하지 않습니다.
          이 결과는 법률·의료·투자에 관한 자문이 아니며, 계약이나 분쟁의 증거로 쓰기 위해 만든 것이 아닙니다.
          원 자료 자체에 오류나 누락이 있을 수 있어(공시 시점 차이, 기관의 입력 오류 등) 그런 경우에는
          표시하지 않거나 그 사실을 함께 밝힙니다. <Link href="/method">계산식은 전부 공개</Link>되어 있습니다.
        </p>
      </section>

      <section className="opinion">
        <p className="lab">4 · 데이터 출처와 이용 조건</p>
        <p>
          국토교통부 공동주택관리정보시스템(K-apt) 공시 · 건강보험심사평가원 비급여 진료비용 공개 ·
          교육부 나이스 교육정보 개방 포털 학원교습소 정보 · 한국장례문화진흥원 e하늘 장사정보 ·
          행정안전부 지방물가정보 및 착한가격업소 현황.
        </p>
        <p className="fine">
          모두 공공데이터포털과 각 기관이 개방한 자료이며 <b>공공누리 제1유형(출처 표시)</b> 조건에 따라
          출처를 밝히고 이용합니다. 가공한 검진 결과의 표현과 계산 방식은 JEGAP의 것이지만,
          원 자료의 권리는 각 기관에 있습니다.
        </p>
      </section>

      <section className="opinion">
        <p className="lab">5 · 틀린 것을 발견하셨다면</p>
        <p>
          사실과 다른 수치나 표기를 발견하시면 알려주세요. 해당 기관의 관계자가 정정을 요청하시는 경우도
          같습니다. <b>24시간 안에 확인하고, 근거가 확인되면 즉시 수정하거나 해당 표시를 내립니다.</b>
          {" "}창구: <a href={CONTACT.href}>{CONTACT.text}</a>.
        </p>
        <p className="fine">
          JEGAP은 개인이 만든 비영리 프로젝트입니다. 광고를 받지 않고, 어떤 기관과도 제휴하지 않습니다.
        </p>
      </section>

      <footer><p>JEGAP 제값 · 정부 공시 데이터 가격 검진</p></footer>
    </main>
  );
}
