import Link from "next/link";
import { countRequests } from "@/lib/db";
import { listBins } from "@/lib/db";
import CreateBin from "@/components/CreateBin";
import DemoFire from "@/components/DemoFire";

export const dynamic = "force-dynamic";

export default async function Home() {
  let bins = 0;
  let captures = 0;
  try {
    const [b, c] = await Promise.all([listBins(), countRequests()]);
    bins = b.length;
    captures = c;
  } catch { /* first boot without DB — page still renders */ }

  return (
    <main className="mx-auto max-w-6xl px-5 py-12">
      <div className="grid items-start gap-8 lg:grid-cols-2">
        <div>
          <div className="mb-3 inline-block rounded border border-lime-500/30 bg-lime-400/10 px-3 py-1 text-xs text-lime-300">
            ● live webhook catcher · neon postgres · no signup
          </div>
          <h1 className="glow text-4xl font-black leading-tight text-lime-200 md:text-6xl">
            Point webhooks here.<br />Read everything.
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-lime-100/70">
            HookLens gives you a URL that catches any HTTP request — Stripe events, GitHub pushes,
            Twilio callbacks — then shows you headers, payload, and a seal proving nobody tampered with it.
            Export it, replay it, or let your AI agent read it via MCP.
          </p>
          <div className="mt-6">
            <div className="mb-2 text-xs text-lime-100/50">$ create a bin — get a URL in 1 second</div>
            <CreateBin />
            <div className="mt-3 flex items-center gap-3 text-xs text-lime-100/50">
              <span>or</span> <DemoFire />
            </div>
          </div>
          <div className="mt-8 grid max-w-lg grid-cols-3 gap-3 text-center">
            {[
              { k: "bins", v: String(bins) },
              { k: "captured", v: String(captures) },
              { k: "signup", v: "none" },
            ].map((s) => (
              <div key={s.k} className="term rounded p-3">
                <div className="text-2xl font-black text-lime-300">{s.v}</div>
                <div className="text-xs text-lime-100/50">{s.k}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="term rounded-lg p-0 text-sm">
          <div className="flex items-center gap-1.5 border-b border-lime-500/20 px-4 py-2">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-lime-400/70" />
            <span className="ml-2 text-xs text-lime-100/40">you — zsh</span>
          </div>
          <pre className="overflow-auto p-4 text-[13px] leading-relaxed">{`$ curl -X POST https://hooklens.vercel.app/api/hook/bin_k7q2m9xd \\
  -H 'content-type: application/json' -d '{"type":"order.paid"}'
{"ok":true,"id":"req_x91m2aaq","seal":"f4d2…"}

$ # open the bin → headers, body, findings, replay curl, export json
$ # agents: POST /api/mcp tools/call get_requests`}<span className="cursor-blink">▊</span>
          </pre>
        </div>
      </div>

      <div className="mt-14 grid gap-4 md:grid-cols-3">
        {[
          { t: "01 · catch", d: "One URL per bin. Any method, any headers, bodies to 256 KB. Every capture is hash-sealed on arrival." },
          { t: "02 · inspect", d: "Auto-detects JSON, forms, XML. Flags missing signatures, giant payloads, malformed bodies. One-click replay curl." },
          { t: "03 · automate", d: "Full REST + MCP tools (create_bin, get_requests, inspect_request). Your coding agent debugs webhooks itself." },
        ].map((f) => (
          <div key={f.t} className="term rounded p-5">
            <div className="font-bold text-lime-300">{f.t}</div>
            <p className="mt-2 text-sm leading-relaxed text-lime-100/70">{f.d}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 text-center text-sm text-lime-100/60">
        <Link href="/bins" className="mr-6 text-lime-300 underline underline-offset-4">browse bins →</Link>
        <Link href="/docs" className="text-lime-300 underline underline-offset-4">read the docs →</Link>
      </div>
    </main>
  );
}
