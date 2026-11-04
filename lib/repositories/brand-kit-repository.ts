import type { BrandKitData, BrandKitVideo, NameAssetSet } from "../types";

const COLLECTION = "brandKits";

export interface SaveBrandKitInput {
  submissionId: string;
  slug: string;
  names: NameAssetSet[];
  genre: string;
  vibe: string;
  musicUrl?: string;
  video?: BrandKitVideo;
  videoUrl?: string;
  interviewScript?: import("../types").InterviewLine[];
}

/** Firestore rejects `undefined` values inside nested maps. */
function stripUndefined<T extends object>(value: T): T {
  const out: Record<string, unknown> = {};
  for (const [key, entry] of Object.entries(value)) {
    if (entry !== undefined && entry !== null) out[key] = entry;
  }
  return out as T;
}

function toBrandKitData(data: Record<string, unknown>): BrandKitData {
  return {
    submissionId: (data.submissionId as string) ?? "",
    slug: (data.slug as string) ?? "",
    names: (data.names as NameAssetSet[]) ?? [],
    genre: (data.genre as string) ?? "",
    vibe: (data.vibe as string) ?? "",
    musicUrl: (data.musicUrl as string) || undefined,
    video: (data.video as BrandKitVideo) || undefined,
    videoUrl: (data.videoUrl as string) || undefined,
    interviewScript: (data.interviewScript as import("../types").InterviewLine[]) || undefined,
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
      video: input.video ? stripUndefined(input.video) : undefined,
      status: "complete",
      createdAt: new Date().toISOString(),
    };

    await db.collection(COLLECTION).doc(input.slug).set(brandKitData);
  },

  async updateVideo(slug: string, video: BrandKitVideo): Promise<void> {
    const { requireDb } = await import("../firebase-admin");
    const db = requireDb();

    await db
      .collection(COLLECTION)
      .doc(slug)
      .update({ video: stripUndefined(video) });
  },
};
