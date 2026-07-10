import Link from "next/link";
import type { ReactNode } from "react";
import Logo from "./Logo";

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
    <div className="min-h-screen bg-beige text-foreground">
      {/* Navbar */}
      <nav className="border-b border-foreground/10 bg-beige/90 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Logo className="w-8 h-8" />
            <span className="font-serif text-sm uppercase tracking-wider text-foreground/70">StageName Club</span>
          </Link>
          <Link
            href="/"
            className="font-serif text-sm uppercase tracking-wider text-foreground/70 hover:text-coral transition-colors"
          >
            ← Back
          </Link>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-12 sm:py-16">
        <div className="bg-white/60 border border-foreground/10 rounded-3xl p-8 sm:p-10 shadow-sm">
          <p className="mb-4 text-sm font-serif uppercase tracking-[0.3em] text-coral">{label}</p>
          <h1 className="text-3xl font-serif font-bold uppercase tracking-wider text-foreground sm:text-4xl">{title}</h1>
          {subtitle && (
            <p className="mt-4 text-lg font-serif text-foreground/50">{subtitle}</p>
          )}

          <div className="mt-10 space-y-8 text-sm font-serif leading-7 text-foreground/70">
            {children}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto px-6 py-8 border-t border-foreground/10">
        <p className="text-xs font-serif text-foreground/40 text-center">
          © 2026 StageName Club. All rights reserved.
        </p>
      </footer>
    </div>
  );
}