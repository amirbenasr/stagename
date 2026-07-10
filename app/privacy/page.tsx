import type { Metadata } from "next";
import LegalPageLayout from "../components/LegalPageLayout";

export const metadata: Metadata = {
  title: "Privacy Policy | StageName Club",
  description: "Review the privacy practices for StageName Club.",
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPageLayout title="Privacy Policy" subtitle="We respect your privacy and are committed to protecting the information you share with us.">
      <section>
        <h2 className="mb-3 text-xl font-serif font-semibold uppercase tracking-wider text-coral">What we collect</h2>
        <p>
          When you use StageName Club, we may collect the files you upload, the text you provide about your artistic identity, and basic account or payment information needed to process your order.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-serif font-semibold uppercase tracking-wider text-coral">How we use it</h2>
        <p>
          We use your information to generate brand naming recommendations, deliver your purchased experience, and improve our services. We do not sell your personal information to third parties.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-serif font-semibold uppercase tracking-wider text-coral">Data storage</h2>
        <p>
          Uploaded content and submitted prompts may be stored securely to provide the service and support troubleshooting. You may request deletion of your data by contacting us.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-serif font-semibold uppercase tracking-wider text-coral">Contact</h2>
        <p>
          If you have questions about this privacy policy, please contact us at hello@stagenameclub.com.
        </p>
      </section>
    </LegalPageLayout>
  );
}