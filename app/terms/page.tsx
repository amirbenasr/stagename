import type { Metadata } from "next";
import LegalPageLayout from "../components/LegalPageLayout";

export const metadata: Metadata = {
  title: "Terms of Service | StageName Club",
  description: "Read the terms of service for StageName Club.",
};

export default function TermsOfServicePage() {
  return (
    <LegalPageLayout title="Terms of Service" subtitle="These terms govern your use of StageName Club and the services we provide.">
      <section>
        <h2 className="mb-3 text-xl font-serif font-semibold uppercase tracking-wider text-coral">Service description</h2>
        <p>
          StageName Club provides AI-assisted brand naming and identity support for artists and creators. Deliverables depend on the information provided and may be revised in line with the selected package.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-serif font-semibold uppercase tracking-wider text-coral">Your responsibilities</h2>
        <p>
          You agree to provide accurate information, respect copyright and third-party rights, and use the generated content responsibly.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-serif font-semibold uppercase tracking-wider text-coral">Limitation of liability</h2>
        <p>
          Our liability is limited to the fees paid for the service, and we are not responsible for indirect or consequential losses.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-serif font-semibold uppercase tracking-wider text-coral">Contact</h2>
        <p>
          Questions about these terms can be sent to hello@stagenameclub.com.
        </p>
      </section>
    </LegalPageLayout>
  );
}