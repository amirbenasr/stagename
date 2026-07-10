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
      <nav className="border-b border-black/10 bg-beige/90 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/">
            <Logo className="h-10 w-auto" showTagline={false} />
          </Link>
          <div className="hidden sm:flex items-center gap-6 text-sm text-foreground/70 font-serif">
            <Link href="/#how" className="hover:text-foreground transition">How it Works</Link>
            <Link href="/pricing" className="hover:text-foreground transition">Pricing</Link>
            <span className="hover:text-foreground transition cursor-pointer">Blog</span>
            <span className="hover:text-foreground transition cursor-pointer">Log In</span>
          </div>
          <Link
            href="/quiz"
            className="border-2 border-foreground rounded-full px-5 py-1.5 text-sm font-serif uppercase tracking-wider hover:bg-foreground hover:text-beige transition-all duration-300"
          >
            Get My Name
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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex flex-wrap gap-4 text-sm font-serif text-foreground/50">
            <Link href="/pricing" className="hover:text-foreground transition">Pricing</Link>
            <Link href="/privacy" className="hover:text-foreground transition">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-foreground transition">Terms of Service</Link>
            <Link href="/refund" className="hover:text-foreground transition">Refund Policy</Link>
          </div>
          <Link
            href="/quiz"
            className="border-2 border-foreground rounded-full px-5 py-1.5 text-sm font-serif uppercase tracking-wider hover:bg-foreground hover:text-beige transition-all duration-300"
          >
            JOIN THE CLUB
          </Link>
        </div>
      </footer>
    </div>
  );
}