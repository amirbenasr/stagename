import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { adminDb } from '../../../lib/firebase-admin';

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
    const rawBody = await request.text();
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

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const submissionId = session.metadata?.submissionId;
      const sessionId = session.id;

      if (!submissionId) {
        console.error('No submissionId in Stripe session metadata');
        return NextResponse.json(
          { received: false, error: 'Missing submissionId in metadata' },
          { status: 400 }
        );
      }

      // Update Firestore submission to paid + store stripeSessionId
      await adminDb.collection('submissions').doc(submissionId).update({
        status: 'paid',
        stripeSessionId: sessionId,
      });

      console.log(`✓ Submission ${submissionId} marked as paid (session ${sessionId})`);

      // Fire-and-forget: trigger generation pipeline without blocking webhook response
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
      fetch(`${siteUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId }),
      }).catch(err => console.error('Failed to trigger generation:', err));

      return NextResponse.json({ received: true }, { status: 200 });
    }

    console.log(`Webhook event received: ${event.type}`);
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Webhook error:', errorMessage);
    return NextResponse.json(
      { received: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
