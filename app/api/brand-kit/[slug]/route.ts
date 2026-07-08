import { NextRequest, NextResponse } from "next/server";
import { brandKitRepository } from "../../../../lib/repositories/brand-kit-repository";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
): Promise<NextResponse> {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json({ error: "Missing slug" }, { status: 400 });
    }

    const brandKit = await brandKitRepository.findBySlug(slug);
    if (!brandKit) {
      return NextResponse.json({ error: "Brand kit not found" }, { status: 404 });
    }

    return NextResponse.json(brandKit, { status: 200 });
  } catch (error) {
    console.error("Brand kit fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}