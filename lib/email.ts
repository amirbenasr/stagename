import { Resend } from "resend";

function getResend(): Resend {
  return new Resend(process.env.RESEND_API_KEY);
}

function getFromEmail(): string {
  return process.env.FROM_EMAIL || "hello@stagename.club";
}

function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}

// ============================================================
// Email Template — Template Method Pattern
// ============================================================

interface EmailTemplateInput {
  header: string;
  subtitle: string;
  bodyHtml: string;
  ctaUrl: string;
  ctaLabel: string;
  footerHtml?: string;
}

const EMAIL_STYLES = {
  shell: `
    font-family: Georgia, serif;
    max-width: 520px;
    margin: 0 auto;
    color: #1a1a1a;
  `,
  header: `
    text-align: center;
    padding: 40px 20px 20px;
  `,
  title: `
    font-size: 28px;
    font-weight: 600;
    margin-bottom: 8px;
  `,
  subtitle: `
    font-size: 15px;
    color: #666;
    line-height: 1.6;
  `,
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
  ctaWrapper: `
    text-align: center;
    padding: 20px 0 40px;
  `,
  footerNote: `
    font-size: 12px;
    color: #999;
    margin-top: 16px;
  `,
  blurredCardContainer: `
    background: #f8f6f3;
    border: 1px solid #e5e0da;
    border-radius: 16px;
    padding: 28px;
    margin: 20px 0;
  `,
  blurredCard: `
    background: white;
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 12px;
    border: 1px solid #eee;
  `,
  blurredName: `
    font-size: 18px;
    font-weight: 600;
    margin: 0;
  `,
  blurredReason: `
    font-size: 13px;
    color: #999;
    margin: 6px 0 0;
  `,
} as const;

function buildEmailShell(input: EmailTemplateInput): string {
  return `
    <div style="${EMAIL_STYLES.shell}">
      <div style="${EMAIL_STYLES.header}">
        <h1 style="${EMAIL_STYLES.title}">${input.header}</h1>
        <p style="${EMAIL_STYLES.subtitle}">${input.subtitle}</p>
      </div>

      ${input.bodyHtml}

      <div style="${EMAIL_STYLES.ctaWrapper}">
        <a href="${input.ctaUrl}" style="${EMAIL_STYLES.ctaButton}">
          ${input.ctaLabel}
        </a>
        ${input.footerHtml ? `<p style="${EMAIL_STYLES.footerNote}">${input.footerHtml}</p>` : ""}
      </div>
    </div>
  `;
}

function buildBlurredCards(): string {
  return `
    <div style="${EMAIL_STYLES.blurredCardContainer}">
      <div style="filter: blur(6px); pointer-events: none; user-select: none;">
        ${[1, 2, 3]
          .map(
            () => `
          <div style="${EMAIL_STYLES.blurredCard}">
            <p style="${EMAIL_STYLES.blurredName}">████████ ██████</p>
            <p style="${EMAIL_STYLES.blurredReason}">AI-generated reason...</p>
          </div>
        `
          )
          .join("")}
      </div>
    </div>
  `;
}

// ============================================================
// Public API
// ============================================================

export async function sendClaimEmail(email: string, submissionId: string): Promise<void> {
  const claimUrl = `${getSiteUrl()}/claim/${submissionId}`;

  await getResend().emails.send({
    from: `stagename.club <${getFromEmail()}>`,
    to: email,
    subject: "Your 3 identities are waiting to be revealed",
    html: buildEmailShell({
      header: "We found 3 available identities for you",
      subtitle:
        "Our AI has analyzed your vibe, your look, and cross-referenced global platform availability. Your personalized Brand Kit is locked and ready.",
      bodyHtml: buildBlurredCards(),
      ctaUrl: claimUrl,
      ctaLabel: "Unlock Your Brand Kit — $14.99",
      footerHtml: "Includes 3 stage names, studio portrait, logo, and platform availability report.",
    }),
  });
}

export async function sendBrandKitReadyEmail(email: string, brandKitSlug: string): Promise<void> {
  const kitUrl = `${getSiteUrl()}/brand-kit/${brandKitSlug}`;

  await getResend().emails.send({
    from: `stagename.club <${getFromEmail()}>`,
    to: email,
    subject: "Your Artist Brand Kit is ready!",
    html: buildEmailShell({
      header: "Your Brand Kit is Live ✨",
      subtitle:
        "Your personalized Artist Debut Kit has been generated. It includes your 3 stage names, a studio portrait, a custom logo, and a full platform availability report.",
      bodyHtml: "",
      ctaUrl: kitUrl,
      ctaLabel: "View Your Brand Kit",
      footerHtml: "This link is unique to you. Share it only with people you trust.",
    }),
  });
}