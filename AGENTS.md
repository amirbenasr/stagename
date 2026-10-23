<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# stagename.club — Project Context for Qwen Code

## Overview
AI-powered stage name generator for musicians. Users take a quiz about their identity/vibe, upload a selfie + optional music snippet, pay $14.99, and receive a Brand Kit with 3 AI-generated stage names, studio portrait, logo, and platform availability report.

## Tech Stack
- **Framework:** Next.js 16 (App Router, Turbopack)
- **Database:** Firestore (project: `stagenameclub`)
- **Storage:** Firebase Storage (bucket: `stagenameclub.firebasestorage.app`)
- **AI Provider:** fal.ai (NOT OpenAI directly — `openai` dep is unused)
- **Email:** Resend (`lib/email.ts`)
- **Payments:** Paddle Billing ($14.99 one-time) — provider-agnostic via `lib/payments/` abstraction (Stripe preserved for easy swap-back)
- **Image Gen:** `bytedance/seedream/v5/pro/edit` (portrait/studio/arena, uses selfie as reference), `fal-ai/flux-pro/v1.1` (logo)
- **Video Gen:** two-stage First Take — `bytedance/seedream/v5/pro/edit` (performance frame) → `xai/grok-imagine-video/reference-to-video` (motion)
- **Text Gen:** fal.ai OpenRouter proxy (`openrouter/router/vision`)
- **Styling:** Tailwind v4, holographic/gradient utilities in `globals.css`

## Architecture & File Map

```
app/
  page.tsx                          — Landing page
  quiz/page.tsx                     — Multi-step quiz (11 questions + selfie + music upload)
  claim/[submissionId]/page.tsx     — Payment landing page (from email link)
  success/page.tsx                  — Post-payment polling page
  brand-kit/[slug]/page.tsx         — Brand kit display (names, images, availability)
  pricing/page.tsx                  — Static pricing
  privacy|terms|refund/page.tsx     — Legal pages

  components/
    ProcessingSidebar.tsx           — Slide-in sidebar with fake animation + email gate

  api/
    checkout/route.ts               — POST: creates checkout session via active payment provider
    webhook/route.ts                — POST: payment webhook → triggers generation pipeline
    generate/route.ts               — POST: full AI pipeline (image analysis, 3 names, images, availability)
    send-link/route.ts              — POST: sends claim email via Resend
    session-lookup/route.ts         — GET: polls Firestore by paymentSessionId
    claim/[submissionId]/route.ts   — GET: submission lookup for claim page
    brand-kit/[slug]/route.ts       — GET: brand kit data fetch

lib/
  firebase.ts                       — Client-side Firebase SDK (browser uploads)
  firebase-admin.ts                 — Server-side Admin SDK (Firestore + Storage)
  email.ts                          — Resend client + HTML email templates
  payments/
    types.ts                        — PaymentProvider interface (createCheckoutSession, handleWebhook, lookupSession)
    index.ts                        — Factory: getPaymentProvider() returns active provider based on PAYMENT_PROVIDER env
    stripe.ts                       — Stripe implementation (preserved for easy swap-back)
    paddle.ts                       — Paddle Billing implementation (active)

data/
  quiz-questions.json               — 11 quiz questions (IDs: "1"–"9", "selfie", "music")
```

## User Flow
```
Quiz → Submit (selfie to Storage, answers to Firestore)
  → ProcessingSidebar (fake 8s animation)
  → Email gate → POST /api/send-link → Resend email with /claim link
  → User clicks email → /claim/{submissionId} page
  → Pay $14.99 → Payment Provider Checkout (Paddle/Stripe) → /success?session_id=...
  → Payment webhook → POST /api/webhook → enqueue generation job
  → /api/generate pipeline ("kit" job):
      1. Image analysis (selfie → structured description via vision model)
      2. 3 stage names (3 separate model calls in parallel)
      3. Images for all 3 names in parallel (logo, studio, portrait, arena)
      4. Save kit with `video.status = "rendering"` + email user
      5. Enqueue a separate "video" job (own serverless time budget)
  → "video" job (same worker, different job type):
      6. Compose performance frame → animate → mix audio (TOP NAME ONLY)
      7. Attach the finished First Take to the kit
  → User visits /brand-kit/{slug} (polls while video.status === "rendering")
```

## Critical Patterns

### Quiz Answer Key Mapping
Quiz stores answers under numeric keys (`"1"`, `"2"`, etc.) but the generate API expects semantic keys. The mapping is in `quiz/page.tsx`:
```
"1"→artistName, "2"→genre, "3"→origin, "4"→platforms, "5"→vibe,
"6"→persona, "7"→drive, "8"→visualWorld, "9"→languages
```

### fal.ai OpenRouter Response Parsing
The OpenRouter proxy returns deeply nested JSON. `callOpenRouter` in `generate/route.ts` uses `unwrapJsonString()` to recursively extract text content:
- Text responses: extracts `.data.output` or `.output` text
- Structured responses (name generation): returns JSON string for caller to parse
- Image analysis: returns plain text description

**Important:** NOT all models on OpenRouter support vision. Currently only the image analysis call uses `image_urls`. Name generation models are text-only.

### Image Generation with Selfie Reference
Portrait, studio and arena photos use `bytedance/seedream/v5/pro/edit`:
```javascript
fal.subscribe("bytedance/seedream/v5/pro/edit", {
  input: { prompt: "...", image_urls: [selfieUrl] }
});
```
- Parameter is `image_urls` (array), NOT `image_url`
- Do NOT pass `strength` — not supported, causes 422 error
- Logo uses `fal-ai/flux-pro/v1.1` (text-to-image, no selfie needed)

### The First Take Video (two-stage)
`lib/ai/video/` renders the performance clip for the TOP NAME ONLY, once per kit.

1. **Direction** (`direction.ts`) reuses the creative engine (scene, fashion, lighting) and adds genre-specific performance energy, BPM and camera movement.
2. **Frame** (`provider.ts`) renders a composed 16:9 performance still of the artist at a condenser mic using the same seedream edit model as the portraits. If the endpoint rejects `image_size`, it retries without it.
3. **Motion** animates that frame with `xai/grok-imagine-video/reference-to-video` (`reference_image_urls: [frameUrl]`). Animating a controlled still is far more stable than asking a video model to invent a scene from a selfie.
4. **Audio** (`music.ts`) prefers the artist's uploaded track, then `MUSIC_LIBRARY_JSON`, then the model's own audio. Muxing uses `fal-ai/ffmpeg-api/merge-audio-video`; if that fails the player syncs the track as a separate `<audio>` element, so the clip is never silent.
5. **Persistence** saves `first-take.mp4` + `first-take-poster.jpg` to Firebase Storage.

Progressive delivery: the kit is saved with `video.status = "rendering"` as soon as images are ready, then `brandKitRepository.updateVideo(slug, …)` attaches the finished clip. `app/components/FirstTakePlayer.tsx` polls while rendering.

Endpoint overrides (all optional):
```
FAL_VIDEO_FRAME_MODEL   default bytedance/seedream/v5/pro/edit
FAL_VIDEO_MODEL         default xai/grok-imagine-video/reference-to-video
FAL_VIDEO_MUX_MODEL     default fal-ai/ffmpeg-api/merge-audio-video
FAL_VIDEO_RESOLUTION    default 720p
MUSIC_LIBRARY_JSON      {"hip-hop":{"url":"...","title":"Booth 90"},"default":{...}}
```
`FAL_VIDEO_MODEL` also accepts `*-image-to-video` endpoints — the provider switches `reference_image_urls` to `image_url` automatically.

### Share Kit & Open Graph images
Generated on demand with `next/og` (Satori). No binary assets to maintain.

| Route | Purpose |
|-------|---------|
| `app/opengraph-image.tsx` | Static 1200×630 home card |
| `app/brand-kit/[slug]/opengraph-image.tsx` | Per-kit 1200×630 card using the First Take poster (falls back to portrait/arena) |
| `app/brand-kit/[slug]/layout.tsx` | Per-kit `<title>` / description / OG metadata |
| `app/api/share-card/[slug]/route.tsx?format=story|profile` | Downloadable 1080×1920 story card / 1080×1080 post card |

- `lib/media/kit-image.ts` fetches the chosen image, resizes it with **sharp** and returns a compressed data URI for Satori. Any failure returns `null` and the card renders typographically.
- `FirstTakePlayer` links to both share cards and offers copy-link / native share.
- `sharp` must stay in `serverExternalPackages` (`next.config.ts`).
- Images are compressed before embedding so the OG route stays fast; the 500KB Satori bundle limit applies to code/fonts, not runtime images.

### Firebase Storage for Generated Images
All generated images are downloaded from fal.ai and saved to Firebase Storage:
```
brandkits/{submissionId}/portrait.jpg
brandkits/{submissionId}/logo.jpg
brandkits/{submissionId}/studio.jpg
```
Uses `adminStorage.bucket(BUCKET).file(path).save(buffer, { public: true })`.
Falls back to fal.ai URL if storage fails.

### Resend Email — Lazy Initialization
`lib/email.ts` uses factory functions (`getResend()`, `getFromEmail()`) instead of module-level constants to avoid build-time crashes when env vars are missing.

### Stripe Webhook for Local Dev
Run `stripe listen --forward-to localhost:3000/api/webhook` and use the CLI's `whsec_` secret (not the dashboard one).

### Polling Pattern (success page)
Use `useRef` for poll counter, NOT `useState` — prevents interval reset on every render:
```javascript
const pollRef = useRef(0);
// increment: pollRef.current += 1 (no re-render)
```

## Firestore Collections

### `submissions`
```javascript
{
  answers: { artistName, genre, origin, platforms, vibe, persona, drive, visualWorld, languages },
  selfieUrl: string,        // Firebase Storage download URL
  musicUrl: string,        // Firebase Storage download URL (optional)
  email: string,           // Set by /api/send-link
  status: string,          // "pending" → "paid" → "complete"
  paymentSessionId: string, // Set by webhook (Paddle transaction ID or Stripe session ID)
  brandKitSlug: string,    // Set after generation
  createdAt: string
}
```

### `brandKits`
```javascript
{
  submissionId: string,
  slug: string,            // UUID first 8 chars
  names: [{
    name, reason, model,
    portraitImageUrl, logoImageUrl, studioPhotoUrl, arenaImageUrl,
    availability: { spotify, instagram, soundcloud }
  }],
  genre: string,
  vibe: string,
  musicUrl?: string,       // artist's uploaded snippet
  video?: {                // The First Take (top name only)
    status: "rendering" | "ready" | "failed",
    url?: string,
    posterUrl?: string,
    musicUrl?: string,
    musicSource?: "artist" | "library" | "none",
    musicMuxed?: boolean,
    durationSeconds?: number,
    aspectRatio?: string,
    model?: string,
    error?: string,
    startedAt?: string,
    updatedAt?: string
  },
  videoUrl?: string,       // @deprecated legacy interview clip
  interviewScript?: [],    // @deprecated legacy captions
  status: "complete",
  createdAt: string
}
```

## Environment Variables
See `.env.local` for all vars. Key ones:
- `PAYMENT_PROVIDER` — `"paddle"` or `"stripe"` (default: paddle)
- `PADDLE_API_KEY`, `PADDLE_WEBHOOK_SECRET`, `PADDLE_PRICE_ID`, `PADDLE_ENVIRONMENT` — Paddle Billing
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` — Stripe (commented out by default, uncomment to swap back)
- `FAL_KEY` — fal.ai API key
- `FAL_VIDEO_FRAME_MODEL`, `FAL_VIDEO_MODEL`, `FAL_VIDEO_MUX_MODEL`, `FAL_VIDEO_RESOLUTION` — First Take overrides (optional)
- `MUSIC_LIBRARY_JSON` — genre → licensed audio URL map for the auto soundbed (optional)
- `RESEND_API_KEY` — Resend email
- `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` — Firebase Admin SDK
- `NEXT_PUBLIC_FIREBASE_*` — Firebase client SDK

## Security Rules
- **Firestore** (`firestore.rules`): submissions allow create+read, brandKits read-only, all else denied
- **Storage** (`storage.rules`): selfies/music allow upload+read (< size limits), brandkits read-only, all else denied
- Deploy: `npx firebase deploy --only firestore:rules` / `--only storage`

## AI Models (via fal.ai)
| Purpose | Endpoint | Model |
|---------|----------|-------|
| Image analysis | `openrouter/router/vision` | `google/gemini-2.5-flash` |
| Name 1 (Linguistic) | `openrouter/router/vision` | `deepseek/deepseek-v4-flash` |
| Name 2 (Cultural) | `openrouter/router/vision` | `openai/gpt-5.5` |
| Name 3 (Market) | `openrouter/router/vision` | `google/gemini-3-flash-preview` |
| Portrait | `bytedance/seedream/v5/pro/edit` | — (selfie reference) |
| Studio photo | `bytedance/seedream/v5/pro/edit` | — (selfie reference) |
| Arena photo | `bytedance/seedream/v5/pro/edit` | — (selfie reference) |
| Logo | `fal-ai/flux-pro/v1.1` | — (text-to-image) |
| First Take frame | `bytedance/seedream/v5/pro/edit` | — (selfie reference) |
| First Take motion | `xai/grok-imagine-video/reference-to-video` | — (frame reference) |
| First Take audio mux | `fal-ai/ffmpeg-api/merge-audio-video` | — (best-effort) |

## Known Gotchas
1. **fal.ai OpenRouter vision**: Not all models support `image_urls`. Only pass images to vision-capable models.
2. **fal.ai image edit models**: Use `image_urls` (array), no `strength` param.
3. **First Take timeouts**: frame ≈ 30–60s, motion ≈ 1–3 min. The kit is saved before the video finishes, so a timeout leaves `video.status = "rendering"` rather than losing the sale. Give the worker enough `maxDuration`.
4. **First Take music**: muxing is best-effort. If `FAL_VIDEO_MUX_MODEL` fails, the MP4 keeps its native audio and `FirstTakePlayer` syncs `video.musicUrl` as a separate audio track (`musicMuxed: false`).
5. **First Take model family**: `FAL_VIDEO_MODEL` must contain `reference-to-video` or `image-to-video` so the input shape matches; anything else gets both shapes and may 422.
6. **Firebase Admin SDK**: Falls back to ADC if no service account key. Needs `gcloud auth application-default login` locally or service account key for prod.
7. **Resend**: Domain must be verified in Resend dashboard before sending from custom domain.
8. **Quiz `handleSubmit`**: Must call `setSubmitting(false)` on BOTH success and error paths.
9. **Firestore rules**: Must be deployed (`npx firebase deploy --only firestore:rules`) or client-side writes fail silently.
10. **Paddle checkout**: Requires "Default Payment Link" set in Paddle Dashboard → Checkout → Settings before transactions can be created.
11. **Paddle webhook**: Webhook secret is generated when creating a notification destination in Paddle Dashboard. Set it as `PADDLE_WEBHOOK_SECRET`.
12. **Payment provider swap**: Change `PAYMENT_PROVIDER` env var + uncomment/comment the relevant provider keys. No code changes needed.
