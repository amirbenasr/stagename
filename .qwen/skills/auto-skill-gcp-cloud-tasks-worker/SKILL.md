---
name: gcp-cloud-tasks-worker
description: Replace Vercel Cron + Firestore queue with GCP Cloud Tasks for event-driven async job execution — OIDC auth, error classification, and deployment sequence
source: auto-skill
extracted_at: '2026-07-09T19:35:38.573Z'
---

# GCP Cloud Tasks Worker Pattern

Replace polling-based cron + Firestore queue with event-driven GCP Cloud Tasks. Zero recurring cost (100K tasks/month free), immediate execution, built-in retries.

## Architecture

```
Stripe webhook → cloudTasksService.enqueueGenerationJob()
  → Cloud Tasks queue → HTTP POST /api/cloud-tasks-worker (with OIDC token)
    → executeGenerationPipeline() → 200 (success) or 500 (retry)
```

## Files

### Enqueue Service (`lib/services/cloud-tasks-service.ts`)
- Uses `@google-cloud/tasks` `CloudTasksClient`
- Auth: `credentials: JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON)`
- Creates task with `httpRequest.oidcToken: { serviceAccountEmail, audience }`
- Queue path: `projects/{GCP_PROJECT_ID}/locations/{CLOUD_TASKS_LOCATION}/queues/{QUEUE_NAME}`

### Worker Endpoint (`app/api/cloud-tasks-worker/route.ts`)
- Verifies OIDC token via `google-auth-library` `OAuth2Client.verifyIdToken()`
- Validates: `iss` (accounts.google.com), `aud` (worker URL), `exp` (not expired), `email` (matching SA)
- **Error classification:**
  - Permanent (`SubmissionNotFoundError`, "not found", "invalid") → return **200** (no retry)
  - Transient (network, timeouts, rate limits) → return **500** (Cloud Tasks retries up to max-attempts)

## Env Vars

| Variable | Example | Purpose |
|----------|---------|---------|
| `GCP_PROJECT_ID` | `stagenameclub` | GCP project |
| `CLOUD_TASKS_LOCATION` | `us-central1` | Queue region |
| `CLOUD_TASKS_SA_EMAIL` | `cloud-tasks-enqueuer@...` | Service account for OIDC signing |
| `CLOUD_TASKS_WORKER_URL` | `https://.../api/cloud-tasks-worker` | Full HTTPS URL for task dispatch |
| `GOOGLE_APPLICATION_CREDENTIALS_JSON` | `{...}` (single-line) | SA key for CloudTasksClient auth |

**Vercel note:** Store `GOOGLE_APPLICATION_CREDENTIALS_JSON` as a single-line JSON string (Vercel env vars are single-line). Use `JSON.stringify(keyObject)` or remove all newlines.

## GCP Setup (one-time)

Run `scripts/create-cloud-tasks-queue.sh` or manually:

```bash
# Enable Cloud Tasks API first (required before any other commands)
gcloud services enable cloudtasks.googleapis.com --project=stagenameclub

# Service account with two roles
gcloud iam service-accounts create cloud-tasks-enqueuer --project=stagenameclub
gcloud projects add-iam-policy-binding stagenameclub \
  --member="serviceAccount:cloud-tasks-enqueuer@stagenameclub.iam.gserviceaccount.com" \
  --role="roles/cloudtasks.enqueuer"
gcloud projects add-iam-policy-binding stagenameclub \
  --member="serviceAccount:cloud-tasks-enqueuer@stagenameclub.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountTokenCreator"

# Queue — use seconds for durations (NOT "1h" or "5m", use "3600s" and "300s")
gcloud tasks queues create generation-jobs \
  --project=stagenameclub --location=us-central1 \
  --max-dispatches-per-second=5 --max-concurrent-dispatches=3 \
  --max-retry-duration=3600s --max-attempts=3 \
  --min-backoff=30s --max-backoff=300s
```

Generate JSON key:
```bash
gcloud iam service-accounts keys create sa-key.json \
  --iam-account=cloud-tasks-enqueuer@stagenameclub.iam.gserviceaccount.com \
  --project=stagenameclub
```

**Gotchas:**
- **Cloud Tasks API must be enabled first** — `gcloud services enable cloudtasks.googleapis.com` or queue creation will fail.
- **Duration format** — `gcloud tasks queues create` requires durations ending in `s` (e.g. `3600s`, `300s`), NOT `1h` or `5m`.
- **Service account may not exist** — if IAM bindings were applied to a non-existent SA, `gcloud iam service-accounts keys create` will fail with `NOT_FOUND`. Always `create` the SA first, then bind roles, then generate the key.
- **Vercel env var `GOOGLE_APPLICATION_CREDENTIALS_JSON`** — set via Vercel Dashboard (CLI `vercel env add` is interactive). Paste the JSON key as a single-line string, keeping `\n` inside the private key as literal escape sequences.
- **`CLOUD_TASKS_WORKER_URL`** — set to your production URL after the first deploy (e.g. `https://stagename-club.vercel.app/api/cloud-tasks-worker`). Local dev can use `http://localhost:3000/api/cloud-tasks-worker`.

## Migration Sequence

1. Create SA + queue (script above)
2. Generate JSON key
3. Deploy code (new cloud-tasks-service, cloud-tasks-worker, modified payment-service)
4. Add env vars to Vercel
5. Test: complete payment → verify via `gcloud tasks list --queue=generation-jobs --location=us-central1`
6. Drain existing Firestore queue (hit old `/api/queue-worker` until empty)
7. Disable Vercel Cron in dashboard (Project → Settings → Cron Jobs)

## Keep Old Queue for Safety

Keep `app/api/queue-worker/route.ts` and `lib/services/queue-service.ts` for:
- Local development (Cloud Tasks requires GCP auth, not ideal for local)
- Manual re-runs of failed jobs
- Drain period during migration

## Verification Commands

```bash
gcloud tasks queues describe generation-jobs --project=stagenameclub --location=us-central1
gcloud tasks list --queue=generation-jobs --location=us-central1 --project=stagenameclub
gcloud logging read 'resource.type="cloud_task" AND resource.labels.queue_id="generation-jobs"' --project=stagenameclub --limit=10
```
