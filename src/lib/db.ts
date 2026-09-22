import { neon } from "@neondatabase/serverless";
import type { Bin, CapturedRequest } from "./types";

function sql() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  return neon(url);
}

const ALLOWED_BIN = /^[a-z0-9_]{3,64}$/;

export function assertBinId(id: string): void {
  if (!ALLOWED_BIN.test(id)) throw new Error("invalid bin id");
}

export async function listBins(): Promise<Bin[]> {
  const db = sql();
  const rows = await db`SELECT id, name, created_at, request_count FROM bins ORDER BY created_at DESC LIMIT 100`;
  return rows as unknown as Bin[];
}

export async function getBin(id: string): Promise<Bin | null> {
  assertBinId(id);
  const db = sql();
  const rows = await db`SELECT id, name, created_at, request_count FROM bins WHERE id = ${id} LIMIT 1`;
  return (rows as unknown as Bin[])[0] ?? null;
}

export async function createBin(id: string, name: string): Promise<Bin> {
  assertBinId(id);
  const clean = name.trim().slice(0, 80) || "Untitled bin";
  const db = sql();
  const rows = await db`INSERT INTO bins (id, name) VALUES (${id}, ${clean}) RETURNING id, name, created_at, request_count`;
  return (rows as unknown as Bin[])[0];
}

export async function renameBin(id: string, name: string): Promise<Bin | null> {
  assertBinId(id);
  const clean = name.trim().slice(0, 80);
  if (!clean) throw new Error("name required");
  const db = sql();
  const rows = await db`UPDATE bins SET name = ${clean} WHERE id = ${id} RETURNING id, name, created_at, request_count`;
  return (rows as unknown as Bin[])[0] ?? null;
}

export async function deleteBin(id: string): Promise<boolean> {
  assertBinId(id);
  const db = sql();
  const rows = await db`DELETE FROM bins WHERE id = ${id} RETURNING id`;
  return (rows as unknown as unknown[]).length > 0;
}

export async function lastSeal(binId: string): Promise<string> {
  assertBinId(binId);
  const db = sql();
  const { GENESIS_SEAL } = await import("./seal");
  const rows = await db`SELECT seal FROM requests WHERE bin_id = ${binId} ORDER BY received_at DESC, id DESC LIMIT 1`;
  const list = rows as unknown as { seal: string }[];
  return list[0]?.seal ?? GENESIS_SEAL;
}

export async function addRequest(input: {
  id: string;
  binId: string;
  method: string;
  headers: Record<string, string>;
  query: Record<string, string>;
  body: string;
  size: number;
  seal: string;
  prevSeal: string;
}): Promise<CapturedRequest> {
  assertBinId(input.binId);
  const db = sql();
  const rows = await db`
    INSERT INTO requests (id, bin_id, method, headers, query, body, size, seal, prev_seal)
    VALUES (${input.id}, ${input.binId}, ${input.method}, ${JSON.stringify(input.headers)}, ${JSON.stringify(input.query)}, ${input.body}, ${input.size}, ${input.seal}, ${input.prevSeal})
    RETURNING id, bin_id, method, headers, query, body, size, seal, prev_seal, received_at`;
  await db`UPDATE bins SET request_count = request_count + 1 WHERE id = ${input.binId}`;
  const r = (rows as unknown as Record<string, unknown>[])[0];
  return {
    id: String(r.id), bin_id: String(r.bin_id), method: String(r.method),
    headers: r.headers as Record<string, string>, query: r.query as Record<string, string>,
    body: String(r.body), size: Number(r.size), seal: String(r.seal),
    prev_seal: String(r.prev_seal), received_at: String(r.received_at),
  };
}

export async function listRequests(binId: string, limit = 25): Promise<CapturedRequest[]> {
  assertBinId(binId);
  const lim = Math.min(100, Math.max(1, limit));
  const db = sql();
  const rows = await db`SELECT id, bin_id, method, headers, query, body, size, seal, prev_seal, received_at FROM requests WHERE bin_id = ${binId} ORDER BY received_at DESC, id DESC LIMIT ${lim}`;
  return rows as unknown as CapturedRequest[];
}

export async function getRequest(binId: string, reqId: string): Promise<CapturedRequest | null> {
  assertBinId(binId);
  const db = sql();
  const rows = await db`SELECT id, bin_id, method, headers, query, body, size, seal, prev_seal, received_at FROM requests WHERE bin_id = ${binId} AND id = ${reqId} LIMIT 1`;
  return (rows as unknown as CapturedRequest[])[0] ?? null;
}

export async function clearRequests(binId: string): Promise<number> {
  assertBinId(binId);
  const db = sql();
  const rows = await db`DELETE FROM requests WHERE bin_id = ${binId} RETURNING id`;
  await db`UPDATE bins SET request_count = 0 WHERE id = ${binId}`;
  return (rows as unknown as unknown[]).length;
}

export async function countRequests(): Promise<number> {
  const db = sql();
  const rows = await db`SELECT COUNT(*)::int AS n FROM requests`;
  return (rows as unknown as { n: number }[])[0]?.n ?? 0;
}
