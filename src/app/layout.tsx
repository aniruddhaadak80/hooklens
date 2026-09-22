import type { Metadata } from "next";
import Link from "next/link";
import { Terminal } from "lucide-react";
import "./globals.css";

export const metadata: Metadata = {
  title: "HookLens — Catch, inspect & debug webhooks",
  description: "HookLens is a live webhook catcher: create a bin, POST webhooks to it, inspect headers and payloads, export captures, and drive it all from AI agents via MCP.",
  keywords: ["webhooks", "webhook debugger", "request bin", "MCP", "AI agents", "API testing", "next.js", "neon postgres"],
  authors: [{ name: "aniruddhaadak80" }],
  openGraph: {
    title: "HookLens — Catch, inspect & debug webhooks",
    description: "Create a bin. POST a webhook. Inspect everything. Export, share, automate via MCP.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "HookLens — Catch, inspect & debug webhooks",
    description: "Create a bin. POST a webhook. Inspect everything. Export, share, automate via MCP.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-[#060906] font-mono text-lime-100 flex flex-col">
        <div className="scanlines" aria-hidden />
        <header className="border-b border-lime-500/20">
          <nav className="mx-auto flex max-w-6xl items-center gap-6 px-5 py-3 text-sm">
            <Link href="/" className="flex items-center gap-2 font-bold text-lime-300">
              <Terminal size={17} /> hooklens<span className="cursor-blink">_</span>
            </Link>
            <Link href="/bins" className="text-lime-100/70 hover:text-lime-300">~/bins</Link>
            <Link href="/docs" className="text-lime-100/70 hover:text-lime-300">~/docs</Link>
            <a href="https://github.com/aniruddhaadak80/hooklens" target="_blank" rel="noreferrer" className="ml-auto text-lime-100/50 hover:text-lime-300">github ↗</a>
          </nav>
        </header>
        <div className="flex-1">{children}</div>
        <footer className="border-t border-lime-500/20 py-4 text-center text-xs text-lime-100/40">
          hooklens · neon postgres · sealed captures · MIT · not a store for secrets — never POST real credentials
        </footer>
      </body>
    </html>
  );
}
