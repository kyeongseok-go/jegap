import Link from "next/link";
import { ready as franchiseReady } from "../lib/franchise";
import { ready as oilReady } from "../lib/oil";
import { ready as goodsReady } from "../lib/goods";

export type DomainKey = "apt" | "med" | "aca" | "fun" | "liv" | "fra" | "oil" | "gro";

/**
 * 제품 패밀리 탭 — 확장 계약의 얼굴.
 *
 * `ready` 가 붙은 도메인은 **데이터가 실제로 있을 때만** 탭에 노출한다.
 * 연동 전 도메인을 탭에 띄우면 살아 있는 화면이 전부 바뀌고, 사용자는
 * 눌러도 "준비 중"만 보게 된다. 데이터가 들어오면 자동으로 나타난다.
 * (현재 보고 있는 도메인은 준비 여부와 무관하게 항상 표시한다.)
 */
const TABS: Array<{ key: DomainKey; href: string; label: string; ready?: () => boolean }> = [
  { key: "apt", href: "/", label: "관리비" },
  { key: "med", href: "/h", label: "병원비" },
  { key: "aca", href: "/a", label: "학원비" },
  { key: "fun", href: "/f", label: "장례비" },
  { key: "liv", href: "/p", label: "생활물가" },
  { key: "fra", href: "/fr", label: "창업비용", ready: franchiseReady },
  { key: "oil", href: "/oil", label: "주유소", ready: oilReady },
  { key: "gro", href: "/gr", label: "생필품", ready: goodsReady },
];

export default function DomainTabs({ active }: { active: DomainKey }) {
  const shown = TABS.filter((t) => !t.ready || t.key === active || t.ready());
  return (
    <nav className="domains" aria-label="검진 종류">
      {shown.map((t) => (
        <Link key={t.key} href={t.href} className={active === t.key ? "on" : ""}
          aria-current={active === t.key ? "page" : undefined}>{t.label}</Link>
      ))}
    </nav>
  );
}
