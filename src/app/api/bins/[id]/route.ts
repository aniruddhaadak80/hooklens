import { NextResponse } from "next/server";
import { deleteBin, getBin, renameBin } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  try {
    const bin = await getBin(id);
    if (!bin) return NextResponse.json({ error: "bin not found" }, { status: 404 });
    return NextResponse.json({ bin });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "db error" }, { status: 500 });
  }
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  try {
    const body = (await req.json()) as { name?: unknown };
    if (typeof body.name !== "string" || !body.name.trim()) {
      return NextResponse.json({ error: "name required" }, { status: 400 });
    }
    const bin = await renameBin(id, body.name);
    if (!bin) return NextResponse.json({ error: "bin not found" }, { status: 404 });
    return NextResponse.json({ bin });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "db error" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  try {
    const gone = await deleteBin(id);
    if (!gone) return NextResponse.json({ error: "bin not found" }, { status: 404 });
    return NextResponse.json({ ok: true, id });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "db error" }, { status: 500 });
  }
}
