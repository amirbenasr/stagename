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
// Email Template — Elegant Brand Emails
// ============================================================

const BRAND_CORAL = "#F15A38";
const BRAND_CORAL_LIGHT = "#f47a5f";
const BRAND_CORAL_DARK = "#d4451f";
const BRAND_BEIGE = "#F7F4EF";
const BRAND_FOREGROUND = "#1C1D1F";
const BRAND_SLATE = "#656B73";
const BRAND_WHITE = "#FFFFFF";

function buildEmailWrapper(innerHtml: string): string {
  return `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>stagename.club</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&display=swap');
    body { margin: 0; padding: 0; width: 100% !important; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    .script-font { font-family: 'Dancing Script', cursive; }
    @media only screen and (max-width: 600px) {
      .email-container { width: 100% !important; }
      .hero-title { font-size: 26px !important; }
      .hero-script { font-size: 32px !important; }
      .cta-button { padding: 14px 28px !important; font-size: 14px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #EDEAE5; font-family: Georgia, 'Times New Roman', serif; -webkit-font-smoothing: antialiased;">

  <!-- Preheader (hidden preview text) -->
  <div style="display: none; font-size: 1px; color: #EDEAE5; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
    Your personalized Artist Brand Kit is ready — 3 unique stage names, studio portrait, logo &amp; more.
  </div>

  <!-- Spacer top -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #EDEAE5;">
    <tr><td height="32" style="font-size: 1px; line-height: 32px;">&nbsp;</td></tr>
  </table>

  <!-- Email Container -->
  <table role="presentation" class="email-container" width="560" cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto; background-color: ${BRAND_BEIGE}; border-radius: 20px; overflow: hidden; box-shadow: 0 2px 20px rgba(0,0,0,0.06);">

    <!-- ====== BRAND HEADER BAR ====== -->
    <tr>
      <td style="padding: 28px 36px 20px; text-align: center;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="text-align: center;">
              <!-- Logo mark -->
              <div style="display: inline-block; width: 40px; height: 40px; background: linear-gradient(135deg, ${BRAND_CORAL}, ${BRAND_CORAL_LIGHT}); border-radius: 12px; line-height: 40px; text-align: center;">
                <span style="font-family: Georgia, serif; font-size: 20px; font-weight: bold; color: ${BRAND_WHITE};">S</span>
              </div>
              <div style="margin-top: 8px; font-family: Georgia, serif; font-size: 13px; letter-spacing: 0.25em; text-transform: uppercase; color: ${BRAND_SLATE};">
                stagename<span style="color: ${BRAND_CORAL};">.</span>club
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Thin coral accent line -->
    <tr>
      <td style="padding: 0 36px;">
        <div style="height: 1px; background: linear-gradient(90deg, transparent, rgba(241,90,56,0.25), transparent);"></div>
      </td>
    </tr>

    <!-- ====== HERO SECTION ====== -->
    <tr>
      <td style="padding: 36px 36px 28px; text-align: center;">
        ${innerHtml}
      </td>
    </tr>

    <!-- ====== FOOTER ====== -->
    <tr>
      <td style="padding: 0 36px 32px; text-align: center;">
        <div style="height: 1px; background: linear-gradient(90deg, transparent, rgba(28,29,31,0.1), transparent); margin-bottom: 24px;"></div>
        <p style="font-family: Georgia, serif; font-size: 12px; color: ${BRAND_SLATE}; line-height: 1.6; margin: 0;">
          You received this email because you submitted a quiz at stagename.club<br>
          <a href="${getSiteUrl()}" style="color: ${BRAND_CORAL}; text-decoration: none;">stagename.club</a>
        </p>
      </td>
    </tr>

  </table>

  <!-- Spacer bottom -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #EDEAE5;">
    <tr><td height="32" style="font-size: 1px; line-height: 32px;">&nbsp;</td></tr>
  </table>

</body>
</html>`;
}

// ============================================================
// Claim Email (pre-payment) — Blurred identity reveal
// ============================================================

function buildClaimEmailBody(claimUrl: string): string {
  const blurredCards = [1, 2, 3]
    .map(
      (i) => `
      <tr>
        <td style="padding: 0 0 ${i < 3 ? "12px" : "0"};">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="background: ${BRAND_WHITE}; border-radius: 16px; padding: 20px 24px; border: 1px solid rgba(28,29,31,0.08);">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="vertical-align: middle;">
                      <div style="font-family: Georgia, serif; font-size: 16px; font-weight: bold; color: ${BRAND_FOREGROUND}; letter-spacing: 0.02em;">
                        <span style="filter: blur(8px); -webkit-filter: blur(8px); display: inline-block;">██████████</span>
                        <span style="filter: blur(6px); -webkit-filter: blur(6px); display: inline-block; margin-left: 4px;">██████</span>
                      </div>
                    </td>
                    <td style="vertical-align: middle; text-align: right; width: 80px;">
                      <div style="font-family: Georgia, serif; font-size: 11px; color: ${BRAND_SLATE}; letter-spacing: 0.08em; text-transform: uppercase;">
                        #${i}
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>`
    )
    .join("");

  return `
    <!-- Headline -->
    <h1 class="hero-title" style="font-family: Georgia, serif; font-size: 30px; font-weight: 400; color: ${BRAND_FOREGROUND}; margin: 0 0 4px; line-height: 1.3;">
      We found <strong style="font-weight: 700;">3</strong> available identities for you
    </h1>

    <!-- Script accent word -->
    <p class="hero-script" style="font-family: 'Dancing Script', cursive; font-size: 36px; color: ${BRAND_CORAL}; margin: 0 0 16px; line-height: 1.2;">
      just for you
    </p>

    <!-- Subtitle -->
    <p style="font-family: Georgia, serif; font-size: 15px; color: ${BRAND_SLATE}; line-height: 1.7; margin: 0 0 32px; max-width: 440px; margin-left: auto; margin-right: auto;">
      Our AI analyzed your vibe, your look, and cross-referenced global platform availability. Your personalized Brand Kit is locked and ready.
    </p>

    <!-- Blurred Cards Container -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background: rgba(255,255,255,0.5); border-radius: 20px; padding: 24px; border: 1px solid rgba(28,29,31,0.06); margin-bottom: 32px;">
      <tr><td>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          ${blurredCards}
        </table>
      </td></tr>
    </table>

    <!-- What's Included -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 32px;">
      <tr>
        <td style="text-align: center; padding-bottom: 20px;">
          <div style="font-family: Georgia, serif; font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: ${BRAND_SLATE}; margin-bottom: 12px;">Your Brand Kit includes</div>
        </td>
      </tr>
      <tr>
        <td>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              ${["3 Stage Names", "Studio Portrait", "Custom Logo", "Platform Report"]
                .map(
                  (item) => `
                <td style="text-align: center; padding: 0 6px; width: 25%;">
                  <div style="background: rgba(241,90,56,0.08); border-radius: 10px; padding: 10px 6px; margin-bottom: 6px;">
                    <div style="font-family: Georgia, serif; font-size: 11px; color: ${BRAND_CORAL}; font-weight: bold;">✓</div>
                  </div>
                  <div style="font-family: Georgia, serif; font-size: 10px; color: ${BRAND_SLATE}; line-height: 1.4;">${item}</div>
                </td>`
                )
                .join("")}
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- CTA Button -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="text-align: center; padding-bottom: 12px;">
          <a href="${claimUrl}" class="cta-button" style="display: inline-block; background: linear-gradient(135deg, ${BRAND_CORAL} 0%, ${BRAND_CORAL_LIGHT} 50%, ${BRAND_CORAL_DARK} 100%); color: ${BRAND_WHITE}; text-decoration: none; padding: 16px 44px; border-radius: 50px; font-family: Georgia, serif; font-size: 14px; font-weight: bold; letter-spacing: 0.08em; text-transform: uppercase; box-shadow: 0 4px 20px rgba(241,90,56,0.3), 0 0 40px rgba(241,90,56,0.1);">
            Unlock Your Brand Kit — $14.99
          </a>
        </td>
      </tr>
      <tr>
        <td style="text-align: center;">
          <p style="font-family: Georgia, serif; font-size: 12px; color: ${BRAND_SLATE}; margin: 0;">
            One-time payment. No subscription.
          </p>
        </td>
      </tr>
    </table>
  `;
}

// ============================================================
// Brand Kit Ready Email (post-payment)
// ============================================================

function buildBrandKitReadyBody(kitUrl: string): string {
  return `
    <!-- Success Icon -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px;">
      <tr>
        <td style="text-align: center;">
          <div style="display: inline-block; width: 64px; height: 64px; background: linear-gradient(135deg, ${BRAND_CORAL} 0%, ${BRAND_CORAL_LIGHT} 100%); border-radius: 50%; line-height: 64px; text-align: center; box-shadow: 0 4px 20px rgba(241,90,56,0.25);">
            <span style="font-family: Georgia, serif; font-size: 28px; color: ${BRAND_WHITE};">✦</span>
          </div>
        </td>
      </tr>
    </table>

    <!-- Headline -->
    <h1 class="hero-title" style="font-family: Georgia, serif; font-size: 30px; font-weight: 400; color: ${BRAND_FOREGROUND}; margin: 0 0 4px; line-height: 1.3;">
      Your Brand Kit is <strong style="font-weight: 700;">Live</strong>
    </h1>

    <!-- Script accent -->
    <p class="hero-script" style="font-family: 'Dancing Script', cursive; font-size: 36px; color: ${BRAND_CORAL}; margin: 0 0 16px; line-height: 1.2;">
      welcome to the club
    </p>

    <!-- Subtitle -->
    <p style="font-family: Georgia, serif; font-size: 15px; color: ${BRAND_SLATE}; line-height: 1.7; margin: 0 0 32px; max-width: 440px; margin-left: auto; margin-right: auto;">
      Your personalized Artist Debut Kit has been generated — 3 stage names, each with a studio portrait, custom logo, and platform availability report. 9 unique assets, all yours.
    </p>

    <!-- Asset Preview Grid -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 32px;">
      <tr>
        <td style="text-align: center; padding-bottom: 16px;">
          <div style="font-family: Georgia, serif; font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: ${BRAND_SLATE};">9 assets generated</div>
        </td>
      </tr>
      <tr>
        <td>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              ${[
                { icon: "✦", label: "3 Stage Names" },
                { icon: "◉", label: "Studio Portrait" },
                { icon: "◆", label: "Custom Logo" },
              ]
                .map(
                  (item) => `
                <td style="text-align: center; padding: 0 8px; width: 33.33%;">
                  <div style="background: ${BRAND_WHITE}; border-radius: 14px; padding: 18px 10px; border: 1px solid rgba(28,29,31,0.06);">
                    <div style="font-size: 22px; margin-bottom: 8px; color: ${BRAND_CORAL};">${item.icon}</div>
                    <div style="font-family: Georgia, serif; font-size: 11px; color: ${BRAND_FOREGROUND}; font-weight: bold; line-height: 1.4;">${item.label}</div>
                  </div>
                </td>`
                )
                .join("")}
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- CTA Button -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="text-align: center; padding-bottom: 12px;">
          <a href="${kitUrl}" class="cta-button" style="display: inline-block; background: linear-gradient(135deg, ${BRAND_CORAL} 0%, ${BRAND_CORAL_LIGHT} 50%, ${BRAND_CORAL_DARK} 100%); color: ${BRAND_WHITE}; text-decoration: none; padding: 16px 44px; border-radius: 50px; font-family: Georgia, serif; font-size: 14px; font-weight: bold; letter-spacing: 0.08em; text-transform: uppercase; box-shadow: 0 4px 20px rgba(241,90,56,0.3), 0 0 40px rgba(241,90,56,0.1);">
            View Your Brand Kit
          </a>
        </td>
      </tr>
      <tr>
        <td style="text-align: center;">
          <p style="font-family: Georgia, serif; font-size: 12px; color: ${BRAND_SLATE}; margin: 0;">
            This link is unique to you. Share it only with people you trust.
          </p>
        </td>
      </tr>
    </table>
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
    html: buildEmailWrapper(buildClaimEmailBody(claimUrl)),
  });
}

export async function sendBrandKitReadyEmail(email: string, brandKitSlug: string): Promise<void> {
  const kitUrl = `${getSiteUrl()}/brand-kit/${brandKitSlug}`;

  await getResend().emails.send({
    from: `stagename.club <${getFromEmail()}>`,
    to: email,
    subject: "Your Artist Brand Kit is ready ✦",
    html: buildEmailWrapper(buildBrandKitReadyBody(kitUrl)),
  });
}