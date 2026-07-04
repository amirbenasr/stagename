import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund Policy | StageName Club",
  description: "Read our refund policy for StageName Club.",
};

export default function RefundPolicyPage() {
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
          <h1 className="text-3xl font-bold text-white sm:text-4xl">Refund Policy</h1>
          <p className="mt-4 text-lg text-gray-300">
            All purchases are final and non-refundable once payment has been completed.
          </p>

          <div className="mt-10 space-y-8 text-sm leading-7 text-gray-300">
            <section>
              <h2 className="mb-3 text-xl font-semibold text-white">Payment confirmation</h2>
              <p>
                By completing checkout, you acknowledge that the service is delivered digitally and that the purchase cannot be reversed after payment is confirmed.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-white">Exceptional cases</h2>
              <p>
                If we are unable to provide the purchased service due to a technical issue on our side, we may review your request on a case-by-case basis.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-white">Contact</h2>
              <p>
                If you believe there is an issue with your order, please contact hello@stagenameclub.com within 7 days of purchase.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
