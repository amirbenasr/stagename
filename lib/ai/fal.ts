import { fal } from "@fal-ai/client";

// Single place where the fal client is configured.
// Every AI module imports this instead of configuring its own credentials.
fal.config({
  credentials: process.env.FAL_KEY,
});

export { fal };

/**
 * Runs a fal call with a hard wall-clock budget. fal's subscribe can hang on
 * cold model boot; a timeout keeps the generation pipeline from stalling the
 * whole job.
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  label = "fal call"
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;

  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timer = setTimeout(
          () => reject(new Error(`${label} timed out after ${Math.round(ms / 1000)}s`)),
          ms
        );
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  attempts = 2,
  delayMs = 1500
): Promise<T> {
  let lastError: unknown;

  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (i < attempts - 1) {
        await new Promise((resolve) => setTimeout(resolve, delayMs * (i + 1)));
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}
