import sharp from "sharp";

/**
 * Fetches a generated image and returns a compressed data URI that Satori
 * (next/og) can render. Returns null on any failure so share cards can fall
 * back to a typographic-only design instead of throwing.
 */
export async function loadPhotoDataUri(
  url: string | undefined,
  size: { width: number; height: number } = { width: 900, height: 1200 }
): Promise<string | null> {
  if (!url) return null;

  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) return null;

    const buffer = Buffer.from(await response.arrayBuffer());

    const jpeg = await sharp(buffer)
      .resize(size.width, size.height, { fit: "cover", position: "attention" })
      .jpeg({ quality: 82, mozjpeg: true })
      .toBuffer();

    return `data:image/jpeg;base64,${jpeg.toString("base64")}`;
  } catch (err) {
    console.error("Share card photo load failed:", err);
    return null;
  }
}

export function displayNameSize(name: string, large: number, small: number): number {
  return name.length > 14 ? small : large;
}
