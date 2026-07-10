import { Paddle, Environment } from "@paddle/paddle-node-sdk";
import { createHmac, timingSafeEqual } from "crypto";
import type { PaymentProvider, WebhookResult, SessionLookupResult } from "./types";
import type { CheckoutRequest, CheckoutResponse } from "../types";
import { submissionRepository } from "../repositories/submission-repository";

function getPaddleClient(): Paddle {
  const apiKey = process.env.PADDLE_API_KEY;
  if (!apiKey) throw new Error("PADDLE_API_KEY is not set");

  const isSandbox = process.env.PADDLE_ENVIRONMENT !== "production";

  return new Paddle(apiKey, {
    environment: isSandbox ? Environment.sandbox : Environment.production,
  });
}

function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}

export const paddleProvider: PaymentProvider = {
  name: "paddle",

  async createCheckoutSession(request: CheckoutRequest): Promise<CheckoutResponse> {
    const { submissionId, email } = request;
    const paddle = getPaddleClient();
    const siteUrl = getSiteUrl();

    const priceId = process.env.PADDLE_PRICE_ID;
    if (!priceId) throw new Error("PADDLE_PRICE_ID is not set — create a product/price in Paddle Dashboard or via MCP");

    let customerId: string | undefined;
    try {
      const customer = await paddle.customers.create({ email });
      customerId = customer.id;
    } catch {
      // Customer creation is optional — checkout will still work without it
    }

    const transaction = await paddle.transactions.create({
      items: [
        {
          priceId: priceId,
          quantity: 1,
        },
      ],
      customerId,
      customData: { submissionId },
      checkout: {
        url: `${siteUrl}/success`,
      },
    });

    return { transactionId: transaction.id };
  },

  async handleWebhook(rawBody: string, signature: string | null): Promise<WebhookResult | null> {
    if (!signature) throw new Error("Missing Paddle-Signature header");

    const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET;
    if (!webhookSecret) throw new Error("PADDLE_WEBHOOK_SECRET is not set");

    const parts = signature.split(";");
    if (parts.length !== 2) throw new Error("Invalid Paddle-Signature format");

    const timestampPart = parts[0].split("=")[1];
    const signaturePart = parts[1].split("=")[1];
    if (!timestampPart || !signaturePart) throw new Error("Invalid Paddle-Signature format");

    const timestampMs = parseInt(timestampPart) * 1000;
    if (isNaN(timestampMs) || Date.now() - timestampMs > 5000) {
      throw new Error("Paddle webhook event expired");
    }

    const signedPayload = `${timestampPart}:${rawBody}`;
    const hashedPayload = createHmac("sha256", webhookSecret)
      .update(signedPayload, "utf8")
      .digest("hex");

    if (!timingSafeEqual(Buffer.from(hashedPayload), Buffer.from(signaturePart))) {
      throw new Error("Invalid Paddle webhook signature");
    }

    const event = JSON.parse(rawBody);

    if (event.event_type !== "transaction.completed") return null;

    const transaction = event.data;
    const submissionId = transaction.custom_data?.submissionId;
    if (!submissionId) throw new Error("No submissionId in Paddle transaction custom_data");

    return { submissionId, sessionId: transaction.id };
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
