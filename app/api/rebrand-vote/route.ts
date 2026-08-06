import { NextRequest, NextResponse } from "next/server";
import { rebrandVoteRepository } from "../../../lib/repositories/rebrand-vote-repository";

export async function GET(
  request: NextRequest
): Promise<NextResponse> {
  try {
    const brandKitSlug = request.nextUrl.searchParams.get("slug");
    if (!brandKitSlug) {
      return NextResponse.json({ error: "Missing slug parameter" }, { status: 400 });
    }

    const counts = await rebrandVoteRepository.getAllCounts(brandKitSlug);
    return NextResponse.json({ counts }, { status: 200 });
  } catch (error) {
    console.error("Rebrand votes fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest
): Promise<NextResponse> {
  try {
    let body: { brandKitSlug: string; nameIndex: number; stageName: string };
    try {
      body = (await request.json()) as { brandKitSlug: string; nameIndex: number; stageName: string };
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    if (!body.brandKitSlug || body.nameIndex == null || !body.stageName) {
      return NextResponse.json(
        { error: "Missing required fields: brandKitSlug, nameIndex, stageName" },
        { status: 400 }
      );
    }

    const newCount = await rebrandVoteRepository.increment(
      body.brandKitSlug,
      body.nameIndex,
      body.stageName
    );

    return NextResponse.json({ count: newCount }, { status: 200 });
  } catch (error) {
    console.error("Rebrand vote error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
