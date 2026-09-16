import { NextResponse } from "next/server";
import { funeralReady, searchFunerals } from "../../../lib/funeral";

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q") ?? "";
  if (!funeralReady()) return NextResponse.json({ items: [] });
  return NextResponse.json({ items: searchFunerals(q) });
}
