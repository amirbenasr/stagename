import fetch from "node-fetch";

const REDDIT_TOKEN = process.env.REDDIT_CONVERSION_TOKEN;
const REDDIT_URL = process.env.REDDIT_CONVERSION_URL; // e.g. https://<reddit-endpoint>/conversions

export async function sendRedditConversion(event: string, payload: Record<string, unknown>) {
  if (!REDDIT_TOKEN || !REDDIT_URL) {
    console.warn("Reddit conversion not sent: missing REDDIT_CONVERSION_TOKEN or REDDIT_CONVERSION_URL");
    return;
  }

  try {
    const body = {
      event,
      timestamp: new Date().toISOString(),
      payload,
    };

    const res = await fetch(REDDIT_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${REDDIT_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error(`Reddit conversion failed: ${res.status} ${res.statusText} - ${text}`);
    } else {
      console.log(`Reddit conversion sent: ${event}`);
    }
  } catch (err) {
    console.error("Reddit conversion error:", err);
  }
}
