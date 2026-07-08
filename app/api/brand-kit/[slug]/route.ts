import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "../../../../lib/firebase-admin";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
): Promise<NextResponse> {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json({ error: "Missing slug" }, { status: 400 });
    }

    const brandKitDoc = await adminDb.collection("brandKits").doc(slug).get();

    if (!brandKitDoc.exists) {
      return NextResponse.json({ error: "Brand kit not found" }, { status: 404 });
    }

    const data = brandKitDoc.data()!;

    return NextResponse.json({
      slug: data.slug,
      submissionId: data.submissionId,
      stageNames: data.stageNames,
      portraitImageUrl: data.portraitImageUrl,
      logoImageUrl: data.logoImageUrl,
      studioPhotoUrl: data.studioPhotoUrl || "",
      availability: data.availability || {},
      status: data.status,
      createdAt: data.createdAt,
    }, { status: 200 });
  } catch (error) {
    console.error("Brand kit fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
