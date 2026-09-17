"use client";
import { useEffect, useRef, useState } from "react";

/**
 * 책상 위 영수증 한 장 — 은은한 3D 틸트·취소선·도장.
 * 금액은 전부 "?" (수치를 지어내지 않는다는 원칙. 답은 검진표에 있다는 훅)
 */
const RECEIPTS = {
  apt: { title: "관리비 영수증", src: "K-apt · 매월 공시", foot: "얼마가 제값인지는 검진표가 압니다",
    items: ["일반관리비", "청소비", "승강기유지비", "난방비", "장기수선충당금"] },
  med: { title: "진료비 영수증", src: "심평원 · 비급여 공시", foot: "같은 진료, 병원마다 다른 값",
    items: ["MRI (요추)", "초음파 (복부)", "도수치료", "체외충격파", "제증명 수수료"] },
  aca: { title: "교습비 영수증", src: "교육청 · 신고 교습비", foot: "신고된 값보다 더 받으면 위법",
    items: ["수강료 (수학)", "수강료 (영어)", "교재비", "모의고사비"] },
  fun: { title: "장례비 영수증", src: "e하늘 · 공개 가격", foot: "정신없을 때일수록 미리",
    items: ["빈소 사용료", "안치료", "염습비", "수의 · 관"] },
  liv: { title: "장보기 영수증", src: "행정안전부 · 매월 조사", foot: "같은 품목, 지역마다 다른 값",
    items: ["냉면 한 그릇", "삼겹살 200g", "이발료", "목욕료", "택시 기본요금"] },
} as const;

/** 도메인별 선화 삽화 (신문 삽도 느낌 — 획 하나로 분야를 알린다) */
const S = { stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
const PROPS: Record<keyof typeof RECEIPTS, React.ReactNode> = {
  apt: (<g {...S}>
    <path d="M10 112V46l26-13v79" /><path d="M36 112V28l30-15v99" /><path d="M66 112V44l30 14v54" />
    <path d="M17 58h12M17 72h12M17 86h12M44 40h14M44 54h14M44 68h14M44 82h14M74 66h14M74 80h14M74 94h14" />
    <path d="M4 112h112" />
  </g>),
  med: (<g {...S}>
    <rect x="22" y="18" width="62" height="86" rx="4" /><path d="M42 18v-6h22v6" />
    <path d="M53 44v30M38 59h30" /><path d="M30 88h46" />
    <path d="M92 56c8 0 14 6 14 14s-6 14-14 14" />
  </g>),
  aca: (<g {...S}>
    <rect x="16" y="20" width="60" height="84" rx="3" /><path d="M28 20v84" />
    <path d="M38 38h28M38 52h28M38 66h20" />
    <path d="M92 26l10 10-38 38-13 3 3-13z" /><path d="M88 30l10 10" />
  </g>),
  fun: (<g {...S}>
    <circle cx="58" cy="44" r="15" />
    <path d="M58 29c-9-9-24-4-24 8M58 29c9-9 24-4 24 8M43 44c-12 0-18 12-11 20M73 44c12 0 18 12 11 20M58 59c-6 8-2 18 8 20M58 59c6 8 2 18-8 20" />
    <path d="M58 59v49" /><path d="M58 78c-8-6-16-4-20 2M58 90c8-6 16-4 20 2" />
  </g>),
  liv: (<g {...S}>
    <path d="M14 34h14l12 50h48l12-36H36" />
    <circle cx="52" cy="98" r="7" /><circle cx="84" cy="98" r="7" />
    <path d="M56 58h30M62 44v28" />
  </g>),
};

export default function HeroReceipt({ domain }: { domain: keyof typeof RECEIPTS }) {
  const r = RECEIPTS[domain];
  const stageRef = useRef<HTMLDivElement>(null);
  const [play, setPlay] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setPlay(true), 550);
    return () => clearTimeout(t);
  }, []);

  // 책상에 놓인 종이가 살짝 반응하는 정도로만 기울인다.
  const onMove = (e: React.PointerEvent) => {
    const el = stageRef.current;
    if (!el || e.pointerType === "touch" || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const b = el.getBoundingClientRect();
    const px = (e.clientX - b.left) / b.width - 0.5;
    const py = (e.clientY - b.top) / b.height - 0.5;
    el.style.setProperty("--ry", `${px * 8}deg`);
    el.style.setProperty("--rx", `${-py * 6}deg`);
  };
  const onLeave = () => {
    const el = stageRef.current;
    if (!el) return;
    el.style.setProperty("--ry", "0deg");
    el.style.setProperty("--rx", "0deg");
  };

  return (
    <div className="rstage" aria-hidden="true" ref={stageRef}
      onPointerMove={onMove} onPointerLeave={onLeave}>
      {/* 도메인 소품 — 분야를 알리는 선화 삽화 */}
      <svg className="rprop" viewBox="0 0 120 120" fill="none" aria-hidden="true">{PROPS[domain]}</svg>

      <div className={`receipt${play ? " play" : ""}`}>
        <p className="r-head">{r.title}</p>
        <p className="r-src">{r.src}</p>
        <ul className="r-items">
          {r.items.map((it, i) => (
            <li key={it} style={{ "--i": i } as React.CSSProperties}>
              <span>{it}</span><i /><b>?</b><em className="strike" />
            </li>
          ))}
        </ul>
        <p className="r-total"><span>합계</span><b>제값?</b></p>
        <p className="r-foot">{r.foot}</p>
        <span className="r-stamp" style={{ "--n": r.items.length } as React.CSSProperties}>제값?</span>
      </div>
    </div>
  );
}
