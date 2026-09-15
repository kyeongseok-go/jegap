"use client";
import { useEffect, useRef } from "react";

export default function Spark({ ours, peer, end }: { ours: string; peer: string; end: string }) {
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) { el.classList.add("drawn"); return; }
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => { if (e.isIntersecting) { setTimeout(() => el.classList.add("drawn"), 150); io.disconnect(); } });
    }, { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const [ex, ey] = end.split(",").map(Number);
  return (
    <svg ref={ref} className="spark" viewBox="0 0 280 52" preserveAspectRatio="none" role="img"
      aria-label="최근 관리비 궤적: 우리 단지와 유사 단지 평균 비교">
      <polyline className="peer" points={peer} />
      <polyline className="ours" points={ours} />
      <circle className="endcap" cx={ex} cy={ey} r="3.5" />
    </svg>
  );
}
