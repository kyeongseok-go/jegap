"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Item = { id: string; name: string; sigungu: string; kind: string };

export default function PriceSearch({
  endpoint, hrefBase, placeholder, label, wide = false,
}: {
  endpoint: string; hrefBase: string; placeholder: string; label: string; wide?: boolean;
}) {
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
        const r = await fetch(`${endpoint}?q=${encodeURIComponent(q)}`);
        const j = await r.json();
        setItems(j.items ?? []); setOpenList(true); setHi(-1);
      } catch { /* 무소음 */ }
    }, 200);
    return () => clearTimeout(t);
  }, [q, endpoint]);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpenList(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const go = (id: string) => { setOpenList(false); router.push(`${hrefBase}/${encodeURIComponent(id)}`); };

  return (
    <div className={`findwrap ${wide ? "wide" : ""}`} ref={boxRef}
      style={wide ? { marginLeft: 0, marginTop: 22, maxWidth: 520 } : undefined}>
      <form className="find" role="search"
        onSubmit={(e) => { e.preventDefault(); if (items[0]) go(items[0].id); }}>
        <input type="search" placeholder={placeholder} value={q}
          role="combobox" aria-expanded={openList} aria-controls="psugg-list"
          aria-label={label} autoComplete="off"
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") { e.preventDefault(); setHi((h) => Math.min(h + 1, items.length - 1)); }
            if (e.key === "ArrowUp") { e.preventDefault(); setHi((h) => Math.max(h - 1, 0)); }
            if (e.key === "Enter" && hi >= 0) { e.preventDefault(); go(items[hi].id); }
            if (e.key === "Escape") setOpenList(false);
          }} />
        <button type="submit">검진</button>
      </form>
      {openList && q.trim() && (
        <div className="sugg" id="psugg-list" role="listbox" aria-label="검색 결과">
          {items.length === 0 && <p className="none">일치하는 곳이 없습니다. 공식 명칭의 두세 글자로 검색해 보세요.</p>}
          {items.map((it, i) => (
            <button key={it.id} role="option" aria-selected={i === hi}
              className={i === hi ? "hit hi" : "hit"} onClick={() => go(it.id)}>
              <span>{it.name}</span><span className="gu">{it.sigungu} · {it.kind}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
