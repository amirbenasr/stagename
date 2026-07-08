import { Resend } from "resend";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

function getFromEmail() {
  return process.env.FROM_EMAIL || "hello@stagename.club";
}

function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}

export async function sendClaimEmail(email: string, submissionId: string) {
  const claimUrl = `${getSiteUrl()}/claim/${submissionId}`;

  await getResend().emails.send({
    from: `stagename.club <${getFromEmail()}>`,
    to: email,
    subject: "Your 3 identities are waiting to be revealed",
    html: `
      <div style="font-family: Georgia, serif; max-width: 520px; margin: 0 auto; color: #1a1a1a;">
        <div style="text-align: center; padding: 40px 20px 20px;">
          <h1 style="font-size: 28px; font-weight: 600; margin-bottom: 8px;">
            We found 3 available identities for you
          </h1>
          <p style="font-size: 15px; color: #666; line-height: 1.6;">
            Our AI has analyzed your vibe, your look, and cross-referenced global platform availability.
            Your personalized Brand Kit is locked and ready.
          </p>
        </div>

        <div style="background: #f8f6f3; border: 1px solid #e5e0da; border-radius: 16px; padding: 28px; margin: 20px 0;">
          <div style="filter: blur(6px); pointer-events: none; user-select: none;">
            <div style="background: white; border-radius: 12px; padding: 16px; margin-bottom: 12px; border: 1px solid #eee;">
              <p style="font-size: 18px; font-weight: 600; margin: 0;">████████ ██████</p>
              <p style="font-size: 13px; color: #999; margin: 6px 0 0;">AI-generated reason...</p>
            </div>
            <div style="background: white; border-radius: 12px; padding: 16px; margin-bottom: 12px; border: 1px solid #eee;">
              <p style="font-size: 18px; font-weight: 600; margin: 0;">████████ ██████</p>
              <p style="font-size: 13px; color: #999; margin: 6px 0 0;">AI-generated reason...</p>
            </div>
            <div style="background: white; border-radius: 12px; padding: 16px; border: 1px solid #eee;">
              <p style="font-size: 18px; font-weight: 600; margin: 0;">████████ ██████</p>
              <p style="font-size: 13px; color: #999; margin: 6px 0 0;">AI-generated reason...</p>
            </div>
          </div>
        </div>

        <div style="text-align: center; padding: 20px 0 40px;">
          <a href="${claimUrl}"
            style="display: inline-block; background: linear-gradient(135deg, #e879a8, #a855f7); color: white; text-decoration: none; padding: 16px 40px; border-radius: 50px; font-size: 15px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase;">
            Unlock Your Brand Kit — $14.99
          </a>
          <p style="font-size: 12px; color: #999; margin-top: 16px;">
            Includes 3 stage names, studio portrait, logo, and platform availability report.
          </p>
        </div>
      </div>
    `,
  });
}

export async function sendBrandKitReadyEmail(email: string, brandKitSlug: string) {
  const kitUrl = `${getSiteUrl()}/brand-kit/${brandKitSlug}`;

  await getResend().emails.send({
    from: `stagename.club <${getFromEmail()}>`,
    to: email,
    subject: "Your Artist Brand Kit is ready!",
    html: `
      <div style="font-family: Georgia, serif; max-width: 520px; margin: 0 auto; color: #1a1a1a;">
        <div style="text-align: center; padding: 40px 20px 20px;">
          <h1 style="font-size: 28px; font-weight: 600; margin-bottom: 8px;">
            Your Brand Kit is Live ✨
          </h1>
          <p style="font-size: 15px; color: #666; line-height: 1.6;">
            Your personalized Artist Debut Kit has been generated. It includes your 3 stage names,
            a studio portrait, a custom logo, and a full platform availability report.
          </p>
        </div>

        <div style="text-align: center; padding: 20px 0 40px;">
          <a href="${kitUrl}"
            style="display: inline-block; background: linear-gradient(135deg, #e879a8, #a855f7); color: white; text-decoration: none; padding: 16px 40px; border-radius: 50px; font-size: 15px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase;">
            View Your Brand Kit
          </a>
          <p style="font-size: 12px; color: #999; margin-top: 16px;">
            This link is unique to you. Share it only with people you trust.
          </p>
        </div>
      </div>
    `,
  });
}
