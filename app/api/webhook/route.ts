import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "../../../lib/stripe";
import { paymentService } from "../../../lib/services/payment-service";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json({ received: false, error: "Missing Stripe signature" }, { status: 400 });
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("STRIPE_WEBHOOK_SECRET is not set");
      return NextResponse.json({ received: false, error: "Webhook secret not configured" }, { status: 500 });
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error("Webhook signature verification failed:", message);
      return NextResponse.json({ received: false, error: "Invalid signature" }, { status: 401 });
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const submissionId = session.metadata?.submissionId;
      const sessionId = session.id;

      if (!submissionId) {
        console.error("No submissionId in Stripe session metadata");
        return NextResponse.json({ received: false, error: "Missing submissionId" }, { status: 400 });
      }

      await paymentService.processSuccessfulPayment(submissionId, sessionId);
      await paymentService.triggerGenerationPipeline(submissionId);

      return NextResponse.json({ received: true }, { status: 200 });
    }

    console.log(`Webhook event received: ${event.type}`);
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Webhook error:", message);
    return NextResponse.json({ received: false, error: "Internal server error" }, { status: 500 });
  }
}