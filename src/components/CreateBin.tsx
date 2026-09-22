"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateBin({ compact = false }: { compact?: boolean }) {
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      const res = await fetch("/api/bins", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: name || "Untitled bin" }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "failed");
      router.push(`/bins/${json.bin.id}`);
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : "failed");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className={`flex gap-2 ${compact ? "" : "max-w-xl"}`}>
      <span className="prompt-dollar self-center">$</span>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="mkbin --name my-stripe-hooks"
        className="flex-1 rounded border border-lime-500/30 bg-black/60 px-3 py-2 text-sm text-lime-100 placeholder:text-lime-100/30 focus:border-lime-400 focus:outline-none"
      />
      <button
        type="submit"
        disabled={busy}
        className="rounded bg-lime-400 px-4 py-2 text-sm font-bold text-black hover:bg-lime-300 disabled:opacity-50"
      >
        {busy ? "…" : "create"}
      </button>
      {err && <span className="self-center text-xs text-red-400">{err}</span>}
    </form>
  );
}
