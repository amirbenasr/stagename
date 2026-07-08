import { NextRequest, NextResponse } from "next/server";
import { executeGenerationPipeline, SubmissionNotFoundError } from "../../../lib/services/generation-service";
import type { GenerateRequest } from "../../../lib/types";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { submissionId } = (await request.json()) as GenerateRequest;

    if (!submissionId) {
      return NextResponse.json({ error: "Missing submissionId" }, { status: 400 });
    }

    const brandKitData = await executeGenerationPipeline({ submissionId });

    return NextResponse.json(brandKitData, { status: 200 });
  } catch (error) {
    if (error instanceof SubmissionNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    console.error("Generation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}