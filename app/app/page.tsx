// 주간 갱신 데이터 — 하루 1회 재생성이면 충분 (가용성: 정적 서빙 유지)
export const revalidate = 86400;

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { getSource } from "../lib/data/kapt";
import { runCheckup } from "../lib/engine/checkup";
import CheckupView from "../components/CheckupView";

export default async function Home() {
  const hlPath = join(process.cwd(), "data", "highlights.json");
  const highlights: Array<{ dom: string; href: string; fact: string }> =
    existsSync(hlPath) ? JSON.parse(readFileSync(hlPath, "utf-8")) : [];
  const src = getSource();
  const [me, all] = await Promise.all([src.worst(), src.all()]);
  const checkup = runCheckup(me, all);
  const peerReserves = checkup.peerReserves;
  return (
    <CheckupView
      checkup={checkup}
      data={me}
      peerReserves={peerReserves}
      isHome
      highlights={highlights}
    />
  );
}
