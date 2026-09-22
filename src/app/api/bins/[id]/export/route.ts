import { NextResponse } from "next/server";
import { getBin, listRequests } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  try {
    const bin = await getBin(id);
    if (!bin) return NextResponse.json({ error: "bin not found" }, { status: 404 });
    const requests = await listRequests(id, 100);
    const payload = JSON.stringify({ bin, exportedAt: new Date().toISOString(), requests }, null, 2);
    return new NextResponse(payload, {
      headers: {
        "content-type": "application/json",
        "content-disposition": `attachment; filename="hooklens-${id}.json"`,
      },
    });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "db error" }, { status: 500 });
  }
}
