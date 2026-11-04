import type { VideoMusicSource } from "../../types";
import type { SubjectAnalysis } from "../creative-engine/types";
import { fal, withRetry, withTimeout } from "../fal";
import { generateImageFromPrompt } from "../image-provider";
import { persistVideoAssets } from "../../services/storage-service";
import { buildPerformanceDirection, type PerformanceDirection } from "./direction";
import { resolveMusic } from "./music";

// ============================================================
// First Take Video Provider
// ============================================================
//
// Two-stage generation:
//   1. Render a composed performance frame (mic, wardrobe, lighting, framing)
//      from the artist's selfie using the same edit model as the portraits.
//   2. Animate that frame with a reference-to-video model.
//
// Why this beats one-shot reference-to-video: the frame locks composition and
// identity before any expensive video compute is spent, and the motion prompt
// only has to describe movement — not invent a scene.

const FRAME_MODEL =
  process.env.FAL_VIDEO_FRAME_MODEL || "bytedance/seedream/v5/pro/edit";

const VIDEO_MODEL =
  process.env.FAL_VIDEO_MODEL || "xai/grok-imagine-video/reference-to-video";

const MUX_MODEL =
  process.env.FAL_VIDEO_MUX_MODEL || "fal-ai/ffmpeg-api/merge-audio-video";

const VIDEO_RESOLUTION = process.env.FAL_VIDEO_RESOLUTION || "720p";

const FRAME_TIMEOUT_MS = 240_000;
const VIDEO_TIMEOUT_MS = 600_000;
const MUX_TIMEOUT_MS = 180_000;

export interface PerformanceVideoInput {
  submissionId: string;
  stageName: string;
  selfieUrl: string;
  genre: string;
  vibe: string;
  subjectAnalysis?: SubjectAnalysis | null;
  uploadedMusicUrl?: string;
}

export interface PerformanceVideoResult {
  url: string;
  posterUrl: string;
  musicUrl?: string;
  musicSource: VideoMusicSource;
  musicMuxed: boolean;
  durationSeconds: number;
  aspectRatio: string;
  model: string;
}

interface FalVideoResult {
  data?: {
    video?: { url?: string };
    output?: Array<{ url?: string }>;
  };
  video?: { url?: string };
  output?: Array<{ url?: string }> | { url?: string };
  url?: string;
}

function extractVideoUrl(result: unknown): string {
  const r = result as FalVideoResult;
  const output = r?.output;
  const outputUrl = Array.isArray(output) ? output[0]?.url : output?.url;

  return (
    r?.data?.video?.url ??
    r?.data?.output?.[0]?.url ??
    r?.video?.url ??
    outputUrl ??
    r?.url ??
    ""
  );
}

/**
 * Renders the still that the video model will animate.
 * Tries a 16:9 frame first; if the edit endpoint rejects the size parameter we
 * retry without it rather than failing the whole video.
 */
async function renderPerformanceFrame(
  direction: PerformanceDirection,
  selfieUrl: string
): Promise<string> {
  const prompt = direction.framePrompt;

  const attempts: Array<Record<string, unknown>> = [
    { image_size: direction.aspectRatio === "9:16" ? "portrait_16_9" : "landscape_16_9" },
    {},
  ];

  let lastError: unknown;

  for (const extra of attempts) {
    try {
      const result = await withTimeout(
        generateImageFromPrompt({
          endpoint: FRAME_MODEL,
          prompt,
          imageUrls: [selfieUrl],
          extraInput: extra,
        }),
        FRAME_TIMEOUT_MS,
        "performance frame"
      );

      if (result.url) return result.url;

      lastError = new Error("Frame model returned no image URL");
    } catch (err) {
      lastError = err;
      console.warn(
        `Performance frame attempt failed (${JSON.stringify(extra)}):`,
        err instanceof Error ? err.message : err
      );
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Performance frame failed");
}

function buildMotionInput(
  model: string,
  frameUrl: string,
  direction: PerformanceDirection
): Record<string, unknown> {
  const base: Record<string, unknown> = {
    prompt: `${direction.motionPrompt} @Image1`,
    duration: direction.durationSeconds,
    aspect_ratio: direction.aspectRatio,
    resolution: VIDEO_RESOLUTION,
  };

  if (model.includes("reference-to-video")) {
    return { ...base, reference_image_urls: [frameUrl] };
  }

  if (model.includes("image-to-video")) {
    return { ...base, image_url: frameUrl };
  }

  // Unknown family — send both shapes and let the provider error clearly.
  return { ...base, image_url: frameUrl, reference_image_urls: [frameUrl] };
}

async function animateFrame(
  frameUrl: string,
  direction: PerformanceDirection
): Promise<string> {
  const result = await withRetry(
    () =>
      withTimeout(
        fal.subscribe(VIDEO_MODEL, {
          input: buildMotionInput(VIDEO_MODEL, frameUrl, direction),
        }),
        VIDEO_TIMEOUT_MS,
        "video generation"
      ),
    2,
    2000
  );

  const url = extractVideoUrl(result);
  if (!url) throw new Error("Video model returned no video URL");

  return url;
}

/**
 * Muxes the chosen soundtrack into the MP4. If the mux endpoint is unavailable
 * we return null and the UI plays the music as a synced track instead — the
 * clip is never lost to an audio failure.
 */
async function muxMusic(videoUrl: string, audioUrl: string): Promise<string | null> {
  try {
    const result = await withTimeout(
      fal.subscribe(MUX_MODEL, {
        input: {
          video_url: videoUrl,
          audio_url: audioUrl,
        },
      }),
      MUX_TIMEOUT_MS,
      "audio mux"
    );

    const url = extractVideoUrl(result);
    return url || null;
  } catch (err) {
    console.warn(
      "Music mux failed — falling back to a synced soundtrack in the player:",
      err instanceof Error ? err.message : err
    );
    return null;
  }
}

export async function generatePerformanceVideo(
  input: PerformanceVideoInput
): Promise<PerformanceVideoResult> {
  const {
    submissionId,
    stageName,
    selfieUrl,
    genre,
    vibe,
    subjectAnalysis,
    uploadedMusicUrl,
  } = input;

  if (!selfieUrl) {
    throw new Error("No selfie available for the performance frame");
  }

  const direction = buildPerformanceDirection({
    stageName,
    genre,
    vibe,
    subject: subjectAnalysis ?? null,
    aspectRatio: "16:9",
    durationSeconds: 10,
  });

  // Stage 1 — compose the frame.
  const frameUrl = await renderPerformanceFrame(direction, selfieUrl);

  // Stage 2 — animate it.
  const sourceVideoUrl = await animateFrame(frameUrl, direction);

  // Audio — artist's track, library bed, or the model's own audio.
  const music = resolveMusic(uploadedMusicUrl, genre);
  let finalVideoUrl = sourceVideoUrl;
  let musicMuxed = false;

  if (music) {
    const muxed = await muxMusic(sourceVideoUrl, music.url);
    if (muxed) {
      finalVideoUrl = muxed;
      musicMuxed = true;
    }
  }

  // Persist so the kit survives fal's URL TTLs.
  const persisted = await persistVideoAssets({
    videoUrl: finalVideoUrl,
    posterUrl: frameUrl,
    submissionId,
  });

  return {
    url: persisted.videoUrl,
    posterUrl: persisted.posterUrl,
    musicUrl: music?.url,
    musicSource: music?.source ?? "none",
    musicMuxed,
    durationSeconds: direction.durationSeconds,
    aspectRatio: direction.aspectRatio,
    model: VIDEO_MODEL,
  };
}

export const videoConfig = {
  frameModel: FRAME_MODEL,
  videoModel: VIDEO_MODEL,
  muxModel: MUX_MODEL,
  resolution: VIDEO_RESOLUTION,
};
