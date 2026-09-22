"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Zap } from "lucide-react";

const SAMPLES: { path: string; init: RequestInit }[] = [
  {
    path: "",
    init: {
      method: "POST",
      headers: { "content-type": "application/json", "stripe-signature": "t=1726900000,v1=demo_signature_abc123", "user-agent": "Stripe/1.0 (+https://stripe.com)" },
      body: JSON.stringify({ id: "evt_demo_123", type: "checkout.session.completed", amount_total: 4999, currency: "usd", customer: "cus_demo_42" }),
    },
  },
  {
    path: "",
    init: {
      method: "POST",
      headers: { "content-type": "application/json", "x-github-event": "push", "user-agent": "GitHub-Hookshot/demo" },
      body: JSON.stringify({ ref: "refs/heads/main", repository: { full_name: "demo/repo" }, commits: [{ id: "abc1234", message: "fix: webhook timeout" }] }),
    },
  },
  {
    path: "",
    init: {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded", "user-agent": "TwilioProxy/1.1" },
      body: "From=%2B15551234567&Body=CONFIRM&Status=received",
    },
  },
];

/** One-click demo: creates a real bin and fires 3 realistic webhooks at it. */
export default function DemoFire() {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const router = useRouter();

  async function fire() {
    setBusy(true);
    setErr("");
    try {
      const res = await fetch("/api/bins", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: "demo-incoming" }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "bin failed");
      const binId = json.bin.id as string;
      await Promise.all(
        SAMPLES.map((s) => fetch(`/api/hook/${binId}${s.path}`, s.init).then((r) => {
          if (!r.ok) throw new Error("hook failed");
        })),
      );
      router.push(`/bins/${binId}`);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "failed");
      setBusy(false);
    }
  }

  return (
    <span className="inline-flex items-center gap-2">
      <button
        onClick={fire}
        disabled={busy}
        className="inline-flex items-center gap-2 rounded border border-amber-400/50 bg-amber-400/10 px-4 py-2 text-sm font-bold text-amber-300 hover:bg-amber-400/20 disabled:opacity-50"
      >
        <Zap size={14} /> {busy ? "firing…" : "fire demo webhooks"}
      </button>
      {err && <span className="text-xs text-red-400">{err}</span>}
    </span>
  );
}
