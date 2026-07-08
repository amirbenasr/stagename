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

## Template Method Pattern to Eliminate HTML Duplication

When you have multiple email templates that share a common shell (header, CTA button, footer), use the **Template Method** pattern instead of duplicating the inline HTML:

```typescript
interface EmailTemplateInput {
  header: string;
  subtitle: string;
  bodyHtml: string;
  ctaUrl: string;
  ctaLabel: string;
  footerHtml?: string;
}

const EMAIL_STYLES = {
  shell: `font-family: Georgia, serif; max-width: 520px; margin: 0 auto; color: #1a1a1a;`,
  ctaButton: `
    display: inline-block;
    background: linear-gradient(135deg, #e879a8, #a855f7);
    color: white;
    text-decoration: none;
    padding: 16px 40px;
    border-radius: 50px;
    font-size: 15px;
    font-weight: 700;
    letter-spacing: 0.5px;
    text-transform: uppercase;
  `,
} as const;

function buildEmailShell(input: EmailTemplateInput): string {
  return `
    <div style="${EMAIL_STYLES.shell}">
      <div style="text-align: center; padding: 40px 20px 20px;">
        <h1 style="font-size: 28px; font-weight: 600; margin-bottom: 8px;">${input.header}</h1>
        <p style="font-size: 15px; color: #666; line-height: 1.6;">${input.subtitle}</p>
      </div>
      ${input.bodyHtml}
      <div style="text-align: center; padding: 20px 0 40px;">
        <a href="${input.ctaUrl}" style="${EMAIL_STYLES.ctaButton}">${input.ctaLabel}</a>
        ${input.footerHtml ? `<p style="font-size: 12px; color: #999; margin-top: 16px;">${input.footerHtml}</p>` : ""}
      </div>
    </div>
  `;
}
```

Then each email becomes a thin wrapper:

```typescript
export async function sendClaimEmail(email: string, submissionId: string): Promise<void> {
  const claimUrl = `${getSiteUrl()}/claim/${submissionId}`;

  await getResend().emails.send({
    from: `stagename.club <${getFromEmail()}>`,
    to: email,
    subject: "Your 3 identities are waiting to be revealed",
    html: buildEmailShell({
      header: "We found 3 available identities for you",
      subtitle: "Our AI has analyzed your vibe, your look, and cross-referenced global platform availability.",
      bodyHtml: buildBlurredCards(), // reusable component
      ctaUrl: claimUrl,
      ctaLabel: "Unlock Your Brand Kit — $14.99",
      footerHtml: "Includes 3 stage names, studio portrait, logo, and platform availability report.",
    }),
  });
}
```

This eliminates the 40-60 lines of duplicated HTML per email template, centralizes all styling in `EMAIL_STYLES`, and makes the actual email content easy to read and modify.

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
