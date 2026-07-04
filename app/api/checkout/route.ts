import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-06-24.dahlia',
});

interface CheckoutRequestBody {
  quantity?: number;
}

interface CheckoutResponse {
  url?: string;
  error?: string;
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<CheckoutResponse>> {
  try {
    let body: CheckoutRequestBody = {};

    try {
      body = (await request.json()) as CheckoutRequestBody;
    } catch (parseError) {
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      );
    }

    const quantity = typeof body.quantity === 'number' ? body.quantity : 1;

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'stagename.club - Complete Brand Dossier',
            },
            unit_amount: 1499, // $14.99 in cents
          },
          quantity,
        },
      ],
      mode: 'payment',
      success_url: `${siteUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/`,
    });

    return NextResponse.json(
      { url: session.url || undefined },
      { status: 200 }
    );
  } catch (error) {
    console.error('Checkout error:', error);

    const errorMessage =
      error instanceof Stripe.errors.StripeError
        ? error.message
        : 'Internal server error';

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
