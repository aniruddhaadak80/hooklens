import Link from "next/link";
import { listBins } from "@/lib/db";
import CreateBin from "@/components/CreateBin";
import DeleteBinButton from "@/components/DeleteBinButton";

export const dynamic = "force-dynamic";

export default async function BinsPage() {
  let bins: Awaited<ReturnType<typeof listBins>> = [];
  let dbError = "";
  try {
    bins = await listBins();
  } catch (e) {
    dbError = e instanceof Error ? e.message : "db unavailable";
  }

  return (
    <main className="mx-auto max-w-6xl px-5 py-10">
      <h1 className="text-2xl font-black text-lime-200"><span className="prompt-dollar">~/</span>bins <span className="text-sm font-normal text-lime-100/50">({bins.length})</span></h1>
      <div className="mt-4 max-w-xl"><CreateBin compact /></div>
      {dbError && <div className="term mt-4 rounded p-3 text-sm text-red-400">$ db error: {dbError} — check DATABASE_URL.</div>}
      <div className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {bins.map((b) => (
          <div key={b.id} className="term rounded p-4">
            <div className="flex items-center justify-between gap-2">
              <Link href={`/bins/${b.id}`} className="truncate font-bold text-lime-200 hover:text-lime-300">{b.name}</Link>
              <DeleteBinButton id={b.id} />
            </div>
            <div className="mt-1 font-mono text-xs text-lime-100/50">{b.id}</div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-lime-100/60">{b.request_count} captures</span>
              <Link href={`/bins/${b.id}`} className="text-lime-300 underline underline-offset-4">open →</Link>
            </div>
          </div>
        ))}
      </div>
      {bins.length === 0 && !dbError && (
        <div className="term mt-6 rounded p-6 text-sm text-lime-100/50">$ no bins yet — create one above, or fire the demo from the homepage.</div>
      )}
    </main>
  );
}
