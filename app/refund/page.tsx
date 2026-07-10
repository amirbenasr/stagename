import type { Metadata } from "next";
import LegalPageLayout from "../components/LegalPageLayout";

export const metadata: Metadata = {
  title: "Refund Policy | StageName Club",
  description: "Read our refund policy for StageName Club.",
};

export default function RefundPolicyPage() {
  return (
    <LegalPageLayout title="Refund Policy" subtitle="All purchases are final and non-refundable once payment has been completed.">
      <section>
        <h2 className="mb-3 text-xl font-serif font-semibold uppercase tracking-wider text-coral">Payment confirmation</h2>
        <p>
          By completing checkout, you acknowledge that the service is delivered digitally and that the purchase cannot be reversed after payment is confirmed.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-serif font-semibold uppercase tracking-wider text-coral">Exceptional cases</h2>
        <p>
          If we are unable to provide the purchased service due to a technical issue on our side, we may review your request on a case-by-case basis.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-serif font-semibold uppercase tracking-wider text-coral">Contact</h2>
        <p>
          If you believe there is an issue with your order, please contact hello@stagenameclub.com within 7 days of purchase.
        </p>
      </section>
    </LegalPageLayout>
  );
}