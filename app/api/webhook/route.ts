import { NextRequest, NextResponse } from "next/server";
import { getPaymentProvider } from "../../../lib/payments";
import { paymentService } from "../../../lib/services/payment-service";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const rawBody = await request.text();
    const provider = getPaymentProvider();

    const signature = request.headers.get(
      provider.name === "stripe" ? "stripe-signature" : "paddle-signature"
    );

    if (!signature) {
      return NextResponse.json(
        { received: false, error: `Missing ${provider.name} signature` },
        { status: 400 }
      );
    }

    let result;
    try {
      result = await provider.handleWebhook(rawBody, signature);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error("Webhook verification failed:", message);
      return NextResponse.json({ received: false, error: "Invalid signature" }, { status: 401 });
    }

    if (!result) {
      return NextResponse.json({ received: true }, { status: 200 });
    }

    await paymentService.processSuccessfulPayment(result.submissionId, result.sessionId);
    await paymentService.triggerGenerationPipeline(result.submissionId);

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Webhook error:", message);
    return NextResponse.json({ received: false, error: "Internal server error" }, { status: 500 });
  }
}
