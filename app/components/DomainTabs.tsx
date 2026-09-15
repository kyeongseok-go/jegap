import Link from "next/link";

/** 제품 패밀리 탭 — 확장 계약의 얼굴. active: "apt" | "med" */
export default function DomainTabs({ active }: { active: "apt" | "med" }) {
  return (
    <nav className="domains" aria-label="검진 종류">
      <Link href="/" className={active === "apt" ? "on" : ""} aria-current={active === "apt" ? "page" : undefined}>관리비</Link>
      <Link href="/h" className={active === "med" ? "on" : ""} aria-current={active === "med" ? "page" : undefined}>병원비</Link>
    </nav>
  );
}
