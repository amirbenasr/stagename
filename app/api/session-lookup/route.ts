import { NextRequest, NextResponse } from "next/server";
import { submissionRepository } from "../../../lib/repositories/submission-repository";
import type { SessionLookupResponse } from "../../../lib/types";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
    }

    const result = await submissionRepository.findByStripeSessionId(sessionId);
    if (!result) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const response: SessionLookupResponse = {
      submissionId: result.id,
      status: result.data.status,
      brandKitSlug: result.data.brandKitSlug,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Session lookup error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}