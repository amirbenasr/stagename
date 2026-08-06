import type { Review } from "../types";

const COLLECTION = "reviews";

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return email;
  const masked = local.length <= 2
    ? local[0] + "***"
    : local[0] + "***" + local[local.length - 1];
  return `${masked}@${domain}`;
}

function toReview(id: string, data: Record<string, unknown>): Review {
  return {
    id,
    brandKitSlug: (data.brandKitSlug as string) ?? "",
    email: (data.email as string) ?? "",
    maskedEmail: (data.maskedEmail as string) ?? "",
    rating: (data.rating as number) ?? 0,
    comment: (data.comment as string) ?? "",
    createdAt: (data.createdAt as string) ?? "",
  };
}

export const reviewRepository = {
  async findByBrandKit(brandKitSlug: string): Promise<Review[]> {
    const { requireDb } = await import("../firebase-admin");
    const db = requireDb();

    const snapshot = await db
      .collection(COLLECTION)
      .where("brandKitSlug", "==", brandKitSlug)
      .orderBy("createdAt", "desc")
      .get();

    return snapshot.docs.map((doc) => toReview(doc.id, doc.data() as Record<string, unknown>));
  },

  async hasReviewed(brandKitSlug: string, email: string): Promise<boolean> {
    const { requireDb } = await import("../firebase-admin");
    const db = requireDb();

    const snapshot = await db
      .collection(COLLECTION)
      .where("brandKitSlug", "==", brandKitSlug)
      .where("email", "==", email.toLowerCase().trim())
      .limit(1)
      .get();

    return !snapshot.empty;
  },

  async create(input: {
    brandKitSlug: string;
    email: string;
    rating: number;
    comment: string;
  }): Promise<Review> {
    const { requireDb } = await import("../firebase-admin");
    const db = requireDb();

    const cleanEmail = input.email.toLowerCase().trim();
    const review: Omit<Review, "id"> = {
      brandKitSlug: input.brandKitSlug,
      email: cleanEmail,
      maskedEmail: maskEmail(cleanEmail),
      rating: Math.min(5, Math.max(1, input.rating)),
      comment: input.comment.trim(),
      createdAt: new Date().toISOString(),
    };

    const docRef = await db.collection(COLLECTION).add(review);
    return { id: docRef.id, ...review };
  },
};
