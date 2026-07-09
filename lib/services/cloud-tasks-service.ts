import { CloudTasksClient } from "@google-cloud/tasks";

// ============================================================
// Cloud Tasks Service — Enqueue generation jobs on GCP
// ============================================================

const QUEUE_NAME = "generation-jobs";

function getClient(): CloudTasksClient {
  const credentialsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  if (!credentialsJson) {
    throw new Error("GOOGLE_APPLICATION_CREDENTIALS_JSON is not set");
  }

  return new CloudTasksClient({
    credentials: JSON.parse(credentialsJson),
  });
}

function getQueuePath(): string {
  const projectId = process.env.GCP_PROJECT_ID;
  const location = process.env.CLOUD_TASKS_LOCATION;

  if (!projectId || !location) {
    throw new Error("GCP_PROJECT_ID and CLOUD_TASKS_LOCATION must be set");
  }

  return `projects/${projectId}/locations/${location}/queues/${QUEUE_NAME}`;
}

export const cloudTasksService = {
  async enqueueGenerationJob(submissionId: string): Promise<void> {
    const client = getClient();
    const queuePath = getQueuePath();
    const workerUrl = process.env.CLOUD_TASKS_WORKER_URL;
    const saEmail = process.env.CLOUD_TASKS_SA_EMAIL;

    if (!workerUrl || !saEmail) {
      throw new Error("CLOUD_TASKS_WORKER_URL and CLOUD_TASKS_SA_EMAIL must be set");
    }

    const body = JSON.stringify({ submissionId });

    await client.createTask({
      parent: queuePath,
      task: {
        httpRequest: {
          httpMethod: "POST",
          url: workerUrl,
          headers: {
            "Content-Type": "application/json",
          },
          body: Buffer.from(body).toString("base64"),
          oidcToken: {
            serviceAccountEmail: saEmail,
            audience: workerUrl,
          },
        },
      },
    });

    console.log(`Cloud Tasks: enqueued generation job for submission ${submissionId}`);
  },
};
