import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "../../../lib/firebase-admin";
import { sendClaimEmail } from "../../../lib/email";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { submissionId, email } = await request.json();

    if (!submissionId || !email) {
      return NextResponse.json(
        { error: "Missing submissionId or email" },
        { status: 400 }
      );
    }

    const submissionDoc = await adminDb
      .collection("submissions")
      .doc(submissionId)
      .get();

    if (!submissionDoc.exists) {
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 }
      );
    }

    await adminDb.collection("submissions").doc(submissionId).update({ email });

    await sendClaimEmail(email, submissionId);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Send link error:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}
