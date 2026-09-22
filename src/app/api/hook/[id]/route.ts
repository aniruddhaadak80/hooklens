import { NextResponse } from "next/server";
import { addRequest, getBin, lastSeal } from "@/lib/db";
import { newId, sealRecord } from "@/lib/seal";

export const dynamic = "force-dynamic";

const MAX_BODY = 262144;

async function capture(req: Request, id: string) {
  const bin = await getBin(id);
  if (!bin) return NextResponse.json({ error: "bin not found" }, { status: 404 });

  const headers: Record<string, string> = {};
  let n = 0;
  for (const [k, v] of req.headers.entries()) {
    if (n++ >= 50) break;
    headers[k.slice(0, 128)] = v.slice(0, 1024);
  }
  const url = new URL(req.url);
  const query: Record<string, string> = {};
  for (const [k, v] of url.searchParams.entries()) query[k.slice(0, 128)] = v.slice(0, 1024);

  let body = "";
  try {
    body = (await req.text()).slice(0, MAX_BODY);
  } catch { body = ""; }
  const size = Buffer.byteLength(body, "utf8");

  const reqId = newId("req");
  const prevSeal = await lastSeal(id);
  const record = { id: reqId, bin_id: id, method: req.method, headers, query, body, size };
  const seal = sealRecord(record, prevSeal);
  await addRequest({ id: reqId, binId: id, method: req.method, headers, query, body, size, seal, prevSeal });
  return NextResponse.json({ ok: true, id: reqId, seal });
}

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  return capture(req, (await ctx.params).id);
}
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  return capture(req, (await ctx.params).id);
}
export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  return capture(req, (await ctx.params).id);
}
export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  return capture(req, (await ctx.params).id);
}
export async function DELETE(req: Request, ctx: { params: Promise<{ id: string }> }) {
  return capture(req, (await ctx.params).id);
}
