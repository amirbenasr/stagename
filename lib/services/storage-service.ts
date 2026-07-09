import { adminStorage, requireStorage, FIREBASE_STORAGE_BUCKET } from "../firebase-admin";
import type { ImageGenerationResult } from "../types";

function buildPublicUrl(submissionId: string, filename: string): string {
  return `https://storage.googleapis.com/${FIREBASE_STORAGE_BUCKET}/brandkits/${submissionId}/${filename}`;
}

async function downloadImageAsBuffer(imageUrl: string): Promise<Buffer> {
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`Failed to download image: HTTP ${response.status}`);
  }
  return Buffer.from(await response.arrayBuffer());
}

async function saveBufferToStorage(
  buffer: Buffer,
  submissionId: string,
  filename: string
): Promise<string> {
  const storage = requireStorage();
  const file = storage
    .bucket(FIREBASE_STORAGE_BUCKET)
    .file(`brandkits/${submissionId}/${filename}`);

  await file.save(buffer, { contentType: "image/jpeg", public: true });

  return buildPublicUrl(submissionId, filename);
}

export async function persistImage(
  imageUrl: string,
  submissionId: string,
  filename: string
): Promise<string> {
  if (!imageUrl) return "";
  if (!adminStorage) {
    console.error(`adminStorage is null — cannot save ${filename}. Falling back to fal.ai URL.`);
    return imageUrl;
  }

  try {
    const buffer = await downloadImageAsBuffer(imageUrl);
    return await saveBufferToStorage(buffer, submissionId, filename);
  } catch (err) {
    console.error(`Failed to save ${filename} to storage:`, err);
    return imageUrl;
  }
}

export interface PersistedImageUrls {
  logo: string;
  studio: string;
  portrait: string;
}

function sanitizeName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export async function persistAllImagesForName(
  images: {
    logo: ImageGenerationResult;
    studio: ImageGenerationResult;
    portrait: ImageGenerationResult;
  },
  submissionId: string,
  stageName: string
): Promise<PersistedImageUrls> {
  const prefix = sanitizeName(stageName);
  const [logoImageUrl, studioPhotoUrl, portraitImageUrl] = await Promise.all([
    persistImage(images.logo.url, submissionId, `${prefix}-logo.jpg`),
    persistImage(images.studio.url, submissionId, `${prefix}-studio.jpg`),
    persistImage(images.portrait.url, submissionId, `${prefix}-portrait.jpg`),
  ]);

  return { logo: logoImageUrl, studio: studioPhotoUrl, portrait: portraitImageUrl };
}