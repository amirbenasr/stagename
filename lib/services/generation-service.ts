import type { BrandKitData, BrandKitVideo, NameAssetSet } from "../types";
import type { SubjectAnalysis } from "../ai/creative-engine/types";
import { analyzeSelfieImage, generateAllStageNames, subjectAnalysisToText } from "../ai/openrouter-client";
import { imageGenerationProvider } from "../ai/image-provider";
import { generatePerformanceVideo } from "../ai/video";
import { persistAllImagesForName } from "./storage-service";
import { checkAvailability } from "../utils/availability";
import { generateSlug } from "../utils/text-utils";
import { submissionRepository } from "../repositories/submission-repository";
import { brandKitRepository } from "../repositories/brand-kit-repository";
import { queueService } from "./queue-service";
import { sendBrandKitReadyEmail } from "../email";
import { existsInMusicBrainz, makeUnique } from "../utils/musicbrainz";
import { sendRedditConversion } from "../analytics/reddit";

// ============================================================
// Generation Service — Pipeline Orchestrator
// ============================================================

export interface GenerationPipelineInput {
  submissionId: string;
}

interface GenerationPipelineContext {
  submissionId: string;
  email: string | null;
  selfieUrl: string;
  artistContext: string;
  genre: string;
  vibe: string;
  realName: string;
  culturePreference: string;
}

export async function executeGenerationPipeline(input: GenerationPipelineInput): Promise<BrandKitData> {
  const { submissionId } = input;

  // Step 0: Fetch submission
  const submission = await submissionRepository.findById(submissionId);
  if (!submission) {
    throw new SubmissionNotFoundError(submissionId);
  }

  const { answers, selfieUrl, musicUrl, email } = submission;
  const artistContext = buildArtistContextFromAnswers(answers);
  const genre = (answers.genre as string) || "";
  const vibe = (answers.vibe as string) || "";
  const realName = (answers.realName as string) || "";
  const culturePreference = (answers.culturePreference as string) || "";
  const ctx: GenerationPipelineContext = { submissionId, email, selfieUrl, artistContext, genre, vibe, realName, culturePreference };

  // Step 1: Image Analysis — structured JSON (non-fatal)
  const subjectAnalysis = await analyzeImageStep(ctx);
  const imageAnalysisText = subjectAnalysis ? subjectAnalysisToText(subjectAnalysis) : "";

  // Step 2: Generate 3 Stage Names (parallel via Strategy pattern)
  const stageNames = await generateStageNamesStep(ctx, imageAnalysisText);
  const slug = generateSlug();
  const startedAt = new Date().toISOString();

  // Step 3: Generate images for all 3 names in parallel
  const nameAssetSets = await generateAllNameAssets(
    stageNames,
    selfieUrl,
    submissionId,
    genre,
    vibe,
    subjectAnalysis
  );

  // Step 4: Save the kit as soon as the images exist, with the First Take
  // marked as rendering. The video is a separate queue job so a slow render
  // can never time out the kit or block delivery.
  const renderingVideo: BrandKitVideo = {
    status: "rendering",
    startedAt,
    updatedAt: startedAt,
  };

  await brandKitRepository.save({
    submissionId,
    slug,
    names: nameAssetSets,
    genre,
    vibe,
    musicUrl: musicUrl || undefined,
    video: renderingVideo,
  });

  await submissionRepository.update(submissionId, {
    status: "complete",
    brandKitSlug: slug,
  });

  // Server-side conversion: notify Reddit that brand kit generation completed
  try {
    await sendRedditConversion("BrandKitGenerated", { submissionId, slug, names: nameAssetSets.length });
  } catch (err) {
    console.error("Failed to send Reddit BrandKitGenerated conversion:", err);
  }

  // Step 5: Send email (non-fatal) — the core kit is already live.
  if (email) {
    try {
      await sendBrandKitReadyEmail(email, slug);
    } catch (err) {
      console.error("Failed to send brand kit ready email:", err);
    }
  }

  // Step 6: Queue the First Take. Its own worker invocation renders the frame,
  // animates it, mixes audio and attaches it to the saved kit.
  try {
    await queueService.enqueue(submissionId, "video");
  } catch (err) {
    console.error("Failed to enqueue First Take video job:", err);
    await brandKitRepository
      .updateVideo(slug, {
        status: "failed",
        error: "Could not queue the video render",
        startedAt,
        updatedAt: new Date().toISOString(),
      })
      .catch(() => {});
  }

  return {
    submissionId,
    slug,
    names: nameAssetSets,
    genre,
    vibe,
    video: renderingVideo,
    status: "complete",
    createdAt: startedAt,
  };
}

/**
 * Renders and attaches the First Take for an already-saved kit.
 * Runs in its own queue job (own serverless invocation / time budget).
 */
export async function executeVideoPipeline(submissionId: string): Promise<BrandKitVideo> {
  const submission = await submissionRepository.findById(submissionId);
  if (!submission) throw new SubmissionNotFoundError(submissionId);

  const slug = submission.brandKitSlug;
  if (!slug) throw new Error(`Submission ${submissionId} has no brand kit yet`);

  const kit = await brandKitRepository.findBySlug(slug);
  const topPick = kit?.names?.[0];
  if (!kit || !topPick) throw new Error(`Brand kit ${slug} is not ready for a video`);

  const startedAt = kit.video?.startedAt ?? new Date().toISOString();

  try {
    let subjectAnalysis: SubjectAnalysis | null = null;
    try {
      if (submission.selfieUrl) {
        subjectAnalysis = await analyzeSelfieImage(submission.selfieUrl);
      }
    } catch (err) {
      console.error("Video image analysis failed, continuing without it:", err);
    }

    const result = await generatePerformanceVideo({
      submissionId,
      stageName: topPick.name,
      selfieUrl: submission.selfieUrl,
      genre: kit.genre,
      vibe: kit.vibe,
      subjectAnalysis,
      uploadedMusicUrl: submission.musicUrl || undefined,
    });

    const video: BrandKitVideo = {
      status: "ready",
      url: result.url,
      posterUrl: result.posterUrl,
      musicUrl: result.musicUrl,
      musicSource: result.musicSource,
      musicMuxed: result.musicMuxed,
      durationSeconds: result.durationSeconds,
      aspectRatio: result.aspectRatio,
      model: result.model,
      startedAt,
      updatedAt: new Date().toISOString(),
    };

    await brandKitRepository.updateVideo(slug, video);
    return video;
  } catch (error) {
    const failed: BrandKitVideo = {
      status: "failed",
      error: error instanceof Error ? error.message : "Video generation failed",
      startedAt,
      updatedAt: new Date().toISOString(),
    };

    await brandKitRepository.updateVideo(slug, failed).catch(() => {});
    throw error;
  }
}

async function generateAllNameAssets(
  stageNames: { name: string; reason: string; model: string }[],
  selfieUrl: string,
  submissionId: string,
  genre: string,
  vibe: string,
  subjectAnalysis: SubjectAnalysis | null
): Promise<NameAssetSet[]> {
  // Generate all 12 images in parallel (3 names × logo/studio/portrait/arena)
  const imageResults = await Promise.all(
    stageNames.map(async (sn, index) => {
      const images = await imageGenerationProvider.generateAll(sn.name, selfieUrl, { genre, vibe, subjectAnalysis: subjectAnalysis ?? undefined, variantIndex: index });
      return { name: sn.name, images };
    })
  );

  // Persist all images to Firebase Storage with per-name filenames
  const persistResults = await Promise.all(
    imageResults.map(async ({ name, images }) => {
      const persisted = await persistAllImagesForName(images, submissionId, name);
      return { name, persisted };
    })
  );

  // Build NameAssetSet array with per-name assets + availability
  return Promise.all(stageNames.map(async (sn) => {
    const persisted = persistResults.find((r) => r.name === sn.name)!.persisted;
    return {
      name: sn.name,
      reason: sn.reason,
      model: sn.model,
      portraitImageUrl: persisted.portrait,
      logoImageUrl: persisted.logo,
      studioPhotoUrl: persisted.studio,
      arenaImageUrl: persisted.arena,
      availability: await checkAvailability(sn.name),
    };
  }));
}

// ============================================================
// Pipeline Steps
// ============================================================

function buildArtistContextFromAnswers(answers: Record<string, string | string[]>): string {
  return Object.entries(answers)
    .filter(([, value]) => value && (typeof value === "string" ? value.trim() : value.length > 0))
    .map(([key, value]) => {
      const formatted = Array.isArray(value) ? value.join(", ") : value;
      return `${formatKey(key)}: ${formatted}`;
    })
    .join("\n");
}

function formatKey(key: string): string {
  const labels: Record<string, string> = {
    realName: "Real name",
    culturePreference: "Culture preference",
    genre: "Music genre",
    influences: "Musical influences",
    origin: "From",
    platforms: "Platforms",
    vibe: "Vibe/Energy",
    persona: "On-stage persona",
    drive: "Artistic drive",
    visualWorld: "Visual world",
    languages: "Languages",
  };
  return labels[key] ?? key;
}

async function analyzeImageStep(ctx: GenerationPipelineContext): Promise<SubjectAnalysis | null> {
  if (!ctx.selfieUrl) return null;

  try {
    return await analyzeSelfieImage(ctx.selfieUrl);
  } catch (err) {
    console.error("Image analysis failed, continuing without it:", err);
    return null;
  }
}

async function generateStageNamesStep(
  ctx: GenerationPipelineContext,
  imageAnalysis: string
) {
  const names = await generateAllStageNames(ctx.artistContext, imageAnalysis, ctx.realName, ctx.culturePreference);

  const deduped = await Promise.all(
    names.map(async (n) => {
      const exists = await existsInMusicBrainz(n.name);
      if (!exists) return n;
      const uniqueName = await makeUnique(n.name);
      return { ...n, name: uniqueName };
    })
  );

  return deduped;
}


// ============================================================
// Error Types
// ============================================================

export class SubmissionNotFoundError extends Error {
  constructor(submissionId: string) {
    super(`Submission not found: ${submissionId}`);
    this.name = "SubmissionNotFoundError";
  }
}