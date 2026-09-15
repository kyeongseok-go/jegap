import { NextRequest, NextResponse } from "next/server";
import { getSource } from "../../../lib/data/kapt";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";
  if (q.trim().length < 1) return NextResponse.json({ items: [] });
  const items = await getSource().search(q);
  return NextResponse.json({ items });
}
