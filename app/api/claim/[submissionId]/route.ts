import { NextRequest, NextResponse } from "next/server";
import { submissionRepository } from "../../../../lib/repositories/submission-repository";
import type { ClaimLookupResponse } from "../../../../lib/types";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ submissionId: string }> }
): Promise<NextResponse> {
  try {
    const { submissionId } = await params;

    const submission = await submissionRepository.findById(submissionId);
    if (!submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    const response: ClaimLookupResponse = {
      submissionId,
      status: submission.status,
      email: submission.email,
      brandKitSlug: submission.brandKitSlug,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Claim lookup error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}