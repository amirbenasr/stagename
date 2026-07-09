#!/bin/bash
# ============================================================
# Cloud Tasks Queue Setup — Idempotent
# ============================================================
# Creates the service account, grants IAM roles, and creates the
# Cloud Tasks queue for the stagename.club generation pipeline.
#
# Usage:
#   chmod +x scripts/create-cloud-tasks-queue.sh
#   ./scripts/create-cloud-tasks-queue.sh
#
# Requires: gcloud CLI authenticated with owner/editor role on the project.
# ============================================================

set -e

PROJECT="stagenameclub"
LOCATION="us-central1"
QUEUE="generation-jobs"
SA_NAME="cloud-tasks-enqueuer"
SA_EMAIL="${SA_NAME}@${PROJECT}.iam.gserviceaccount.com"

echo "=== Cloud Tasks Setup for ${PROJECT} ==="

# --- Service Account ---
echo ""
echo "Creating service account: ${SA_EMAIL}..."
gcloud iam service-accounts create "${SA_NAME}" \
  --display-name="Cloud Tasks Enqueuer" \
  --project="${PROJECT}" 2>/dev/null \
  || echo "  (service account already exists, skipping)"

echo "Granting roles/cloudtasks.enqueuer..."
gcloud projects add-iam-policy-binding "${PROJECT}" \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/cloudtasks.enqueuer" \
  --quiet 2>/dev/null \
  || echo "  (binding already exists, skipping)"

echo "Granting roles/iam.serviceAccountTokenCreator..."
gcloud projects add-iam-policy-binding "${PROJECT}" \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/iam.serviceAccountTokenCreator" \
  --quiet 2>/dev/null \
  || echo "  (binding already exists, skipping)"

# --- Queue ---
echo ""
echo "Creating Cloud Tasks queue: ${QUEUE} in ${LOCATION}..."
gcloud tasks queues create "${QUEUE}" \
  --project="${PROJECT}" \
  --location="${LOCATION}" \
  --max-dispatches-per-second=5 \
  --max-concurrent-dispatches=3 \
  --max-retry-duration=1h \
  --max-attempts=3 \
  --min-backoff=30s \
  --max-backoff=5m 2>/dev/null \
  || echo "  (queue already exists, skipping)"

# --- Summary ---
echo ""
echo "=== Setup Complete ==="
echo ""
echo "Service Account: ${SA_EMAIL}"
echo "Queue: projects/${PROJECT}/locations/${LOCATION}/queues/${QUEUE}"
echo ""
echo "Next steps:"
echo "  1. Generate a JSON key for ${SA_EMAIL}:"
echo "     gcloud iam service-accounts keys create sa-key.json \\"
echo "       --iam-account=${SA_EMAIL} --project=${PROJECT}"
echo ""
echo "     (Or via Google Cloud Console → IAM → Service Accounts → Keys)"
echo ""
echo "  2. Add env vars to Vercel:"
echo "     GCP_PROJECT_ID=${PROJECT}"
echo "     CLOUD_TASKS_LOCATION=${LOCATION}"
echo "     CLOUD_TASKS_SA_EMAIL=${SA_EMAIL}"
echo "     CLOUD_TASKS_WORKER_URL=https://your-domain.com/api/cloud-tasks-worker"
echo "     GOOGLE_APPLICATION_CREDENTIALS_JSON=$(cat sa-key.json | tr -d '\n' | python3 -c 'import sys,json; print(json.dumps(sys.stdin.read()))' 2>/dev/null || echo '<paste single-line JSON>')"
echo ""
echo "  3. Deploy code and test with a payment"
