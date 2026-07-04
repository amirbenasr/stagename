import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | StageName Club",
  description: "Read the terms of service for StageName Club.",
};

export default function TermsOfServicePage() {
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
          <p className="mb-4 text-sm uppercase tracking-[0.3em] text-emerald-300">Legal</p>
          <h1 className="text-3xl font-bold text-white sm:text-4xl">Terms of Service</h1>
          <p className="mt-4 text-lg text-gray-300">
            These terms govern your use of StageName Club and the services we provide.
          </p>

          <div className="mt-10 space-y-8 text-sm leading-7 text-gray-300">
            <section>
              <h2 className="mb-3 text-xl font-semibold text-white">Service description</h2>
              <p>
                StageName Club provides AI-assisted brand naming and identity support for artists and creators. Deliverables depend on the information provided and may be revised in line with the selected package.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-white">Your responsibilities</h2>
              <p>
                You agree to provide accurate information, respect copyright and third-party rights, and use the generated content responsibly.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-white">Limitation of liability</h2>
              <p>
                Our liability is limited to the fees paid for the service, and we are not responsible for indirect or consequential losses.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-white">Contact</h2>
              <p>
                Questions about these terms can be sent to hello@stagenameclub.com.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
