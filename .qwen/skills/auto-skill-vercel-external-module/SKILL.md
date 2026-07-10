---
name: vercel-external-module
description: Vercel serverless cannot bundle packages with proto/binary files (e.g. @google-cloud/tasks) — use GCP Cloud Function triggered by Firestore writes instead
source: auto-skill
extracted_at: '2026-07-10T11:29:24.339Z'
---

# Vercel Serverless External Module Limitation

Packages with proto/binary files (e.g. `@google-cloud/tasks`) **cannot run in Vercel serverless functions**. The solution is to use a GCP Cloud Function triggered by Firestore writes instead.

## The Problem

- **Static import**: Vercel bundler fails on `protos.json`
- **serverExternalPackages**: Doesn't help — Vercel doesn't include full `node_modules`
- **Dynamic import**: `await import(...)` fails with "Cannot find module as expression is too dynamic" or "Cannot find module protos.json"

## The Solution: Firestore Queue + GCP Cloud Function

Instead of calling external APIs from Vercel, write to Firestore and let a GCP Cloud Function handle the external call:

```
Vercel webhook → queueService.enqueue() → Firestore "generationJobs"
                                              ↓
                                    GCP Cloud Function (Eventarc trigger)
                                              ↓
                                    POST /api/queue-worker (Vercel)
```

See the `gcp-cloud-tasks-worker` skill for full implementation details.

## Key Takeaway

If a package has proto files, binary dependencies, or gRPC clients, **don't use it in Vercel**. Write to Firestore instead and trigger a GCP Cloud Function.
