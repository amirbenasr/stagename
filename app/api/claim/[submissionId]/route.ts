import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "../../../../lib/firebase-admin";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ submissionId: string }> }
): Promise<NextResponse> {
  try {
    const { submissionId } = await params;

    const doc = await adminDb.collection("submissions").doc(submissionId).get();

    if (!doc.exists) {
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 }
      );
    }

    const data = doc.data()!;

    return NextResponse.json({
      submissionId,
      status: data.status,
      email: data.email || null,
      brandKitSlug: data.brandKitSlug || null,
    });
  } catch (error) {
    console.error("Claim lookup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
