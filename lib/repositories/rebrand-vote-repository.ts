const COLLECTION = "rebrandVotes";

function docId(brandKitSlug: string, nameIndex: number): string {
  return `${brandKitSlug}-${nameIndex}`;
}

export const rebrandVoteRepository = {
  async getCount(brandKitSlug: string, nameIndex: number): Promise<number> {
    const { requireDb } = await import("../firebase-admin");
    const db = requireDb();

    const doc = await db.collection(COLLECTION).doc(docId(brandKitSlug, nameIndex)).get();
    if (!doc.exists) return 0;

    return (doc.data()?.count as number) ?? 0;
  },

  async getAllCounts(brandKitSlug: string): Promise<Record<number, number>> {
    const { requireDb } = await import("../firebase-admin");
    const db = requireDb();

    const snapshot = await db
      .collection(COLLECTION)
      .where("brandKitSlug", "==", brandKitSlug)
      .get();

    const counts: Record<number, number> = {};
    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      counts[data.nameIndex as number] = (data.count as number) ?? 0;
    });
    return counts;
  },

  async increment(
    brandKitSlug: string,
    nameIndex: number,
    stageName: string
  ): Promise<number> {
    const { requireDb } = await import("../firebase-admin");
    const db = requireDb();
    const { FieldValue } = await import("firebase-admin/firestore");

    const ref = db.collection(COLLECTION).doc(docId(brandKitSlug, nameIndex));
    await db.runTransaction(async (tx) => {
      const doc = await tx.get(ref);
      if (doc.exists) {
        tx.update(ref, { count: FieldValue.increment(1) });
      } else {
        tx.set(ref, {
          brandKitSlug,
          nameIndex,
          stageName,
          count: 1,
          createdAt: new Date().toISOString(),
        });
      }
    });

    const updated = await ref.get();
    return (updated.data()?.count as number) ?? 1;
  },
};
