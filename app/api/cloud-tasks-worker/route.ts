import { NextRequest, NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";
import { executeGenerationPipeline, SubmissionNotFoundError } from "../../../lib/services/generation-service";

// ============================================================
// Cloud Tasks Worker — Handles generation tasks from GCP Cloud Tasks
// ============================================================
//
// Cloud Tasks dispatches POST requests with an OIDC token in the
// Authorization header. This endpoint verifies the token and runs
// the generation pipeline.
//
// Error classification:
//   - Permanent errors (bad data, not found) → 200 (no retry)
//   - Transient errors (network, timeouts) → 500 (Cloud Tasks retries)

const EXPECTED_AUDIENCE = process.env.CLOUD_TASKS_WORKER_URL;
const EXPECTED_SA_EMAIL = process.env.CLOUD_TASKS_SA_EMAIL;

async function verifyOidcToken(authHeader: string | null): Promise<boolean> {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return false;
  }

  const token = authHeader.slice(7);

  if (!EXPECTED_AUDIENCE) {
    console.error("CLOUD_TASKS_WORKER_URL is not set — cannot verify OIDC token");
    return false;
  }

  try {
    const client = new OAuth2Client();
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: EXPECTED_AUDIENCE,
    });

    const payload = ticket.getPayload();
    if (!payload) return false;

    // Verify issuer
    const iss = payload.iss;
    if (iss !== "https://accounts.google.com" && iss !== "accounts.google.com") {
      console.warn(`OIDC token issuer mismatch: ${iss}`);
      return false;
    }

    // Verify audience
    const aud = payload.aud;
    if (aud !== EXPECTED_AUDIENCE) {
      console.warn(`OIDC token audience mismatch: ${aud}`);
      return false;
    }

    // Verify expiry
    const exp = payload.exp;
    if (!exp || exp * 1000 < Date.now()) {
      console.warn("OIDC token has expired");
      return false;
    }

    // Verify service account email
    if (EXPECTED_SA_EMAIL && payload.email !== EXPECTED_SA_EMAIL) {
      console.warn(`OIDC token email mismatch: ${payload.email}`);
      return false;
    }

    return true;
  } catch (err) {
    console.error("OIDC token verification failed:", err);
    return false;
  }
}

function isPermanentError(error: unknown): boolean {
  if (error instanceof SubmissionNotFoundError) return true;
  if (!(error instanceof Error)) return false;
  const msg = error.message.toLowerCase();
  return msg.includes("not found") || msg.includes("invalid");
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  // Verify OIDC token
  const authHeader = request.headers.get("authorization");
  const isValid = await verifyOidcToken(authHeader);

  if (!isValid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Parse request body
  let body: { submissionId?: string };
  try {
    body = await request.json();
  } catch {
    console.error("Cloud Tasks worker: invalid JSON body");
    return NextResponse.json({ error: "Invalid request body" }, { status: 200 });
  }

  const { submissionId } = body;
  if (!submissionId) {
    console.error("Cloud Tasks worker: missing submissionId");
    return NextResponse.json({ error: "Missing submissionId" }, { status: 200 });
  }

  console.log(`Cloud Tasks worker: processing generation for submission ${submissionId}`);

  try {
    await executeGenerationPipeline({ submissionId });
    console.log(`Cloud Tasks worker: completed generation for submission ${submissionId}`);
    return NextResponse.json({ message: "Generation complete" }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    if (isPermanentError(error)) {
      // Permanent failure — don't retry
      console.error(`Cloud Tasks worker: permanent error for submission ${submissionId}: ${message}`);
      return NextResponse.json({ error: "Permanent failure", message }, { status: 200 });
    }

    // Transient failure — Cloud Tasks will retry
    console.error(`Cloud Tasks worker: transient error for submission ${submissionId}: ${message}`);
    return NextResponse.json({ error: "Transient failure", message }, { status: 500 });
  }
}
