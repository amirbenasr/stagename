import type { BrandKitData } from "../types";

const COLLECTION = "brandKits";

export interface SaveBrandKitInput {
  submissionId: string;
  slug: string;
  stageNames: BrandKitData["stageNames"];
  portraitImageUrl: string;
  logoImageUrl: string;
  studioPhotoUrl: string;
  availability: BrandKitData["availability"];
}

function toBrandKitData(data: Record<string, unknown>): BrandKitData {
  return {
    submissionId: (data.submissionId as string) ?? "",
    slug: (data.slug as string) ?? "",
    stageNames: (data.stageNames as BrandKitData["stageNames"]) ?? [],
    portraitImageUrl: (data.portraitImageUrl as string) ?? "",
    logoImageUrl: (data.logoImageUrl as string) ?? "",
    studioPhotoUrl: (data.studioPhotoUrl as string) ?? "",
    availability: (data.availability as BrandKitData["availability"]) ?? {},
    status: "complete",
    createdAt: (data.createdAt as string) ?? "",
  };
}

export const brandKitRepository = {
  async findBySlug(slug: string): Promise<BrandKitData | null> {
    const { requireDb } = await import("../firebase-admin");
    const db = requireDb();

    const doc = await db.collection(COLLECTION).doc(slug).get();
    if (!doc.exists) return null;

    return toBrandKitData(doc.data()!);
  },

  async save(input: SaveBrandKitInput): Promise<void> {
    const { requireDb } = await import("../firebase-admin");
    const db = requireDb();

    const brandKitData: BrandKitData = {
      ...input,
      status: "complete",
      createdAt: new Date().toISOString(),
    };

    await db.collection(COLLECTION).doc(input.slug).set(brandKitData);
  },
};
