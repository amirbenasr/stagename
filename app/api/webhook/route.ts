import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-06-24.dahlia',
});

interface WebhookResponse {
  received: boolean;
  error?: string;
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<WebhookResponse>> {
  try {
    // Read the raw request body as text for signature verification
    const rawBody = await request.text();

    // Get the Stripe signature from headers
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { received: false, error: 'Missing Stripe signature' },
        { status: 400 }
      );
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET is not set');
      return NextResponse.json(
        { received: false, error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    // Verify the event's authenticity using Stripe's signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Webhook signature verification failed:', errorMessage);
      return NextResponse.json(
        { received: false, error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Handle checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;

      // Extract customer email and session details
      const customerEmail = session.customer_email;
      const sessionId = session.id;
      const paymentStatus = session.payment_status;
      const amountTotal = session.amount_total;

      console.log('✓ Payment completed successfully!');
      console.log(`  Session ID: ${sessionId}`);
      console.log(`  Customer Email: ${customerEmail}`);
      console.log(`  Payment Status: ${paymentStatus}`);
      console.log(`  Amount: $${((amountTotal || 0) / 100).toFixed(2)}`);

      // TODO: In production, update database to flip account status to 'paid = true'
      // Example:
      // if (customerEmail) {
      //   await db.users.update(
      //     { email: customerEmail },
      //     { paid: true, paidAt: new Date() }
      //   );
      // }

      return NextResponse.json(
        { received: true },
        { status: 200 }
      );
    }

    // Log other events but acknowledge receipt
    console.log(`Webhook event received: ${event.type}`);

    return NextResponse.json(
      { received: true },
      { status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Webhook error:', errorMessage);

    return NextResponse.json(
      { received: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
