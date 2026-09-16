"use client";
import { useEffect, useRef, useState } from "react";

/**
 * 히어로 영수증 더미 — 뒤로 구겨진 영수증이 쌓이고, 맨 앞 장에 3D 틸트·취소선·도장.
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

export default function HeroReceipt({ domain }: { domain: keyof typeof RECEIPTS }) {
  const r = RECEIPTS[domain];
  const stageRef = useRef<HTMLDivElement>(null);
  const [play, setPlay] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setPlay(true), 550);
    return () => clearTimeout(t);
  }, []);

  // 더미 전체가 커서를 따라 기운다 (뒷장은 더 적게 → 깊이감)
  const onMove = (e: React.PointerEvent) => {
    const el = stageRef.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const b = el.getBoundingClientRect();
    const px = (e.clientX - b.left) / b.width - 0.5;
    const py = (e.clientY - b.top) / b.height - 0.5;
    el.style.setProperty("--ry", `${px * 15}deg`);
    el.style.setProperty("--rx", `${-py * 11}deg`);
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
      {/* 뒤로 쌓인 구겨진 영수증들 */}
      <span className="rcrumple c3" />
      <span className="rcrumple c2" />
      <span className="rslip s3" />
      <span className="rslip s2" />
      <span className="rslip s1" />

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
