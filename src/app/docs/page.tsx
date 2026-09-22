import McpConsole from "@/components/McpConsole";

export const dynamic = "force-static";

const BASE = "https://hooklens-brown.vercel.app";

export default function DocsPage() {
  return (
    <main className="mx-auto max-w-4xl px-5 py-10 text-sm leading-relaxed">
      <h1 className="text-2xl font-black text-lime-200"><span className="prompt-dollar">~/</span>docs</h1>

      <h2 className="mb-2 mt-8 font-bold text-lime-300">## REST</h2>
      <div className="term space-y-3 rounded p-4 text-[13px]">
        <div><span className="prompt-dollar">$ </span><span className="text-lime-100/60"># create a bin</span><br />{`curl -X POST ${BASE}/api/bins -H 'content-type: application/json' -d '{"name":"stripe"}'`}</div>
        <div><span className="prompt-dollar">$ </span><span className="text-lime-100/60"># catch a webhook (any method works)</span><br />{`curl -X POST ${BASE}/api/hook/bin_abc123 -d '{"type":"order.paid"}'`}</div>
        <div><span className="prompt-dollar">$ </span><span className="text-lime-100/60"># read captures / inspect one / export</span><br />{`curl ${BASE}/api/bins/bin_abc123/requests?limit=10`}<br />{`curl ${BASE}/api/bins/bin_abc123/requests/req_xyz`}<br />{`curl -O ${BASE}/api/bins/bin_abc123/export`}</div>
        <div><span className="prompt-dollar">$ </span><span className="text-lime-100/60"># rename / clear / delete</span><br />{`curl -X PATCH ${BASE}/api/bins/bin_abc123 -d '{"name":"prod"}'`}<br />{`curl -X DELETE ${BASE}/api/bins/bin_abc123/requests`}<br />{`curl -X DELETE ${BASE}/api/bins/bin_abc123`}</div>
      </div>

      <h2 className="mb-2 mt-8 font-bold text-lime-300">## MCP (agents)</h2>
      <p className="mb-3 text-lime-100/70">Point any MCP client at <code className="text-amber-200">{BASE}/api/mcp</code> (JSON-RPC 2.0: <code>initialize</code> / <code>tools/list</code> / <code>tools/call</code>). Full manifest: <code>/mcp.json</code>.</p>
      <div className="term mb-4 rounded p-4 text-[13px]">
        <span className="prompt-dollar">$ </span>tools: <span className="text-lime-300">create_bin</span> · <span className="text-lime-300">list_bins</span> · <span className="text-lime-300">get_requests</span> · <span className="text-lime-300">inspect_request</span> · <span className="text-lime-300">clear_bin</span>
      </div>
      <McpConsole base={BASE} />
      <div className="term mt-4 rounded p-4 text-[13px]">
        <span className="prompt-dollar">$ </span><span className="text-lime-100/60"># mcp.json for your agent config</span>
        <pre className="mt-2 overflow-auto text-lime-100/80">{`{
  "mcpServers": {
    "hooklens": { "url": "${BASE}/api/mcp", "transport": "json-rpc" }
  }
}`}</pre>
      </div>

      <h2 className="mb-2 mt-8 font-bold text-lime-300">## integrity</h2>
      <p className="text-lime-100/70">Every capture is sealed at arrival: <code className="text-amber-200">SHA-384(prevSeal ‖ canonicalJson)</code> chained per bin. The inspector replays the chain and shows <b>seal ok</b> or <b>seal BROKEN</b> — export the JSON and anyone can re-verify offline.</p>

      <h2 className="mb-2 mt-8 font-bold text-lime-300">## limits</h2>
      <p className="text-lime-100/70">Bodies capped at 256 KB, 50 headers stored, latest 100 captures per bin readable. This is a debugging tool — never POST real secrets, cards, or PII through it.</p>
    </main>
  );
}
