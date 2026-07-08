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

const FILENAME_MAP = {
  logo: "logo.jpg",
  studio: "studio.jpg",
  portrait: "portrait.jpg",
} as const;

export async function persistAllImages(
  images: {
    logo: ImageGenerationResult;
    studio: ImageGenerationResult;
    portrait: ImageGenerationResult;
  },
  submissionId: string
): Promise<PersistedImageUrls> {
  const [logoImageUrl, studioPhotoUrl, portraitImageUrl] = await Promise.all([
    persistImage(images.logo.url, submissionId, FILENAME_MAP.logo),
    persistImage(images.studio.url, submissionId, FILENAME_MAP.studio),
    persistImage(images.portrait.url, submissionId, FILENAME_MAP.portrait),
  ]);

  return { logo: logoImageUrl, studio: studioPhotoUrl, portrait: portraitImageUrl };
}