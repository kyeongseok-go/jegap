import { NextResponse } from "next/server";
import { academyReady, searchAcademies } from "../../../lib/academy";

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q") ?? "";
  if (!academyReady()) return NextResponse.json({ items: [] });
  return NextResponse.json({ items: searchAcademies(q) });
}
