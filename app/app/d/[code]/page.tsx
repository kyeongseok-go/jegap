// 방문한 페이지는 하루 캐시 (ISR) — 데이터는 주간 갱신이라 안전
export const revalidate = 86400;

import { notFound } from "next/navigation";
import { getSource } from "../../../lib/data/kapt";
import { runCheckup } from "../../../lib/engine/checkup";
import CheckupView from "../../../components/CheckupView";

export default async function DanjiPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const src = getSource();
  const me = await src.get(code);
  if (!me) notFound();
  const all = await src.all();
  const checkup = runCheckup(me, all);
  const peerReserves = all
    .filter((d) => d.danji.code !== me.danji.code)
    .map((d) => d.reserve.perM2);
  return <CheckupView checkup={checkup} data={me} peerReserves={peerReserves} />;
}
