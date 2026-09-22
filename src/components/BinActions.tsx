"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eraser } from "lucide-react";
import DeleteBinButton from "./DeleteBinButton";

export default function BinActions({ id, onCleared }: { id: string; onCleared: () => void }) {
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function clear() {
    if (!confirm("Delete all captured requests in this bin?")) return;
    setBusy(true);
    await fetch(`/api/bins/${id}/requests`, { method: "DELETE" });
    setBusy(false);
    onCleared();
    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <a
        href={`/api/bins/${id}/export`}
        className="inline-flex items-center gap-1.5 rounded border border-lime-500/30 bg-lime-400/10 px-2.5 py-1 text-xs text-lime-200 hover:bg-lime-400/20"
      >
        ↓ export json
      </a>
      <button
        onClick={clear}
        disabled={busy}
        className="inline-flex items-center gap-1.5 rounded border border-amber-400/40 bg-amber-400/10 px-2.5 py-1 text-xs text-amber-300 hover:bg-amber-400/20 disabled:opacity-50"
      >
        <Eraser size={12} /> {busy ? "…" : "clear captures"}
      </button>
      <DeleteBinButton id={id} redirect />
    </div>
  );
}
