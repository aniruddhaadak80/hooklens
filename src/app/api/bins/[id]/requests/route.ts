import { NextResponse } from "next/server";
import { clearRequests, getBin, listRequests } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  try {
    const bin = await getBin(id);
    if (!bin) return NextResponse.json({ error: "bin not found" }, { status: 404 });
    const limit = Number(new URL(req.url).searchParams.get("limit") ?? 25);
    const requests = await listRequests(id, limit);
    return NextResponse.json({ count: requests.length, requests });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "db error" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  try {
    const bin = await getBin(id);
    if (!bin) return NextResponse.json({ error: "bin not found" }, { status: 404 });
    const cleared = await clearRequests(id);
    return NextResponse.json({ ok: true, cleared });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "db error" }, { status: 500 });
  }
}
