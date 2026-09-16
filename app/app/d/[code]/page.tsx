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
  const peerReserves = checkup.peerReserves;
  return <CheckupView checkup={checkup} data={me} peerReserves={peerReserves} />;
}
