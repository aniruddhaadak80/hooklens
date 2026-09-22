import { NextResponse } from "next/server";
import { getBin, getRequest } from "@/lib/db";
import { inspectRequest } from "@/lib/inspect";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string; reqId: string }> }) {
  const { id, reqId } = await ctx.params;
  try {
    const bin = await getBin(id);
    if (!bin) return NextResponse.json({ error: "bin not found" }, { status: 404 });
    const r = await getRequest(id, reqId);
    if (!r) return NextResponse.json({ error: "request not found" }, { status: 404 });
    return NextResponse.json({ request: r, inspection: inspectRequest(r) });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "db error" }, { status: 500 });
  }
}
