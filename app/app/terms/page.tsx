import type { Metadata } from "next";
import Link from "next/link";
import { CONTACT } from "../../lib/site";

export const metadata: Metadata = {
  title: "이용 안내와 개인정보 — JEGAP 제값",
  description: "JEGAP이 무엇을 수집하지 않는지, 이 검진을 어떻게 읽어야 하는지, 데이터는 어디서 왔는지.",
};

/** 출처별 이용 조건 — 개방 페이지 원문으로 확인한 것만 유형을 적는다.
 *  확인하지 못한 것은 "확인 중"으로 두고 추측하지 않는다. */
const SOURCES: Array<{ name: string; license: string; asof: string; note?: string }> = [
  { name: "국토교통부 공동주택관리정보시스템(K-apt)", license: "확인 중", asof: "공시 기준" },
  { name: "건강보험심사평가원 비급여 진료비용 공개", license: "확인 중", asof: "공개 기준" },
  { name: "교육부 나이스 교육정보 개방 포털", license: "확인 중", asof: "2026.9 수집" },
  { name: "한국장례문화진흥원 e하늘 장사정보", license: "공공누리 제1유형(출처 표시)", asof: "2023.6 공시" },
  { name: "행정안전부 지방물가·착한가격업소", license: "확인 중", asof: "2026.6~8 조사" },
  { name: "공정거래위원회 가맹사업 정보공개", license: "이용허락범위 제한 없음 · 무료", asof: "연 1회 갱신" },
  { name: "한국소비자원 참가격", license: "공공누리 제1유형(출처 표시) · 무료", asof: "격주 조사" },
  { name: "한국석유공사 오피넷", license: "공공데이터포털 기준 제한 없음", asof: "매일 조사",
    note: "오피넷 저작권정책은 수익 목적 이용 시 석유공사와 사전 협의를 요구합니다. JEGAP은 비영리로 운영하며, 수익이 생기면 먼저 협의합니다." },
];

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
          검색창에 입력한 단지·병원·학원·장례식장 이름은 결과를 만드는 데만 쓰이고,
          <b>이 애플리케이션은 그것을 별도의 데이터베이스에 저장하지 않습니다</b>. 광고나 분석 목적의
          쿠키도 심지 않습니다.
        </p>
        <p className="fine">
          이는 애플리케이션 코드에서 확인할 수 있는 범위입니다. 사이트를 올려둔 호스팅 제공자(Vercel)가
          요청 기록을 자체 로그로 남기는 것은 이와 별개의 문제이며, 그 보존 기간과 설정은 제공자의 정책을
          따릅니다. 여기서는 확인한 내용만 적고, 확인하지 못한 것을 없다고 쓰지 않습니다.
        </p>
      </section>

      <section className="opinion">
        <p className="lab">2 · 잠깐 쓰는 것</p>
        <p>
          질의서 대필 기능은 <b>같은 IP 주소에서 60초에 다섯 번</b>까지만 쓸 수 있습니다. 이 횟수를 세려고
          접속 IP를 <b>서버 메모리에만</b> 담습니다. 디스크에 기록하지 않고, 60초 창이 지난 기록은 다음 요청이
          들어올 때 지웁니다. 서버가 재시작되면 그 기록도 함께 사라집니다.
        </p>
        <p className="fine">
          IP 기준 제한은 <b>사람 기준 제한이 아닙니다</b>. 회사·학교·통신사 공유망을 쓰는 여러 사람이 한 명으로
          묶일 수 있고, 반대로 IP가 바뀌면 같은 사람이 다른 사람으로 세어집니다. 또 이 계산은 서버 인스턴스마다
          따로 이뤄지므로 전체 사용량의 정확한 상한이 아닙니다.
        </p>
        <p>
          대필 문장을 다듬는 과정에서 <b>검진 결과 문서(수치와 대상 기관 이름 포함)가 Anthropic의 Claude API로
          전송</b>됩니다. IP를 비롯해 이용자를 식별할 수 있는 정보는 함께 보내지 않습니다. 다듬은 결과는
          서버가 <b>숫자와 법 조항이 원문 그대로인지 검사한 뒤</b>에만 내보내고, 하나라도 다르면 그 결과를 버리고
          서버가 만든 표준 문서를 그대로 드립니다. 운영자가 이 기능을 끄거나 하루 호출 한도에 이른 경우에도
          같은 표준 문서가 나갑니다.
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
          모두 공공데이터포털과 각 기관이 개방한 자료입니다. <b>이용 조건은 출처마다 다릅니다.</b>
        </p>
        <div className="srctable" role="table" aria-label="출처별 이용 조건">
          <div className="srow shead" role="row">
            <span role="columnheader">출처</span>
            <span role="columnheader">이용 조건</span>
            <span role="columnheader">기준 시점</span>
          </div>
          {SOURCES.map((r) => (
            <div className="srow" role="row" key={r.name}>
              <span role="cell" className="sname">{r.name}</span>
              <span role="cell">{r.license}{r.note && <i className="snote"> — {r.note}</i>}</span>
              <span role="cell" className="sasof">{r.asof}</span>
            </div>
          ))}
        </div>
        <p className="fine">
          &ldquo;확인 중&rdquo;은 개방 페이지에서 이용허락 유형을 아직 원문으로 확인하지 못했다는 뜻입니다.
          확인을 마칠 때까지 출처를 밝히고 이용하며, 각 기관이 다른 조건을 안내하는 경우 그 조건을 따릅니다.
          가공한 검진 결과의 표현과 계산 방식은 JEGAP의 것이지만, 원 자료의 권리는 각 기관에 있습니다.
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
