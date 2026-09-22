"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AlertTriangle, Info, ShieldCheck, ShieldAlert } from "lucide-react";
import CopyButton from "./CopyButton";
import type { CapturedRequest, Inspection } from "@/lib/types";

interface Detail { request: CapturedRequest; inspection: Inspection }

function replayCurl(r: CapturedRequest, hookUrl: string): string {
  const esc = (s: string) => s.replace(/'/g, `'\\''`);
  const lines = [`curl -X ${r.method} '${hookUrl}'`];
  for (const [k, v] of Object.entries(r.headers ?? {})) {
    const lk = k.toLowerCase();
    if (["host", "content-length", "connection"].includes(lk)) continue;
    lines.push(`  -H '${esc(k)}: ${esc(v)}'`);
  }
  if (r.body) lines.push(`  -d '${esc(r.body.slice(0, 4000))}'`);
  return lines.join(" \\\n");
}

export default function RequestStream({ binId, hookUrl, refreshKey = 0 }: { binId: string; hookUrl: string; refreshKey?: number }) {
  const [items, setItems] = useState<CapturedRequest[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [detail, setDetail] = useState<Detail | null>(null);
  const [live, setLive] = useState(true);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/bins/${binId}/requests?limit=25`);
      if (!res.ok) return;
      const json = await res.json();
      const rows = (json.requests ?? []) as CapturedRequest[];
      // Deferred off the effect path so polling never cascades renders.
      queueMicrotask(() => setItems(rows));
    } catch { /* offline moment — keep old rows */ }
  }, [binId]);

  useEffect(() => {
    load();
    if (timer.current) clearInterval(timer.current);
    if (live) timer.current = setInterval(() => { if (!document.hidden) load(); }, 4000);
    return () => { if (timer.current) clearInterval(timer.current); };
  }, [live, load, refreshKey]);

  function select(reqId: string) {
    setSelected(reqId);
    setDetail(null);
    fetch(`/api/bins/${binId}/requests/${reqId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => setDetail(j))
      .catch(() => setDetail(null));
  }

  const methodColor = (m: string) =>
    m === "GET" ? "text-sky-300 border-sky-500/40 bg-sky-500/10"
    : m === "DELETE" ? "text-red-300 border-red-500/40 bg-red-500/10"
    : "text-lime-300 border-lime-500/40 bg-lime-500/10";

  return (
    <div className="grid gap-4 lg:grid-cols-5">
      <div className="lg:col-span-2">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="text-lime-100/60">{items.length} captured</span>
          <button onClick={() => setLive((v) => !v)} className={`rounded border px-2 py-0.5 ${live ? "border-lime-500/40 text-lime-300" : "border-lime-100/20 text-lime-100/50"}`}>
            {live ? "● live" : "○ paused"}
          </button>
        </div>
        <div className="term max-h-[560px] space-y-1 overflow-auto rounded p-2">
          {items.length === 0 && <div className="p-4 text-sm text-lime-100/40">$ waiting for webhooks…<br />$ POST something to the endpoint above.</div>}
          {items.map((r) => (
            <button
              key={r.id}
              onClick={() => select(r.id)}
              className={`stream-row flex w-full items-center gap-2 rounded border px-2 py-1.5 text-left font-mono text-xs ${selected === r.id ? "border-lime-400/70 bg-lime-400/10" : "border-transparent hover:border-lime-500/30 hover:bg-lime-400/5"}`}
            >
              <span className={`rounded border px-1.5 py-0.5 font-bold ${methodColor(r.method)}`}>{r.method}</span>
              <span className="truncate text-lime-100/80">{r.id}</span>
              <span className="ml-auto shrink-0 text-lime-100/40">{(r.size / 1024).toFixed(1)}k</span>
            </button>
          ))}
        </div>
      </div>
      <div className="lg:col-span-3">
        {!detail && <div className="term rounded p-6 text-sm text-lime-100/40">$ select a request to inspect headers, body &amp; seal.</div>}
        {detail && (
          <div className="term space-y-4 rounded p-4 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded border px-2 py-0.5 font-bold ${methodColor(detail.request.method)}`}>{detail.request.method}</span>
              <span className="text-lime-100/60">{new Date(detail.request.received_at).toLocaleString()}</span>
              <span className="ml-auto flex items-center gap-1 text-xs">
                {detail.inspection.sealValid
                  ? <span className="flex items-center gap-1 text-lime-300"><ShieldCheck size={13} /> seal ok</span>
                  : <span className="flex items-center gap-1 text-red-400"><ShieldAlert size={13} /> seal BROKEN</span>}
              </span>
            </div>
            <div>
              <div className="mb-1 text-xs text-lime-100/50"># replay</div>
              <div className="flex items-start gap-2">
                <pre className="flex-1 overflow-auto rounded bg-black/60 p-2 text-xs text-amber-200">{replayCurl(detail.request, hookUrl)}</pre>
                <CopyButton text={replayCurl(detail.request, hookUrl)} label="copy curl" />
              </div>
            </div>
            <div>
              <div className="mb-1 text-xs text-lime-100/50"># findings ({detail.inspection.bodyKind} · {detail.inspection.sizeBytes} bytes)</div>
              <ul className="space-y-1">
                {detail.inspection.findings.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs">
                    {f.kind === "warn" ? <AlertTriangle size={13} className="mt-0.5 shrink-0 text-amber-300" /> : <Info size={13} className="mt-0.5 shrink-0 text-lime-400" />}
                    <span><b className={f.kind === "warn" ? "text-amber-300" : "text-lime-300"}>{f.name}:</b> <span className="text-lime-100/70">{f.detail}</span></span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="mb-1 flex items-center gap-2 text-xs text-lime-100/50"># headers <CopyButton text={JSON.stringify(detail.request.headers, null, 2)} /></div>
              <pre className="max-h-40 overflow-auto rounded bg-black/60 p-2 text-xs text-lime-100/80">{JSON.stringify(detail.request.headers, null, 2)}</pre>
            </div>
            <div>
              <div className="mb-1 flex items-center gap-2 text-xs text-lime-100/50"># body <CopyButton text={detail.request.body} /></div>
              <pre className="max-h-64 overflow-auto rounded bg-black/60 p-2 text-xs whitespace-pre-wrap text-lime-100/80">{detail.request.body || "(empty)"}</pre>
            </div>
            <div className="break-all font-mono text-[11px] text-lime-100/40">
              seal {detail.request.seal.slice(0, 48)}… · prev {detail.request.prev_seal.slice(0, 24)}…
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
