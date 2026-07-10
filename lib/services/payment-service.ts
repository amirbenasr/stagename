import { submissionRepository } from "../repositories/submission-repository";
import { queueService } from "./queue-service";

export const paymentService = {
  async processSuccessfulPayment(submissionId: string, sessionId: string): Promise<void> {
    await submissionRepository.update(submissionId, {
      status: "paid",
      paymentSessionId: sessionId,
    });

    console.log(`✓ Submission ${submissionId} marked as paid (session ${sessionId})`);
  },

  async triggerGenerationPipeline(submissionId: string): Promise<void> {
    await queueService.enqueue(submissionId);
    console.log(`✓ Generation job enqueued to Firestore queue for submission ${submissionId}`);
  },
};
