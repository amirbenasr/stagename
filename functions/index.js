const { onDocumentWritten } = require("firebase-functions/v2/firestore");
const fetch = require("node-fetch");

/**
 * Cloud Function triggered by Firestore write to generationJobs collection.
 * Calls the Vercel queue worker endpoint to process the job.
 */
exports.onGenerationJobCreated = onDocumentWritten(
  {
    document: "generationJobs/{jobId}",
    region: "us-central1",
  },
  async (event) => {
    const data = event.data;
    if (!data) {
      console.log("No data in event (document deleted?), skipping");
      return;
    }

    const after = data.after;
    if (!after.exists) {
      console.log("Document deleted, skipping");
      return;
    }

    const jobId = event.params.jobId;
    const jobData = after.data();

    const submissionId = jobData.submissionId;
    const status = jobData.status;

    console.log(`Job ${jobId} for submission ${submissionId}, status: ${status}`);

    // Only process pending jobs
    if (status !== "pending") {
      console.log(`Job ${jobId} is not pending (status: ${status}), skipping`);
      return;
    }

    // Call the queue worker endpoint (hardcoded fallback for production)
    const workerUrl = process.env.QUEUE_WORKER_URL || "https://stagename.club/api/queue-worker";

    try {
      console.log(`Triggering queue worker at ${workerUrl}`);

      const response = await fetch(workerUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ jobId }),
      });

      const result = await response.text();
      console.log(`Queue worker response (${response.status}):`, result);

      if (!response.ok) {
        throw new Error(`Worker returned ${response.status}: ${result}`);
      }

      console.log(`Successfully processed job ${jobId}`);
    } catch (error) {
      console.error(`Failed to process job ${jobId}:`, error.message);
      throw error; // Will retry
    }
  }
);
