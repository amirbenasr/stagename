import { NextRequest, NextResponse } from "next/server";
import { queueService } from "../../../lib/services/queue-service";
import {
  executeGenerationPipeline,
  executeVideoPipeline,
  SubmissionNotFoundError,
} from "../../../lib/services/generation-service";

// ============================================================
// Queue Worker — Processes one pending generation job at a time
// ============================================================
//
// Triggered by GCP Cloud Function when a new job is written to Firestore.
// Can also be called manually: POST /api/queue-worker
//
// Two job types:
//   "kit"   → names, images, availability, email, then enqueues a "video" job
//   "video" → First Take frame + motion + audio, attached to the saved kit
//
// Splitting them gives the video its own serverless time budget, so a slow
// render can never time out the kit or leave the customer with nothing.

export async function GET(_request: NextRequest): Promise<NextResponse> {
  try {
    const job = await queueService.dequeueOne();
    if (!job) {
      return NextResponse.json({ message: "No pending jobs" }, { status: 200 });
    }

    console.log(`Processing ${job.type} job ${job.id} for submission ${job.submissionId}...`);

    try {
      if (job.type === "video") {
        const video = await executeVideoPipeline(job.submissionId);
        await queueService.complete(job.id);

        return NextResponse.json({
          message: "First Take completed",
          jobId: job.id,
          videoStatus: video.status,
        });
      }

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
    if (error instanceof SubmissionNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

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
