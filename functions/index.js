const fetch = require("node-fetch");

/**
 * Cloud Function triggered by Firestore write to generationJobs collection.
 * Calls the Vercel queue worker endpoint to process the job.
 *
 * @param {object} cloudEvent - The CloudEvent from GCP Eventarc
 */
module.exports.onGenerationJobCreated = async (cloudEvent) => {
  const data = cloudEvent.data;

  // Extract job info from the Firestore document
  const jobId = data.name.split("/").pop();
  const jobData = data.value?.fields || {};

  const submissionId = jobData.submissionId?.stringValue;
  const status = jobData.status?.stringValue;

  console.log(`Job ${jobId} created/updated for submission ${submissionId}, status: ${status}`);

  // Only process pending jobs
  if (status !== "pending") {
    console.log(`Job ${jobId} is not pending (status: ${status}), skipping`);
    return;
  }

  // Call the queue worker endpoint
  const workerUrl = process.env.QUEUE_WORKER_URL;
  if (!workerUrl) {
    console.error("QUEUE_WORKER_URL environment variable not set");
    throw new Error("QUEUE_WORKER_URL not configured");
  }

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
};
