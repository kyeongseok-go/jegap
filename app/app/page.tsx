import { getSource } from "../lib/data/kapt";
import { runCheckup } from "../lib/engine/checkup";
import CheckupView from "../components/CheckupView";

export default async function Home() {
  const src = getSource();
  const [me, all] = await Promise.all([src.worst(), src.all()]);
  const checkup = runCheckup(me, all);
  const peerReserves = all
    .filter((d) => d.danji.code !== me.danji.code)
    .map((d) => d.reserve.perM2);
  return (
    <CheckupView
      checkup={checkup}
      data={me}
      peerReserves={peerReserves}
      isHome
    />
  );
}
