import { NextRequest, NextResponse } from "next/server";
import { reviewRepository } from "../../../lib/repositories/review-repository";
import type { ReviewPostRequest, ReviewPostResponse } from "../../../lib/types";

export async function GET(
  request: NextRequest
): Promise<NextResponse> {
  try {
    const brandKitSlug = request.nextUrl.searchParams.get("slug");
    const reviews = brandKitSlug
      ? await reviewRepository.findByBrandKit(brandKitSlug)
      : await reviewRepository.findAll();

    return NextResponse.json({ reviews }, { status: 200 });
  } catch (error) {
    console.error("Reviews fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<ReviewPostResponse>> {
  try {
    let body: ReviewPostRequest;
    try {
      body = (await request.json()) as ReviewPostRequest;
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    if (!body.brandKitSlug || !body.email || !body.rating || !body.comment) {
      return NextResponse.json(
        { error: "Missing required fields: brandKitSlug, email, rating, comment" },
        { status: 400 }
      );
    }

    if (body.rating < 1 || body.rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
    }

    const alreadyReviewed = await reviewRepository.hasReviewed(body.brandKitSlug, body.email);
    if (alreadyReviewed) {
      return NextResponse.json(
        { error: "You have already submitted a review for this brand kit" },
        { status: 409 }
      );
    }

    const review = await reviewRepository.create({
      brandKitSlug: body.brandKitSlug,
      email: body.email,
      rating: body.rating,
      comment: body.comment,
    });

    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    console.error("Review post error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
