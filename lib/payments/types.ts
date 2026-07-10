import type { CheckoutRequest, CheckoutResponse, SubmissionStatus } from "../types";

export interface WebhookResult {
  submissionId: string;
  sessionId: string;
}

export interface SessionLookupResult {
  id: string;
  submissionId: string;
  status: SubmissionStatus;
  brandKitSlug: string | null;
}

export interface PaymentProvider {
  readonly name: string;

  createCheckoutSession(request: CheckoutRequest): Promise<CheckoutResponse>;

  handleWebhook(rawBody: string, signature: string | null): Promise<WebhookResult | null>;

  lookupSession(sessionId: string): Promise<SessionLookupResult | null>;
}
