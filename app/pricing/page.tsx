import Link from "next/link";
import type { Metadata } from "next";
import Logo from "../components/Logo";

export const metadata: Metadata = {
  title: "Pricing | StageName Club",
  description: "Simple one-time pricing for your complete artist brand kit.",
};

export default function PricingPage() {
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
        {/* Header */}
        <div className="text-center mb-12">
          <p className="mb-4 text-sm font-serif uppercase tracking-[0.3em] text-coral">Simple pricing</p>
          <h1 className="text-4xl sm:text-5xl font-serif font-bold uppercase tracking-wider text-foreground">
            One price.{" "}
            <span className="font-script text-coral lowercase">one shot.</span>
          </h1>
          <p className="mt-4 text-lg font-serif text-foreground/50 max-w-2xl mx-auto">
            Get a complete brand naming experience with a single one-time payment.
          </p>
        </div>

        {/* Pricing Card */}
        <div className="max-w-2xl mx-auto">
          <div className="relative bg-white/60 border border-foreground/10 rounded-3xl p-8 sm:p-10 shadow-lg">
            <div className="flex items-baseline gap-3 mb-8">
              <span className="text-5xl font-serif font-bold holographic-text">$14.99</span>
              <span className="text-lg font-serif text-foreground/50">one-time</span>
            </div>

            <ul className="space-y-4 mb-8">
              {[
                "3 AI-generated stage names with reasoning",
                "Studio portrait & logo visuals",
                "Platform availability report",
                "Instant delivery to your email",
              ].map((feature) => (
                <li key={feature} className="flex gap-3 text-sm font-serif text-foreground/70">
                  <span className="text-coral font-bold">✓</span>
                  {feature}
                </li>
              ))}
            </ul>

            <Link
              href="/"
              className="holographic holographic-shadow rounded-full px-6 py-3 text-white font-serif uppercase tracking-wider text-sm font-bold hover:scale-105 transition-all duration-300 inline-block text-center w-full"
            >
              Buy now
            </Link>
          </div>

          {/* Why section */}
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {[
              { title: "Fast & focused", desc: "No subscriptions, no upsells. One clear package." },
              { title: "Built for launch", desc: "Everything you need to start your artist identity." },
              { title: "Secure checkout", desc: "Payments processed safely through Stripe." },
            ].map((item) => (
              <div key={item.title} className="bg-white/60 border border-foreground/10 rounded-3xl p-6 text-center">
                <h3 className="text-sm font-serif uppercase tracking-[0.3em] text-foreground/70 mb-2">{item.title}</h3>
                <p className="text-sm font-serif text-foreground/50">{item.desc}</p>
              </div>
            ))}
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
