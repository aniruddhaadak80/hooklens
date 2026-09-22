"use client";

import { useState } from "react";
import BinActions from "./BinActions";
import CopyButton from "./CopyButton";
import RequestStream from "./RequestStream";

export default function BinView({ binId, binName, hookUrl }: { binId: string; binName: string; hookUrl: string }) {
  const [refreshKey, setRefreshKey] = useState(0);
  const curl = `curl -X POST '${hookUrl}' -H 'content-type: application/json' -d '{"hello":"webhook"}'`;

  return (
    <div className="space-y-5">
      <div className="term rounded p-4">
        <div className="mb-1 text-xs text-lime-100/50"># endpoint — POST anything here ({binName})</div>
        <div className="flex flex-wrap items-center gap-2">
          <code className="flex-1 break-all rounded bg-black/60 px-3 py-2 text-sm text-lime-300">{hookUrl}</code>
          <CopyButton text={hookUrl} label="copy url" />
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <code className="flex-1 overflow-x-auto whitespace-nowrap rounded bg-black/60 px-3 py-2 text-xs text-amber-200">{curl}</code>
          <CopyButton text={curl} label="copy curl" />
        </div>
      </div>
      <BinActions id={binId} onCleared={() => setRefreshKey((k) => k + 1)} />
      <RequestStream key={refreshKey} binId={binId} hookUrl={hookUrl} refreshKey={refreshKey} />
    </div>
  );
}
