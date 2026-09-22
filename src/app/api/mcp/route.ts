import { NextResponse } from "next/server";
import { clearRequests, createBin, getBin, getRequest, listBins, listRequests } from "@/lib/db";
import { inspectRequest } from "@/lib/inspect";
import { newId } from "@/lib/seal";

export const dynamic = "force-dynamic";

const TOOLS = [
  { name: "create_bin", description: "Create a webhook bin. Returns the bin id and its public hook URL path.", inputSchema: { type: "object", properties: { name: { type: "string" } } } },
  { name: "list_bins", description: "List all bins with request counts.", inputSchema: { type: "object", properties: {} } },
  { name: "get_requests", description: "Get captured requests for a bin, newest first.", inputSchema: { type: "object", properties: { bin_id: { type: "string" }, limit: { type: "number" } }, required: ["bin_id"] } },
  { name: "inspect_request", description: "Deterministic inspection of one captured request: body kind, keys, findings, seal validity.", inputSchema: { type: "object", properties: { bin_id: { type: "string" }, request_id: { type: "string" } }, required: ["bin_id", "request_id"] } },
  { name: "clear_bin", description: "Delete all captured requests in a bin.", inputSchema: { type: "object", properties: { bin_id: { type: "string" } }, required: ["bin_id"] } },
];

interface RpcBody { jsonrpc?: string; id?: string | number | null; method?: string; params?: { name?: string; arguments?: Record<string, unknown> } }

function rpcOk(id: string | number | null, result: unknown) {
  return NextResponse.json({ jsonrpc: "2.0", id: id ?? 0, result });
}
function rpcErr(id: string | number | null, code: number, message: string) {
  return NextResponse.json({ jsonrpc: "2.0", id: id ?? 0, error: { code, message } });
}

export async function GET() {
  return NextResponse.json({ protocol: "mcp-jsonrpc", version: "1.0.0", tools: TOOLS.map((t) => t.name), usage: "POST {jsonrpc:'2.0', id, method:'tools/list'|'tools/call'|'initialize', params}" });
}

export async function POST(req: Request) {
  let body: RpcBody;
  try {
    body = (await req.json()) as RpcBody;
  } catch {
    return rpcErr(null, -32700, "parse error");
  }
  const id = body.id ?? 0;
  const method = body.method ?? "";
  if (method === "initialize") {
    return rpcOk(id, { protocolVersion: "2024-11-05", serverInfo: { name: "hooklens", version: "1.0.0" }, capabilities: { tools: {} } });
  }
  if (method === "tools/list") {
    return rpcOk(id, { tools: TOOLS });
  }
  if (method === "tools/call") {
    const name = body.params?.name ?? "";
    const args = (body.params?.arguments ?? {}) as Record<string, unknown>;
    try {
      if (name === "create_bin") {
        const binName = typeof args.name === "string" ? args.name : "Agent bin";
        const bin = await createBin(newId("bin"), binName);
        return rpcOk(id, { content: [{ type: "text", text: JSON.stringify({ ...bin, hook_path: `/api/hook/${bin.id}` }) }] });
      }
      if (name === "list_bins") {
        const bins = await listBins();
        return rpcOk(id, { content: [{ type: "text", text: JSON.stringify({ count: bins.length, bins }) }] });
      }
      if (name === "get_requests") {
        const binId = String(args.bin_id ?? "");
        const limit = typeof args.limit === "number" ? Math.min(50, Math.max(1, args.limit)) : 10;
        const bin = await getBin(binId);
        if (!bin) return rpcErr(id, -32000, "bin not found");
        const requests = await listRequests(binId, limit);
        return rpcOk(id, { content: [{ type: "text", text: JSON.stringify({ count: requests.length, requests }) }] });
      }
      if (name === "inspect_request") {
        const r = await getRequest(String(args.bin_id ?? ""), String(args.request_id ?? ""));
        if (!r) return rpcErr(id, -32000, "request not found");
        return rpcOk(id, { content: [{ type: "text", text: JSON.stringify(inspectRequest(r)) }] });
      }
      if (name === "clear_bin") {
        const binId = String(args.bin_id ?? "");
        const bin = await getBin(binId);
        if (!bin) return rpcErr(id, -32000, "bin not found");
        const cleared = await clearRequests(binId);
        return rpcOk(id, { content: [{ type: "text", text: JSON.stringify({ ok: true, cleared }) }] });
      }
      return rpcErr(id, -32601, `unknown tool: ${name}`);
    } catch (e) {
      return rpcErr(id, -32603, e instanceof Error ? e.message : "tool failed");
    }
  }
  return rpcErr(id, -32601, `unknown method: ${method}`);
}
