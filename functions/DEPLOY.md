# GCP Cloud Function — Firestore Queue Trigger

This Cloud Function is triggered when a new job is written to the `generationJobs` Firestore collection. It calls the Vercel queue worker endpoint to process the job.

## Architecture

```
Stripe Webhook → Vercel /api/webhook
  ↓
queueService.enqueue() → Firestore "generationJobs" collection
  ↓
GCP Eventarc trigger → Cloud Function (this code)
  ↓
POST /api/queue-worker (Vercel) → processes job
```

## Deployment

### 1. Install Firebase CLI (if not already installed)

```bash
npm install -g firebase-tools
```

### 2. Deploy the Cloud Function

```bash
firebase deploy --only functions
```

### 3. Set up Eventarc trigger

After deployment, create an Eventarc trigger to watch Firestore writes:

```bash
gcloud eventarc triggers create generation-job-trigger \
  --location=us-central1 \
  --destination-run-service=on-generation-job-created \
  --event-filters="type=google.cloud.firestore.document.v1.written" \
  --event-filters="path=projects/stagenameclub/databases/(default)/documents/generationJobs/{jobId}" \
  --service-account=cloud-tasks-enqueuer@stagenameclub.iam.gserviceaccount.com
```

**Note:** The service account needs:
- `roles/eventarc.admin` (to create triggers)
- `roles/run.invoker` (to invoke Cloud Run services)

### 4. Set environment variables

In GCP Cloud Console → Cloud Functions → `on-generation-job-created` → Environment variables:

```
QUEUE_WORKER_URL=https://stagename.club/api/queue-worker
```

Or via CLI:

```bash
gcloud functions deploy on-generation-job-created \
  --gen2 \
  --runtime=nodejs20 \
  --region=us-central1 \
  --source=. \
  --entry-point=onGenerationJobCreated \
  --trigger-event-filters="type=google.cloud.firestore.document.v1.written" \
  --trigger-event-filters="path=projects/stagenameclub/databases/(default)/documents/generationJobs/{jobId}" \
  --trigger-service-account=cloud-tasks-enqueuer@stagenameclub.iam.gserviceaccount.com \
  --set-env-vars="QUEUE_WORKER_URL=https://stagename.club/api/queue-worker"
```

## Local Testing

```bash
# Install dependencies
npm install

# Start local emulator (requires Firebase Emulator Suite)
firebase emulators:start --only functions

# Trigger manually (in another terminal)
curl -X POST http://localhost:5001/stagenameclub/us-central1/on-generation-job-created \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "name": "projects/stagenameclub/databases/(default)/documents/generationJobs/test123",
      "value": {
        "fields": {
          "submissionId": {"stringValue": "test-submission-id"},
          "status": {"stringValue": "pending"}
        }
      }
    }
  }'
```

## Monitoring

View logs:

```bash
gcloud functions logs read on-generation-job-created --region=us-central1
```

Or in GCP Console → Cloud Functions → Logs.
