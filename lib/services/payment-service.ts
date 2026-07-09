import { stripe, STRIPE_PRICING, getSiteUrl } from "../stripe";
import { submissionRepository } from "../repositories/submission-repository";
import type { CheckoutRequest, CheckoutResponse } from "../types";

// ============================================================
// Payment Service — Stripe checkout + webhook processing
// ============================================================

export const paymentService = {
  async createCheckoutSession(request: CheckoutRequest): Promise<CheckoutResponse> {
    const { submissionId, email } = request;
    const siteUrl = getSiteUrl();

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: STRIPE_PRICING.currency,
            product_data: {
              name: STRIPE_PRICING.productName,
            },
            unit_amount: STRIPE_PRICING.unitAmount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      customer_email: email,
      metadata: { submissionId },
      success_url: `${siteUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: siteUrl,
    });

    return { url: session.url ?? undefined };
  },

  async processSuccessfulPayment(submissionId: string, sessionId: string): Promise<void> {
    await submissionRepository.update(submissionId, {
      status: "paid",
      stripeSessionId: sessionId,
    });

    console.log(`✓ Submission ${submissionId} marked as paid (session ${sessionId})`);
  },

  async triggerGenerationPipeline(submissionId: string): Promise<void> {
    // Dynamic import to avoid Turbopack build-time resolution issues with @google-cloud/tasks
    const { cloudTasksService } = await import("./cloud-tasks-service");
    await cloudTasksService.enqueueGenerationJob(submissionId);
    console.log(`✓ Generation job enqueued via Cloud Tasks for submission ${submissionId}`);
  },
};