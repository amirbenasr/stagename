/**
 * Fetches a generated image and returns a data URI that Satori (next/og) can
 * render. Returns null on any failure so share cards fall back to a
 * typographic-only design instead of throwing.
 *
 * Deliberately does not use sharp: its native libvips binary is not reliably
 * available in the Vercel function, and an import-time failure there takes the
 * whole route down.
 */
export async function loadPhotoDataUri(url: string | undefined): Promise<string | null> {
  if (!url) return null;

  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) return null;

    const contentType = (response.headers.get("content-type") || "image/jpeg")
      .split(";")[0]
      .trim();

    if (!contentType.startsWith("image/")) return null;

    const buffer = Buffer.from(await response.arrayBuffer());

    // Keep the embedded image bounded; the generated portraits are ~0.4 MB,
    // arena shots can be larger. Beyond 4 MB we fall back to the text card.
    if (buffer.byteLength > 4 * 1024 * 1024) return null;

    return `data:${contentType};base64,${buffer.toString("base64")}`;
  } catch (err) {
    console.error("Share card photo load failed:", err);
    return null;
  }
}

export function displayNameSize(name: string, large: number, small: number): number {
  return name.length > 14 ? small : large;
}
