"use client";
import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Item = { code: string; name: string; sigungu: string };

export default function Search({ wide = false }: { wide?: boolean }) {
  const ph = wide ? "예: 은마, 헬리오시티…" : "단지 이름 검색";
  const [q, setQ] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [openList, setOpenList] = useState(false);
  const [hi, setHi] = useState(-1);
  const router = useRouter();
  const boxRef = useRef<HTMLDivElement>(null);
  const seqRef = useRef(0);
  const listId = useId();

  useEffect(() => {
    if (q.trim().length < 1) { setItems([]); return; }
    const seq = ++seqRef.current;
    const ac = new AbortController();
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`/api/search?q=${encodeURIComponent(q)}`, { signal: ac.signal });
        const j = (await r.json()) as { items: Item[] };
        if (seq !== seqRef.current) return;
        setItems(j.items); setOpenList(true); setHi(-1);
      } catch { /* 중단·실패 무소음 */ }
    }, 200);
    return () => { clearTimeout(t); ac.abort(); };
  }, [q]);

  useEffect(() => {
    const close = (e: PointerEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpenList(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);

  function go(it: Item) { setOpenList(false); setQ(""); router.push(`/d/${it.code}`); }

  return (
    <div className={`findwrap ${wide ? "wide" : ""}`} ref={boxRef}
      style={wide ? { marginLeft: 0, marginTop: 22, maxWidth: 460 } : undefined}>
      <form className="find" role="search"
        onSubmit={(e) => { e.preventDefault(); if (items[0]) go(items[hi >= 0 ? hi : 0]); }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") { e.preventDefault(); if (items.length) setHi((h) => Math.min(h + 1, items.length - 1)); }
            if (e.key === "ArrowUp") { e.preventDefault(); if (items.length) setHi((h) => Math.max(h - 1, 0)); }
            if (e.key === "Escape") setOpenList(false);
          }}
          placeholder={ph}
          aria-label="아파트 이름 검색" aria-expanded={openList && items.length > 0}
          role="combobox" aria-controls={listId}
          aria-activedescendant={hi >= 0 && items[hi] ? `${listId}-${hi}` : undefined} aria-autocomplete="list"
          autoComplete="off" spellCheck={false} name="danji" type="search" enterKeyHint="search"
        />
        <button type="submit">검진</button>
      </form>
      {openList && q.trim() && (
        <div className="sugg" id={listId} role="listbox" aria-label="검색 결과">
          {items.length === 0 && <p className="none">일치하는 단지가 없습니다. 공식 명칭의 두세 글자로 검색해 보세요.</p>}
          {items.map((it, i) => (
            <button key={it.code} id={`${listId}-${i}`} role="option" aria-selected={i === hi} onClick={() => go(it)}>
              <span>{it.name}</span><span className="gu">{it.sigungu}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
