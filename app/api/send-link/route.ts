import { NextRequest, NextResponse } from "next/server";
import { submissionRepository } from "../../../lib/repositories/submission-repository";
import { sendClaimEmail } from "../../../lib/email";
import type { SendLinkRequest } from "../../../lib/types";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { submissionId, email } = (await request.json()) as SendLinkRequest;

    if (!submissionId || !email) {
      return NextResponse.json({ error: "Missing submissionId or email" }, { status: 400 });
    }

    const submission = await submissionRepository.findById(submissionId);
    if (!submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    await submissionRepository.update(submissionId, { email });
    await sendClaimEmail(email, submissionId);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Send link error:", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}