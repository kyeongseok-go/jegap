import { NextResponse } from "next/server";
import { hiraReady, searchHospitals } from "../../../lib/medical/hira";

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q") ?? "";
  if (!hiraReady()) return NextResponse.json({ items: [] });
  return NextResponse.json({ items: searchHospitals(q) });
}
