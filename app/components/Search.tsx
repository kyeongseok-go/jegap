"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Item = { code: string; name: string; sigungu: string };

export default function Search({ wide = false }: { wide?: boolean }) {
  const [q, setQ] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [openList, setOpenList] = useState(false);
  const [hi, setHi] = useState(-1);
  const router = useRouter();
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (q.trim().length < 1) { setItems([]); return; }
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        const j = (await r.json()) as { items: Item[] };
        setItems(j.items); setOpenList(true); setHi(-1);
      } catch { setItems([]); }
    }, 200);
    return () => clearTimeout(t);
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
            if (e.key === "ArrowDown") { e.preventDefault(); setHi((h) => Math.min(h + 1, items.length - 1)); }
            if (e.key === "ArrowUp") { e.preventDefault(); setHi((h) => Math.max(h - 1, 0)); }
            if (e.key === "Escape") setOpenList(false);
          }}
          placeholder="예: 한빛마을 3단지…"
          aria-label="아파트 이름 검색" aria-expanded={openList && items.length > 0}
          role="combobox" aria-controls="sugg-list" aria-autocomplete="list"
          autoComplete="off" spellCheck={false} name="danji" type="search" enterKeyHint="search"
        />
        <button type="submit">검진</button>
      </form>
      {openList && q.trim() && (
        <div className="sugg" id="sugg-list" role="listbox" aria-label="검색 결과">
          {items.length === 0 && <p className="none">일치하는 단지가 없습니다. 공식 명칭의 두세 글자로 검색해 보세요.</p>}
          {items.map((it, i) => (
            <button key={it.code} role="option" aria-selected={i === hi} onClick={() => go(it)}>
              <span>{it.name}</span><span className="gu">{it.sigungu}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
