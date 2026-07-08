---
name: firebase-storage-setup
description: End-to-end Firebase Storage + Firestore setup for Next.js — config files, security rules, dual SDK pattern (client uploads + admin server ops), env vars, and deployment sequence
source: auto-skill
extracted_at: '2026-07-07T15:51:06.032Z'
---

## Firebase Storage Setup for Next.js

When a project needs user file uploads (images, audio) stored in Firebase Storage, follow this setup sequence.

### Architecture: Dual SDK Pattern

Use **two separate Firebase SDKs** for different purposes:

| SDK | Where | Purpose |
|-----|-------|---------|
| `firebase` (client) | Browser components | Direct uploads to Storage from the user's browser |
| `firebase-admin` (server) | API routes | Server-side reads, metadata updates, admin operations |

Client-side uploads bypass your Next.js API entirely — the browser uploads directly to Firebase Storage using the client SDK, then stores the resulting URL in Firestore.

### Required Files

#### 1. `.firebaserc` — project alias

```json
{
  "projects": {
    "default": "<your-project-id>"
  }
}
```

#### 2. `firebase.json` — CLI config pointing to rules

```json
{
  "storage": {
    "rules": "storage.rules"
  }
}
```

#### 3. `storage.rules` — security rules with type/size validation

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /selfies/{fileId} {
      allow write: if request.resource.size < 10 * 1024 * 1024
                   && request.resource.contentType.matches('image/.*');
      allow read: if true;
    }
    match /music/{fileId} {
      allow write: if request.resource.size < 25 * 1024 * 1024
                   && request.resource.contentType.matches('audio/.*');
      allow read: if true;
    }
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

Customize folders, size limits, and content types per use case. Always end with a deny-all catch-all rule.

### Environment Variables

Two sets of env vars are needed in `.env.local`:

**Client SDK** (exposed to browser via `NEXT_PUBLIC_` prefix):
```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=<projectId>.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=<projectId>
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=<projectId>.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

**Admin SDK** (server-only, never prefix with `NEXT_PUBLIC_`):
```
FIREBASE_PROJECT_ID=<projectId>
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
```

### Storage Bucket URL — New Format

Firebase projects created after ~2024 use `{projectId}.firebasestorage.app` instead of the old `{projectId}.appspot.com`. Check your Firebase Console → Storage to confirm which format your project uses.

### Setup Sequence

1. **Create Firebase project** in console.firebase.google.com
2. **Enable Storage** in Firebase Console → Storage → "Get Started" (choose region)
3. **Create a web app** in Project Settings → "Your apps" → `</>` icon (gives you the client config values)
4. **Generate service account key** in Project Settings → Service Accounts → "Generate new private key" (gives you `client_email` and `private_key`)
5. **Install Firebase CLI**: `npm install -D firebase-tools`
6. **Login**: `npx firebase login` — this is **interactive** (opens browser, asks Gemini/analytics questions). Cannot be piped or automated. User must run it themselves.
7. **Fill `.env.local`** with values from steps 3-4
8. **Deploy storage rules**: `npx firebase deploy --only storage`

### Pitfalls

- **`firebase login` is interactive** — it prompts for Gemini enablement, analytics consent, then opens a browser. You cannot pipe answers to it. Tell the user to run it manually.
- **Client uploads don't need an API route** — the quiz/form component uploads directly via `firebase/storage` SDK (`uploadBytes` + `getDownloadURL`). No `/api/upload` route needed.
- **`next.config.ts`** must list `firebasestorage.googleapis.com` in `images.remotePatterns` for `<Image>` to display uploaded files, and `firebase-admin` sub-packages in `serverExternalPackages`.
- **Guard admin SDK init** — if env vars are missing, `getFirestore()` throws. Always check `getApps().length > 0` before exporting admin instances.

### Firestore Setup (If Also Using Firestore)

If the project writes documents to Firestore (e.g. form submissions, quiz answers), you **must** also set up Firestore rules and deploy them — otherwise client-side `addDoc`/`set`/`update` will fail silently (default rules are locked).

#### 1. Create `firestore.rules`

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /submissions/{docId} {
      allow create: if true;
      allow read: if true;
      allow update: if false;
      allow delete: if false;
    }
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

#### 2. Add to `firebase.json`

```json
{
  "firestore": {
    "rules": "firestore.rules"
  },
  "storage": {
    "rules": "storage.rules"
  }
}
```

#### 3. Deploy

```bash
npx firebase deploy --only firestore:rules
```

This command also **creates the Firestore database** if it doesn't exist yet (first-time setup).

### Critical Pitfall: Missing Firestore Rules

If you only set up Storage rules and skip Firestore rules:
- **Storage uploads work** (user can upload selfies, files, etc.)
- **Firestore writes fail silently** — `addDoc` throws a permission error, but the catch block may not surface it clearly
- **Symptom**: user reports "stuck on uploading" even though Storage uploads succeeded — it's actually the Firestore `addDoc` that failed
- **Diagnosis**: check browser console for `Missing or insufficient permissions` errors from Firestore
- **Fix**: deploy Firestore rules as described above
