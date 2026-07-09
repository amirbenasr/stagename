import { NextRequest, NextResponse } from "next/server";
import { queueService } from "../../../lib/services/queue-service";
import { executeGenerationPipeline, SubmissionNotFoundError } from "../../../lib/services/generation-service";

// ============================================================
// Queue Worker — Processes one pending generation job at a time
// ============================================================
//
// Usage:
//   - Manual: GET /api/queue-worker
//   - Cron: Set up a cron job (e.g. Vercel Cron, GitHub Actions) to hit this endpoint
//   - Local: curl http://localhost:3000/api/queue-worker
//
// The worker dequeues one "pending" job, executes the generation pipeline,
// and marks it as "complete" or "failed" (with retry up to 3 attempts).

export async function GET(_request: NextRequest): Promise<NextResponse> {
  try {
    const job = await queueService.dequeueOne();
    if (!job) {
      return NextResponse.json({ message: "No pending jobs" }, { status: 200 });
    }

    console.log(`Processing job ${job.id} for submission ${job.submissionId}...`);

    try {
      const brandKitData = await executeGenerationPipeline({
        submissionId: job.submissionId,
      });

      await queueService.complete(job.id, brandKitData.slug);

      return NextResponse.json({
        message: "Job completed",
        jobId: job.id,
        brandKitSlug: brandKitData.slug,
      });
    } catch (pipelineError) {
      const message = pipelineError instanceof Error ? pipelineError.message : "Unknown error";
      await queueService.fail(job.id, message);
      throw pipelineError;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Queue worker error:", message);

    return NextResponse.json(
      { error: "Worker failed", message },
      { status: 500 }
    );
  }
}

// Also allow POST for webhook-style triggers
export async function POST(request: NextRequest): Promise<NextResponse> {
  return GET(request);
}
