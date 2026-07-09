import { NextRequest, NextResponse } from "next/server";
import { queueService } from "../../../lib/services/queue-service";
import { brandKitRepository } from "../../../lib/repositories/brand-kit-repository";

// ============================================================
// Queue Status — Returns generation job status for a submission
// ============================================================
//
// Usage: GET /api/queue-status?submissionId=xxx
//
// Response:
//   - { status: "pending" | "processing" | "complete" | "failed", brandKitSlug?: string, error?: string }
//   - If the brand kit already exists (direct lookup), returns the slug immediately.

export async function GET(request: NextRequest): Promise<NextResponse> {
  const submissionId = request.nextUrl.searchParams.get("submissionId");
  if (!submissionId) {
    return NextResponse.json({ error: "Missing submissionId" }, { status: 400 });
  }

  // First check if the brand kit already exists (fast path)
  const jobs = await queueService.findBySubmissionId(submissionId);
  if (jobs?.brandKitSlug) {
    const brandKit = await brandKitRepository.findBySlug(jobs.brandKitSlug);
    if (brandKit) {
      return NextResponse.json({
        status: "complete" as const,
        brandKitSlug: brandKit.slug,
      });
    }
  }

  const statusInfo = await queueService.getStatusBySubmissionId(submissionId);
  if (!statusInfo) {
    return NextResponse.json({ error: "No job found for this submission" }, { status: 404 });
  }

  return NextResponse.json(statusInfo);
}
