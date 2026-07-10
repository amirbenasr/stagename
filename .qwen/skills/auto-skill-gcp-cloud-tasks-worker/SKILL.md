---
name: firestore-queue-cloud-function
description: Firestore queue + GCP Cloud Function trigger pattern — webhook writes to Firestore, Cloud Function watches for writes and calls Vercel queue worker
source: auto-skill
extracted_at: '2026-07-10T11:29:24.339Z'
---

# Firestore Queue + GCP Cloud Function Trigger Pattern

Replace direct Cloud Tasks API calls (which fail on Vercel due to proto file bundling issues) with a Firestore queue + GCP Cloud Function trigger. The webhook writes to Firestore, and a Cloud Function watches for new documents and calls the queue worker endpoint.

## Architecture

```
Stripe webhook → Vercel /api/webhook
  ↓
queueService.enqueue() → Firestore "generationJobs" collection
  ↓ (document write triggers Eventarc)
GCP Cloud Function (functions/index.js)
  ↓
POST /api/queue-worker (Vercel) → processes job
```

## Why This Pattern?

- **Vercel can't bundle `@google-cloud/tasks`** — the package has proto/binary files that Vercel's bundler strips out
- **Firestore writes are reliable** — no external dependencies needed in Vercel
- **Eventarc triggers are instant** — no polling delay
- **Queue worker stays in Vercel** — no need to move generation logic to GCP

## Files

### Queue Service (`lib/services/queue-service.ts`)
- `enqueue(submissionId)` — writes job document to `generationJobs` collection
- `dequeueOne()` — atomically marks job as "processing" and returns it
- `complete(jobId, brandKitSlug)` — marks job as "complete"
- `fail(jobId, error)` — marks as "failed" after 3 attempts, otherwise resets to "pending"

### Queue Worker (`app/api/queue-worker/route.ts`)
- Accepts POST requests (triggered by Cloud Function)
- Dequeues one job, runs generation pipeline
- Returns 200 on success, 500 on failure (Cloud Function will retry)

### Cloud Function (`functions/index.js`)
- Uses `firebase-functions` v2 SDK with `onDocumentWritten` trigger
- Triggered by Firestore write to `generationJobs/{jobId}`
- Checks if job status is "pending"
- Calls `QUEUE_WORKER_URL` env var (defaults to `https://stagename.club/api/queue-worker`)
- Retries on failure (GCP handles retry automatically)

## Env Vars

### Vercel
| Variable | Example | Purpose |
|----------|---------|---------|
| `GCP_PROJECT_ID` | `stagenameclub` | GCP project (for Firestore Admin SDK) |

### GCP Cloud Function
| Variable | Example | Purpose |
|----------|---------|---------|
| `QUEUE_WORKER_URL` | `https://stagename.club/api/queue-worker` | Full HTTPS URL to queue worker |

**Note:** No `@google-cloud/tasks` or `google-auth-library` needed in Vercel dependencies.

## GCP Setup (one-time)

### 1. Deploy the Cloud Function

```bash
cd functions && npm install
cd .. && npx firebase deploy --only functions
```

The function uses `firebase-functions` v2 SDK with `onDocumentWritten` trigger defined in code. No separate Eventarc trigger creation needed — Firebase handles it automatically.

### 2. Required IAM Roles

If deployment fails with permission errors, add these roles to the compute service account:

```bash
# For Eventarc triggers
gcloud projects add-iam-policy-binding stagenameclub \
  --member=serviceAccount:714751050242-compute@developer.gserviceaccount.com \
  --role=roles/eventarc.eventReceiver

# For Cloud Run invocation
gcloud projects add-iam-policy-binding stagenameclub \
  --member=serviceAccount:714751050242-compute@developer.gserviceaccount.com \
  --role=roles/run.invoker

# For Cloud Build
gcloud projects add-iam-policy-binding stagenameclub \
  --member=serviceAccount:714751050242-compute@developer.gserviceaccount.com \
  --role=roles/cloudbuild.builds.builder

# For Artifact Registry
gcloud projects add-iam-policy-binding stagenameclub \
  --member=serviceAccount:714751050242-compute@developer.gserviceaccount.com \
  --role=roles/artifactregistry.writer
```

### 3. Environment Variables

The worker URL is hardcoded as a fallback in `functions/index.js`:
```javascript
const workerUrl = process.env.QUEUE_WORKER_URL || "https://stagename.club/api/queue-worker";
```

To override (e.g., for staging):
```bash
gcloud functions deploy onGenerationJobCreated \
  --region=us-central1 \
  --update-env-vars=QUEUE_WORKER_URL=https://staging.stagename.club/api/queue-worker
```

## Firestore Queue Schema

```javascript
// generationJobs/{jobId}
{
  submissionId: string,
  status: "pending" | "processing" | "complete" | "failed",
  attempts: number,           // incremented on retry
  error?: string,             // last error message
  brandKitSlug?: string,      // set on completion
  createdAt: string,          // ISO timestamp
  updatedAt: string           // ISO timestamp
}
```

## Gotchas

1. **Vercel can't bundle `@google-cloud/tasks`** — the package has proto files that get stripped. Use Firestore queue + Cloud Function instead.
2. **Dynamic imports fail on Vercel** — `await import("./cloud-tasks-service")` throws "Cannot find module as expression is too dynamic". Use static imports or move the logic outside Vercel.
3. **Cloud Function must check status** — only process jobs with `status === "pending"` to avoid duplicate processing.
4. **Queue worker must be public** — Cloud Function calls it via HTTPS, so it needs to be accessible (no auth middleware blocking it).
5. **Firestore composite index** — first time `dequeueOne()` runs, Firestore will reject the query and provide a URL to create the required index. Click that link once.
6. **Stripe webhook 308 redirect** — if webhook URL has `www.` prefix but Vercel redirects to bare domain, Stripe gets 308. Use the exact URL without `www.`.
7. **firebase-functions vs Functions Framework** — use `firebase-functions` v2 SDK (`onDocumentWritten`) not `@google-cloud/functions-framework`. The latter causes "function.js does not exist" build errors.
8. **IAM propagation delay** — after adding IAM roles, wait 1-2 minutes before retrying deployment.

## Verification Commands

```bash
# Check Firestore queue
gcloud firestore indexes list --project=stagenameclub

# View Cloud Function logs
gcloud functions logs read on-generation-job-created --region=us-central1

# View Eventarc triggers
gcloud eventarc triggers list --location=us-central1 --project=stagenameclub

# Manually trigger queue worker (for testing)
curl -X POST https://stagename.club/api/queue-worker
```

## Migration from Cloud Tasks

If you previously used `@google-cloud/tasks` directly:

1. Remove `@google-cloud/tasks` and `google-auth-library` from `package.json`
2. Delete `lib/services/cloud-tasks-service.ts`
3. Delete `app/api/cloud-tasks-worker/route.ts`
4. Update payment webhook to use `queueService.enqueue()` instead of `cloudTasksService.enqueueGenerationJob()`
5. Deploy Cloud Function and set up Eventarc trigger
6. Remove Cloud Tasks env vars from Vercel (`CLOUD_TASKS_LOCATION`, `CLOUD_TASKS_SA_EMAIL`, `CLOUD_TASKS_WORKER_URL`)
