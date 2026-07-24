import type { BrandKitData, NameAssetSet } from "../types";

const COLLECTION = "brandKits";

export interface SaveBrandKitInput {
  submissionId: string;
  slug: string;
  names: NameAssetSet[];
  genre: string;
  vibe: string;
  musicUrl?: string;
}

function toBrandKitData(data: Record<string, unknown>): BrandKitData {
  return {
    submissionId: (data.submissionId as string) ?? "",
    slug: (data.slug as string) ?? "",
    names: (data.names as NameAssetSet[]) ?? [],
    genre: (data.genre as string) ?? "",
    vibe: (data.vibe as string) ?? "",
    musicUrl: (data.musicUrl as string) || undefined,
    status: (data.status as BrandKitData["status"]) ?? "complete",
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
