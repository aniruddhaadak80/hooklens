"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export default function CopyButton({ text, label = "copy" }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setDone(true);
    setTimeout(() => queueMicrotask(() => setDone(false)), 1500);
  }
  return (
    <button
      onClick={copy}
      className="inline-flex items-center gap-1.5 rounded border border-lime-500/30 bg-lime-400/10 px-2.5 py-1 text-xs text-lime-200 hover:bg-lime-400/20"
    >
      {done ? <Check size={12} /> : <Copy size={12} />} {done ? "copied" : label}
    </button>
  );
}
