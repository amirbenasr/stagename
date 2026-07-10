---
name: vercel-external-module
description: Vercel serverless cannot bundle @google-cloud/tasks or similar packages with proto/binary files — use Firestore queue fallback pattern (project)
source: auto-skill
extracted_at: '2026-07-10T09:43:00.000Z'
---

# Vercel Serverless External Module Limitation

`@google-cloud/tasks` (and similar Google Cloud client libraries) **cannot run in Vercel serverless functions** because they depend on proto files (`protos.json`) that Vercel's bundler strips during the build process.

## The Problem

- **Static import**: `import { CloudTasksClient } from "@google-cloud/tasks"` — Vercel bundler tries to resolve the full dependency tree, fails on `protos.json`
- **serverExternalPackages**: Adding to `next.config.ts` `serverExternalPackages` doesn't help — Vercel doesn't install `node_modules` the same way, proto files are still missing
- **Dynamic import**: `await import("./cloud-tasks-service")` — initially works locally but fails on Vercel with: `Cannot find module '/var/task/node_modules/@google-cloud/tasks/build/protos/protos.json'`

## The Pattern: Graceful Degradation

Wrap the Cloud Tasks call in a try/catch with dynamic import so the **primary flow (payment) always succeeds** even if the async job enqueue fails:

```typescript
async triggerGenerationPipeline(submissionId: string): Promise<void> {
  try {
    const { cloudTasksService } = await import("./cloud-tasks-service");
    await cloudTasksService.enqueueGenerationJob(submissionId);
    console.log(`✓ Generation job enqueued via Cloud Tasks for submission ${submissionId}`);
  } catch (error) {
    console.error("Failed to enqueue Cloud Tasks job (non-blocking):", error);
    // Don't throw — payment already succeeded, generation can be retried manually
  }
}
```

This ensures:
1. `/api/checkout` and `/api/webhook` always return 200
2. Payment is never blocked by async infrastructure
3. Failed enqueues can be retried manually via the Firestore queue worker

## Alternative: Pure Firestore Queue

If Cloud Tasks can't be made to work on Vercel at all, fall back to the Firestore-based async queue pattern (`firestore-async-queue` skill) with Vercel Cron triggering `/api/queue-worker` every 1-5 minutes. This has zero external dependencies.

## Affected Packages

This limitation applies to any Google Cloud client library that bundles proto files:
- `@google-cloud/tasks`
- `@google-cloud/pubsub`
- `@google-cloud/bigquery`
- Similar gRPC-based clients

These work fine on GCP Cloud Functions or dedicated servers, but **not on Vercel serverless**.
