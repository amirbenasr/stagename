---
name: turbopack-resolve-debug
description: Debugging methodology for Turbopack "Can't resolve" errors in Next.js — distinguishing path issues from package resolution issues, and specific package API notes
source: auto-skill
extracted_at: '2026-07-07T09:54:19.244Z'
---

## Debugging Turbopack "Can't resolve" Errors

When `next build` (Turbopack) reports `Module not found: Can't resolve '...'`, the error message alone doesn't tell you whether the problem is a **wrong relative import path** or a **npm package bundling issue**. Six failed attempts targeting package resolution were made before discovering the real problem was always just wrong path depth.

### Step 1: Isolate the problem with a diagnostic test

Before trying `serverExternalPackages`, `resolveAlias`, `eval('require')`, or other bundling workarounds, run this diagnostic:

1. Replace the target file's content with the simplest possible exports (e.g., `export const X: any = {}`)
2. Remove ALL npm package imports from that file (zero references to the problematic package)
3. Run `npm run build`

**If it still fails** → the import PATH from the consumer file is wrong (Turbopack can't even find the local file). Fix the relative path depth first.

**If it now succeeds** → the path is correct but Turbopack can't handle the npm package. Now consider `serverExternalPackages`, `resolveAlias`, etc.

### Step 2: Calculate relative path depth correctly

In Next.js app directory structure, route files can be surprisingly deep:

```
app/api/generate/route.ts           → 3 dirs deep → ../../../ to reach root
app/api/session-lookup/route.ts     → 3 dirs deep → ../../../
app/api/webhook/route.ts            → 3 dirs deep → ../../../
app/api/brand-kit/[slug]/route.ts   → 4 dirs deep → ../../../../
```

**Common mistake**: Using `../../lib/firebase-admin` from a 3-deep file resolves to `app/lib/firebase-admin` (inside `app/`) instead of the project root `lib/firebase-admin`. Always trace the path: each `../` goes up one directory from the *file's directory*, not from the project root.

### Step 3: Package-specific notes

#### firebase-admin v14 (modular API)
firebase-admin v14 dropped the old namespace API. Use named imports:

```ts
import { initializeApp, getApps, cert } from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
```

**Old (broken):** `admin.apps`, `admin.credential.cert()`, `admin.firestore()`
**New (correct):** `getApps()`, `cert()`, `getFirestore()`, `getStorage()`

Add all sub-packages to `serverExternalPackages`:
```ts
serverExternalPackages: ["firebase-admin", "firebase-admin/firestore", "firebase-admin/storage"]
```

Guard initialization against missing env vars — `getFirestore()` throws if no app was initialized:
```ts
if (projectId && clientEmail && privateKey && !getApps().length) {
  initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
}
const hasApp = getApps().length > 0;
export const adminDb = hasApp ? getFirestore() : null as any;
```

#### @fal-ai/client (named export singleton)
The `fal` singleton is a **named export**, not a default or namespace:

```ts
import { fal } from "@fal-ai/client";   // ✓ correct
import * as fal from "@fal-ai/client";   // ✗ wrong — fal.config won't exist on namespace object
```

`fal.config()` accepts `credentials` as a string. `image_urls` in vision endpoints must be `string[]` (never `undefined`).
