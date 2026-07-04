import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing | StageName Club",
  description: "Learn about the one-time pricing for StageName Club.",
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <main className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-16 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="mb-8 inline-flex w-fit items-center rounded-full border border-purple-500/30 bg-purple-900/20 px-4 py-2 text-sm text-purple-200 transition hover:border-purple-400 hover:bg-purple-900/40"
        >
          ← Back to home
        </Link>

        <div className="mb-10 text-center">
          <p className="mb-4 text-sm uppercase tracking-[0.3em] text-emerald-300">Simple pricing</p>
          <h1 className="text-3xl font-bold text-white sm:text-4xl">One price. One shot. Full creative unlock.</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-300">
            Get a complete brand naming experience with a single one-time payment.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-purple-500/20 bg-gradient-to-br from-purple-900/30 to-slate-950/90 p-8 shadow-2xl shadow-purple-900/20">
            <div className="flex items-baseline gap-3">
              <span className="text-5xl font-bold text-emerald-400">$14.99</span>
              <span className="text-lg text-gray-400">one-time</span>
            </div>

            <ul className="mt-8 space-y-4 text-sm text-gray-300">
              <li className="flex gap-3"><span className="text-emerald-400">✓</span> 50+ personalized brand name ideas</li>
              <li className="flex gap-3"><span className="text-emerald-400">✓</span> Cultural and sonic identity analysis</li>
              <li className="flex gap-3"><span className="text-emerald-400">✓</span> Launch-ready naming guidance</li>
              <li className="flex gap-3"><span className="text-emerald-400">✓</span> Instant access after checkout</li>
            </ul>

            <a
              href="/"
              className="mt-8 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-emerald-500 px-6 py-3 font-semibold text-white transition hover:from-purple-600 hover:to-emerald-600"
            >
              Buy now
            </a>
          </div>

          <div className="rounded-3xl border border-emerald-500/20 bg-slate-950/90 p-8">
            <h2 className="text-2xl font-semibold text-white">Why artists choose it</h2>
            <div className="mt-6 space-y-5 text-sm text-gray-300">
              <div>
                <h3 className="font-semibold text-white">Fast and focused</h3>
                <p className="mt-1">No subscriptions, no upsells, just one clear package.</p>
              </div>
              <div>
                <h3 className="font-semibold text-white">Built for launch</h3>
                <p className="mt-1">The output is designed to support your artist identity from day one.</p>
              </div>
              <div>
                <h3 className="font-semibold text-white">Secure checkout</h3>
                <p className="mt-1">Payments are processed safely through Stripe.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
