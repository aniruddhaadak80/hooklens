import { NextResponse } from "next/server";
import { createBin, listBins } from "@/lib/db";
import { newId } from "@/lib/seal";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const bins = await listBins();
    return NextResponse.json({ count: bins.length, bins });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "db error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    let name = "Untitled bin";
    try {
      const body = (await req.json()) as { name?: unknown };
      if (typeof body.name === "string" && body.name.trim()) name = body.name;
    } catch { /* empty body is fine */ }
    const bin = await createBin(newId("bin"), name);
    return NextResponse.json({ bin }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "db error" }, { status: 500 });
  }
}
