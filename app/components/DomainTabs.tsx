import Link from "next/link";

export type DomainKey = "apt" | "med" | "aca" | "fun" | "liv";

const TABS: Array<{ key: DomainKey; href: string; label: string }> = [
  { key: "apt", href: "/", label: "관리비" },
  { key: "med", href: "/h", label: "병원비" },
  { key: "aca", href: "/a", label: "학원비" },
  { key: "fun", href: "/f", label: "장례비" },
  { key: "liv", href: "/p", label: "생활물가" },
];

/** 제품 패밀리 탭 — 확장 계약의 얼굴 */
export default function DomainTabs({ active }: { active: DomainKey }) {
  return (
    <nav className="domains" aria-label="검진 종류">
      {TABS.map((t) => (
        <Link key={t.key} href={t.href} className={active === t.key ? "on" : ""}
          aria-current={active === t.key ? "page" : undefined}>{t.label}</Link>
      ))}
    </nav>
  );
}
