import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "../../../lib/firebase-admin";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
    }

    // Find submission by stripeSessionId
    const snapshot = await adminDb
      .collection("submissions")
      .where("stripeSessionId", "==", sessionId)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const submissionDoc = snapshot.docs[0];
    const data = submissionDoc.data();

    return NextResponse.json({
      submissionId: submissionDoc.id,
      status: data.status,
      brandKitSlug: data.brandKitSlug || null,
    }, { status: 200 });
  } catch (error) {
    console.error("Session lookup error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
