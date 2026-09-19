import { NextResponse } from "next/server";
import { ready, search } from "../../../lib/oil";

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q") ?? "";
  if (!ready()) return NextResponse.json({ items: [] });
  return NextResponse.json({ items: search(q) });
}
