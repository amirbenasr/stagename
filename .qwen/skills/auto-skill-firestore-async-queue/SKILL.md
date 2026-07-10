---
name: firestore-async-queue
description: Firestore-based async job queue pattern for long-running operations — enqueue on event, process via worker endpoint, retry on failure, client-side polling for status
source: auto-skill
extracted_at: '2026-07-09T17:30:00.000Z'
---

## Firestore-Based Async Job Queue

When a user triggers a long-running server operation (e.g. AI generation, video processing, batch tasks) and should be able to leave the page and come back later, use a Firestore-based job queue instead of fire-and-forget `fetch()`.

### Why Not Fire-and-Fetch

The naive pattern:
```typescript
// In webhook or payment handler:
fetch(`${siteUrl}/api/generate`, { method: 'POST', body: JSON.stringify({ id }) })
  .catch(console.error);
```

Problems:
- No retry on failure (network glitch, timeout, AI provider down)
- No way for the client to check progress
- No audit trail of what was attempted
- If the server process dies mid-request, the work is lost forever

### Architecture

```
Event (webhook, payment, user action)
  → enqueue job in Firestore (status: "pending")
  → return 200 immediately

Worker endpoint (GET /api/queue-worker)
  → dequeueOne (atomic: find oldest pending, mark processing)
  → execute the actual work
  → on success: mark complete, store result reference
  → on failure: mark failed OR reset to pending for retry (up to N attempts)

Client polling (brand kit page, dashboard)
  → poll the result endpoint every 5s
  → show loading state until status becomes "complete"
  → stop polling after N attempts or timeout
```

### Firestore Collection Schema

```typescript
// collection: generationJobs
{
  submissionId: string;    // the entity being processed
  status: "pending" | "processing" | "complete" | "failed";
  attempts: number;        // starts at 0, incremented on retry
  error?: string;          // last error message
  brandKitSlug?: string;   // result reference (set on complete)
  createdAt: string;       // ISO timestamp
  updatedAt: string;       // ISO timestamp
}
```

### Queue Service Implementation

```typescript
const COLLECTION = "generationJobs";

async function getDb() {
  const { requireDb } = await import("../firebase-admin");
  return requireDb();
}

export const queueService = {
  async enqueue(submissionId: string): Promise<GenerationJob> {
    const db = await getDb();
    const now = new Date().toISOString();
    const doc = { submissionId, status: "pending", attempts: 0, createdAt: now, updatedAt: now };
    const ref = await db.collection(COLLECTION).add(doc);
    return jobFromDoc(doc, ref.id);
  },

  async dequeueOne(): Promise<GenerationJob | null> {
    const db = await getDb();

    // Use transaction to prevent race conditions with concurrent workers
    return db.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(
        db
          .collection(COLLECTION)
          .where("status", "==", "pending")
          .orderBy("createdAt", "asc")
          .limit(1)
      );

      if (snapshot.empty) return null;

      const doc = snapshot.docs[0];
      const data = doc.data();
      const job = jobFromDoc(data, doc.id);

      // Mark as processing atomically within the transaction
      transaction.update(doc.ref, {
        status: "processing",
        updatedAt: new Date().toISOString(),
      });

      return { ...job, status: "processing" };
    });
  },

  async complete(jobId: string, resultRef: string): Promise<void> {
    const db = await getDb();
    await db.collection(COLLECTION).doc(jobId).update({
      status: "complete",
      brandKitSlug: resultRef,  // or whatever result reference you need
      updatedAt: new Date().toISOString(),
    });
  },

  async fail(jobId: string, error: string): Promise<void> {
    const db = await getDb();
    const doc = await db.collection(COLLECTION).doc(jobId).get();
    if (!doc.exists) return;

    const currentAttempts = (doc.data()?.attempts as number) ?? 0;
    const maxAttempts = 3;

    if (currentAttempts >= maxAttempts) {
      await doc.ref.update({ status: "failed", error, updatedAt: new Date().toISOString() });
    } else {
      // Retry: reset to pending so next worker picks it up
      await doc.ref.update({
        status: "pending",
        attempts: currentAttempts + 1,
        updatedAt: new Date().toISOString(),
      });
    }
  },

  async findBySubmissionId(submissionId: string): Promise<GenerationJob | null> {
    const db = await getDb();
    const snapshot = await db.collection(COLLECTION)
      .where("submissionId", "==", submissionId)
      .limit(1).get();
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return jobFromDoc(doc.data(), doc.id);
  },
};
```

### Worker Endpoint

```typescript
// app/api/queue-worker/route.ts
export async function GET(_request: NextRequest): Promise<NextResponse> {
  try {
    const job = await queueService.dequeueOne();
    if (!job) {
      return NextResponse.json({ message: "No pending jobs" }, { status: 200 });
    }

    try {
      const result = await executeTheActualWork(job.submissionId);
      await queueService.complete(job.id, result.slug);
      return NextResponse.json({ message: "Job completed", jobId: job.id });
    } catch (pipelineError) {
      const message = pipelineError instanceof Error ? pipelineError.message : "Unknown";
      await queueService.fail(job.id, message);
      throw pipelineError;
    }
  } catch (error) {
    return NextResponse.json({ error: "Worker failed" }, { status: 500 });
  }
}
```

### Trigger from Event Handler

```typescript
// In payment webhook or similar:
async function triggerGenerationPipeline(submissionId: string): Promise<void> {
  await queueService.enqueue(submissionId);
  console.log(`Generation job enqueued for submission ${submissionId}`);
}
```

### Client-Side Polling

```typescript
// In the page that shows results:
const pollRef = useRef(0);

useEffect(() => {
  if (!slug || loading || brandKit?.names.length) return;

  const interval = setInterval(async () => {
    pollRef.current += 1;
    if (pollRef.current > 60) { clearInterval(interval); return; } // 5min timeout

    try {
      const res = await fetch(`/api/brand-kit/${slug}`);
      if (res.ok) {
        const data = await res.json();
        if (data.names?.length > 0) {
          setBrandKit(data);
          clearInterval(interval);
        }
      }
    } catch { /* silent */ }
  }, 5000);

  return () => clearInterval(interval);
}, [slug, loading, brandKit?.names?.length]);
```

**Critical**: Use `useRef` for the poll counter, NOT `useState` — prevents interval reset on every render.

### Worker Execution

The worker endpoint must be triggered somehow:

- **Manual**: User or admin hits `GET /api/queue-worker`
- **Cron**: Set up Vercel Cron, GitHub Actions scheduled workflow, or external cron service to hit the endpoint every 1-5 minutes
- **Self-triggering**: After completing one job, the worker could check for another (but be careful of infinite loops and serverless timeout limits)

### Retry Logic

The `fail` method resets the job to `"pending"` if attempts < max, so the next `dequeueOne` call will pick it up again. This means:
- Transient failures (AI provider timeout, network error) are automatically retried
- Permanent failures (invalid data, missing submission) will eventually hit max attempts and be marked `"failed"`
- Set `maxAttempts = 3` as a reasonable default

### Pitfalls

- **Race condition with concurrent workers** — two workers could theoretically dequeue the same job if they read before either writes. **Fix:** Use `db.runTransaction()` to make the read+update atomic. Without a transaction, concurrent workers will process the same job twice.
- **Serverless timeout** — if the worker runs on Vercel serverless functions, it has a max timeout (10s on hobby, 60s on pro). For long-running jobs (AI generation can take 2-5 minutes), this won't work on serverless. Use a dedicated worker server, Vercel Cron with longer timeout, or split the work into smaller chunks.
- **Polling the result, not the queue** — the client should poll the result endpoint (e.g. `/api/brand-kit/{slug}`) rather than the queue status endpoint. The result endpoint returning data is the true signal that work is complete.
- **Parallel execution** — Vercel serverless auto-scales, so multiple workers can run concurrently. With the transaction-based dequeue, each worker gets a unique job. Hobby plan allows 10 concurrent, Pro allows 100. Requests beyond the limit queue briefly, not fail.