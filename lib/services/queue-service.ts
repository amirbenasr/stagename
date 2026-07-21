import type { SubmissionStatus } from "../types";

const COLLECTION = "generationJobs";

export type JobStatus = "pending" | "processing" | "complete" | "failed";

export interface GenerationJob {
  id: string;
  submissionId: string;
  status: JobStatus;
  attempts: number;
  error?: string;
  brandKitSlug?: string;
  createdAt: string;
  updatedAt: string;
}

async function getDb() {
  const { requireDb } = await import("../firebase-admin");
  return requireDb();
}

function jobFromDoc(data: Record<string, unknown>, docId: string): GenerationJob {
  return {
    id: docId,
    submissionId: (data.submissionId as string) ?? "",
    status: (data.status as JobStatus) ?? "pending",
    attempts: (data.attempts as number) ?? 0,
    error: data.error as string | undefined,
    brandKitSlug: data.brandKitSlug as string | undefined,
    createdAt: (data.createdAt as string) ?? "",
    updatedAt: (data.updatedAt as string) ?? "",
  };
}

export const queueService = {
  async enqueue(submissionId: string): Promise<GenerationJob> {
    const db = await getDb();
    const now = new Date().toISOString();
    const doc = {
      submissionId,
      status: "pending" as const,
      attempts: 0,
      createdAt: now,
      updatedAt: now,
    };

    const ref = await db.collection(COLLECTION).add(doc);
    return jobFromDoc(doc, ref.id);
  },

  async dequeueOne(): Promise<GenerationJob | null> {
    const db = await getDb();

    // Use transaction to prevent race conditions with concurrent workers
    return db.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(
        db
          .collection(COLLECTION)
          .where("status", "==", "pending")
          .orderBy("createdAt", "asc")
          .limit(1)
      );

      if (snapshot.empty) return null;

      const doc = snapshot.docs[0];
      const data = doc.data();
      const job = jobFromDoc(data, doc.id);

      // Mark as processing atomically within the transaction
      transaction.update(doc.ref, {
        status: "processing",
        updatedAt: new Date().toISOString(),
      });

      return { ...job, status: "processing" };
    });
  },

  async complete(jobId: string, brandKitSlug: string): Promise<void> {
    const db = await getDb();
    await db.collection(COLLECTION).doc(jobId).update({
      status: "complete",
      brandKitSlug,
      updatedAt: new Date().toISOString(),
    });
  },

  async fail(jobId: string, error: string): Promise<void> {
    const db = await getDb();
    const doc = await db.collection(COLLECTION).doc(jobId).get();
    if (!doc.exists) return;

    const currentAttempts = (doc.data()?.attempts as number) ?? 0;
    //TODO update this when we're rich
    const maxAttempts = 0;

    if (currentAttempts >= maxAttempts) {

      await doc.ref.update({
        status: "failed",
        error,
        updatedAt: new Date().toISOString(),
      });
    } else {
      // Retry: reset to pending
      await doc.ref.update({
        status: "pending",
        attempts: currentAttempts + 1,
        updatedAt: new Date().toISOString(),
      });
    }
  },

  async findBySubmissionId(submissionId: string): Promise<GenerationJob | null> {
    const db = await getDb();
    const snapshot = await db
      .collection(COLLECTION)
      .where("submissionId", "==", submissionId)
      .limit(1)
      .get();

    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return jobFromDoc(doc.data(), doc.id);
  },

  async getStatusBySubmissionId(submissionId: string): Promise<{
    status: JobStatus;
    brandKitSlug?: string;
    error?: string;
  } | null> {
    const job = await this.findBySubmissionId(submissionId);
    if (!job) return null;
    return {
      status: job.status,
      brandKitSlug: job.brandKitSlug,
      error: job.error,
    };
  },
};
