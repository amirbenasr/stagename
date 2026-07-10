import { slugify as slugifyName } from "../utils/text-utils";
import type { SemanticQuizAnswers, Submission, SubmissionStatus } from "../types";

const COLLECTION = "submissions";

export interface CreateSubmissionInput {
  answers: SemanticQuizAnswers;
  selfieUrl: string;
  musicUrl: string;
}

export interface UpdateSubmissionInput {
  email?: string;
  status?: SubmissionStatus;
  paymentSessionId?: string;
  brandKitSlug?: string;
}

function toSubmission(docId: string, data: Record<string, unknown>): Submission {
  return {
    answers: (data.answers ?? {}) as SemanticQuizAnswers,
    selfieUrl: (data.selfieUrl as string) ?? "",
    musicUrl: (data.musicUrl as string) ?? "",
    email: (data.email as string) ?? null,
    status: (data.status as SubmissionStatus) ?? "pending",
    paymentSessionId: (data.paymentSessionId as string) ?? null,
    brandKitSlug: (data.brandKitSlug as string) ?? null,
    createdAt: (data.createdAt as string) ?? "",
  };
}

export const submissionRepository = {
  async create(input: CreateSubmissionInput): Promise<string> {
    const { requireDb } = await import("../firebase-admin");
    const db = requireDb();

    const docRef = await db.collection(COLLECTION).add({
      answers: input.answers,
      selfieUrl: input.selfieUrl,
      musicUrl: input.musicUrl,
      email: null,
      status: "pending" as SubmissionStatus,
      paymentSessionId: null,
      brandKitSlug: null,
      createdAt: new Date().toISOString(),
    });

    return docRef.id;
  },

  async findById(submissionId: string): Promise<Submission | null> {
    const { requireDb } = await import("../firebase-admin");
    const db = requireDb();

    const doc = await db.collection(COLLECTION).doc(submissionId).get();
    if (!doc.exists) return null;

    return toSubmission(doc.id, doc.data()!);
  },

  async findByPaymentSessionId(paymentSessionId: string): Promise<{ id: string; data: Submission } | null> {
    const { requireDb } = await import("../firebase-admin");
    const db = requireDb();

    const snapshot = await db
      .collection(COLLECTION)
      .where("paymentSessionId", "==", paymentSessionId)
      .limit(1)
      .get();

    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    return { id: doc.id, data: toSubmission(doc.id, doc.data()!) };
  },

  async update(submissionId: string, updates: UpdateSubmissionInput): Promise<void> {
    const { requireDb } = await import("../firebase-admin");
    const db = requireDb();

    await db.collection(COLLECTION).doc(submissionId).update(updates);
  },

  slugify: slugifyName,
};
