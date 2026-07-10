import { NextRequest, NextResponse } from "next/server";
import { getPaymentProvider } from "../../../lib/payments";
import type { SessionLookupResponse } from "../../../lib/types";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
    }

    const provider = getPaymentProvider();
    const result = await provider.lookupSession(sessionId);

    if (!result) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const response: SessionLookupResponse = {
      submissionId: result.submissionId,
      status: result.status,
      brandKitSlug: result.brandKitSlug,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Session lookup error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
