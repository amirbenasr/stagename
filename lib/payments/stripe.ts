import Stripe from "stripe";
import type { PaymentProvider, WebhookResult, SessionLookupResult } from "./types";
import type { CheckoutRequest, CheckoutResponse } from "../types";
import { submissionRepository } from "../repositories/submission-repository";

const STRIPE_API_VERSION = "2026-06-24.dahlia";

function getStripeClient(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  return new Stripe(key, { apiVersion: STRIPE_API_VERSION });
}

function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}

const PRICING = {
  currency: "usd" as const,
  productName: "stagename.club — Artist Debut Kit",
  unitAmount: 1499,
} as const;

export const stripeProvider: PaymentProvider = {
  name: "stripe",

  async createCheckoutSession(request: CheckoutRequest): Promise<CheckoutResponse> {
    const { submissionId, email } = request;
    const stripe = getStripeClient();
    const siteUrl = getSiteUrl();

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: PRICING.currency,
            product_data: { name: PRICING.productName },
            unit_amount: PRICING.unitAmount,
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

  async handleWebhook(rawBody: string, signature: string | null): Promise<WebhookResult | null> {
    if (!signature) throw new Error("Missing Stripe signature");

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) throw new Error("STRIPE_WEBHOOK_SECRET is not set");

    const stripe = getStripeClient();
    const event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);

    if (event.type !== "checkout.session.completed") return null;

    const session = event.data.object as Stripe.Checkout.Session;
    const submissionId = session.metadata?.submissionId;
    if (!submissionId) throw new Error("No submissionId in Stripe session metadata");

    return { submissionId, sessionId: session.id };
  },

  async lookupSession(sessionId: string): Promise<SessionLookupResult | null> {
    const result = await submissionRepository.findByPaymentSessionId(sessionId);
    if (!result) return null;

    return {
      id: result.id,
      submissionId: result.id,
      status: result.data.status,
      brandKitSlug: result.data.brandKitSlug,
    };
  },
};
