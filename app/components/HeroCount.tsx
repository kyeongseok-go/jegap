"use client";
import { useEffect, useRef } from "react";
import type { Signal } from "../lib/engine/types";

export default function HeroCount({
  percentile, signal, signalLabel, meX, children,
}: {
  percentile: number; signal: Signal; signalLabel: string; meX: number;
  children: React.ReactNode;
}) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current?.parentElement; // centerpiece 전체에서 SVG 탐색
    if (!root) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const counter = root.querySelector<HTMLElement>("[data-count]");
    const badge = root.querySelector<HTMLElement>("[data-badge]");
    const dot = root.querySelector<SVGCircleElement>("[data-me-dot]");
    const line = root.querySelector<SVGLineElement>("[data-me-line]");
    const lab = root.querySelector<SVGTextElement>("[data-me-lab]");

    const settle = () => {
      dot?.setAttribute("cy", "132");
      line?.setAttribute("y1", "132");
      lab?.setAttribute("opacity", "1");
    };
    if (reduced) {
      if (counter) counter.textContent = String(percentile);
      badge?.classList.add("on");
      settle();
      return;
    }
    // 점은 곡선 정점에서 시작해 실제 위치로 미끄러진다
    dot?.setAttribute("cx", "450"); dot?.setAttribute("cy", "40");
    line?.setAttribute("opacity", "0"); lab?.setAttribute("opacity", "0");
    let n = 0;
    const iv = setInterval(() => {
      n++;
      if (counter) counter.textContent = String(Math.min(n, percentile));
      if (n >= percentile) { clearInterval(iv); badge?.classList.add("on"); }
    }, Math.max(40, 700 / Math.max(percentile, 1)));
    const t = setTimeout(() => {
      if (dot) { dot.style.transition = "cx 1.1s cubic-bezier(.16,1,.3,1), cy 1.1s cubic-bezier(.16,1,.3,1)";
        dot.setAttribute("cx", String(meX)); dot.setAttribute("cy", "132"); }
      if (line) { line.style.transition = "opacity .5s ease .9s"; line.setAttribute("y1", "132"); line.setAttribute("opacity", "1"); }
      if (lab) { lab.style.transition = "opacity .5s ease 1s"; lab.setAttribute("opacity", "1"); }
    }, 500);
    return () => { clearInterval(iv); clearTimeout(t); };
  }, [percentile, meX]);

  return (
    <div className="cp-top" ref={rootRef}>
      {children}
      <span className={`badge ${signal === "good" ? "okb" : ""}`} data-badge aria-live="polite">
        <span className="dot" aria-hidden="true"></span>{signalLabel}
      </span>
    </div>
  );
}
