import { NextRequest, NextResponse } from "next/server";
import { getPaymentProvider } from "../../../lib/payments";
import type { CheckoutRequest, CheckoutResponse } from "../../../lib/types";

export async function POST(request: NextRequest): Promise<NextResponse<CheckoutResponse>> {
  try {
    let body: CheckoutRequest;

    try {
      body = (await request.json()) as CheckoutRequest;
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    if (!body.submissionId || !body.email) {
      return NextResponse.json(
        { error: "Missing required fields: submissionId, email" },
        { status: 400 }
      );
    }

    const provider = getPaymentProvider();
    const response = await provider.createCheckoutSession(body);

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Checkout error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
