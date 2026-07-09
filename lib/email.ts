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
    font-family: Georgia, "Times New Roman", serif;
    max-width: 520px;
    margin: 0 auto;
    color: #1C1D1F;
    background: #F7F4EF;
    padding: 40px 20px;
  `,
  header: `
    text-align: center;
    padding: 20px 20px 24px;
  `,
  title: `
    font-size: 28px;
    font-weight: 600;
    margin: 0 0 8px;
    color: #1C1D1F;
  `,
  subtitle: `
    font-size: 15px;
    color: #656B73;
    line-height: 1.6;
    margin: 0;
  `,
  ctaButton: `
    display: inline-block;
    background: linear-gradient(135deg, #F15A38 0%, #f47a5f 30%, #F15A38 60%, #d4451f 100%);
    color: #F7F4EF;
    text-decoration: none;
    padding: 16px 40px;
    border-radius: 50px;
    font-size: 15px;
    font-weight: 700;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    box-shadow: 0 4px 20px rgba(241, 90, 56, 0.35), 0 0 40px rgba(241, 90, 56, 0.12);
  `,
  ctaWrapper: `
    text-align: center;
    padding: 24px 0 40px;
  `,
  footerNote: `
    font-size: 12px;
    color: #656B73;
    margin-top: 16px;
  `,
  blurredCardContainer: `
    background: rgba(255, 255, 255, 0.6);
    border: 1px solid rgba(28, 29, 31, 0.1);
    border-radius: 24px;
    padding: 28px;
    margin: 20px 0;
  `,
  blurredName: `
    font-size: 18px;
    font-weight: 600;
    margin: 0;
    color: #1C1D1F;
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
      <div style="filter: blur(16px); pointer-events: none; user-select: none;">
        ${[1, 2, 3]
          .map(
            () => `
          <div style="background: white; border-radius: 24px; padding: 16px; margin-bottom: 12px; border: 1px solid rgba(28, 29, 31, 0.1);">
            <p style="${EMAIL_STYLES.blurredName}">████████ ██████</p>
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
        "Your personalized Artist Debut Kit has been generated. It includes 3 stage names, each with its own studio portrait, custom logo, and platform availability report — 9 unique assets total.",
      bodyHtml: "",
      ctaUrl: kitUrl,
      ctaLabel: "View Your Brand Kit",
      footerHtml: "This link is unique to you. Share it only with people you trust.",
    }),
  });
}