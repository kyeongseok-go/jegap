"use client";
import { useRef, useState } from "react";

export default function RxBox({ code, refundWon }: { code: string; refundWon?: number }) {
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<"template" | "llm" | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  async function run(kind: "inquiry" | "agenda" | "refund") {
    // 진행 중 재클릭 = 중단 후 전체 표시 (인터럽트 가능 — 가이드라인)
    if (busy) { abortRef.current?.abort(); return; }
    setOpen(true); setText(""); setBusy(true);
    const ac = new AbortController();
    abortRef.current = ac;
    try {
      const res = await fetch("/api/rx", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ code, kind }),
        signal: ac.signal,
      });
      setMode((res.headers.get("x-rx-mode") as "template" | "llm") ?? "template");
      const reader = res.body!.getReader();
      const dec = new TextDecoder();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        setText((t) => t + dec.decode(value, { stream: true }));
      }
    } catch {
      /* 중단 시 지금까지 텍스트 유지 */
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rx reveal in">
      <h3>물어볼 수 있습니다</h3>
      <p>근거 조항까지 갖춘 질의서를 만들어 드립니다. 그대로 복사해 관리사무소에 보내세요.</p>
      {refundWon !== undefined && (
        <p className="rx-hint">
          전세·월세로 살다 이사하셨나요? 세입자가 대신 낸 장기수선충당금은 집주인에게 돌려받는 돈입니다
          (공동주택관리법 시행령 제31조).
          {refundWon >= 30000 && <> 이 단지 기준, 전용 84㎡ · 2년 거주면 약 <b>{refundWon.toLocaleString()}원</b>입니다.</>}
        </p>
      )}
      <div className="acts">
        <button className="btn" onClick={() => run("inquiry")}>
          {busy ? "생성 중… (누르면 중단)" : "관리사무소 질의서 만들기"}
        </button>
        <button className="btn g" onClick={() => run("agenda")} disabled={busy}>
          입주자대표회의 안건 초안
        </button>
        <button className="btn g" onClick={() => run("refund")} disabled={busy}>
          세입자 반환 확인서 요청문
        </button>
        {text && !busy && (
          <button className="btn g" onClick={() => navigator.clipboard?.writeText(text)}>복사</button>
        )}
      </div>
      {open && (
        <div className="paper on" aria-live="polite">
          {text}{busy && <span className="car" aria-hidden="true"></span>}
        </div>
      )}
      {mode && !busy && (
        <p className="rx-mode">
          {mode === "llm"
            ? "AI가 문장을 다듬었습니다. 수치와 법 조항은 데이터에서 그대로 가져왔습니다."
            : "표준 양식으로 작성했습니다. 수치와 법 조항은 데이터에서 그대로 가져왔습니다."}
        </p>
      )}
    </section>
  );
}
