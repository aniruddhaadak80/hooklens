"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export default function DeleteBinButton({ id, redirect = false }: { id: string; redirect?: boolean }) {
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  async function del() {
    if (!confirm(`Delete bin ${id} and all its captures?`)) return;
    setBusy(true);
    await fetch(`/api/bins/${id}`, { method: "DELETE" });
    if (redirect) router.push("/bins");
    else router.refresh();
  }
  return (
    <button
      onClick={del}
      disabled={busy}
      className="inline-flex items-center gap-1.5 rounded border border-red-500/40 bg-red-500/10 px-2.5 py-1 text-xs text-red-300 hover:bg-red-500/20 disabled:opacity-50"
    >
      <Trash2 size={12} /> {busy ? "…" : "delete"}
    </button>
  );
}
