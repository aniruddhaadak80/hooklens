import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-20 text-center">
      <div className="term rounded p-8">
        <div className="text-4xl font-black text-amber-300">404</div>
        <p className="mt-2 text-sm text-lime-100/60">$ bin not found — it was deleted or never existed.</p>
        <Link href="/bins" className="mt-4 inline-block text-lime-300 underline underline-offset-4">cd ~/bins →</Link>
      </div>
    </main>
  );
}
