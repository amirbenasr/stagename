---
name: nextjs-resend-email
description: Integrate Resend email into Next.js API routes with lazy initialization to avoid build-time crashes when env vars are missing
source: auto-skill
extracted_at: '2026-07-07T19:18:31.953Z'
---

# Resend Email Integration in Next.js

## The Build-Time Pitfall

API client libraries like **Resend** (and Stripe, etc.) that validate constructor arguments eagerly will **crash during `next build`** if initialized at module level. During build, server-side env vars like `RESEND_API_KEY` are not available, causing:

```
Error: Missing API key. Pass it to the constructor `new Resend("re_123")`
```

This happens because Next.js evaluates all imported modules during the build's "Collecting page data" phase.

## Solution: Lazy Initialization via Getter Functions

**Never** do this at module level:
```ts
// ❌ Crashes during next build
const resend = new Resend(process.env.RESEND_API_KEY);
```

**Always** use lazy getters:
```ts
// ✅ Only instantiated when the function is actually called at runtime
function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

function getFromEmail() {
  return process.env.FROM_EMAIL || "hello@stagename.club";
}

export async function sendEmail(to: string, subject: string, html: string) {
  await getResend().emails.send({
    from: `YourApp <${getFromEmail()}>`,
    to,
    subject,
    html,
  });
}
```

## Two-Email Pattern (Claim Link → Kit Ready)

For gated payment flows, use two separate emails:

1. **Claim email** — sent immediately after quiz/form submission. Contains a link to a `/claim/{id}` page where the user pays.
2. **Completion email** — sent after the webhook triggers and async processing finishes. Contains a link to the final deliverable.

Both should use inline HTML (no React Email or JSX) for maximum email client compatibility.

## Env Vars Required

| Variable | Purpose |
|---|---|
| `RESEND_API_KEY` | API key from resend.com dashboard |
| `FROM_EMAIL` | Verified sender address (e.g. `hello@yourdomain.com`) |
| `NEXT_PUBLIC_SITE_URL` | Base URL for building links in email templates |
