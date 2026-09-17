"use client";
import { useMemo, useState } from "react";
import type { PriceExam } from "../lib/pricedom/core";

/** 항목 표 — 이름 필터와 전체 보기 토글. 모바일에서는 CSS가 카드형 행으로 바꾼다. */
export default function ExamTable({
  exams, mainLabel, maxRows,
}: { exams: PriceExam[]; mainLabel: string; maxRows: number }) {
  const [q, setQ] = useState("");
  const [all, setAll] = useState(false);
  const key = q.trim().toLowerCase();
  const hit = useMemo(
    () => (key ? exams.filter((e) => e.name.toLowerCase().includes(key)) : exams),
    [exams, key],
  );
  const rows = all || key ? hit : hit.slice(0, maxRows);

  return (
    <>
      <div className="htools">
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)}
          placeholder="항목 이름으로 찾기" aria-label="항목 이름으로 찾기" autoComplete="off" />
        {!key && exams.length > maxRows && (
          <button type="button" className="hmorebtn" aria-expanded={all} onClick={() => setAll((v) => !v)}>
            {all ? `상위 ${maxRows}개만 보기` : `전체 ${exams.length}개 보기`}
          </button>
        )}
      </div>
      <div className="htable" role="table" aria-label="항목별 가격 위치">
        <div className="hrow hhead" role="row">
          <span role="columnheader">항목</span>
          <span role="columnheader">이곳</span>
          <span role="columnheader">유사 기관 중간값</span>
          <span role="columnheader">위치</span>
        </div>
        {rows.map((e) => (
          <div className="hrow" role="row" key={e.code}>
            <span role="cell" className="hname">{e.name}{e.peerLabel !== mainLabel && <i className="unit"> · {e.peerLabel}</i>}</span>
            <span role="cell" className="num" data-l="이곳">{e.price.toLocaleString()}원</span>
            <span role="cell" className="num slate" data-l="유사 기관 중간값">{e.median.toLocaleString()}원 <i>({e.peerCount}곳)</i></span>
            <span role="cell" className={`num ${e.multiple >= 2 ? "hot" : ""}`} data-l="위치">
              중간값의 {e.multiple}배 · 가격 높은 쪽 상위 {Math.max(1, Math.min(99, e.percentile))}%
            </span>
          </div>
        ))}
      </div>
      <p className="hmore" role="status">
        {rows.length === 0
          ? `"${q.trim()}"와 일치하는 항목이 없습니다. 공개 항목은 모두 ${exams.length}개입니다.`
          : key
            ? `"${q.trim()}" 검색 결과 ${hit.length}개. 공개 항목은 모두 ${exams.length}개입니다.`
            : exams.length > maxRows && !all
              ? `배수가 큰 순으로 ${maxRows}개를 표시했습니다. 공개 항목은 모두 ${exams.length}개입니다.`
              : `공개 항목 ${exams.length}개를 모두 표시했습니다.`}
      </p>
    </>
  );
}
