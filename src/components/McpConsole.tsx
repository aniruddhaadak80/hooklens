"use client";

import { useState } from "react";
import { Bot, Play } from "lucide-react";

export default function McpConsole({ base }: { base: string }) {
  const [out, setOut] = useState("Click a preset — every call below hits the live database.");
  const [busy, setBusy] = useState(false);

  async function run(path: string, body: unknown) {
    setBusy(true);
    try {
      const res = await fetch(path, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
      const json = await res.json();
      setOut(JSON.stringify(json, null, 2).slice(0, 4000));
    } catch (e) {
      setOut(`error: ${e instanceof Error ? e.message : "fetch failed"}`);
    } finally {
      setBusy(false);
    }
  }

  const presets = [
    { label: "tools/list", body: { jsonrpc: "2.0", id: 1, method: "tools/list" } },
    { label: "create_bin", body: { jsonrpc: "2.0", id: 2, method: "tools/call", params: { name: "create_bin", arguments: { name: "console-test" } } } },
    { label: "list_bins", body: { jsonrpc: "2.0", id: 3, method: "tools/call", params: { name: "list_bins", arguments: {} } } },
  ];

  return (
    <div className="term rounded p-4">
      <div className="mb-2 text-sm font-bold text-lime-300">$ mcp console → {base}/api/mcp</div>
      <div className="mb-3 flex flex-wrap gap-2">
        {presets.map((p) => (
          <button
            key={p.label}
            disabled={busy}
            onClick={() => run("/api/mcp", p.body)}
            className="inline-flex items-center gap-1.5 rounded border border-lime-500/30 bg-lime-400/10 px-3 py-1.5 text-xs font-bold text-lime-200 hover:bg-lime-400/20 disabled:opacity-50"
          >
            <Play size={12} /> {p.label}
          </button>
        ))}
      </div>
      <pre className="max-h-80 overflow-auto rounded bg-black/70 p-3 text-[11px] leading-relaxed text-lime-100"><Bot size={12} className="mr-1 inline" />{out}</pre>
    </div>
  );
}
