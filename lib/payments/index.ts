import type { PaymentProvider } from "./types";
import { stripeProvider } from "./stripe";
import { paddleProvider } from "./paddle";

const providers: Record<string, PaymentProvider> = {
  stripe: stripeProvider,
  paddle: paddleProvider,
};

export function getPaymentProvider(): PaymentProvider {
  const name = (process.env.PAYMENT_PROVIDER || "paddle").toLowerCase();
  const provider = providers[name];
  if (!provider) {
    throw new Error(`Unknown payment provider: "${name}". Available: ${Object.keys(providers).join(", ")}`);
  }
  return provider;
}

export type { PaymentProvider, WebhookResult, SessionLookupResult } from "./types";
