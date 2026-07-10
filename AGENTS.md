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
- **Image Gen:** `fal-ai/flux-2-pro/edit` (portrait/studio, uses selfie as reference), `fal-ai/flux/dev` (logo)
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
  → /api/generate pipeline:
      1. Image analysis (selfie → text description via vision model)
      2. 3 stage names (3 separate model calls in parallel)
      3. Logo (flux/dev, text-to-image)
      4. Studio photo (flux-2-pro/edit, selfie as reference)
      5. Portrait (flux-2-pro/edit, selfie as reference)
      6. Save images to Firebase Storage (brandkits/{submissionId}/)
      7. Simulated platform availability
      8. Save brand kit to Firestore + email user
  → User visits /brand-kit/{slug}
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
Portrait and studio photo use `fal-ai/flux-2-pro/edit`:
```javascript
fal.subscribe("fal-ai/flux-2-pro/edit", {
  input: { prompt: "...", image_urls: [selfieUrl] }
});
```
- Parameter is `image_urls` (array), NOT `image_url`
- Do NOT pass `strength` — not supported, causes 422 error
- Logo uses `fal-ai/flux/dev` (text-to-image, no selfie needed)

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
  stageNames: [{ name, reason, model }],
  portraitImageUrl: string, // Firebase Storage URL
  logoImageUrl: string,     // Firebase Storage URL
  studioPhotoUrl: string,   // Firebase Storage URL
  availability: { [name]: { spotify, appleMusic, instagram, facebook, domainCom } },
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
| Portrait | `fal-ai/flux-2-pro/edit` | — (selfie reference) |
| Studio photo | `fal-ai/flux-2-pro/edit` | — (selfie reference) |
| Logo | `fal-ai/flux/dev` | — (text-to-image) |

## Known Gotchas
1. **fal.ai OpenRouter vision**: Not all models support `image_urls`. Only pass images to vision-capable models.
2. **fal.ai `flux-2-pro/edit`**: Uses `image_urls` (array), no `strength` param.
3. **Firebase Admin SDK**: Falls back to ADC if no service account key. Needs `gcloud auth application-default login` locally or service account key for prod.
4. **Resend**: Domain must be verified in Resend dashboard before sending from custom domain.
5. **Quiz `handleSubmit`**: Must call `setSubmitting(false)` on BOTH success and error paths.
6. **Firestore rules**: Must be deployed (`npx firebase deploy --only firestore:rules`) or client-side writes fail silently.
7. **Paddle checkout**: Requires "Default Payment Link" set in Paddle Dashboard → Checkout → Settings before transactions can be created.
8. **Paddle webhook**: Webhook secret is generated when creating a notification destination in Paddle Dashboard. Set it as `PADDLE_WEBHOOK_SECRET`.
9. **Payment provider swap**: Change `PAYMENT_PROVIDER` env var + uncomment/comment the relevant provider keys. No code changes needed.
