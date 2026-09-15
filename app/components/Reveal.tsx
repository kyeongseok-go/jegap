"use client";
import { useEffect, useRef } from "react";

export default function Reveal({
  as: Tag = "div", className = "", children,
}: { as?: "div" | "section"; className?: string; children: React.ReactNode }) {
  const ref = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) { el.classList.add("in"); return; }
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => { if (e.isIntersecting) { el.classList.add("in"); io.disconnect(); } });
    }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Tag ref={ref as React.Ref<HTMLDivElement> & React.Ref<HTMLElement>} className={`reveal ${className}`}>
      {children}
    </Tag>
  );
}
