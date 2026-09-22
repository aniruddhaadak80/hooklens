import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { getBin } from "@/lib/db";
import BinView from "@/components/BinView";

export const dynamic = "force-dynamic";

export default async function BinDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let bin: Awaited<ReturnType<typeof getBin>>;
  try {
    bin = await getBin(id);
  } catch {
    bin = null;
  }
  if (!bin) notFound();

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "https";
  const hookUrl = `${proto}://${host}/api/hook/${bin.id}`;

  return (
    <main className="mx-auto max-w-6xl px-5 py-10">
      <h1 className="text-2xl font-black text-lime-200">
        <span className="prompt-dollar">~/bins/</span>{bin.name} <span className="text-sm font-normal text-lime-100/50">{bin.id} · {bin.request_count} captures</span>
      </h1>
      <div className="mt-5"><BinView binId={bin.id} binName={bin.name} hookUrl={hookUrl} /></div>
    </main>
  );
}
