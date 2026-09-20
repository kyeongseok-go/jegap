"use client";
import { useRef, useState } from "react";

/** 범용 처방전 박스 — endpoint에 {id} POST, 스트리밍 표시 (관리비편 RxBox의 단일 버튼 판) */
export default function RxSimple({
  id, endpoint, title, lead, btnLabel, hint,
}: {
  id: string; endpoint: string; title: string; lead: string;
  btnLabel: string; hint?: React.ReactNode;
}) {
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<"template" | "llm" | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  async function run() {
    if (busy) { abortRef.current?.abort(); return; }
    setOpen(true); setText(""); setBusy(true);
    const ac = new AbortController();
    abortRef.current = ac;
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id }),
        signal: ac.signal,
      });
      if (!res.ok) {
        setText("요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.");
        setMode(null); setBusy(false); return;
      }
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
      <h2>{title}</h2>
      <p>{lead}</p>
      {hint && <p className="rx-hint">{hint}</p>}
      <div className="acts">
        <button className="btn" onClick={run}>
          {busy ? "생성 중… (누르면 중단)" : btnLabel}
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
