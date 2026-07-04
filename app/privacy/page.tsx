import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | StageName Club",
  description: "Review the privacy practices for StageName Club.",
};

export default function PrivacyPolicyPage() {
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
          <h1 className="text-3xl font-bold text-white sm:text-4xl">Privacy Policy</h1>
          <p className="mt-4 text-lg text-gray-300">
            We respect your privacy and are committed to protecting the information you share with us.
          </p>

          <div className="mt-10 space-y-8 text-sm leading-7 text-gray-300">
            <section>
              <h2 className="mb-3 text-xl font-semibold text-white">What we collect</h2>
              <p>
                When you use StageName Club, we may collect the files you upload, the text you provide about your artistic identity, and basic account or payment information needed to process your order.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-white">How we use it</h2>
              <p>
                We use your information to generate brand naming recommendations, deliver your purchased experience, and improve our services. We do not sell your personal information to third parties.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-white">Data storage</h2>
              <p>
                Uploaded content and submitted prompts may be stored securely to provide the service and support troubleshooting. You may request deletion of your data by contacting us.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold text-white">Contact</h2>
              <p>
                If you have questions about this privacy policy, please contact us at hello@stagenameclub.com.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
