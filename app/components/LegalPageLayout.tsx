import Link from "next/link";
import type { ReactNode } from "react";

interface LegalPageLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  label?: string;
}

export default function LegalPageLayout({
  title,
  subtitle,
  children,
  label = "Legal",
}: LegalPageLayoutProps) {
  return (
    <div className="min-h-screen bg-black text-white">
      <main className="mx-auto flex min-h-screen max-w-4xl flex-col px-4 py-16 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="mb-8 inline-flex w-fit items-center rounded-full border border-purple-500/30 bg-purple-900/20 px-4 py-2 text-sm text-purple-200 transition hover:border-purple-400 hover:bg-purple-900/40"
        >
          ← Back to home
        </Link>

        <div className="rounded-3xl border border-purple-500/20 bg-slate-950/90 p-8 shadow-2xl shadow-purple-900/20 sm:p-10">
          <p className="mb-4 text-sm uppercase tracking-[0.3em] text-emerald-300">{label}</p>
          <h1 className="text-3xl font-bold text-white sm:text-4xl">{title}</h1>
          {subtitle && (
            <p className="mt-4 text-lg text-gray-300">{subtitle}</p>
          )}

          <div className="mt-10 space-y-8 text-sm leading-7 text-gray-300">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}